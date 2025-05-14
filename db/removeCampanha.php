<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
$env = parse_ini_file(__DIR__ . '/../.env');

$servername = $env['DB_HOST'];
$username = $env['DB_USER'];
$password = $env['DB_PASS'];
$dbname = $env['DB_NAME'];


try {
    $data = json_decode(file_get_contents('php://input'), true);

    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);

    $stmt = $conn->prepare("DELETE FROM campanhas WHERE id = :id");

    $stmt->execute([
        ':id' => $data['id'],
    ]);

    echo json_encode([
        'success' => true,
        'response' => "Campanha excluída com sucesso!"
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
