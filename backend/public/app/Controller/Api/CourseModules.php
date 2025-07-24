<?php
namespace App\Controller\Api;

use App\Utils\JWT;
use PDO;
use Exception;

class CourseModules {
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
     * Check if user can access course
     */
    private static function canAccessCourse($pdo, $courseId, $userData) {
        if ($userData->role === 'admin') {
            return true;
        }
        
        $stmt = $pdo->prepare("SELECT instructor_id FROM courses WHERE id = :id");
        $stmt->execute(['id' => $courseId]);
        $course = $stmt->fetch();
        
        return $course && $course['instructor_id'] === $userData->userId;
    }
    
    /**
     * List course modules
     * GET /api/v1/courses/:courseId/modules
     */
    public static function list($request, $courseId) {
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
            // Check if user can access course
            if (!self::canAccessCourse($pdo, $courseId, $userData)) {
                http_response_code(403);
                return [
                    'success' => false,
                    'message' => 'Você não tem permissão para acessar este curso'
                ];
            }
            
            // Get modules with lesson counts
            $stmt = $pdo->prepare("
                SELECT cm.*, 
                       (SELECT COUNT(*) FROM lessons WHERE module_id = cm.id) as lessons_count,
                       (SELECT SUM(duration_minutes) FROM lessons WHERE module_id = cm.id) as total_duration
                FROM course_modules cm
                WHERE cm.course_id = :course_id
                ORDER BY cm.order_index
            ");
            $stmt->execute(['course_id' => $courseId]);
            $modules = $stmt->fetchAll();
            
            // Format modules data
            $formattedModules = array_map(function($module) {
                return [
                    'id' => $module['id'],
                    'title' => $module['title'],
                    'description' => $module['description'],
                    'orderIndex' => (int)$module['order_index'],
                    'isPublished' => (bool)$module['is_published'],
                    'stats' => [
                        'lessons' => (int)$module['lessons_count'],
                        'duration' => (int)$module['total_duration']
                    ],
                    'createdAt' => $module['created_at'],
                    'updatedAt' => $module['updated_at']
                ];
            }, $modules);
            
            return [
                'success' => true,
                'data' => $formattedModules
            ];
            
        } catch (Exception $e) {
            error_log('List course modules error: ' . $e->getMessage());
            http_response_code(500);
            return [
                'success' => false,
                'message' => 'Erro ao listar módulos'
            ];
        }
    }
    
