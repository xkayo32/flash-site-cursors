<?php
// Configure error handling for API responses (prevent JSON corruption)
ini_set('display_errors', '0');           // Don't output errors to STDOUT
ini_set('display_startup_errors', '0');
ini_set('log_errors', '1');               // Log errors to PHP error log
error_reporting(E_ALL);                   // Report all errors to log

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