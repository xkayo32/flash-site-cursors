<?php 

namespace App\Utils;

use \PDO;
use \PDOException;

class Database {

  private static $host;
  private static $name;
  private static $user;
  private static $pass;
  private static $port;
  private $connection;

  /**
   * Configura os dados de conexão
   */
  public static function config($host, $name, $user, $pass, $port = 3306){
    self::$host = $host;
    self::$name = $name;
    self::$user = $user;
    self::$pass = $pass;
    self::$port = $port;
  }

  /**
   * Cria uma nova conexão com o banco
   */
  public function __construct(){
    $this->setConnection();
  }

  /**
   * Estabelece a conexão com MySQL ou PostgreSQL
   */
  private function setConnection(){
    try {
      // Detectar tipo de banco baseado na porta (5432 = PostgreSQL, 3306 = MySQL)
      if (self::$port == 5432 || getenv('DB_TYPE') === 'pgsql') {
        $dsn = 'pgsql:host='.self::$host.';port='.self::$port.';dbname='.self::$name;
      } else {
        $dsn = 'mysql:host='.self::$host.';dbname='.self::$name.';port='.self::$port;
      }
      
      $this->connection = new PDO($dsn, self::$user, self::$pass);
      $this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    } catch(PDOException $e) {
      die('ERROR: '.$e->getMessage());
    }
  }

  /**
   * Executa queries no banco de dados
   */
  public function execute($query, $params = []) {
    try{
      $statement = $this->connection->prepare($query);
      $statement->execute($params);
      return $statement;
    } catch(PDOException $e) {
      die('ERROR: '.$e->getMessage());
    }
  }

  /**
   * Retorna a conexão PDO
   */
  public function getConnection() {
    return $this->connection;
  }
}
