<?php

use \App\Http\Response;
use \App\Controller\Api;

// LIST USERS - GET /api/v1/users
$obRouter->get('/api/v1/users', [
    function($request) {
        return new Response(200, Api\Users::list($request), 'application/json');
    }
]);

// GET SINGLE USER - GET /api/v1/users/{id}
$obRouter->get('/api/v1/users/{id}', [
    function($request, $id) {
        return new Response(200, Api\Users::get($request, $id), 'application/json');
    }
]);

// CREATE USER - POST /api/v1/users
$obRouter->post('/api/v1/users', [
    function($request) {
        return new Response(200, Api\Users::create($request), 'application/json');
    }
]);

// UPDATE USER - PUT /api/v1/users/{id}
$obRouter->put('/api/v1/users/{id}', [
    function($request, $id) {
        return new Response(200, Api\Users::update($request, $id), 'application/json');
    }
]);

// DELETE USER - DELETE /api/v1/users/{id}
$obRouter->delete('/api/v1/users/{id}', [
    function($request, $id) {
        return new Response(200, Api\Users::delete($request, $id), 'application/json');
    }
]);