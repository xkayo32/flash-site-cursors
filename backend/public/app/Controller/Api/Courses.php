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
        $host = '173.208.151.106';
        $port = '5532';
        $dbname = 'estudos_db';
        $user = 'estudos_user';
        $pass = 'estudos_pass';
        
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
            
            // Format courses data
            $formattedCourses = array_map(function($course) {
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
                    'thumbnail' => $course['thumbnail_url'],
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
                'thumbnail' => $course['thumbnail_url'],
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
        if (empty($title) || empty($category)) {
            http_response_code(400);
            return [
                'success' => false,
                'message' => 'Título e categoria são obrigatórios'
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
            
            // Create course
            $courseStmt = $pdo->prepare("
                INSERT INTO courses (
                    title, slug, description, category, instructor_id, thumbnail_url,
                    preview_video_url, price, difficulty_level, duration_hours, duration_months,
                    requirements, objectives, target_audience, certification_available, status
                ) VALUES (
                    :title, :slug, :description, :category, :instructor_id, :thumbnail_url,
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
                'thumbnail_url' => $thumbnail,
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
        // Verify authentication and admin/instructor role
        try {
            $userData = JWT::requireRole(['admin', 'instructor']);
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
            // Check if course exists and verify permissions
            $checkStmt = $pdo->prepare("SELECT instructor_id FROM courses WHERE id = :id");
            $checkStmt->execute(['id' => $id]);
            $course = $checkStmt->fetch();
            
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
                    'message' => 'Você não tem permissão para editar este curso'
                ];
            }
            
            // Get POST vars
            $postVars = $request->getPostVars();
            
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
            
            if (empty($updateFields)) {
                return [
                    'success' => false,
                    'message' => 'Nenhum campo para atualizar'
                ];
            }
            
            // Add updated_at
            $updateFields[] = "updated_at = CURRENT_TIMESTAMP";
            
            // Update published_at if status changed to published
            if (array_key_exists('status', $postVars) && $postVars['status'] === 'published') {
                $updateFields[] = "published_at = CURRENT_TIMESTAMP";
            }
            
            $updateSql = "UPDATE courses SET " . implode(', ', $updateFields) . " WHERE id = :id";
            $updateStmt = $pdo->prepare($updateSql);
            $updateStmt->execute($params);
            
            return [
                'success' => true,
                'message' => 'Curso atualizado com sucesso'
            ];
            
        } catch (Exception $e) {
            error_log('Update course error: ' . $e->getMessage());
            http_response_code(500);
            return [
                'success' => false,
                'message' => 'Erro ao atualizar curso'
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
}