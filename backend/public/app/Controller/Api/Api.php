<?php

namespace App\Controller\Api;

class Api {

  public static function getDetails() {
    return [
      'name' => 'Api Gest System',
      'version' => '0.0.1',
      'author' => 'Edie Johnny (edie.eu@gmail.com)'
    ];
  }

  public static function inventoryInsert($request) {
    $inventoryInsert = new HardwareInventory();
    return json_encode($inventoryInsert->inventoryInsert());
  }

}