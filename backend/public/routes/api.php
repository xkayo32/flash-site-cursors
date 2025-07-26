<?php

// Inclui as rotas padrões da API
include __DIR__ . '/api/v1/default.php';
include __DIR__ . '/api/v1/test.php';
include __DIR__ . '/api/v1/auth.php';
include __DIR__ . '/api/v1/users.php';
// Rotas de imagem ANTES das rotas genéricas de cursos
include __DIR__ . '/api/v1/course-image.php';
include __DIR__ . '/api/v1/course-image-upload.php';
include __DIR__ . '/api/v1/course-image-organized.php';
include __DIR__ . '/api/v1/course-images-serve.php';
include __DIR__ . '/api/v1/courses.php'; // Rotas genéricas por último
include __DIR__ . '/api/v1/image-upload-test.php';