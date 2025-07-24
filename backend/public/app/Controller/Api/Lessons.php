<?php
namespace App\Controller\Api;

use App\Utils\JWT;
use PDO;
use Exception;

class Lessons {
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
     * Check if user can access course module
     */
    private static function canAccessModule($pdo, $moduleId, $userData) {
        if ($userData->role === 'admin') {
            return true;
        }
        
        $stmt = $pdo->prepare("
            SELECT c.instructor_id 
            FROM course_modules cm
            INNER JOIN courses c ON cm.course_id = c.id
            WHERE cm.id = :module_id
        ");
        $stmt->execute(['module_id' => $moduleId]);
        $result = $stmt->fetch();
        
        return $result && $result['instructor_id'] === $userData->userId;
    }
    
    /**
     * List lessons in a module
     * GET /api/v1/modules/:moduleId/lessons
     */
    public static function list($request, $moduleId) {
        // Verify authentication
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
            // Check if user can access module
            if (!self::canAccessModule($pdo, $moduleId, $userData)) {
                http_response_code(403);
                return [
                    'success' => false,
                    'message' => 'Você não tem permissão para acessar este módulo'
                ];
            }
            
            // Get lessons
            $stmt = $pdo->prepare("
                SELECT l.*,
                       (SELECT COUNT(*) FROM lesson_resources WHERE lesson_id = l.id) as resources_count
                FROM lessons l
                WHERE l.module_id = :module_id
                ORDER BY l.order_index
            ");
            $stmt->execute(['module_id' => $moduleId]);
            $lessons = $stmt->fetchAll();
            
            // Format lessons data
            $formattedLessons = array_map(function($lesson) {
                return [
                    'id' => $lesson['id'],
                    'moduleId' => $lesson['module_id'],
                    'title' => $lesson['title'],
                    'description' => $lesson['description'],
                    'type' => $lesson['type'],
                    'orderIndex' => (int)$lesson['order_index'],
                    'duration' => (int)$lesson['duration_minutes'],
                    'videoUrl' => $lesson['video_url'],
                    'content' => $lesson['content'],
                    'isPublished' => (bool)$lesson['is_published'],
                    'isFree' => (bool)$lesson['is_free'],
                    'stats' => [
                        'resources' => (int)$lesson['resources_count']
                    ],
                    'createdAt' => $lesson['created_at'],
                    'updatedAt' => $lesson['updated_at']
                ];
            }, $lessons);
            
            return [
                'success' => true,
                'data' => $formattedLessons
            ];
            
        } catch (Exception $e) {
            error_log('List lessons error: ' . $e->getMessage());
            http_response_code(500);
            return [
                'success' => false,
                'message' => 'Erro ao listar aulas'
            ];
        }
    }
    
    /**
     * Get single lesson
     * GET /api/v1/modules/:moduleId/lessons/:id
     */
    public static function get($request, $moduleId, $id) {
        // Verify authentication
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
            // Check if user can access module
            if (!self::canAccessModule($pdo, $moduleId, $userData)) {
                http_response_code(403);
                return [
                    'success' => false,
                    'message' => 'Você não tem permissão para acessar este módulo'
                ];
            }
            
            // Get lesson details
            $stmt = $pdo->prepare("
                SELECT l.*
                FROM lessons l
                WHERE l.id = :id AND l.module_id = :module_id
            ");
            $stmt->execute(['id' => $id, 'module_id' => $moduleId]);
            $lesson = $stmt->fetch();
            
            if (!$lesson) {
                http_response_code(404);
                return [
                    'success' => false,
                    'message' => 'Aula não encontrada'
                ];
            }
            
            // Get lesson resources
            $resourcesStmt = $pdo->prepare("
                SELECT id, title, type, url, size_bytes, created_at
                FROM lesson_resources
                WHERE lesson_id = :lesson_id
                ORDER BY title
            ");
            $resourcesStmt->execute(['lesson_id' => $id]);
            $resources = $resourcesStmt->fetchAll();
            
            $formattedLesson = [
                'id' => $lesson['id'],
                'moduleId' => $lesson['module_id'],
                'title' => $lesson['title'],
                'description' => $lesson['description'],
                'type' => $lesson['type'],
                'orderIndex' => (int)$lesson['order_index'],
                'duration' => (int)$lesson['duration_minutes'],
                'videoUrl' => $lesson['video_url'],
                'content' => $lesson['content'],
                'isPublished' => (bool)$lesson['is_published'],
                'isFree' => (bool)$lesson['is_free'],
                'resources' => array_map(function($resource) {
                    return [
                        'id' => $resource['id'],
                        'title' => $resource['title'],
                        'type' => $resource['type'],
                        'url' => $resource['url'],
                        'size' => (int)$resource['size_bytes'],
                        'createdAt' => $resource['created_at']
                    ];
                }, $resources),
                'createdAt' => $lesson['created_at'],
                'updatedAt' => $lesson['updated_at']
            ];
            
            return [
                'success' => true,
                'data' => $formattedLesson
            ];
            
        } catch (Exception $e) {
            error_log('Get lesson error: ' . $e->getMessage());
            http_response_code(500);
            return [
                'success' => false,
                'message' => 'Erro ao buscar aula'
            ];
        }
    }
    
    /**
     * Create new lesson
     * POST /api/v1/modules/:moduleId/lessons
     */
    public static function create($request, $moduleId) {
        // Verify authentication
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
            // Check if user can access module
            if (!self::canAccessModule($pdo, $moduleId, $userData)) {
                http_response_code(403);
                return [
                    'success' => false,
                    'message' => 'Você não tem permissão para editar este módulo'
                ];
            }
            
            // Get POST vars
            $postVars = $request->getPostVars();
            
            $title = $postVars['title'] ?? '';
            $description = $postVars['description'] ?? '';
            $type = $postVars['type'] ?? 'video';
            $orderIndex = $postVars['order_index'] ?? null;
            $duration = $postVars['duration_minutes'] ?? null;
            $videoUrl = $postVars['video_url'] ?? null;
            $content = $postVars['content'] ?? null;
            $isPublished = isset($postVars['is_published']) ? (bool)$postVars['is_published'] : false;
            $isFree = isset($postVars['is_free']) ? (bool)$postVars['is_free'] : false;
            
            // Validate input
            if (empty($title)) {
                http_response_code(400);
                return [
                    'success' => false,
                    'message' => 'Título é obrigatório'
                ];
            }
            
            // Validate type
            $validTypes = ['video', 'text', 'quiz', 'assignment', 'live'];
            if (!in_array($type, $validTypes)) {
                http_response_code(400);
                return [
                    'success' => false,
                    'message' => 'Tipo de aula inválido'
                ];
            }
            
            // If no order index provided, set as next available
            if ($orderIndex === null) {
                $maxOrderStmt = $pdo->prepare("SELECT COALESCE(MAX(order_index), 0) + 1 as next_order FROM lessons WHERE module_id = :module_id");
                $maxOrderStmt->execute(['module_id' => $moduleId]);
                $orderIndex = $maxOrderStmt->fetchColumn();
            }
            
            // Create lesson
            $stmt = $pdo->prepare("
                INSERT INTO lessons (
                    module_id, title, description, type, order_index, duration_minutes,
                    video_url, content, is_published, is_free
                ) VALUES (
                    :module_id, :title, :description, :type, :order_index, :duration_minutes,
                    :video_url, :content, :is_published, :is_free
                ) RETURNING id
            ");
            
            $stmt->execute([
                'module_id' => $moduleId,
                'title' => $title,
                'description' => $description,
                'type' => $type,
                'order_index' => $orderIndex,
                'duration_minutes' => $duration,
                'video_url' => $videoUrl,
                'content' => $content,
                'is_published' => $isPublished,
                'is_free' => $isFree
            ]);
            
            $lessonId = $stmt->fetchColumn();
            
            return [
                'success' => true,
                'message' => 'Aula criada com sucesso',
                'data' => [
                    'id' => $lessonId,
                    'title' => $title,
                    'type' => $type,
                    'orderIndex' => (int)$orderIndex,
                    'isPublished' => $isPublished
                ]
            ];
            
        } catch (Exception $e) {
            error_log('Create lesson error: ' . $e->getMessage());
            http_response_code(500);
            return [
                'success' => false,
                'message' => 'Erro ao criar aula'
            ];
        }
    }
    
    /**
     * Update lesson
     * PUT /api/v1/modules/:moduleId/lessons/:id
     */
    public static function update($request, $moduleId, $id) {
        // Verify authentication
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
            // Check if user can access module
            if (!self::canAccessModule($pdo, $moduleId, $userData)) {
                http_response_code(403);
                return [
                    'success' => false,
                    'message' => 'Você não tem permissão para editar este módulo'
                ];
            }
            
            // Check if lesson exists
            $checkStmt = $pdo->prepare("SELECT id FROM lessons WHERE id = :id AND module_id = :module_id");
            $checkStmt->execute(['id' => $id, 'module_id' => $moduleId]);
            
            if (!$checkStmt->fetch()) {
                http_response_code(404);
                return [
                    'success' => false,
                    'message' => 'Aula não encontrada'
                ];
            }
            
            // Get POST vars
            $postVars = $request->getPostVars();
            
            // Build update fields dynamically
            $updateFields = [];
            $params = ['id' => $id];
            
            $allowedFields = [
                'title', 'description', 'type', 'order_index', 'duration_minutes',
                'video_url', 'content', 'is_published', 'is_free'
            ];
            
            foreach ($allowedFields as $field) {
                if (array_key_exists($field, $postVars)) {
                    // Validate type if provided
                    if ($field === 'type') {
                        $validTypes = ['video', 'text', 'quiz', 'assignment', 'live'];
                        if (!in_array($postVars[$field], $validTypes)) {
                            http_response_code(400);
                            return [
                                'success' => false,
                                'message' => 'Tipo de aula inválido'
                            ];
                        }
                    }
                    
                    $updateFields[] = "$field = :$field";
                    $params[$field] = $postVars[$field];
                }
            }
            
            if (empty($updateFields)) {
                return [
                    'success' => false,
                    'message' => 'Nenhum campo para atualizar'
                ];
            }
            
            // Add updated_at
            $updateFields[] = "updated_at = CURRENT_TIMESTAMP";
            
            $updateSql = "UPDATE lessons SET " . implode(', ', $updateFields) . " WHERE id = :id";
            $updateStmt = $pdo->prepare($updateSql);
            $updateStmt->execute($params);
            
            return [
                'success' => true,
                'message' => 'Aula atualizada com sucesso'
            ];
            
        } catch (Exception $e) {
            error_log('Update lesson error: ' . $e->getMessage());
            http_response_code(500);
            return [
                'success' => false,
                'message' => 'Erro ao atualizar aula'
            ];
        }
    }
    
    /**
     * Delete lesson
     * DELETE /api/v1/modules/:moduleId/lessons/:id
     */
    public static function delete($request, $moduleId, $id) {
        // Verify authentication
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
            // Check if user can access module
            if (!self::canAccessModule($pdo, $moduleId, $userData)) {
                http_response_code(403);
                return [
                    'success' => false,
                    'message' => 'Você não tem permissão para editar este módulo'
                ];
            }
            
            // Check if lesson exists
            $checkStmt = $pdo->prepare("SELECT id, title FROM lessons WHERE id = :id AND module_id = :module_id");
            $checkStmt->execute(['id' => $id, 'module_id' => $moduleId]);
            $lesson = $checkStmt->fetch();
            
            if (!$lesson) {
                http_response_code(404);
                return [
                    'success' => false,
                    'message' => 'Aula não encontrada'
                ];
            }
            
            // Delete lesson (CASCADE will handle resources)
            $deleteStmt = $pdo->prepare("DELETE FROM lessons WHERE id = :id");
            $deleteStmt->execute(['id' => $id]);
            
            return [
                'success' => true,
                'message' => 'Aula excluída com sucesso'
            ];
            
        } catch (Exception $e) {
            error_log('Delete lesson error: ' . $e->getMessage());
            http_response_code(500);
            return [
                'success' => false,
                'message' => 'Erro ao excluir aula'
            ];
        }
    }
    
