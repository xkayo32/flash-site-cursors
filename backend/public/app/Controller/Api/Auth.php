<?php
namespace App\Controller\Api;

use App\Utils\JWT;
use PDO;
use Exception;

class Auth {
    /**
     * Get database connection
     */
    private static function getConnection() {
        // PostgreSQL connection
        $host = getenv('DB_HOST') ?: 'postgres';
        $port = getenv('DB_PORT') ?: '5432';
        $dbname = getenv('DB_DATABASE') ?: 'estudos_db';
        $user = getenv('DB_USERNAME') ?: 'estudos_user';
        $pass = getenv('DB_PASSWORD') ?: 'estudos_pass';
        
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
     * Login endpoint
     * POST /api/v1/auth/login
     */
    public static function login($request) {
        // Get POST vars from request
        $postVars = $request->getPostVars();
        
        $email = $postVars['email'] ?? '';
        $password = $postVars['password'] ?? '';
        
        // Validate input
        if (empty($email) || empty($password)) {
            http_response_code(400);
            return [
                'success' => false,
                'message' => 'Email e senha são obrigatórios'
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
            // Get user by email
            $stmt = $pdo->prepare("
                SELECT u.id, u.email, u.password_hash, u.role, u.status, u.email_verified,
                       p.name, p.avatar_url
                FROM users u
                LEFT JOIN user_profiles p ON u.id = p.user_id
                WHERE u.email = :email
            ");
            $stmt->execute(['email' => $email]);
            $user = $stmt->fetch();
            
            if (!$user) {
                http_response_code(401);
                return [
                    'success' => false,
                    'message' => 'Email ou senha inválidos'
                ];
            }
            
            // Check user status
            if ($user['status'] !== 'active') {
                http_response_code(401);
                return [
                    'success' => false,
                    'message' => 'Conta inativa ou suspensa'
                ];
            }
            
            // Verify password
            if (!password_verify($password, $user['password_hash'])) {
                http_response_code(401);
                return [
                    'success' => false,
                    'message' => 'Email ou senha inválidos'
                ];
            }
            
            // Update last login
            $updateStmt = $pdo->prepare("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = :id");
            $updateStmt->execute(['id' => $user['id']]);
            
            // Get subscription info
            $subStmt = $pdo->prepare("
                SELECT s.status, s.current_period_end, sp.name as plan_name
                FROM subscriptions s
                JOIN subscription_plans sp ON s.plan_id = sp.id
                WHERE s.user_id = :user_id
                ORDER BY s.created_at DESC
                LIMIT 1
            ");
            $subStmt->execute(['user_id' => $user['id']]);
            $subscription = $subStmt->fetch();
            
            // Generate JWT token
            $token = JWT::generateToken($user['id'], $user['email'], $user['role']);
            
            // Prepare response
            return [
                'success' => true,
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['name'] ?? 'Usuário',
                    'email' => $user['email'],
                    'role' => $user['role'],
                    'avatar' => $user['avatar_url'],
                    'subscription' => $subscription ? [
                        'plan' => $subscription['plan_name'],
                        'status' => $subscription['status'],
                        'expiresAt' => $subscription['current_period_end']
                    ] : null
                ]
            ];
            
        } catch (Exception $e) {
            error_log('Login error: ' . $e->getMessage());
            http_response_code(500);
            return [
                'success' => false,
                'message' => 'Erro ao processar login'
            ];
        }
    }
    
    /**
     * Register endpoint
     * POST /api/v1/auth/register
     */
    public static function register($request) {
        // Get POST vars from request
        $postVars = $request->getPostVars();
        
        $email = $postVars['email'] ?? '';
        $password = $postVars['password'] ?? '';
        $name = $postVars['name'] ?? '';
        
        // Validate input
        if (empty($email) || empty($password) || empty($name)) {
            http_response_code(400);
            return [
                'success' => false,
                'message' => 'Todos os campos são obrigatórios'
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
                'memory_cost' => 65536,  // 64MB
                'time_cost' => 4,        // 4 iterations
                'threads' => 3           // 3 parallel threads
            ]);
            $userStmt = $pdo->prepare("
                INSERT INTO users (email, password_hash, role, status, email_verified)
                VALUES (:email, :password_hash, 'student', 'active', false)
                RETURNING id
            ");
            $userStmt->execute([
                'email' => $email,
                'password_hash' => $hashedPassword
            ]);
            $userId = $userStmt->fetchColumn();
            
            // Create user profile
            $profileStmt = $pdo->prepare("
                INSERT INTO user_profiles (user_id, name)
                VALUES (:user_id, :name)
            ");
            $profileStmt->execute([
                'user_id' => $userId,
                'name' => $name
            ]);
            
            // Create user preferences
            $prefsStmt = $pdo->prepare("
                INSERT INTO user_preferences (user_id)
                VALUES (:user_id)
            ");
            $prefsStmt->execute(['user_id' => $userId]);
            
            // Create free subscription
            $planStmt = $pdo->prepare("SELECT id FROM subscription_plans WHERE slug = 'basico' LIMIT 1");
            $planStmt->execute();
            $planId = $planStmt->fetchColumn();
            
            if ($planId) {
                $subStmt = $pdo->prepare("
                    INSERT INTO subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
                    VALUES (:user_id, :plan_id, 'active', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days')
                ");
                $subStmt->execute([
                    'user_id' => $userId,
                    'plan_id' => $planId
                ]);
            }
            
            // Commit transaction
            $pdo->commit();
            
            // Generate JWT token
            $token = JWT::generateToken($userId, $email, 'student');
            
            // Prepare response
            return [
                'success' => true,
                'token' => $token,
                'user' => [
                    'id' => $userId,
                    'name' => $name,
                    'email' => $email,
                    'role' => 'student',
                    'avatar' => null
                ]
            ];
            
        } catch (Exception $e) {
            $pdo->rollBack();
            error_log('Registration error: ' . $e->getMessage());
            http_response_code(500);
            return [
                'success' => false,
                'message' => 'Erro ao criar conta'
            ];
        }
    }
    
    /**
     * Verify token endpoint
     * GET /api/v1/auth/verify
     */
    public static function verify($request) {
        try {
            $userData = JWT::authenticate();
            
            // Get database connection
            $pdo = self::getConnection();
            if (!$pdo) {
                http_response_code(500);
                return [
                    'success' => false,
                    'message' => 'Erro de conexão com banco de dados'
                ];
            }
            
            // Get fresh user data
            $stmt = $pdo->prepare("
                SELECT u.id, u.email, u.role, u.status,
                       p.name, p.avatar_url
                FROM users u
                LEFT JOIN user_profiles p ON u.id = p.user_id
                WHERE u.id = :id
            ");
            $stmt->execute(['id' => $userData->userId]);
            $user = $stmt->fetch();
            
            if (!$user || $user['status'] !== 'active') {
                http_response_code(401);
                return [
                    'success' => false,
                    'message' => 'Usuário não encontrado ou inativo'
                ];
            }
            
            return [
                'success' => true,
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['name'] ?? 'Usuário',
                    'email' => $user['email'],
                    'role' => $user['role'],
                    'avatar' => $user['avatar_url']
                ]
            ];
            
        } catch (Exception $e) {
            http_response_code(401);
            return [
                'success' => false,
                'message' => 'Token inválido'
            ];
        }
    }
    
    /**
     * Logout endpoint (optional - just for logging)
     * POST /api/v1/auth/logout
     */
    public static function logout($request) {
        // JWT is stateless, so we just return success
        // In a real app, you might want to blacklist the token
        return [
            'success' => true,
            'message' => 'Logout realizado com sucesso'
        ];
    }
}