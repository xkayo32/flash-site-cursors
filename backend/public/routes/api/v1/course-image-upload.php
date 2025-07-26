<?php

use \App\Http\Response;
use \App\Utils\JWT;
use PDO;
use Exception;

// Test upload endpoint (simplified version of working example)
$obRouter->post('/api/v1/test-course-image-upload', [
    'middlewares' => ['api'],
    function($request) {
        
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return new Response(405, [
                'status' => 'error', 
                'message' => 'Invalid request method.'
            ], 'application/json');
        }

        if (!isset($_FILES['thumbnail']) || $_FILES['thumbnail']['error'] !== UPLOAD_ERR_OK) {
            return new Response(400, [
                'status' => 'error', 
                'message' => 'No file uploaded or upload error.',
                'debug' => [
                    'files' => $_FILES,
                    'error' => $_FILES['thumbnail']['error'] ?? 'no thumbnail key'
                ]
            ], 'application/json');
        }

        $image_type = exif_imagetype($_FILES['thumbnail']['tmp_name']);
        if (!in_array($image_type, [IMAGETYPE_JPEG, IMAGETYPE_PNG])) {
            return new Response(400, [
                'status' => 'error', 
                'message' => 'Only JPG and PNG images are allowed.'
            ], 'application/json');
        }

        $max_size = 10 * 1024 * 1024; // 10MB
        if ($_FILES['thumbnail']['size'] > $max_size) {
            return new Response(400, [
                'status' => 'error', 
                'message' => 'File size exceeds 10MB.'
            ], 'application/json');
        }

        // Create upload directory if it doesn't exist
        $uploadDir = __DIR__ . '/../../../uploads/course-images/';
        if (!is_dir($uploadDir)) {
            if (!mkdir($uploadDir, 0755, true)) {
                return new Response(500, [
                    'status' => 'error', 
                    'message' => 'Failed to create upload directory.'
                ], 'application/json');
            }
        }

        $random_name = 'test_' . uniqid() . '.png';
        $destination = $uploadDir . $random_name;

        if ($image_type == IMAGETYPE_JPEG) {
            $src_image = imagecreatefromjpeg($_FILES['thumbnail']['tmp_name']);
        } elseif ($image_type == IMAGETYPE_PNG) {
            $src_image = imagecreatefrompng($_FILES['thumbnail']['tmp_name']);
        }

        if (!$src_image) {
            return new Response(500, [
                'status' => 'error', 
                'message' => 'Failed to create image resource.'
            ], 'application/json');
        }

        $src_width = imagesx($src_image);
        $src_height = imagesy($src_image);
        $dst_width = 400;
        $dst_height = 300;
        $dst_image = imagecreatetruecolor($dst_width, $dst_height);
        imagecopyresampled($dst_image, $src_image, 0, 0, 0, 0, $dst_width, $dst_height, $src_width, $src_height);

        if (!imagepng($dst_image, $destination)) {
            imagedestroy($src_image);
            imagedestroy($dst_image);
            return new Response(500, [
                'status' => 'error', 
                'message' => 'Failed to save image.'
            ], 'application/json');
        }

        imagedestroy($src_image);
        imagedestroy($dst_image);

        return new Response(200, [
            'status' => 'success', 
            'message' => 'Image uploaded and processed successfully',
            'image_url' => '/uploads/course-images/' . $random_name,
            'filename' => $random_name,
            'original_size' => $_FILES['thumbnail']['size'],
            'processed_size' => filesize($destination)
        ], 'application/json');
    }
]);

