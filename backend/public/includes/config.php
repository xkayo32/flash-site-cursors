<?php
require __DIR__ . '/../vendor/autoload.php';

use \App\Utils\Environment;
use \App\Http\Middlewares\Queue as MiddlewaresQueue;

Environment::load(__DIR__.'/../');


// Define a constante de URL do projeto
define('URL', getenv('URL'));
define('VERSAO', getenv('VERSAO'));


// Define o mapeamento de middlewares
MiddlewaresQueue::setMap([
    'api' => \App\Http\Middlewares\Api::class
]);

// Define o mapeamento de middlewares padrões (executados em todas as rotas)
MiddlewaresQueue::setDefault([
    'api'
]);
