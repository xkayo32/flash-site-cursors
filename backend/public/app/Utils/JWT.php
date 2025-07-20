<?php
namespace App\Utils;

use Firebase\JWT\JWT as FirebaseJWT;
use Firebase\JWT\Key;
use Exception;

class JWT {
    private static $secretKey = 'your-secret-key-here-change-in-production'; // Move to environment variable
    private static $algorithm = 'HS256';
    private static $expiration = 86400; // 24 hours in seconds

    /**
     * Generate JWT token
     */
    public static function generateToken($userId, $email, $role) {
        $issuedAt = time();
        $expirationTime = $issuedAt + self::$expiration;
        
        $payload = [
            'iat' => $issuedAt,           // Issued at
            'exp' => $expirationTime,      // Expiration time
            'iss' => 'estudos-api',        // Issuer
            'data' => [
                'userId' => $userId,
                'email' => $email,
                'role' => $role
            ]
        ];
        
        return FirebaseJWT::encode($payload, self::$secretKey, self::$algorithm);
    }
    
    /**
     * Verify and decode JWT token
     */
    public static function validateToken($token) {
        try {
            $decoded = FirebaseJWT::decode($token, new Key(self::$secretKey, self::$algorithm));
            return (array) $decoded;
        } catch (Exception $e) {
            return false;
        }
    }
    
    /**
     * Get token from Authorization header
     */
    public static function getTokenFromHeader() {
        $headers = getallheaders();
        
        if (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
            
            // Bearer token format: "Bearer <token>"
            if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                return $matches[1];
            }
        }
        
        return null;
    }
    
    /**
     * Middleware to verify authentication
     */
    public static function authenticate() {
        $token = self::getTokenFromHeader();
        
        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'Token não fornecido']);
            exit;
        }
        
        $decoded = self::validateToken($token);
        
        if (!$decoded) {
            http_response_code(401);
            echo json_encode(['error' => 'Token inválido ou expirado']);
            exit;
        }
        
        // Return user data from token
        return $decoded['data'];
    }
    
    /**
     * Verify if user has required role
     */
    public static function requireRole($requiredRole) {
        $userData = self::authenticate();
        
        if ($userData->role !== $requiredRole) {
            http_response_code(403);
            echo json_encode(['error' => 'Acesso negado']);
            exit;
        }
        
        return $userData;
    }
}