// Upload course image (simplified version based on working example)
$obRouter->post('/api/v1/courses/{courseId}/upload-image', [
    'middlewares' => ['api'],
    function($request, $courseId) {
        
        // Verify authentication
        try {
            $userData = JWT::requireRole(['admin', 'instructor']);
        } catch (Exception $e) {
            return new Response(401, [
                'status' => 'error', 
                'message' => 'Acesso negado'
            ], 'application/json');
        }

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return new Response(405, [
                'status' => 'error', 
                'message' => 'Invalid request method.'
            ], 'application/json');
        }

        if (!isset($_FILES['thumbnail']) || $_FILES['thumbnail']['error'] !== UPLOAD_ERR_OK) {
            return new Response(400, [
                'status' => 'error', 
                'message' => 'No file uploaded or upload error.'
            ], 'application/json');
        }

        $image_type = exif_imagetype($_FILES['thumbnail']['tmp_name']);
        if (!in_array($image_type, [IMAGETYPE_JPEG, IMAGETYPE_PNG])) {
            return new Response(400, [
                'status' => 'error', 
                'message' => 'Only JPG and PNG images are allowed.'
            ], 'application/json');
        }

        $max_size = 10 * 1024 * 1024; // 10MB
        if ($_FILES['thumbnail']['size'] > $max_size) {
            return new Response(400, [
                'status' => 'error', 
                'message' => 'File size exceeds 10MB.'
            ], 'application/json');
        }

        // Create upload directory if it doesn't exist
        $uploadDir = __DIR__ . '/../../../uploads/course-images/';
        if (!is_dir($uploadDir)) {
            if (!mkdir($uploadDir, 0755, true)) {
                return new Response(500, [
                    'status' => 'error', 
                    'message' => 'Failed to create upload directory.'
                ], 'application/json');
            }
        }

        $random_name = 'course_' . $courseId . '_' . uniqid() . '.png';
        $destination = $uploadDir . $random_name;

        if ($image_type == IMAGETYPE_JPEG) {
            $src_image = imagecreatefromjpeg($_FILES['thumbnail']['tmp_name']);
        } elseif ($image_type == IMAGETYPE_PNG) {
            $src_image = imagecreatefrompng($_FILES['thumbnail']['tmp_name']);
        }

        if (!$src_image) {
            return new Response(500, [
                'status' => 'error', 
                'message' => 'Failed to create image resource.'
            ], 'application/json');
        }

        $src_width = imagesx($src_image);
        $src_height = imagesy($src_image);
        $dst_width = 400;
        $dst_height = 300;
        $dst_image = imagecreatetruecolor($dst_width, $dst_height);
        imagecopyresampled($dst_image, $src_image, 0, 0, 0, 0, $dst_width, $dst_height, $src_width, $src_height);

        if (!imagepng($dst_image, $destination)) {
            imagedestroy($src_image);
            imagedestroy($dst_image);
            return new Response(500, [
                'status' => 'error', 
                'message' => 'Failed to save image.'
            ], 'application/json');
        }

        imagedestroy($src_image);
        imagedestroy($dst_image);

        // Update course with new thumbnail URL
        try {
            // PostgreSQL connection
            $host = getenv('DB_HOST') ?: 'postgres';
            $port = getenv('DB_PORT') ?: '5432';
            $dbname = getenv('DB_NAME') ?: 'estudos_db';
            $user = getenv('DB_USER') ?: 'estudos_user';
            $pass = getenv('DB_PASS') ?: 'estudos_pass';
            
            $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
            $pdo = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);
            
            $thumbnailUrl = '/uploads/course-images/' . $random_name;
            $thumbnailFilePath = 'uploads/course-images/' . $random_name;
            
            $stmt = $pdo->prepare("UPDATE courses SET thumbnail_url = ?, thumbnail_file_path = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
            $stmt->execute([$thumbnailUrl, $thumbnailFilePath, $courseId]);
            
        } catch (Exception $e) {
            error_log('Database error in course image upload: ' . $e->getMessage());
            // Don't fail the whole request if DB update fails - image is still uploaded
        }

        return new Response(200, [
            'status' => 'success', 
            'image_url' => '/uploads/course-images/' . $random_name,
            'message' => 'Image uploaded successfully'
        ], 'application/json');
    }
]);

// Serve uploaded course images
$obRouter->get('/uploads/course-images/{filename}', [
    function($request, $filename) {
        $imagePath = __DIR__ . '/../../../uploads/course-images/' . $filename;
        
        if (!file_exists($imagePath)) {
            return new Response(404, [
                'status' => 'error',
                'message' => 'Image not found'
            ], 'application/json');
        }
        
        $imageData = file_get_contents($imagePath);
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $imagePath);
        finfo_close($finfo);
        
        return new Response(200, $imageData, $mimeType);
    }
]);