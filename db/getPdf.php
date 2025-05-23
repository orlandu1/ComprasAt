<?php

$env = parse_ini_file(__DIR__ . '/../.env');
date_default_timezone_set('America/Sao_Paulo');

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

$servername = $env['DB_HOST'];
$username = $env['DB_USER'];
$password = $env['DB_PASS'];
$dbname = $env['DB_NAME'];

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $praca = $data['praca'];
    $TokenCampanha = $data['token'];

    try {
        $pdo = new PDO("mysql:host=$servername;dbname=$dbname;charset=utf8", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Buscar o hash (pdf_id)
        $stmt = $pdo->prepare("SELECT pdf_id, itens FROM hashpdf WHERE praca = ? AND campanha_id = ? ORDER BY id DESC LIMIT 1");
        $stmt->execute([$praca, $TokenCampanha]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        $pdfId = $row['pdf_id'] ?? null;
        $itens = $row['itens'] ?? null;

        // Buscar quantidade de anotações, se houver pdf_id
        $totalCorrecoes = 0;
        if ($pdfId) {
            $countStmt = $pdo->prepare("SELECT COUNT(id) FROM annotations WHERE pdf_id = ?");
            $countStmt->execute([$pdfId]);
            $totalCorrecoes = (int) $countStmt->fetchColumn();
        }

        echo json_encode([
            'hash' => $pdfId,
            'correcoes' => $totalCorrecoes,
            'itens' => $itens
        ]);
    } catch (PDOException $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}
