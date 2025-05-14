<?php

$env = parse_ini_file(__DIR__ . '/../.env');
date_default_timezone_set('America/Sao_Paulo');
$servername = $env['DB_HOST'];
$username = $env['DB_USER'];
$password = $env['DB_PASS'];
$dbname = $env['DB_NAME'];

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $praca = $data['praca'];

    try {
        $pdo = new PDO("mysql:host=$servername;dbname=$dbname;charset=utf8", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Consulta no banco de dados
        $stmt = $pdo->prepare("SELECT pdf_id, user FROM hashpdf WHERE praca = ? LIMIT 1");
        $stmt->execute([$praca]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);


        // Verifica se o arquivo existe no diretório
        $dirPath = "../uploads/encartes/"; // Substitua para o caminho real
        $filePath = "$dirPath/" . $row['pdf_id'] . ".pdf";
        $fileExists = file_exists($filePath);
        $fileInfo = $fileExists ? [
            'exists' => true,
            'filename' => "$praca.pdf",
            'lastModified' => date("Y-m-d H:i:s", filemtime($filePath)),
            'user' => $row['user']

        ] : ['exists' => false];

        echo json_encode([
            'hash' => $row['pdf_id'] ?? null,
            'arquivo' => $fileInfo
        ]);
    } catch (PDOException $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}
