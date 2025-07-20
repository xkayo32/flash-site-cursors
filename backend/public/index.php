<?php

require __DIR__.'/includes/config.php';
use \App\Http\Router;

// Objeto da rota
$obRouter = new Router(URL);

// Define content-type como JSON para APIs
$obRouter->setContentType('application/json');

// Inclui arquivo de rotas da API
include __DIR__.'/routes/api.php';

// Imprime o response da rota
$obRouter->run()
         ->sendResponse();