    /**
     * Reorder lessons in a module
     * PUT /api/v1/modules/:moduleId/lessons/reorder
     */
    public static function reorder($request, $moduleId) {
        // Verify authentication
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
            // Check if user can access module
            if (!self::canAccessModule($pdo, $moduleId, $userData)) {
                http_response_code(403);
                return [
                    'success' => false,
                    'message' => 'Você não tem permissão para editar este módulo'
                ];
            }
            
            // Get POST vars
            $postVars = $request->getPostVars();
            $lessonIds = $postVars['lesson_ids'] ?? [];
            
            if (!is_array($lessonIds) || empty($lessonIds)) {
                http_response_code(400);
                return [
                    'success' => false,
                    'message' => 'Lista de IDs das aulas é obrigatória'
                ];
            }
            
            // Begin transaction
            $pdo->beginTransaction();
            
            // Update order for each lesson
            $updateStmt = $pdo->prepare("
                UPDATE lessons 
                SET order_index = :order_index, updated_at = CURRENT_TIMESTAMP 
                WHERE id = :id AND module_id = :module_id
            ");
            
            foreach ($lessonIds as $index => $lessonId) {
                $updateStmt->execute([
                    'order_index' => $index + 1,
                    'id' => $lessonId,
                    'module_id' => $moduleId
                ]);
            }
            
            // Commit transaction
            $pdo->commit();
            
            return [
                'success' => true,
                'message' => 'Ordem das aulas atualizada com sucesso'
            ];
            
        } catch (Exception $e) {
            $pdo->rollBack();
            error_log('Reorder lessons error: ' . $e->getMessage());
            http_response_code(500);
            return [
                'success' => false,
                'message' => 'Erro ao reordenar aulas'
            ];
        }
    }
    
