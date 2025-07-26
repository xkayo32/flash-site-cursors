<?php

use \App\Http\Response;
use \App\Controller\Api;

// Get course thumbnail image
$obRouter->get('/api/v1/courses/{id}/thumbnail', [
    function($request, $id) {
        return new Response(200, Api\Courses::getThumbnail($request, $id), 'image');
    }
]);