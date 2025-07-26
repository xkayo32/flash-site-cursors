<?php

use \App\Http\Response;

// Image upload test endpoint - serves the HTML interface
$obRouter->get('/image_upload_test', [
    function($request) {
        $htmlPath = __DIR__ . '/../../../../image-upload-project-example/index.html';
        
        if (!file_exists($htmlPath)) {
            return new Response(404, [
                'status' => 'error',
                'message' => 'Image upload test HTML not found'
            ], 'application/json');
        }
        
        $htmlContent = file_get_contents($htmlPath);
        
        // Update the API path to use the current backend structure
        $htmlContent = str_replace(
            "fetch('api/upload.php'",
            "fetch('/api/v1/image_upload_test/upload'",
            $htmlContent
        );
        
        return new Response(200, $htmlContent, 'text/html');
    }
]);

// Image upload API endpoint - processes the upload
$obRouter->post('/api/v1/image_upload_test/upload', [
    'middlewares' => ['api'],
    function($request) {
        
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            return new Response(405, [
                'status' => 'error', 
                'message' => 'Invalid request method.'
            ], 'application/json');
        }

        if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            return new Response(400, [
                'status' => 'error', 
                'message' => 'No file uploaded or upload error.'
            ], 'application/json');
        }

        $image_type = exif_imagetype($_FILES['image']['tmp_name']);
        if (!in_array($image_type, [IMAGETYPE_JPEG, IMAGETYPE_PNG])) {
            return new Response(400, [
                'status' => 'error', 
                'message' => 'Only JPG and PNG images are allowed.'
            ], 'application/json');
        }

        $max_size = 10 * 1024 * 1024; // 10MB
        if ($_FILES['image']['size'] > $max_size) {
            return new Response(400, [
                'status' => 'error', 
                'message' => 'File size exceeds 10MB.'
            ], 'application/json');
        }

        // Create upload directory if it doesn't exist
        $uploadDir = __DIR__ . '/../../../../image-upload-project-example/images/user1/';
        if (!is_dir($uploadDir)) {
            if (!mkdir($uploadDir, 0755, true)) {
                return new Response(500, [
                    'status' => 'error', 
                    'message' => 'Failed to create upload directory.'
                ], 'application/json');
            }
        }

        $random_name = uniqid() . '.png';
        $destination = $uploadDir . $random_name;

        if ($image_type == IMAGETYPE_JPEG) {
            $src_image = imagecreatefromjpeg($_FILES['image']['tmp_name']);
        } elseif ($image_type == IMAGETYPE_PNG) {
            $src_image = imagecreatefrompng($_FILES['image']['tmp_name']);
        }

        if (!$src_image) {
            return new Response(500, [
                'status' => 'error', 
                'message' => 'Failed to create image resource.'
            ], 'application/json');
        }

        $src_width = imagesx($src_image);
        $src_height = imagesy($src_image);
        $dst_width = 512;
        $dst_height = 512;
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
            'image_url' => '/api/v1/image_upload_test/image/' . $random_name
        ], 'application/json');
    }
]);

// Serve uploaded images
$obRouter->get('/api/v1/image_upload_test/image/{filename}', [
    function($request, $filename) {
        $imagePath = __DIR__ . '/../../../../image-upload-project-example/images/user1/' . $filename;
        
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