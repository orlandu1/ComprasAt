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

    function gerarHashUnicoCampanha($nomeCampanha)
    {
        $dataHoraAtual = date('Y-m-d H:i:s');

        $nome = strtolower(trim($nomeCampanha));
        $nome = iconv('UTF-8', 'ASCII//TRANSLIT', $nome);
        $nome = preg_replace('/[^a-z0-9]/', '', $nome);

        $stringParaHash = $nome . '-' . $dataHoraAtual;

        return hash('sha256', $stringParaHash);
    }

    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);

    $stmt = $conn->prepare("INSERT INTO campanhas 
                                        (titulo, campanha_id, periodo1, periodo2, progresso)
                                            VALUES
                                        (:titulo, :campanha_id, :periodo1, :periodo2, :progresso)");


    $stmt->execute([
        ':titulo' => $data['titulo'],
        ':campanha_id' => gerarHashUnicoCampanha($data['titulo']),
        ':periodo1' => $data['periodo1'],
        ':periodo2' => $data['periodo2'],
        ':progresso' => 0
    ]);

    echo json_encode([
        'success' => true,
        'response' => "Campanha cadastrada com sucesso!"
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