    /**
     * Get single module
     * GET /api/v1/courses/:courseId/modules/:id
     */
    public static function get($request, $courseId, $id) {
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
            // Check if user can access course
            if (!self::canAccessCourse($pdo, $courseId, $userData)) {
                http_response_code(403);
                return [
                    'success' => false,
                    'message' => 'Você não tem permissão para acessar este curso'
                ];
            }
            
            // Get module details with lessons
            $stmt = $pdo->prepare("
                SELECT cm.*, 
                       (SELECT COUNT(*) FROM lessons WHERE module_id = cm.id) as lessons_count
                FROM course_modules cm
                WHERE cm.id = :id AND cm.course_id = :course_id
            ");
            $stmt->execute(['id' => $id, 'course_id' => $courseId]);
            $module = $stmt->fetch();
            
            if (!$module) {
                http_response_code(404);
                return [
                    'success' => false,
                    'message' => 'Módulo não encontrado'
                ];
            }
            
            // Get lessons for this module
            $lessonsStmt = $pdo->prepare("
                SELECT id, title, description, type, order_index, duration_minutes,
                       video_url, is_published, is_free, created_at, updated_at
                FROM lessons
                WHERE module_id = :module_id
                ORDER BY order_index
            ");
            $lessonsStmt->execute(['module_id' => $id]);
            $lessons = $lessonsStmt->fetchAll();
            
            $formattedModule = [
                'id' => $module['id'],
                'courseId' => $module['course_id'],
                'title' => $module['title'],
                'description' => $module['description'],
                'orderIndex' => (int)$module['order_index'],
                'isPublished' => (bool)$module['is_published'],
                'stats' => [
                    'lessons' => (int)$module['lessons_count']
                ],
                'lessons' => array_map(function($lesson) {
                    return [
                        'id' => $lesson['id'],
                        'title' => $lesson['title'],
                        'description' => $lesson['description'],
                        'type' => $lesson['type'],
                        'orderIndex' => (int)$lesson['order_index'],
                        'duration' => (int)$lesson['duration_minutes'],
                        'videoUrl' => $lesson['video_url'],
                        'isPublished' => (bool)$lesson['is_published'],
                        'isFree' => (bool)$lesson['is_free'],
                        'createdAt' => $lesson['created_at'],
                        'updatedAt' => $lesson['updated_at']
                    ];
                }, $lessons),
                'createdAt' => $module['created_at'],
                'updatedAt' => $module['updated_at']
            ];
            
            return [
                'success' => true,
                'data' => $formattedModule
            ];
            
        } catch (Exception $e) {
            error_log('Get course module error: ' . $e->getMessage());
            http_response_code(500);
            return [
                'success' => false,
                'message' => 'Erro ao buscar módulo'
            ];
        }
    }
    
    /**
     * Create new module
     * POST /api/v1/courses/:courseId/modules
     */
    public static function create($request, $courseId) {
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
            // Check if user can access course
            if (!self::canAccessCourse($pdo, $courseId, $userData)) {
                http_response_code(403);
                return [
                    'success' => false,
                    'message' => 'Você não tem permissão para editar este curso'
                ];
            }
            
            // Get POST vars
            $postVars = $request->getPostVars();
            
            $title = $postVars['title'] ?? '';
            $description = $postVars['description'] ?? '';
            $orderIndex = $postVars['order_index'] ?? null;
            $isPublished = isset($postVars['is_published']) ? (bool)$postVars['is_published'] : false;
            
            // Validate input
            if (empty($title)) {
                http_response_code(400);
                return [
                    'success' => false,
                    'message' => 'Título é obrigatório'
                ];
            }
            
            // If no order index provided, set as next available
            if ($orderIndex === null) {
                $maxOrderStmt = $pdo->prepare("SELECT COALESCE(MAX(order_index), 0) + 1 as next_order FROM course_modules WHERE course_id = :course_id");
                $maxOrderStmt->execute(['course_id' => $courseId]);
                $orderIndex = $maxOrderStmt->fetchColumn();
            }
            
            // Create module
            $stmt = $pdo->prepare("
                INSERT INTO course_modules (course_id, title, description, order_index, is_published)
                VALUES (:course_id, :title, :description, :order_index, :is_published)
                RETURNING id
            ");
            
            $stmt->execute([
                'course_id' => $courseId,
                'title' => $title,
                'description' => $description,
                'order_index' => $orderIndex,
                'is_published' => $isPublished
            ]);
            
            $moduleId = $stmt->fetchColumn();
            
            return [
                'success' => true,
                'message' => 'Módulo criado com sucesso',
                'data' => [
                    'id' => $moduleId,
                    'title' => $title,
                    'orderIndex' => (int)$orderIndex,
                    'isPublished' => $isPublished
                ]
            ];
            
        } catch (Exception $e) {
            error_log('Create module error: ' . $e->getMessage());
            http_response_code(500);
            return [
                'success' => false,
                'message' => 'Erro ao criar módulo'
            ];
        }
    }
    
    /**
     * Update module
     * PUT /api/v1/courses/:courseId/modules/:id
     */
    public static function update($request, $courseId, $id) {
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
            // Check if user can access course
            if (!self::canAccessCourse($pdo, $courseId, $userData)) {
                http_response_code(403);
                return [
                    'success' => false,
                    'message' => 'Você não tem permissão para editar este curso'
                ];
            }
            
            // Check if module exists
            $checkStmt = $pdo->prepare("SELECT id FROM course_modules WHERE id = :id AND course_id = :course_id");
            $checkStmt->execute(['id' => $id, 'course_id' => $courseId]);
            
            if (!$checkStmt->fetch()) {
                http_response_code(404);
                return [
                    'success' => false,
                    'message' => 'Módulo não encontrado'
                ];
            }
            
            // Get POST vars
            $postVars = $request->getPostVars();
            
            // Build update fields dynamically
            $updateFields = [];
            $params = ['id' => $id];
            
            $allowedFields = ['title', 'description', 'order_index', 'is_published'];
            
            foreach ($allowedFields as $field) {
                if (array_key_exists($field, $postVars)) {
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
            
            $updateSql = "UPDATE course_modules SET " . implode(', ', $updateFields) . " WHERE id = :id";
            $updateStmt = $pdo->prepare($updateSql);
            $updateStmt->execute($params);
            
            return [
                'success' => true,
                'message' => 'Módulo atualizado com sucesso'
            ];
            
        } catch (Exception $e) {
            error_log('Update module error: ' . $e->getMessage());
            http_response_code(500);
            return [
                'success' => false,
                'message' => 'Erro ao atualizar módulo'
            ];
        }
    }
    
    /**
     * Delete module
     * DELETE /api/v1/courses/:courseId/modules/:id
     */
    public static function delete($request, $courseId, $id) {
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
            // Check if user can access course
            if (!self::canAccessCourse($pdo, $courseId, $userData)) {
                http_response_code(403);
                return [
                    'success' => false,
                    'message' => 'Você não tem permissão para editar este curso'
                ];
            }
            
            // Check if module exists
            $checkStmt = $pdo->prepare("SELECT id, title FROM course_modules WHERE id = :id AND course_id = :course_id");
            $checkStmt->execute(['id' => $id, 'course_id' => $courseId]);
            $module = $checkStmt->fetch();
            
            if (!$module) {
                http_response_code(404);
                return [
                    'success' => false,
                    'message' => 'Módulo não encontrado'
                ];
            }
            
            // Delete module (CASCADE will handle lessons)
            $deleteStmt = $pdo->prepare("DELETE FROM course_modules WHERE id = :id");
            $deleteStmt->execute(['id' => $id]);
            
            return [
                'success' => true,
                'message' => 'Módulo excluído com sucesso'
            ];
            
        } catch (Exception $e) {
            error_log('Delete module error: ' . $e->getMessage());
            http_response_code(500);
            return [
                'success' => false,
                'message' => 'Erro ao excluir módulo'
            ];
        }
    }
    
    /**
     * Reorder modules
     * PUT /api/v1/courses/:courseId/modules/reorder
     */
    public static function reorder($request, $courseId) {
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
            // Check if user can access course
            if (!self::canAccessCourse($pdo, $courseId, $userData)) {
                http_response_code(403);
                return [
                    'success' => false,
                    'message' => 'Você não tem permissão para editar este curso'
                ];
            }
            
            // Get POST vars
            $postVars = $request->getPostVars();
            $moduleIds = $postVars['module_ids'] ?? [];
            
            if (!is_array($moduleIds) || empty($moduleIds)) {
                http_response_code(400);
                return [
                    'success' => false,
                    'message' => 'Lista de IDs dos módulos é obrigatória'
                ];
            }
            
            // Begin transaction
            $pdo->beginTransaction();
            
            // Update order for each module
            $updateStmt = $pdo->prepare("
                UPDATE course_modules 
                SET order_index = :order_index, updated_at = CURRENT_TIMESTAMP 
                WHERE id = :id AND course_id = :course_id
            ");
            
            foreach ($moduleIds as $index => $moduleId) {
                $updateStmt->execute([
                    'order_index' => $index + 1,
                    'id' => $moduleId,
                    'course_id' => $courseId
                ]);
            }
            
            // Commit transaction
            $pdo->commit();
            
            return [
                'success' => true,
                'message' => 'Ordem dos módulos atualizada com sucesso'
            ];
            
        } catch (Exception $e) {
            $pdo->rollBack();
            error_log('Reorder modules error: ' . $e->getMessage());
            http_response_code(500);
            return [
                'success' => false,
                'message' => 'Erro ao reordenar módulos'
            ];
        }
    }
}