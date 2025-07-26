<?php

use \App\Http\Response;
use \App\Utils\JWT;
use PDO;
use Exception;

// Upload course image with organized directory structure
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

            // Create unique filename
            $filename = 'course_' . $sanitizedCourseSlug . '_' . time() . '_' . uniqid() . '.' . $extension;

            // Simple directory structure: images/courses/
            $relativePath = "images/courses";
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

            // Update database
            $thumbnailUrl = '/' . $relativePath . '/' . $filename;
            $thumbnailFilePath = $relativePath . '/' . $filename;

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
                'data' => [
                    'image_url' => $thumbnailUrl,
                    'file_path' => $thumbnailFilePath,
                    'filename' => $filename
                ]
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