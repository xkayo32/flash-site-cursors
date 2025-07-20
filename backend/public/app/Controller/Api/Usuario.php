<?php

namespace App\Controller\Api;

use \PDO;
use \PDOException;

class Usuario extends Api {

  /**
   * Retorna lista de usuários
   */
  public static function getUsers($request) {
    try {
      // Conectar diretamente ao PostgreSQL
      $host = '173.208.151.106';
      $port = '5532';
      $dbname = 'estudos_db';
      $user = 'estudos_user';
      $pass = 'estudos_pass';
      
      $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
      $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
      ]);
      
      // Buscar usuários no banco
      $stmt = $pdo->prepare('
        SELECT 
          u.id,
          u.name,
          u.email,
          u.phone,
          u.avatar,
          u.role,
          u.status,
          u.created_at,
          u.last_login_at,
          s.plan,
          s.status as subscription_status,
          s.expires_at,
          ua.courses_enrolled,
          ua.questions_answered,
          ua.flashcards_studied,
          ua.study_streak,
          ua.total_spent
        FROM users u
        LEFT JOIN subscriptions s ON s.user_id = u.id
        LEFT JOIN user_activities ua ON ua.user_id = u.id
        ORDER BY u.created_at DESC
      ');
      $stmt->execute();
      
      $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
      
      // Formatar dados para o frontend
      $formattedUsers = array_map(function($user) {
        return [
          'id' => $user['id'],
          'name' => $user['name'],
          'email' => $user['email'],
          'phone' => $user['phone'] ?? '',
          'avatar' => $user['avatar'] ?? '',
          'role' => $user['role'],
          'status' => $user['status'],
          'plan' => $user['plan'] ?? 'Básico',
          'subscriptionStatus' => $user['subscription_status'] ?? 'active',
          'subscriptionExpiry' => $user['expires_at'],
          'joinDate' => date('Y-m-d', strtotime($user['created_at'])),
          'lastLogin' => $user['last_login_at'] ? date('Y-m-d H:i', strtotime($user['last_login_at'])) : 'Nunca',
          'totalSpent' => floatval($user['total_spent'] ?? 0),
          'coursesEnrolled' => intval($user['courses_enrolled'] ?? 0),
          'questionsAnswered' => intval($user['questions_answered'] ?? 0),
          'flashcardsStudied' => intval($user['flashcards_studied'] ?? 0),
          'studyStreak' => intval($user['study_streak'] ?? 0)
        ];
      }, $users);
      
      return [
        'status' => 'success',
        'data' => $formattedUsers,
        'total' => count($formattedUsers)
      ];
      
    } catch (\Exception $e) {
      return [
        'status' => 'error',
        'message' => 'Erro ao buscar usuários: ' . $e->getMessage()
      ];
    }
  }

} 