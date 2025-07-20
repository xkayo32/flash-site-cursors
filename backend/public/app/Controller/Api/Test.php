<?php

namespace App\Controller\Api;

use \PDO;
use \PDOException;

class Test extends Api {

  /**
   * Endpoint de teste para verificar se a API está funcionando
   */
  public static function status($request) {
    try {
      // Conectar diretamente ao PostgreSQL
      $host = getenv('DB_HOST') ?: 'postgres';
      $port = getenv('DB_PORT') ?: '5432';
      $dbname = getenv('DB_DATABASE') ?: 'estudos_db';
      $user = getenv('DB_USERNAME') ?: 'estudos_user';
      $pass = getenv('DB_PASSWORD') ?: 'estudos_pass';
      
      $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
      $pdo = new PDO($dsn, $user, $pass);
      
      // Testar conexão
      $stmt = $pdo->query('SELECT 1 as test');
      $result = $stmt->fetch(PDO::FETCH_ASSOC);
      
      return [
        'status' => 'success',
        'message' => 'API is working',
        'timestamp' => date('Y-m-d H:i:s'),
        'database' => 'connected'
      ];
    } catch (PDOException $e) {
      return [
        'status' => 'error',
        'message' => 'Database connection failed: ' . $e->getMessage()
      ];
    }
  }

} 