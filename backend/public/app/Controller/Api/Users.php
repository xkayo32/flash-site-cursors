<?php
namespace App\Controller\Api;

use App\Utils\JWT;
use PDO;
use Exception;

class Users {
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
     * List all users
     * GET /api/v1/users
     */
    public static function list($request) {
        // Verify authentication and admin role
        try {
            $userData = JWT::requireRole('admin');
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Acesso negado'];
        }
        
        // Get query parameters
        $queryParams = $request->getQueryParams();
        $page = (int)($queryParams['page'] ?? 1);
        $limit = (int)($queryParams['limit'] ?? 10);
        $search = $queryParams['search'] ?? '';
        $status = $queryParams['status'] ?? '';
        $role = $queryParams['role'] ?? '';
        $includeInactive = isset($queryParams['include_inactive']) && $queryParams['include_inactive'] === 'true';
        
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
            
            // By default, exclude inactive users unless specifically requested
            if (!$includeInactive && empty($status)) {
                $whereConditions[] = "u.status != 'inactive'";
            }
            
            if (!empty($search)) {
                $whereConditions[] = "(u.email ILIKE :search OR p.name ILIKE :search)";
                $params['search'] = "%$search%";
            }
            
            if (!empty($status)) {
                $whereConditions[] = "u.status = :status";
                $params['status'] = $status;
            }
            
            if (!empty($role)) {
                $whereConditions[] = "u.role = :role";
                $params['role'] = $role;
            }
            
            $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
            
            // Count total records
            $countStmt = $pdo->prepare("
                SELECT COUNT(*) as total
                FROM users u
                LEFT JOIN user_profiles p ON u.id = p.user_id
                $whereClause
            ");
            $countStmt->execute($params);
            $total = $countStmt->fetchColumn();
            
            // Get users with pagination
            $stmt = $pdo->prepare("
                SELECT u.id, u.email, u.role, u.status, u.email_verified, u.created_at, u.last_login,
                       p.name, p.avatar_url, p.phone,
                       s.status as subscription_status, sp.name as plan_name
                FROM users u
                LEFT JOIN user_profiles p ON u.id = p.user_id
                LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
                LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
                $whereClause
                ORDER BY u.created_at DESC
                LIMIT :limit OFFSET :offset
            ");
            
            $params['limit'] = $limit;
            $params['offset'] = $offset;
            $stmt->execute($params);
            $users = $stmt->fetchAll();
            
            // Format users data
            $formattedUsers = array_map(function($user) {
                return [
                    'id' => $user['id'],
                    'name' => $user['name'] ?? 'Sem nome',
                    'email' => $user['email'],
                    'role' => $user['role'],
                    'status' => $user['status'],
                    'avatar' => $user['avatar_url'],
                    'phone' => $user['phone'],
                    'emailVerified' => $user['email_verified'],
                    'subscription' => [
                        'plan' => $user['plan_name'] ?? 'Básico',
                        'status' => $user['subscription_status'] ?? 'inactive'
                    ],
                    'createdAt' => $user['created_at'],
                    'lastLogin' => $user['last_login']
                ];
            }, $users);
            
            return [
                'success' => true,
                'data' => $formattedUsers,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => (int)$total,
                    'pages' => ceil($total / $limit)
                ]
            ];
            
        } catch (Exception $e) {
            error_log('List users error: ' . $e->getMessage());
            http_response_code(500);
            return [
                'success' => false,
                'message' => 'Erro ao listar usuários'
            ];
        }
    }
    
    /**
     * Create new user
     * POST /api/v1/users
     */
    public static function create($request) {
        // Verify authentication and admin role
        try {
            $userData = JWT::requireRole('admin');
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Acesso negado'];
        }
        
        // Get POST vars
        $postVars = $request->getPostVars();
        
        $email = $postVars['email'] ?? '';
        $password = $postVars['password'] ?? '';
        $name = $postVars['name'] ?? '';
        $role = $postVars['role'] ?? 'student';
        $status = $postVars['status'] ?? 'active';
        $phone = $postVars['phone'] ?? '';
        $planId = $postVars['plan_id'] ?? null;
        
        // Validate input
        if (empty($email) || empty($password) || empty($name)) {
            http_response_code(400);
            return [
                'success' => false,
                'message' => 'Email, senha e nome são obrigatórios'
            ];
        }
        
        // Validate email format
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            return [
                'success' => false,
                'message' => 'Email inválido'
            ];
        }
        
