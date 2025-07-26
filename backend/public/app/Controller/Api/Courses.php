<?php
namespace App\Controller\Api;

use App\Utils\JWT;
use PDO;
use Exception;

class Courses {
    /**
     * Get database connection
     */
    private static function getConnection() {
        // PostgreSQL connection
        $host = getenv('DB_HOST') ?: 'postgres';
        $port = getenv('DB_PORT') ?: '5432';
        $dbname = getenv('DB_NAME') ?: 'estudos_db';
        $user = getenv('DB_USER') ?: 'estudos_user';
        $pass = getenv('DB_PASS') ?: 'estudos_pass';
        
        try {
            $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
            return new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);
        } catch (Exception $e) {
            return null;
        }
    }
    
    /**
     * Generate URL-friendly slug from title
     */
    private static function generateSlug($title) {
        $slug = strtolower(trim($title));
        $slug = preg_replace('/[^a-z0-9-]/', '-', $slug);
        $slug = preg_replace('/-+/', '-', $slug);
        return trim($slug, '-');
    }
    
    /**
     * Sanitize string for safe file path usage
     */
    private static function sanitizeForPath($string) {
        // Remove or replace unsafe characters for file paths
        $sanitized = preg_replace('/[^a-zA-Z0-9\-_]/', '_', $string);
        $sanitized = preg_replace('/_{2,}/', '_', $sanitized); // Replace multiple underscores with single
        $sanitized = trim($sanitized, '_-'); // Remove leading/trailing underscores and dashes
        
        // Ensure it's not empty and has reasonable length
        if (empty($sanitized)) {
            $sanitized = 'default';
        }
        
        // Limit length to 50 characters
        return substr($sanitized, 0, 50);
    }
    
    /**
     * Create organized directory structure for user and course
     */
    private static function createUploadPath($userId, $courseSlug, $originalFilename) {
        // Sanitize course slug for filename
        $sanitizedCourseSlug = self::sanitizeForPath($courseSlug);
        
        // Get file extension
        $extension = strtolower(pathinfo($originalFilename, PATHINFO_EXTENSION));
        
        // Create unique filename with course slug and timestamp
        $filename = 'course_' . $sanitizedCourseSlug . '_' . time() . '_' . uniqid() . '.' . $extension;
        
        // Simple directory structure: images/courses/
        $relativePath = "images/courses";
        $fullPath = __DIR__ . "/../../{$relativePath}";
        
        // Create directory if it doesn't exist
        if (!is_dir($fullPath)) {
            mkdir($fullPath, 0755, true);
        }
        
        return [
            'full_path' => $fullPath . '/' . $filename,
            'relative_path' => $relativePath . '/' . $filename,
            'url_path' => '/' . $relativePath . '/' . $filename,
            'filename' => $filename
        ];
    }
    
    /**
     * Validate and process uploaded image
     */
    private static function validateAndProcessImage($uploadedFile, $userId, $courseSlug) {
        // Check for upload errors
        if ($uploadedFile['error'] !== UPLOAD_ERR_OK) {
            return [
                'success' => false,
                'message' => 'Erro no upload da imagem'
            ];
        }
        
        // Validate file size (max 5MB)
        $maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if ($uploadedFile['size'] > $maxSize) {
            return [
                'success' => false,
                'message' => 'Imagem muito grande. Tamanho máximo: 5MB'
            ];
        }
        
        // Validate MIME type
        $allowedMimeTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp'
        ];
        
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $uploadedFile['tmp_name']);
        finfo_close($finfo);
        
        // Map MIME type to extension
        $extensionMap = [
            'image/jpeg' => 'jpg',
            'image/jpg' => 'jpg',
            'image/png' => 'png',
            'image/gif' => 'gif',
            'image/webp' => 'webp'
        ];
        
        if (!in_array($mimeType, $allowedMimeTypes)) {
            return [
                'success' => false,
                'message' => 'Formato de imagem não permitido. Use: JPEG, PNG, GIF ou WebP'
            ];
        }
        
        $extension = $extensionMap[$mimeType];
        
        // Create organized upload path with proper extension
        $pathInfo = self::createUploadPath($userId, $courseSlug, 'thumbnail.' . $extension);
        
        // Process and optimize image
        $processResult = self::processAndOptimizeImage($uploadedFile['tmp_name'], $pathInfo['full_path'], $mimeType);
        if (!$processResult['success']) {
            return $processResult;
        }
        
        return [
            'success' => true,
            'filename' => $pathInfo['filename'],
            'full_path' => $pathInfo['full_path'],
            'relative_path' => $pathInfo['relative_path'],
            'url_path' => $pathInfo['url_path'],
            'mime_type' => $mimeType,
            'size' => $uploadedFile['size'],
            'original_name' => basename($uploadedFile['name'])
        ];
    }
    
    /**
     * Process and optimize image (resize, compress, maintain quality)
     */
    private static function processAndOptimizeImage($sourcePath, $destinationPath, $mimeType) {
        // Create image resource from source
        switch ($mimeType) {
            case 'image/jpeg':
            case 'image/jpg':
                $sourceImage = imagecreatefromjpeg($sourcePath);
                break;
            case 'image/png':
                $sourceImage = imagecreatefrompng($sourcePath);
                break;
            case 'image/gif':
                $sourceImage = imagecreatefromgif($sourcePath);
                break;
            case 'image/webp':
                $sourceImage = imagecreatefromwebp($sourcePath);
                break;
            default:
                return [
                    'success' => false,
                    'message' => 'Formato de imagem não suportado para processamento'
                ];
        }
        
        if (!$sourceImage) {
            return [
                'success' => false,
                'message' => 'Erro ao processar imagem'
            ];
        }
        
        // Get original dimensions
        $originalWidth = imagesx($sourceImage);
        $originalHeight = imagesy($sourceImage);
        
        // Set target dimensions (thumbnail: 400x300, maintaining aspect ratio)
        $targetWidth = 400;
        $targetHeight = 300;
        
        // Calculate new dimensions maintaining aspect ratio
        $aspectRatio = $originalWidth / $originalHeight;
        $targetAspectRatio = $targetWidth / $targetHeight;
        
        if ($aspectRatio > $targetAspectRatio) {
            // Image is wider - fit by width
            $newWidth = $targetWidth;
            $newHeight = intval($targetWidth / $aspectRatio);
        } else {
            // Image is taller - fit by height
            $newHeight = $targetHeight;
            $newWidth = intval($targetHeight * $aspectRatio);
        }
        
        // Create new image with target dimensions
        $resizedImage = imagecreatetruecolor($newWidth, $newHeight);
        
        // Preserve transparency for PNG and GIF
        if ($mimeType === 'image/png' || $mimeType === 'image/gif') {
            imagealphablending($resizedImage, false);
            imagesavealpha($resizedImage, true);
            $transparent = imagecolorallocatealpha($resizedImage, 255, 255, 255, 127);
            imagefill($resizedImage, 0, 0, $transparent);
        }
        
        // Resize image with high quality resampling
        imagecopyresampled(
            $resizedImage, $sourceImage,
            0, 0, 0, 0,
            $newWidth, $newHeight,
            $originalWidth, $originalHeight
        );
        
        // Save optimized image
        $saved = false;
        switch ($mimeType) {
            case 'image/jpeg':
            case 'image/jpg':
                $saved = imagejpeg($resizedImage, $destinationPath, 85); // 85% quality
                break;
            case 'image/png':
                $saved = imagepng($resizedImage, $destinationPath, 6); // Compression level 6 (0-9)
                break;
            case 'image/gif':
                $saved = imagegif($resizedImage, $destinationPath);
                break;
            case 'image/webp':
                $saved = imagewebp($resizedImage, $destinationPath, 85); // 85% quality
                break;
        }
        
        // Clean up memory
        imagedestroy($sourceImage);
        imagedestroy($resizedImage);
        
        if (!$saved) {
            return [
                'success' => false,
                'message' => 'Erro ao salvar imagem otimizada'
            ];
        }
        
        return ['success' => true];
    }
    
    /**
     * List all courses
     * GET /api/v1/courses
     */
    public static function list($request) {
        // Verify authentication and admin/instructor role
        try {
            $userData = JWT::requireRole(['admin', 'instructor']);
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Acesso negado'];
        }
        
        // Get query parameters
        $queryParams = $request->getQueryParams();
        $page = (int)($queryParams['page'] ?? 1);
        $limit = (int)($queryParams['limit'] ?? 10);
        $search = $queryParams['search'] ?? '';
        $status = $queryParams['status'] ?? '';
        $category = $queryParams['category'] ?? '';
        
        $offset = ($page - 1) * $limit;
        
        // Get database connection
        $pdo = self::getConnection();
        if (!$pdo) {
            http_response_code(500);
            return [
                'success' => false,
                'message' => 'Erro de conexão com banco de dados'
            ];
        }
        
        try {
            // Build query with filters
            $whereConditions = [];
            $params = [];
            
            // Filter by instructor for non-admin users
            if ($userData->role !== 'admin') {
                $whereConditions[] = "c.instructor_id = :instructor_id";
                $params['instructor_id'] = $userData->userId;
            }
            
            if (!empty($search)) {
                $whereConditions[] = "(c.title ILIKE :search OR c.description ILIKE :search)";
                $params['search'] = "%$search%";
            }
            
            if (!empty($status)) {
                $whereConditions[] = "c.status = :status";
                $params['status'] = $status;
            }
            
            if (!empty($category)) {
                $whereConditions[] = "c.category = :category";
                $params['category'] = $category;
            }
            
            $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
            
            // Count total records
            $countStmt = $pdo->prepare("
                SELECT COUNT(*) as total
                FROM courses c
                $whereClause
            ");
            $countStmt->execute($params);
            $total = $countStmt->fetchColumn();
            
            // Get courses with pagination
            $stmt = $pdo->prepare("
                SELECT c.id, c.title, c.slug, c.description, c.category, c.instructor_id,
                       c.thumbnail_url, c.price, c.status, c.visibility, c.difficulty_level,
                       c.duration_hours, c.duration_months, c.total_enrollments, c.average_rating,
                       c.created_at, c.updated_at, c.published_at,
                       up.name as instructor_name,
                       (SELECT COUNT(*) FROM course_modules WHERE course_id = c.id) as modules_count,
                       (SELECT COUNT(*) FROM lessons l 
                        INNER JOIN course_modules cm ON l.module_id = cm.id 
                        WHERE cm.course_id = c.id) as lessons_count
                FROM courses c
                LEFT JOIN user_profiles up ON c.instructor_id = up.user_id
                $whereClause
                ORDER BY c.created_at DESC
                LIMIT :limit OFFSET :offset
            ");
            
            $params['limit'] = $limit;
            $params['offset'] = $offset;
            $stmt->execute($params);
            $courses = $stmt->fetchAll();
            
            // Get base URL for thumbnail URLs
            $baseUrl = 'http://' . ($_SERVER['HTTP_HOST'] ?? 'localhost:8180');
            
            // Format courses data
            $formattedCourses = array_map(function($course) use ($baseUrl) {
                // Use thumbnail_url or null for default handling on frontend
                $thumbnailUrl = null;
                if ($course['thumbnail_url']) {
                    // Check if URL already has http/https
                    if (strpos($course['thumbnail_url'], 'http://') === 0 || strpos($course['thumbnail_url'], 'https://') === 0) {
                        $thumbnailUrl = $course['thumbnail_url'];
                    } else {
                        $thumbnailUrl = $baseUrl . $course['thumbnail_url'];
                    }
                }
                
                return [
                    'id' => $course['id'],
                    'title' => $course['title'],
                    'slug' => $course['slug'],
                    'description' => $course['description'],
                    'category' => $course['category'],
                    'instructor' => [
                        'id' => $course['instructor_id'],
                        'name' => $course['instructor_name'] ?? 'Instrutor não encontrado'
                    ],
                    'thumbnail' => $thumbnailUrl,
                    'price' => $course['price'] ? (float)$course['price'] : null,
                    'status' => $course['status'],
                    'visibility' => $course['visibility'],
                    'difficulty' => $course['difficulty_level'],
                    'duration' => [
                        'hours' => $course['duration_hours'],
                        'months' => $course['duration_months']
                    ],
                    'stats' => [
                        'enrollments' => (int)$course['total_enrollments'],
                        'rating' => $course['average_rating'] ? (float)$course['average_rating'] : 0,
                        'modules' => (int)$course['modules_count'],
                        'lessons' => (int)$course['lessons_count']
                    ],
                    'createdAt' => $course['created_at'],
                    'updatedAt' => $course['updated_at'],
                    'publishedAt' => $course['published_at']
                ];
            }, $courses);
            
            return [
                'success' => true,
                'data' => $formattedCourses,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => (int)$total,
                    'pages' => ceil($total / $limit)
                ]
            ];
            
        } catch (Exception $e) {
            error_log('List courses error: ' . $e->getMessage());
            http_response_code(500);
            return [
                'success' => false,
                'message' => 'Erro ao listar cursos'
            ];
        }
    }
    
    /**
     * Get single course
     * GET /api/v1/courses/:id
     */
    public static function get($request, $id) {
        // Verify authentication
        try {
            $userData = JWT::requireAuth();
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Acesso negado'];
        }
        
        // Get database connection
        $pdo = self::getConnection();
        if (!$pdo) {
            http_response_code(500);
            return [
                'success' => false,
                'message' => 'Erro de conexão com banco de dados'
            ];
        }
        
        try {
            // Get course details
            $stmt = $pdo->prepare("
                SELECT c.*, up.name as instructor_name,
                       (SELECT COUNT(*) FROM course_modules WHERE course_id = c.id) as modules_count,
                       (SELECT COUNT(*) FROM lessons l 
                        INNER JOIN course_modules cm ON l.module_id = cm.id 
                        WHERE cm.course_id = c.id) as lessons_count
                FROM courses c
                LEFT JOIN user_profiles up ON c.instructor_id = up.user_id
                WHERE c.id = :id
            ");
            $stmt->execute(['id' => $id]);
            $course = $stmt->fetch();
            
            if (!$course) {
                http_response_code(404);
                return [
                    'success' => false,
                    'message' => 'Curso não encontrado'
                ];
            }
            
            // Check permissions
            if ($userData->role !== 'admin' && $course['instructor_id'] !== $userData->userId) {
                http_response_code(403);
                return [
                    'success' => false,
                    'message' => 'Você não tem permissão para visualizar este curso'
                ];
            }
            
            // Get course modules with lessons
            $modulesStmt = $pdo->prepare("
                SELECT cm.*, 
                       (SELECT COUNT(*) FROM lessons WHERE module_id = cm.id) as lessons_count
                FROM course_modules cm
                WHERE cm.course_id = :course_id
                ORDER BY cm.order_index
            ");
            $modulesStmt->execute(['course_id' => $id]);
            $modules = $modulesStmt->fetchAll();
            
            // Get lessons for each module
            foreach ($modules as &$module) {
                $lessonsStmt = $pdo->prepare("
                    SELECT id, title, description, type, order_index, duration_minutes,
                           video_url, is_published, is_free
                    FROM lessons
                    WHERE module_id = :module_id
                    ORDER BY order_index
                ");
                $lessonsStmt->execute(['module_id' => $module['id']]);
                $module['lessons'] = $lessonsStmt->fetchAll();
            }
            
            // Get base URL for thumbnail URLs
            $baseUrl = 'http://' . ($_SERVER['HTTP_HOST'] ?? 'localhost:8180');
            
            // Process thumbnail URL
            $thumbnailUrl = null;
            if ($course['thumbnail_url']) {
                // Check if URL already has http/https
                if (strpos($course['thumbnail_url'], 'http://') === 0 || strpos($course['thumbnail_url'], 'https://') === 0) {
                    $thumbnailUrl = $course['thumbnail_url'];
                } else {
                    $thumbnailUrl = $baseUrl . $course['thumbnail_url'];
                }
            }
            
            $formattedCourse = [
                'id' => $course['id'],
                'title' => $course['title'],
                'slug' => $course['slug'],
                'description' => $course['description'],
                'category' => $course['category'],
                'instructor' => [
                    'id' => $course['instructor_id'],
                    'name' => $course['instructor_name'] ?? 'Instrutor não encontrado'
                ],
                'thumbnail' => $thumbnailUrl,
                'previewVideo' => $course['preview_video_url'],
                'price' => $course['price'] ? (float)$course['price'] : null,
                'status' => $course['status'],
                'visibility' => $course['visibility'],
                'difficulty' => $course['difficulty_level'],
                'duration' => [
                    'hours' => $course['duration_hours'],
                    'months' => $course['duration_months']
                ],
                'language' => $course['language'],
                'requirements' => $course['requirements'] ? json_decode($course['requirements'], true) : [],
                'objectives' => $course['objectives'] ? json_decode($course['objectives'], true) : [],
                'targetAudience' => $course['target_audience'],
                'certificationAvailable' => $course['certification_available'],
                'stats' => [
                    'enrollments' => (int)$course['total_enrollments'],
                    'rating' => $course['average_rating'] ? (float)$course['average_rating'] : 0,
                    'modules' => (int)$course['modules_count'],
                    'lessons' => (int)$course['lessons_count']
                ],
                'modules' => $modules,
                'createdAt' => $course['created_at'],
                'updatedAt' => $course['updated_at'],
                'publishedAt' => $course['published_at']
            ];
            
            return [
                'success' => true,
                'data' => $formattedCourse
            ];
            
        } catch (Exception $e) {
            error_log('Get course error: ' . $e->getMessage());
            http_response_code(500);
            return [
                'success' => false,
                'message' => 'Erro ao buscar curso'
            ];
        }
    }
    
    /**
     * Create new course
     * POST /api/v1/courses
     */
    public static function create($request) {
        // Verify authentication and admin/instructor role
        try {
            $userData = JWT::requireRole(['admin', 'instructor']);
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Acesso negado'];
        }
        
        // Get POST vars
        $postVars = $request->getPostVars();
        
        $title = $postVars['title'] ?? '';
        $description = $postVars['description'] ?? '';
        $category = $postVars['category'] ?? '';
        $thumbnail = $postVars['thumbnail_url'] ?? null;
        $previewVideo = $postVars['preview_video_url'] ?? null;
        $price = $postVars['price'] ?? null;
        $difficulty = $postVars['difficulty_level'] ?? 'beginner';
        $durationHours = $postVars['duration_hours'] ?? null;
        $durationMonths = $postVars['duration_months'] ?? null;
        $requirements = $postVars['requirements'] ?? [];
        $objectives = $postVars['objectives'] ?? [];
        $targetAudience = $postVars['target_audience'] ?? '';
        $certification = isset($postVars['certification_available']) ? (bool)$postVars['certification_available'] : false;
        
        // Validate input
        $validationErrors = [];
        
        if (empty(trim($title))) {
            $validationErrors[] = 'O título do curso é obrigatório';
        }
        
        if (empty(trim($category))) {
            $validationErrors[] = 'A categoria do curso é obrigatória';
        }
        
        if (!empty($price) && !is_numeric($price)) {
            $validationErrors[] = 'O preço deve ser um número válido';
        }
        
        if (!empty($durationHours) && (!is_numeric($durationHours) || intval($durationHours) < 0)) {
            $validationErrors[] = 'A duração em horas deve ser um número positivo';
        }
        
        if (!empty($durationMonths) && (!is_numeric($durationMonths) || intval($durationMonths) < 0)) {
            $validationErrors[] = 'A duração em meses deve ser um número positivo';
        }
        
        if (!empty($validationErrors)) {
            http_response_code(400);
            return [
                'success' => false,
                'message' => 'Erro de validação: ' . implode(', ', $validationErrors),
                'validation_errors' => $validationErrors
            ];
        }
        
        // Get database connection
        $pdo = self::getConnection();
        if (!$pdo) {
            http_response_code(500);
            return [
                'success' => false,
                'message' => 'Erro de conexão com banco de dados'
            ];
        }
        
        try {
            // Generate unique slug
            $slug = self::generateSlug($title);
            $originalSlug = $slug;
            $counter = 1;
            
            // Check if slug exists and make it unique
            do {
                $checkStmt = $pdo->prepare("SELECT id FROM courses WHERE slug = :slug");
                $checkStmt->execute(['slug' => $slug]);
                if ($checkStmt->fetch()) {
                    $slug = $originalSlug . '-' . $counter;
                    $counter++;
                } else {
                    break;
                }
            } while (true);
            
            // Set instructor as current user for non-admin
            $instructorId = ($userData->role === 'admin' && isset($postVars['instructor_id'])) 
                ? $postVars['instructor_id'] 
                : $userData->userId;
            
            // Begin transaction
            $pdo->beginTransaction();
            
            // Handle image upload if present
            $thumbnailUrl = $thumbnail; // Use provided URL or null
            $thumbnailFilePath = null;
            
            // Check for image data in FILES array (for POST requests)
            if (isset($_FILES['thumbnail']) && $_FILES['thumbnail']['error'] === UPLOAD_ERR_OK) {
                // Generate temporary slug for new course
                $tempSlug = self::generateSlug($title);
                
                $uploadResult = self::validateAndProcessImage($_FILES['thumbnail'], $instructorId, $tempSlug);
                if (!$uploadResult['success']) {
                    $pdo->rollBack();
                    http_response_code(400);
                    return $uploadResult;
                }
                
                $thumbnailUrl = $uploadResult['url_path'];
                $thumbnailFilePath = $uploadResult['relative_path'];
            }
            // Check for image data in POST vars (for FormData)
            elseif (isset($postVars['thumbnail']) && !empty($postVars['thumbnail'])) {
                // Generate temporary slug for new course
                $tempSlug = self::generateSlug($title);
                
                // Create a temporary file from the POST data
                $tempFile = tempnam(sys_get_temp_dir(), 'course_upload_');
                file_put_contents($tempFile, $postVars['thumbnail']);
                
                // Create a fake uploaded file array
                $fakeUploadedFile = [
                    'tmp_name' => $tempFile,
                    'size' => strlen($postVars['thumbnail']),
                    'error' => UPLOAD_ERR_OK,
                    'name' => 'thumbnail.png' // Default name
                ];
                
                $uploadResult = self::validateAndProcessImage($fakeUploadedFile, $instructorId, $tempSlug);
                
                // Clean up temp file
                unlink($tempFile);
                
                if (!$uploadResult['success']) {
                    $pdo->rollBack();
                    http_response_code(400);
                    return $uploadResult;
                }
                
                $thumbnailUrl = $uploadResult['url_path'];
                $thumbnailFilePath = $uploadResult['relative_path'];
            }
            
            // Create course
            $courseStmt = $pdo->prepare("
                INSERT INTO courses (
                    title, slug, description, category, instructor_id, thumbnail_url, thumbnail_file_path,
                    preview_video_url, price, difficulty_level, duration_hours, duration_months,
                    requirements, objectives, target_audience, certification_available, status
                ) VALUES (
                    :title, :slug, :description, :category, :instructor_id, :thumbnail_url, :thumbnail_file_path,
                    :preview_video_url, :price, :difficulty_level, :duration_hours, :duration_months,
                    :requirements, :objectives, :target_audience, :certification_available, 'draft'
                ) RETURNING id
            ");
            
            $courseStmt->execute([
                'title' => $title,
                'slug' => $slug,
                'description' => $description,
                'category' => $category,
                'instructor_id' => $instructorId,
                'thumbnail_url' => $thumbnailUrl,
                'thumbnail_file_path' => $thumbnailFilePath,
                'preview_video_url' => $previewVideo,
                'price' => $price,
                'difficulty_level' => $difficulty,
                'duration_hours' => $durationHours,
                'duration_months' => $durationMonths,
                'requirements' => is_array($requirements) ? json_encode($requirements) : $requirements,
                'objectives' => is_array($objectives) ? json_encode($objectives) : $objectives,
                'target_audience' => $targetAudience,
                'certification_available' => $certification
            ]);
            
            $courseId = $courseStmt->fetchColumn();
            
            // Create course resources entry
            $resourcesStmt = $pdo->prepare("
                INSERT INTO course_resources (course_id) VALUES (:course_id)
            ");
            $resourcesStmt->execute(['course_id' => $courseId]);
            
            // Commit transaction
            $pdo->commit();
            
            return [
                'success' => true,
                'message' => 'Curso criado com sucesso',
                'data' => [
                    'id' => $courseId,
                    'title' => $title,
                    'slug' => $slug,
                    'status' => 'draft'
                ]
            ];
            
        } catch (Exception $e) {
            $pdo->rollBack();
            error_log('Create course error: ' . $e->getMessage());
            http_response_code(500);
            return [
                'success' => false,
                'message' => 'Erro ao criar curso'
            ];
        }
    }
    
    /**
     * Update course
     * PUT /api/v1/courses/:id
     */
    public static function update($request, $id) {
        error_log('Course update - Function called with ID: ' . $id);
        
        // Capture any output that might be breaking JSON
        ob_start();
        
        // Verify authentication and admin/instructor role
        try {
            error_log('Course update - Verifying authentication');
            $userData = JWT::requireRole(['admin', 'instructor']);
            error_log('Course update - Authentication successful for user: ' . $userData->userId);
        } catch (Exception $e) {
            error_log('Course update - Authentication failed: ' . $e->getMessage());
            ob_end_clean();
            return ['success' => false, 'message' => 'Acesso negado'];
        }
        
        // Get database connection
        error_log('Course update - Getting database connection');
        $pdo = self::getConnection();
        if (!$pdo) {
            error_log('Course update - Database connection failed');
            ob_end_clean();
            return [
                'success' => false,
                'message' => 'Erro de conexão com banco de dados'
            ];
        }
        error_log('Course update - Database connection successful');
        
        try {
            error_log('Course update - Entering try block for course ID: ' . $id);
            
            // Check if course exists and verify permissions
            error_log('Course update - Checking if course exists');
            $checkStmt = $pdo->prepare("SELECT instructor_id, slug, thumbnail_file_path FROM courses WHERE id = :id");
            $checkStmt->execute(['id' => $id]);
            $course = $checkStmt->fetch();
            
            if (!$course) {
                error_log('Course update - Course not found');
                ob_end_clean();
                return [
                    'success' => false,
                    'message' => 'Curso não encontrado'
                ];
            }
            
            error_log('Course update - Course found, checking permissions');
            
            // Check permissions
            if ($userData->role !== 'admin' && $course['instructor_id'] !== $userData->userId) {
                error_log('Course update - Permission denied');
                ob_end_clean();
                return [
                    'success' => false,
                    'message' => 'Você não tem permissão para editar este curso'
                ];
            }
            
            error_log('Course update - Permissions OK, getting POST vars');
            
            // Debug request info
            error_log('Course update - Request method: ' . $_SERVER['REQUEST_METHOD']);
            error_log('Course update - Content type: ' . ($_SERVER['CONTENT_TYPE'] ?? 'not set'));
            error_log('Course update - Raw FILES: ' . print_r($_FILES, true));
            
            // Get POST vars
            $postVars = $request->getPostVars();
            error_log('Course update - PostVars from request: ' . print_r($postVars, true));
            
            // Validate required fields if provided
            $validationErrors = [];
            
            if (array_key_exists('title', $postVars) && empty(trim($postVars['title']))) {
                $validationErrors[] = 'O título do curso é obrigatório';
            }
            
            if (array_key_exists('category', $postVars) && empty(trim($postVars['category']))) {
                $validationErrors[] = 'A categoria do curso é obrigatória';
            }
            
            if (array_key_exists('price', $postVars) && !empty($postVars['price']) && !is_numeric($postVars['price'])) {
                $validationErrors[] = 'O preço deve ser um número válido';
            }
            
            if (array_key_exists('duration_hours', $postVars) && !empty($postVars['duration_hours']) && (!is_numeric($postVars['duration_hours']) || intval($postVars['duration_hours']) < 0)) {
                $validationErrors[] = 'A duração em horas deve ser um número positivo';
            }
            
            if (array_key_exists('duration_months', $postVars) && !empty($postVars['duration_months']) && (!is_numeric($postVars['duration_months']) || intval($postVars['duration_months']) < 0)) {
                $validationErrors[] = 'A duração em meses deve ser um número positivo';
            }
            
            if (!empty($validationErrors)) {
                http_response_code(400);
                ob_end_clean();
                return [
                    'success' => false,
                    'message' => 'Erro de validação: ' . implode(', ', $validationErrors),
                    'validation_errors' => $validationErrors
                ];
            }
            
            // Debug: Log received data
            error_log('Course update - POST vars: ' . print_r($postVars, true));
            error_log('Course update - FILES: ' . print_r($_FILES, true));
            
            error_log('Course update - Beginning transaction');
            
            // Begin transaction
            $pdo->beginTransaction();
            
            error_log('Course update - Transaction started successfully');
            
            // Handle image upload if present
            $newThumbnailUrl = null;
            $newThumbnailFilePath = null;
            
            // Check for image data in FILES array (for POST requests)
            if (isset($_FILES['thumbnail']) && $_FILES['thumbnail']['error'] === UPLOAD_ERR_OK) {
                error_log('Course update - Processing image upload from FILES');
                
                // Delete old thumbnail file if it exists
                if ($course['thumbnail_file_path']) {
                    $oldFilePath = __DIR__ . '/../../' . $course['thumbnail_file_path'];
                    if (file_exists($oldFilePath)) {
                        unlink($oldFilePath);
                        error_log('Course update - Deleted old thumbnail: ' . $oldFilePath);
                    }
                }
                
                $uploadResult = self::validateAndProcessImage($_FILES['thumbnail'], $userData->userId, $course['slug']);
                if (!$uploadResult['success']) {
                    error_log('Course update - Image upload failed: ' . $uploadResult['message']);
                    $pdo->rollBack();
                    ob_end_clean();
                    return $uploadResult;
                }
                
                $newThumbnailUrl = $uploadResult['url_path'];
                $newThumbnailFilePath = $uploadResult['relative_path'];
                error_log('Course update - Image uploaded successfully to: ' . $newThumbnailUrl);
            }
            // Check for image data in POST vars (for PUT requests with FormData)
            elseif (isset($postVars['thumbnail']) && !empty($postVars['thumbnail'])) {
                error_log('Course update - Processing image upload from POST vars (FormData)');
                
                // Delete old thumbnail file if it exists
                if ($course['thumbnail_file_path']) {
                    $oldFilePath = __DIR__ . '/../../' . $course['thumbnail_file_path'];
                    if (file_exists($oldFilePath)) {
                        unlink($oldFilePath);
                        error_log('Course update - Deleted old thumbnail: ' . $oldFilePath);
                    }
                }
                
                // Create a temporary file from the POST data
                $tempFile = tempnam(sys_get_temp_dir(), 'course_upload_');
                file_put_contents($tempFile, $postVars['thumbnail']);
                
                // Create a fake uploaded file array
                $fakeUploadedFile = [
                    'tmp_name' => $tempFile,
                    'size' => strlen($postVars['thumbnail']),
                    'error' => UPLOAD_ERR_OK,
                    'name' => 'thumbnail.png' // Default name
                ];
                
                $uploadResult = self::validateAndProcessImage($fakeUploadedFile, $userData->userId, $course['slug']);
                
                // Clean up temp file
                unlink($tempFile);
                
                if (!$uploadResult['success']) {
                    error_log('Course update - Image upload failed: ' . $uploadResult['message']);
                    $pdo->rollBack();
                    ob_end_clean();
                    return $uploadResult;
                }
                
                $newThumbnailUrl = $uploadResult['url_path'];
                $newThumbnailFilePath = $uploadResult['relative_path'];
                error_log('Course update - Image uploaded successfully to: ' . $newThumbnailUrl);
            }
            
            // Build update fields dynamically
            $updateFields = [];
            $params = ['id' => $id];
            
            $allowedFields = [
                'title', 'description', 'category', 'thumbnail_url', 'preview_video_url',
                'price', 'difficulty_level', 'duration_hours', 'duration_months',
                'target_audience', 'certification_available', 'status', 'visibility'
            ];
            
            foreach ($allowedFields as $field) {
                if (array_key_exists($field, $postVars)) {
                    $updateFields[] = "$field = :$field";
                    $params[$field] = $postVars[$field];
                }
            }
            
            // Handle array fields
            if (array_key_exists('requirements', $postVars)) {
                $updateFields[] = "requirements = :requirements";
                $params['requirements'] = is_array($postVars['requirements']) 
                    ? json_encode($postVars['requirements']) 
                    : $postVars['requirements'];
            }
            
            if (array_key_exists('objectives', $postVars)) {
                $updateFields[] = "objectives = :objectives";
                $params['objectives'] = is_array($postVars['objectives']) 
                    ? json_encode($postVars['objectives']) 
                    : $postVars['objectives'];
            }
            
            // Update slug if title changed
            if (array_key_exists('title', $postVars)) {
                $newSlug = self::generateSlug($postVars['title']);
                $originalSlug = $newSlug;
                $counter = 1;
                
                // Check if slug exists and make it unique (excluding current course)
                do {
                    $checkSlugStmt = $pdo->prepare("SELECT id FROM courses WHERE slug = :slug AND id != :id");
                    $checkSlugStmt->execute(['slug' => $newSlug, 'id' => $id]);
                    if ($checkSlugStmt->fetch()) {
                        $newSlug = $originalSlug . '-' . $counter;
                        $counter++;
                    } else {
                        break;
                    }
                } while (true);
                
                $updateFields[] = "slug = :slug";
                $params['slug'] = $newSlug;
            }
            
            // Add thumbnail URL and file path if image was uploaded
            if ($newThumbnailUrl) {
                $updateFields[] = "thumbnail_url = :thumbnail_url";
                $updateFields[] = "thumbnail_file_path = :thumbnail_file_path";
                $params['thumbnail_url'] = $newThumbnailUrl;
                $params['thumbnail_file_path'] = $newThumbnailFilePath;
                error_log('Course update - Added thumbnail_url to update fields: ' . $newThumbnailUrl);
            }
            
            // Debug: Log update status
            error_log('Course update - updateFields: ' . print_r($updateFields, true));
            error_log('Course update - newThumbnailUrl exists: ' . ($newThumbnailUrl ? 'yes' : 'no'));
            error_log('Course update - params: ' . print_r($params, true));
            
            if (empty($updateFields) && !$newThumbnailUrl) {
                error_log('Course update - No fields to update, rolling back');
                $pdo->rollBack();
                return [
                    'success' => false,
                    'message' => 'Nenhum campo para atualizar',
                    'debug' => [
                        'postVars' => $postVars,
                        'filesReceived' => !empty($_FILES),
                        'imageProcessed' => !empty($imageData),
                        'updateFields' => $updateFields
                    ]
                ];
            }
            
            // Add updated_at
            $updateFields[] = "updated_at = CURRENT_TIMESTAMP";
            
            // Update published_at if status changed to published
            if (array_key_exists('status', $postVars) && $postVars['status'] === 'published') {
                $updateFields[] = "published_at = CURRENT_TIMESTAMP";
            }
            
            $updateSql = "UPDATE courses SET " . implode(', ', $updateFields) . " WHERE id = :id";
            error_log('Course update - SQL: ' . $updateSql);
            error_log('Course update - About to execute update');
            
            $updateStmt = $pdo->prepare($updateSql);
            $updateStmt->execute($params);
            
            error_log('Course update - Update executed successfully, committing transaction');
            
            // Commit transaction
            $pdo->commit();
            
            error_log('Course update - Transaction committed successfully');
            
            // Clean any output buffer
            ob_end_clean();
            
            return [
                'success' => true,
                'message' => 'Curso atualizado com sucesso',
                'debug' => [
                    'postVars' => $postVars,
                    'filesReceived' => !empty($_FILES),
                    'imageProcessed' => !empty($newThumbnailUrl),
                    'updateFields' => $updateFields,
                    'sqlExecuted' => $updateSql
                ]
            ];
            
        } catch (Exception $e) {
            error_log('Course update - Exception caught: ' . $e->getMessage());
            error_log('Course update - Exception trace: ' . $e->getTraceAsString());
            
            // Check if transaction is still active before rolling back
            try {
                if ($pdo && $pdo->inTransaction()) {
                    error_log('Course update - Rolling back active transaction');
                    $pdo->rollBack();
                } else {
                    error_log('Course update - No active transaction to roll back');
                }
            } catch (Exception $rollbackError) {
                error_log('Course update - Error during rollback: ' . $rollbackError->getMessage());
            }
            
            error_log('Update course error: ' . $e->getMessage());
            
            // Clean any output buffer
            ob_end_clean();
            
            return [
                'success' => false,
                'message' => 'Erro ao atualizar curso',
                'error' => $e->getMessage(),
                'debug' => [
                    'postVars' => $postVars ?? [],
                    'filesReceived' => !empty($_FILES),
                    'updateFields' => $updateFields ?? [],
                    'exceptionTrace' => $e->getTraceAsString()
                ]
            ];
        }
    }
    
    /**
     * Delete course
     * DELETE /api/v1/courses/:id
     */
    public static function delete($request, $id) {
        // Verify authentication and admin role (only admin can delete courses)
        try {
            $userData = JWT::requireRole('admin');
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Acesso negado'];
        }
        
        // Get database connection
        $pdo = self::getConnection();
        if (!$pdo) {
            http_response_code(500);
            return [
                'success' => false,
                'message' => 'Erro de conexão com banco de dados'
            ];
        }
        
        try {
            // Check if course exists
            $checkStmt = $pdo->prepare("SELECT id, title FROM courses WHERE id = :id");
            $checkStmt->execute(['id' => $id]);
            $course = $checkStmt->fetch();
            
            if (!$course) {
                http_response_code(404);
                return [
                    'success' => false,
                    'message' => 'Curso não encontrado'
                ];
            }
            
            // Delete course (CASCADE will handle related tables)
            $deleteStmt = $pdo->prepare("DELETE FROM courses WHERE id = :id");
            $deleteStmt->execute(['id' => $id]);
            
            return [
                'success' => true,
                'message' => 'Curso excluído com sucesso'
            ];
            
        } catch (Exception $e) {
            error_log('Delete course error: ' . $e->getMessage());
            http_response_code(500);
            return [
                'success' => false,
                'message' => 'Erro ao excluir curso'
            ];
        }
    }
    
    /**
     * Serve course image with fallback to default SVG
     * GET /uploads/img/{userId}/courses/{courseSlug}/{filename}
     */
    public static function serveImage($request, $userId, $courseSlug, $filename) {
        // Construct file path
        $filePath = __DIR__ . "/../../uploads/img/{$userId}/courses/{$courseSlug}/{$filename}";
        
        // Check if file exists
        if (file_exists($filePath)) {
            // Get MIME type
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_file($finfo, $filePath);
            finfo_close($finfo);
            
            // Set headers
            header('Content-Type: ' . $mimeType);
            header('Content-Length: ' . filesize($filePath));
            header('Cache-Control: public, max-age=86400'); // Cache for 24 hours
            header('Content-Disposition: inline; filename="' . basename($filename) . '"');
            
            // Output file
            readfile($filePath);
            exit;
        } else {
            // File not found, return default SVG
            return self::getDefaultThumbnailSVG();
        }
    }
    
    /**
     * Generate default thumbnail SVG
     */
    private static function getDefaultThumbnailSVG() {
        $svg = '<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="400" height="300" fill="#f3f4f6"/>
  
  <!-- Gradient -->
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Book Icon -->
  <g transform="translate(200, 150)">
    <path d="M -40 -30 L -40 30 L 0 40 L 40 30 L 40 -30 L 0 -20 Z" fill="url(#grad1)" opacity="0.9"/>
    <path d="M 0 -20 L 0 40" stroke="white" stroke-width="2" fill="none"/>
    <path d="M -40 -30 L 0 -20 L 40 -30" stroke="white" stroke-width="2" fill="none"/>
  </g>
  
  <!-- Text -->
  <text x="200" y="230" font-family="Arial, sans-serif" font-size="16" fill="#6b7280" text-anchor="middle">
    Curso
  </text>
</svg>';
        
        header('Content-Type: image/svg+xml');
        header('Content-Length: ' . strlen($svg));
        header('Cache-Control: public, max-age=86400');
        
        echo $svg;
        exit;
    }
    
    /**
     * Upload course image
     * POST /api/v1/courses/{id}/upload-image
     */
    public static function uploadImage($request, $id) {
        // Verify authentication and admin/instructor role
        try {
            $userData = JWT::requireRole(['admin', 'instructor']);
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Acesso negado'];
        }
        
        // Check if file was uploaded
        if (!isset($_FILES['thumbnail']) || $_FILES['thumbnail']['error'] !== UPLOAD_ERR_OK) {
            return [
                'success' => false,
                'message' => 'No file uploaded or upload error.'
            ];
        }
        
        // Validate image type
        $image_type = exif_imagetype($_FILES['thumbnail']['tmp_name']);
        if (!in_array($image_type, [IMAGETYPE_JPEG, IMAGETYPE_PNG])) {
            return [
                'success' => false,
                'message' => 'Only JPG and PNG images are allowed.'
            ];
        }
        
        // Validate file size (10MB max)
        $max_size = 10 * 1024 * 1024;
        if ($_FILES['thumbnail']['size'] > $max_size) {
            return [
                'success' => false,
                'message' => 'File size exceeds 10MB.'
            ];
        }
        
        // Get database connection
        $pdo = self::getConnection();
        if (!$pdo) {
            return [
                'success' => false,
                'message' => 'Database connection error'
            ];
        }
        
        try {
            // Check if course exists and get course info
            $checkStmt = $pdo->prepare("SELECT instructor_id, slug, thumbnail_file_path FROM courses WHERE id = :id");
            $checkStmt->execute(['id' => $id]);
            $course = $checkStmt->fetch();
            
            if (!$course) {
                return [
                    'success' => false,
                    'message' => 'Course not found'
                ];
            }
            
            // Check permissions
            if ($userData->role !== 'admin' && $course['instructor_id'] !== $userData->userId) {
                return [
                    'success' => false,
                    'message' => 'You do not have permission to upload images for this course'
                ];
            }
            
            // Create upload directory if it doesn't exist
            $uploadDir = __DIR__ . '/../../uploads/course-images/';
            if (!is_dir($uploadDir)) {
                if (!mkdir($uploadDir, 0755, true)) {
                    return [
                        'success' => false,
                        'message' => 'Failed to create upload directory.'
                    ];
                }
            }
            
            // Create filename: course_[ID]_[hash]_[datetime].png
            $datetime = date('Y-m-d_H-i-s');
            $randomHash = uniqid();
            $filename = 'course_' . $id . '_' . $randomHash . '_' . $datetime . '.png';
            $destination = $uploadDir . $filename;
            
            // Process image
            if ($image_type == IMAGETYPE_JPEG) {
                $src_image = imagecreatefromjpeg($_FILES['thumbnail']['tmp_name']);
            } elseif ($image_type == IMAGETYPE_PNG) {
                $src_image = imagecreatefrompng($_FILES['thumbnail']['tmp_name']);
            }
            
            if (!$src_image) {
                return [
                    'success' => false,
                    'message' => 'Failed to create image resource.'
                ];
            }
            
            // Resize image
            $src_width = imagesx($src_image);
            $src_height = imagesy($src_image);
            $dst_width = 400;
            $dst_height = 300;
            $dst_image = imagecreatetruecolor($dst_width, $dst_height);
            imagecopyresampled($dst_image, $src_image, 0, 0, 0, 0, $dst_width, $dst_height, $src_width, $src_height);
            
            // Save image
            if (!imagepng($dst_image, $destination)) {
                imagedestroy($src_image);
                imagedestroy($dst_image);
                return [
                    'success' => false,
                    'message' => 'Failed to save image.'
                ];
            }
            
            // Clean up memory
            imagedestroy($src_image);
            imagedestroy($dst_image);
            
            // Delete old thumbnail if it exists
            if ($course['thumbnail_file_path']) {
                $oldFilePath = __DIR__ . '/../../' . $course['thumbnail_file_path'];
                if (file_exists($oldFilePath)) {
                    unlink($oldFilePath);
                }
            }
            
            // Update course with new thumbnail URL
            $thumbnailUrl = '/uploads/course-images/' . $filename;
            
            $stmt = $pdo->prepare("UPDATE courses SET thumbnail_url = ?, thumbnail_file_path = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
            $stmt->execute([$thumbnailUrl, 'uploads/course-images/' . $filename, $id]);
            
            return [
                'success' => true,
                'image_url' => $thumbnailUrl,
                'filename' => $filename,
                'message' => 'Image uploaded successfully'
            ];
            
        } catch (Exception $e) {
            error_log('Upload course image error: ' . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Error uploading image'
            ];
        }
    }
    
}