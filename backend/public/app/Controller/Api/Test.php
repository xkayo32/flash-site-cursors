<?php

namespace App\Controller\Api;

class Test extends Api {

  /**
   * Endpoint de teste para verificar se a API está funcionando
   */
  public static function status($request) {
    return [
      'status' => 'success',
      'message' => 'API is working',
      'timestamp' => date('Y-m-d H:i:s')
    ];
  }

}