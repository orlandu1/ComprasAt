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
    $token = $data['token'];

    try {
        $pdo = new PDO("mysql:host=$servername;dbname=$dbname;charset=utf8", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Consulta no banco de dados
        $stmt = $pdo->prepare("SELECT id, pdf_id, user, itens FROM hashpdf WHERE praca = ? AND campanha_id = ? ORDER BY id ASC;");
        $stmt->execute([$praca, $token]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $dirPath = "../uploads/encartes/"; // Caminho do diretório dos PDFs
        $resultados = [];

        foreach ($rows as $row) {
            $filePath = $dirPath . $row['pdf_id'] . ".pdf";
            $fileExists = file_exists($filePath);

            $totalCorrecoes = 0;
            if ($fileExists) {
                $countStmt = $pdo->prepare("SELECT COUNT(id) FROM annotations WHERE pdf_id = ?");
                $countStmt->execute([$row['pdf_id']]);
                $totalCorrecoes = (int) $countStmt->fetchColumn();
            }

            $resultados[] = [
                'arquivo' => $fileExists ? [
                    'id' => $row['id'],
                    'exists' => true,
                    'filename' => $row['pdf_id'] . ".pdf",
                    'lastModified' => date("Y-m-d H:i:s", filemtime($filePath)),
                    'user' => $row['user'],
                    'itens' => $row['itens'],
                    'correcoes'=> $totalCorrecoes,
                    'hash' => $row['pdf_id']
                ] : ['exists' => false]
            ];
        }

        echo json_encode($resultados);
    } catch (PDOException $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }

}
