<?php

use \App\Http\Response;
use \App\Controller\Api;

// Endpoint de status da API
$obRouter->get('/api/v1/status', [
  'middlewares' => [
    'api'
  ],
  function($request) {
    return new Response(200, Api\Test::status($request), 'application/json');
  }
]);