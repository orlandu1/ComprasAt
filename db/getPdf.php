<?php

$env = parse_ini_file(__DIR__ . '/../.env');

$servername = $env['DB_HOST'];
$username = $env['DB_USER'];
$password = $env['DB_PASS'];
$dbname = $env['DB_NAME'];

try {
    $pdo = new PDO("mysql:host=$servername;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $pdo->query("SELECT hash FROM hashPdf WHERE id = 1");
    $row = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode(['pdf' => $row['hash'] ?? null]);
} catch (PDOException $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
