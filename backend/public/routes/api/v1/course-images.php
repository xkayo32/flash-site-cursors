<?php

use \App\Http\Response;
use \App\Utils\JWT;
use PDO;
use Exception;

/**
 * Course Image Management Routes
 * 
 * Upload endpoints:
 * - POST /api/v1/courses/{id}/image - Upload image for specific course
 * 
 * Serve endpoints:
 * - GET /images/courses/{filename} - Serve images from images/courses directory
 * - GET /uploads/course-images/{filename} - Serve images from uploads/course-images directory
 */

// ===========================================
// UPLOAD COURSE IMAGE
// ===========================================
$obRouter->post('/api/v1/courses/{courseId}/image', [
    function($request, $courseId) {
        
        // Verify authentication
        try {
            $userData = JWT::requireRole(['admin', 'instructor']);
        } catch (Exception $e) {
            return new Response(401, [
                'success' => false, 
                'message' => 'Acesso negado'
            ], 'application/json');
        }

        if (!isset($_FILES['thumbnail']) || $_FILES['thumbnail']['error'] !== UPLOAD_ERR_OK) {
            return new Response(400, [
                'success' => false, 
                'message' => 'Nenhum arquivo enviado ou erro no upload.',
                'debug' => [
                    'files' => $_FILES,
                    'error' => $_FILES['thumbnail']['error'] ?? 'no thumbnail key'
                ]
            ], 'application/json');
        }

        // Validate image type
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $_FILES['thumbnail']['tmp_name']);
        finfo_close($finfo);

        $allowedMimeTypes = [
            'image/jpeg',
            'image/jpg', 
            'image/png',
            'image/gif',
            'image/webp'
        ];

        if (!in_array($mimeType, $allowedMimeTypes)) {
            return new Response(400, [
                'success' => false, 
                'message' => 'Formato de imagem não permitido. Use: JPEG, PNG, GIF ou WebP'
            ], 'application/json');
        }

        // Validate file size (max 5MB)
        $maxSize = 5 * 1024 * 1024;
        if ($_FILES['thumbnail']['size'] > $maxSize) {
            return new Response(400, [
                'success' => false, 
                'message' => 'Imagem muito grande. Tamanho máximo: 5MB'
            ], 'application/json');
        }

        try {
            // Get database connection
            $host = getenv('DB_HOST') ?: 'postgres';
            $port = getenv('DB_PORT') ?: '5432';
            $dbname = getenv('DB_DATABASE') ?: 'estudos_db';
            $user = getenv('DB_USERNAME') ?: 'estudos_user';
            $pass = getenv('DB_PASSWORD') ?: 'estudos_pass';
            
            $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
            $pdo = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);

            // Get course info
            $stmt = $pdo->prepare("SELECT id, slug, instructor_id FROM courses WHERE id = ?");
            $stmt->execute([$courseId]);
            $course = $stmt->fetch();

            if (!$course) {
                return new Response(404, [
                    'success' => false,
                    'message' => 'Curso não encontrado'
                ], 'application/json');
            }

            // Check permissions
            if ($userData->role !== 'admin' && $course['instructor_id'] !== $userData->userId) {
                return new Response(403, [
                    'success' => false,
                    'message' => 'Você não tem permissão para editar este curso'
                ], 'application/json');
            }

            // Sanitize course slug
            $sanitizedCourseSlug = preg_replace('/[^a-z0-9\-_]/i', '', $course['slug']);

            // Map MIME type to extension
            $extensionMap = [
                'image/jpeg' => 'jpg',
                'image/jpg' => 'jpg',
                'image/png' => 'png',
                'image/gif' => 'gif',
                'image/webp' => 'webp'
            ];
            $extension = $extensionMap[$mimeType];

            // Create unique filename with timestamp and unique ID
            $timestamp = date('Y-m-d_H-i-s');
            $uniqueId = uniqid();
            $filename = "course_{$courseId}_{$uniqueId}_{$timestamp}.{$extension}";

            // Use uploads/course-images directory (already exists and working)
            $relativePath = "uploads/course-images";
            $fullPath = __DIR__ . "/../../../{$relativePath}";

            // Create directory if it doesn't exist
            if (!is_dir($fullPath)) {
                if (!mkdir($fullPath, 0755, true)) {
                    return new Response(500, [
                        'success' => false,
                        'message' => 'Falha ao criar diretório de upload'
                    ], 'application/json');
                }
            }

            $destinationPath = $fullPath . '/' . $filename;

            // Move uploaded file
            if (!move_uploaded_file($_FILES['thumbnail']['tmp_name'], $destinationPath)) {
                return new Response(500, [
                    'success' => false,
                    'message' => 'Falha ao salvar imagem'
                ], 'application/json');
            }

            // Update database with both URL and file path
            $thumbnailUrl = "http://localhost:8180/{$relativePath}/{$filename}";
            $thumbnailFilePath = "{$relativePath}/{$filename}";

            $updateStmt = $pdo->prepare("
                UPDATE courses 
                SET thumbnail_url = ?, 
                    thumbnail_file_path = ?, 
                    updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            ");
            $updateStmt->execute([$thumbnailUrl, $thumbnailFilePath, $courseId]);

            return new Response(200, [
                'success' => true,
                'message' => 'Imagem enviada com sucesso',
                'image_url' => "/{$relativePath}/{$filename}",
                'filename' => $filename
            ], 'application/json');

        } catch (Exception $e) {
            error_log('Course image upload error: ' . $e->getMessage());
            return new Response(500, [
                'success' => false,
                'message' => 'Erro ao processar upload',
                'error' => $e->getMessage()
            ], 'application/json');
        }
    }
]);

// ===========================================
// SERVE IMAGES FROM UPLOADS/COURSE-IMAGES
// ===========================================
$obRouter->get('/uploads/course-images/{filename}', [
    function($request, $filename) {
        // Sanitize filename to prevent directory traversal
        $filename = basename($filename);
        $imagePath = __DIR__ . '/../../../uploads/course-images/' . $filename;
        
        if (!file_exists($imagePath)) {
            return new Response(404, [
                'status' => 'error',
                'message' => 'Image not found'
            ], 'application/json');
        }
        
        // Get MIME type
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $imagePath);
        finfo_close($finfo);
        
        // Read and return image
        $imageData = file_get_contents($imagePath);
        
        // Set proper headers
        header('Content-Type: ' . $mimeType);
        header('Content-Length: ' . strlen($imageData));
        header('Cache-Control: public, max-age=86400'); // Cache for 24 hours
        
        echo $imageData;
        exit;
    }
]);

// ===========================================
// SERVE IMAGES FROM IMAGES/COURSES (LEGACY)
// ===========================================
$obRouter->get('/images/courses/{filename}', [
    function($request, $filename) {
        // Sanitize filename to prevent directory traversal
        $filename = basename($filename);
        $imagePath = __DIR__ . '/../../../images/courses/' . $filename;
        
        if (!file_exists($imagePath)) {
            // Return default course image SVG
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
    Imagem do Curso
  </text>
</svg>';
            
            header('Content-Type: image/svg+xml');
            header('Cache-Control: public, max-age=86400');
            echo $svg;
            exit;
        }
        
        // Get MIME type
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $imagePath);
        finfo_close($finfo);
        
        // Read and return image
        $imageData = file_get_contents($imagePath);
        
        // Set proper headers
        header('Content-Type: ' . $mimeType);
        header('Content-Length: ' . strlen($imageData));
        header('Cache-Control: public, max-age=86400'); // Cache for 24 hours
        
        echo $imageData;
        exit;
    }
]);