    /**
     * Add resource to lesson
     * POST /api/v1/modules/:moduleId/lessons/:lessonId/resources
     */
    public static function addResource($request, $moduleId, $lessonId) {
        // Verify authentication
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
            // Check if user can access module
            if (!self::canAccessModule($pdo, $moduleId, $userData)) {
                http_response_code(403);
                return [
                    'success' => false,
                    'message' => 'Você não tem permissão para editar este módulo'
                ];
            }
            
            // Get POST vars
            $postVars = $request->getPostVars();
            
            $title = $postVars['title'] ?? '';
            $type = $postVars['type'] ?? '';
            $url = $postVars['url'] ?? '';
            $sizeBytes = $postVars['size_bytes'] ?? null;
            
            // Validate input
            if (empty($title) || empty($type) || empty($url)) {
                http_response_code(400);
                return [
                    'success' => false,
                    'message' => 'Título, tipo e URL são obrigatórios'
                ];
            }
            
            // Validate type
            $validTypes = ['pdf', 'video', 'link', 'download'];
            if (!in_array($type, $validTypes)) {
                http_response_code(400);
                return [
                    'success' => false,
                    'message' => 'Tipo de recurso inválido'
                ];
            }
            
            // Create resource
            $stmt = $pdo->prepare("
                INSERT INTO lesson_resources (lesson_id, title, type, url, size_bytes)
                VALUES (:lesson_id, :title, :type, :url, :size_bytes)
                RETURNING id
            ");
            
            $stmt->execute([
                'lesson_id' => $lessonId,
                'title' => $title,
                'type' => $type,
                'url' => $url,
                'size_bytes' => $sizeBytes
            ]);
            
            $resourceId = $stmt->fetchColumn();
            
            return [
                'success' => true,
                'message' => 'Recurso adicionado com sucesso',
                'data' => [
                    'id' => $resourceId,
                    'title' => $title,
                    'type' => $type,
                    'url' => $url
                ]
            ];
            
        } catch (Exception $e) {
            error_log('Add lesson resource error: ' . $e->getMessage());
            http_response_code(500);
            return [
                'success' => false,
                'message' => 'Erro ao adicionar recurso'
            ];
        }
    }
}