<?php

use \App\Http\Response;
use \App\Controller\Api;

// Login endpoint
$obRouter->post('/api/v1/auth/login', [
    function($request) {
        return new Response(200, Api\Auth::login($request), 'application/json');
    }
]);

// Register endpoint
$obRouter->post('/api/v1/auth/register', [
    function($request) {
        return new Response(200, Api\Auth::register($request), 'application/json');
    }
]);

// Verify token endpoint
$obRouter->get('/api/v1/auth/verify', [
    'middlewares' => [
        'api'
    ],
    function($request) {
        return new Response(200, Api\Auth::verify($request), 'application/json');
    }
]);

// Logout endpoint
$obRouter->post('/api/v1/auth/logout', [
    function($request) {
        return new Response(200, Api\Auth::logout($request), 'application/json');
    }
]);