<?php

use \App\Http\Response;

// Serve images from the images/courses directory
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
            
            return new Response(200, $svg, 'image/svg+xml');
        }
        
        // Get MIME type
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $imagePath);
        finfo_close($finfo);
        
        // Read and return image
        $imageData = file_get_contents($imagePath);
        
        // Set cache headers for better performance
        header('Cache-Control: public, max-age=86400'); // Cache for 24 hours
        
        return new Response(200, $imageData, $mimeType);
    }
]);