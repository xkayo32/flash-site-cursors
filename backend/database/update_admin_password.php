<?php
// Script to generate a new password hash for admin user

$newPassword = 'AdminEstudos@2024';
$hashedPassword = password_hash($newPassword, PASSWORD_ARGON2ID, [
    'memory_cost' => 65536,  // 64MB
    'time_cost' => 4,        // 4 iterations
    'threads' => 3           // 3 parallel threads
]);

echo "New password: " . $newPassword . "\n";
echo "Password hash: " . $hashedPassword . "\n";
echo "\n";
echo "SQL to update:\n";
echo "UPDATE users SET password_hash = '" . $hashedPassword . "' WHERE email = 'admin@estudos.com';\n";