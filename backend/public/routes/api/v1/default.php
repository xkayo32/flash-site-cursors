<?php

use \App\Http\Response;
use \App\Controller\Api;
use \App\Controller\Api\HardwareInventory;

$obRouter->get('/api/v1', [
  function($request) {
    return new Response(200, Api\Api::getDetails(), 'application/json');
  }
]);

$obRouter->get('/api/v1/inventory/current_client_version', [
  function($request) {
    return new Response(200, HardwareInventory::getClientVersion(), 'application/json');
  }
]);

$obRouter->post('/api/v1/inventory/insert', [
  function($request) {
    return new Response(200, Api\Api::inventoryInsert($request), 'application/json');
  }
]);

$obRouter->get('/api/v1/usuarios', [
  'middlewares' => [
    'api'
  ],
  function($request) {
    return new Response(200, Api\Usuario::getUsers($request), 'application/json');
  }
]);

$obRouter->get('/api/v1/usuarios/grupos', [
  'middlewares' => [
    'cache'
  ],
  function() {
    return new Response(200, Api\Usuario::getGroups(), 'application/json');
  }
]);

/**
 * Exclusão de usuários
 */
$obRouter->delete('/api/v1/cadastro/usuario', [
  function($request, $id) {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = (int)$input['id'] ?? 0;
    return new Response(200, Api\Usuario::deleteUsuario($id), 'application/json');
  }
]);