        // Validate password strength
        if (strlen($password) < 6) {
            http_response_code(400);
            return [
                'success' => false,
                'message' => 'Senha deve ter pelo menos 6 caracteres'
            ];
        }
        
        // Validate role
        if (!in_array($role, ['admin', 'instructor', 'student'])) {
            http_response_code(400);
            return [
                'success' => false,
                'message' => 'Role inválido'
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
            // Check if email already exists
            $checkStmt = $pdo->prepare("SELECT id FROM users WHERE email = :email");
            $checkStmt->execute(['email' => $email]);
            
            if ($checkStmt->fetch()) {
                http_response_code(409);
                return [
                    'success' => false,
                    'message' => 'Email já cadastrado'
                ];
            }
            
            // Begin transaction
            $pdo->beginTransaction();
            
            // Create user with Argon2id hashing
            $hashedPassword = password_hash($password, PASSWORD_ARGON2ID, [
                'memory_cost' => 65536,
                'time_cost' => 4,
                'threads' => 3
            ]);
            
            $userStmt = $pdo->prepare("
                INSERT INTO users (email, password_hash, role, status, email_verified)
                VALUES (:email, :password_hash, :role, :status, true)
                RETURNING id
            ");
            $userStmt->execute([
                'email' => $email,
                'password_hash' => $hashedPassword,
                'role' => $role,
                'status' => $status
            ]);
            $userId = $userStmt->fetchColumn();
            
            // Create user profile
            $profileStmt = $pdo->prepare("
                INSERT INTO user_profiles (user_id, name, phone)
                VALUES (:user_id, :name, :phone)
            ");
            $profileStmt->execute([
                'user_id' => $userId,
                'name' => $name,
                'phone' => $phone
            ]);
            
            // Create user preferences
            $prefsStmt = $pdo->prepare("
                INSERT INTO user_preferences (user_id)
                VALUES (:user_id)
            ");
            $prefsStmt->execute(['user_id' => $userId]);
            
            // Create subscription if plan_id provided
            if ($planId) {
                // Verify plan exists
                $planStmt = $pdo->prepare("SELECT id FROM subscription_plans WHERE id = :id");
                $planStmt->execute(['id' => $planId]);
                
                if ($planStmt->fetch()) {
                    $subStmt = $pdo->prepare("
                        INSERT INTO subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
                        VALUES (:user_id, :plan_id, 'active', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days')
                    ");
                    $subStmt->execute([
                        'user_id' => $userId,
                        'plan_id' => $planId
                    ]);
                }
            }
            
            // Commit transaction
            $pdo->commit();
            
            return [
                'success' => true,
                'message' => 'Usuário criado com sucesso',
                'data' => [
                    'id' => $userId,
                    'email' => $email,
                    'name' => $name,
                    'role' => $role,
                    'status' => $status
                ]
            ];
            
        } catch (Exception $e) {
            $pdo->rollBack();
            error_log('Create user error: ' . $e->getMessage());
            http_response_code(500);
            return [
                'success' => false,
                'message' => 'Erro ao criar usuário'
            ];
        }
    }
    
    /**
     * Update user
     * PUT /api/v1/users/:id
     */
    public static function update($request, $id) {
        // Verify authentication and admin role
        try {
            $userData = JWT::requireRole('admin');
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Acesso negado'];
        }
        
        // Get POST vars (PUT data)
        $postVars = $request->getPostVars();
        
        $name = $postVars['name'] ?? null;
        $email = $postVars['email'] ?? null;
        $password = $postVars['password'] ?? null;
        $role = $postVars['role'] ?? null;
        $status = $postVars['status'] ?? null;
        $phone = $postVars['phone'] ?? null;
        $planId = $postVars['plan_id'] ?? null;
        
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
            // Check if user exists and get current data
            $checkStmt = $pdo->prepare("SELECT id, role FROM users WHERE id = :id");
            $checkStmt->execute(['id' => $id]);
            $targetUser = $checkStmt->fetch();
            
            if (!$targetUser) {
                http_response_code(404);
                return [
                    'success' => false,
                    'message' => 'Usuário não encontrado'
                ];
            }
            
            // Protection: Admin cannot change their own status
            if ($userData->userId == $id && $status !== null) {
                http_response_code(403);
                return [
                    'success' => false,
                    'message' => 'Você não pode alterar seu próprio status'
                ];
            }
            
            // Protection: Admin cannot change status of other admins
            if ($targetUser['role'] === 'admin' && $userData->userId != $id && $status !== null) {
                http_response_code(403);
                return [
                    'success' => false,
                    'message' => 'Você não pode alterar o status de outros administradores'
                ];
            }
            
            // Begin transaction
            $pdo->beginTransaction();
            
            // Update user table if needed
            $updateFields = [];
            $params = ['id' => $id];
            
            if ($email !== null) {
                // Check if new email already exists
                $emailStmt = $pdo->prepare("SELECT id FROM users WHERE email = :email AND id != :id");
                $emailStmt->execute(['email' => $email, 'id' => $id]);
                
                if ($emailStmt->fetch()) {
                    $pdo->rollBack();
                    http_response_code(409);
                    return [
                        'success' => false,
                        'message' => 'Email já está em uso'
                    ];
                }
                
                $updateFields[] = "email = :email";
                $params['email'] = $email;
            }
            
            if ($password !== null && !empty($password)) {
                $hashedPassword = password_hash($password, PASSWORD_ARGON2ID, [
                    'memory_cost' => 65536,
                    'time_cost' => 4,
                    'threads' => 3
                ]);
                $updateFields[] = "password_hash = :password_hash";
                $params['password_hash'] = $hashedPassword;
            }
            
            if ($role !== null) {
                $updateFields[] = "role = :role";
                $params['role'] = $role;
            }
            
            if ($status !== null) {
                $updateFields[] = "status = :status";
                $params['status'] = $status;
            }
            
            if (!empty($updateFields)) {
                $updateFields[] = "updated_at = CURRENT_TIMESTAMP";
                $updateSql = "UPDATE users SET " . implode(', ', $updateFields) . " WHERE id = :id";
                $updateStmt = $pdo->prepare($updateSql);
                $updateStmt->execute($params);
            }
            
            // Update profile
            if ($name !== null || $phone !== null) {
                $profileFields = [];
                $profileParams = ['user_id' => $id];
                
                if ($name !== null) {
                    $profileFields[] = "name = :name";
                    $profileParams['name'] = $name;
                }
                
                if ($phone !== null) {
                    $profileFields[] = "phone = :phone";
                    $profileParams['phone'] = $phone;
                }
                
                if (!empty($profileFields)) {
                    $profileFields[] = "updated_at = CURRENT_TIMESTAMP";
                    $profileSql = "UPDATE user_profiles SET " . implode(', ', $profileFields) . " WHERE user_id = :user_id";
                    $profileStmt = $pdo->prepare($profileSql);
                    $profileStmt->execute($profileParams);
                }
            }
            
            // Update subscription if plan_id provided
            if ($planId !== null) {
                // Deactivate current subscription
                $deactivateStmt = $pdo->prepare("
                    UPDATE subscriptions 
                    SET status = 'canceled', updated_at = CURRENT_TIMESTAMP 
                    WHERE user_id = :user_id AND status = 'active'
                ");
                $deactivateStmt->execute(['user_id' => $id]);
                
                // Create new subscription
                $subStmt = $pdo->prepare("
                    INSERT INTO subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
                    VALUES (:user_id, :plan_id, 'active', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days')
                ");
                $subStmt->execute([
                    'user_id' => $id,
                    'plan_id' => $planId
                ]);
            }
            
            // Commit transaction
            $pdo->commit();
            
            return [
                'success' => true,
                'message' => 'Usuário atualizado com sucesso'
            ];
            
        } catch (Exception $e) {
            $pdo->rollBack();
            error_log('Update user error: ' . $e->getMessage());
            http_response_code(500);
            return [
                'success' => false,
                'message' => 'Erro ao atualizar usuário'
            ];
        }
    }
    
    /**
     * Delete user (soft delete - change status to inactive)
     * DELETE /api/v1/users/:id
     */
    public static function delete($request, $id) {
        // Verify authentication and admin role
        try {
            $userData = JWT::requireRole('admin');
        } catch (Exception $e) {
            return ['success' => false, 'message' => 'Acesso negado'];
        }
        
        // Prevent self-deletion
        if ($userData->userId === $id) {
            http_response_code(403);
            return [
                'success' => false,
                'message' => 'Você não pode excluir sua própria conta'
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
            // Check if user exists and get current data
            $checkStmt = $pdo->prepare("SELECT id, status, role FROM users WHERE id = :id");
            $checkStmt->execute(['id' => $id]);
            $user = $checkStmt->fetch();
            
            if (!$user) {
                http_response_code(404);
                return [
                    'success' => false,
                    'message' => 'Usuário não encontrado'
                ];
            }
            
            // Protection: Admin cannot deactivate other admins
            if ($user['role'] === 'admin') {
                http_response_code(403);
                return [
                    'success' => false,
                    'message' => 'Você não pode desativar outros administradores'
                ];
            }
            
            if ($user['status'] === 'inactive') {
                return [
                    'success' => false,
                    'message' => 'Usuário já está inativo'
                ];
            }
            
            // Soft delete: just change status to inactive
            $deleteStmt = $pdo->prepare("
                UPDATE users 
                SET status = 'inactive', updated_at = CURRENT_TIMESTAMP 
                WHERE id = :id
            ");
            $deleteStmt->execute(['id' => $id]);
            
            return [
                'success' => true,
                'message' => 'Usuário desativado com sucesso'
            ];
            
        } catch (Exception $e) {
            error_log('Delete user error: ' . $e->getMessage());
            http_response_code(500);
            return [
                'success' => false,
                'message' => 'Erro ao desativar usuário'
            ];
        }
    }
    
    /**
     * Get single user
     * GET /api/v1/users/:id
     */
    public static function get($request, $id) {
        // Verify authentication and admin role
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
            // Get user details
            $stmt = $pdo->prepare("
                SELECT u.id, u.email, u.role, u.status, u.email_verified, u.created_at, u.last_login,
                       p.name, p.avatar_url, p.phone, p.bio,
                       s.id as subscription_id, s.status as subscription_status, s.plan_id,
                       sp.name as plan_name, sp.price as plan_price
                FROM users u
                LEFT JOIN user_profiles p ON u.id = p.user_id
                LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
                LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
                WHERE u.id = :id
            ");
            $stmt->execute(['id' => $id]);
            $user = $stmt->fetch();
            
            if (!$user) {
                http_response_code(404);
                return [
                    'success' => false,
                    'message' => 'Usuário não encontrado'
                ];
            }
            
            // Get all subscription plans for dropdown
            $plansStmt = $pdo->prepare("SELECT id, name, price FROM subscription_plans ORDER BY price");
            $plansStmt->execute();
            $plans = $plansStmt->fetchAll();
            
            return [
                'success' => true,
                'data' => [
                    'id' => $user['id'],
                    'name' => $user['name'] ?? '',
                    'email' => $user['email'],
                    'role' => $user['role'],
                    'status' => $user['status'],
                    'phone' => $user['phone'] ?? '',
                    'bio' => $user['bio'] ?? '',
                    'avatar' => $user['avatar_url'],
                    'emailVerified' => $user['email_verified'],
                    'subscription' => [
                        'id' => $user['subscription_id'],
                        'plan_id' => $user['plan_id'],
                        'plan' => $user['plan_name'] ?? 'Básico',
                        'price' => $user['plan_price'] ?? 0,
                        'status' => $user['subscription_status'] ?? 'inactive'
                    ],
                    'createdAt' => $user['created_at'],
                    'lastLogin' => $user['last_login']
                ],
                'plans' => $plans
            ];
            
        } catch (Exception $e) {
            error_log('Get user error: ' . $e->getMessage());
            http_response_code(500);
            return [
                'success' => false,
                'message' => 'Erro ao buscar usuário'
            ];
        }
    }
}