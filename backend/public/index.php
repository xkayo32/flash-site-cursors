<?php
// Set display_errors to true for development
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

require __DIR__.'/includes/config.php';
use \App\Http\Router;

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Objeto da rota
$obRouter = new Router(URL);

// Define content-type como JSON para APIs
$obRouter->setContentType('application/json');

// Inclui arquivo de rotas da API
include __DIR__.'/routes/api.php';

// Imprime o response da rota
$obRouter->run()
         ->sendResponse();