<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

$env = parse_ini_file(__DIR__ . '/../.env');
$pdo = new PDO(
    "mysql:host={$env['DB_HOST']};dbname={$env['DB_NAME']}",
    $env['DB_USER'],
    $env['DB_PASS'],
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
);

$data = json_decode(file_get_contents("php://input"), true);

$praca = $data['praca'];
$token = $data['token'];
$itens = $data['itens'];

$stmt = $pdo->prepare("UPDATE hashpdf SET itens = ? WHERE praca = ? AND campanha_id = ?");
$stmt->execute([$itens, $praca, $token]);

echo json_encode(['status' => 'ok']);
