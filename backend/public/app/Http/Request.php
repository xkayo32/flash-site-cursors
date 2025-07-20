<?php

namespace App\Http;

class Request
{

  /**
   * Instância do Router
   * @var Router
   */
  private $router;

  /**
   * Metodo HTTP da requisição
   * @var string
   */
  private $httpMethod;

  /**
   * URI da pagina
   * @var string
   */
  private $uri;

  /**
   * Parametros da URL ($_GET)
   * @var array
   */
  private $queryParams = [];

  /**
   * Variaveis recebidas no POST da pagina ($_POST)
   * @var array
   */
  private $postVars = [];

  /**
   * Cabeçalho da requisição
   * @var array 
   */
  private $headers;

  public function __construct($router) {
    $this->router      = $router;
    $this->queryParams = $_GET ?? [];
    $this->headers     = getallheaders();
    $this->httpMethod  = $_SERVER['REQUEST_METHOD'] ?? '';
    $this->setUri();
    $this->setPostVars();
  }

  /**
   * Metodo responsavel por definir as variaveis POST
   */
  private function setPostVars() {
    // Se for JSON, decodificar o corpo da requisição
    $contentType = $this->headers['Content-Type'] ?? '';
    
    if (strpos($contentType, 'application/json') !== false) {
      $input = file_get_contents('php://input');
      $this->postVars = json_decode($input, true) ?: [];
    } else {
      $this->postVars = $_POST ?? [];
    }
  }

  /**
   * Metodo responsavel por definir a URI
   */
  private function setUri() {
    // URI completa (com GETs)
    $this->uri = $_SERVER['REQUEST_URI'] ?? '';

    // Remover GETs da URI
    $xURI = explode('?', $this->uri);

    // Setar URI somente com o elemento 0
    $this->uri = $xURI[0];
  }

  /**
   * Metodo responsavel por retornar a instância de Router
   * @return Router
   */
  public function getRouter() {
    return $this->router;
  }

  public function getHttpMethod() {
    return $this->httpMethod;
  }

  /**
   * Metodo responsavel por retornar uri da requisição
   * @return string
   */
  public function getUri(){
    return $this->uri;
  }

  /**
   * Metodo responsavel por retornar parametros da requisição
   * @return string
   */
  public function getQueryParams() {
    return $this->queryParams;
  }

  /**
   * Metodo responsavel por retornar variaveis recebidas no post da requisição
   * @return string
   */
  public function getPostVars() {
    return $this->postVars;
  }

  /**
   * Metodo responsavel por retornar headers da requisição
   * @return string
   */
  public function getHeaders() {
    return $this->headers;
  }
}
