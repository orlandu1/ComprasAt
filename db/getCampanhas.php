<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
$env = parse_ini_file(__DIR__ . '/../.env');

$servername = $env['DB_HOST'];
$username = $env['DB_USER'];
$password = $env['DB_PASS'];
$dbname = $env['DB_NAME'];


try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $stmt = $conn->prepare("SELECT  *,
                            DATE_FORMAT(periodo1, '%d/%m/%Y') AS periodo1_formatado,
                            DATE_FORMAT(periodo2, '%d/%m/%Y') AS periodo2_formatado,
                            DATE_FORMAT(dataCadastro, '%d/%m/%Y - %H:%i:%s') AS dataCadastro_formatado
                            FROM campanhas ORDER BY id DESC;");
    $stmt->execute();

    $campanhas = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {

        $totalItens = 0;
        $totalAnotacoes = 0;

        $pdfsStmt = $conn->prepare("SELECT pdf_id, itens FROM hashpdf WHERE campanha_id = ?");
        $pdfsStmt->execute([$row['campanha_id']]);
        $pdfs = $pdfsStmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($pdfs as $pdf) {
            $totalItens += (int)$pdf['itens'];

            $anotacoesStmt = $conn->prepare("SELECT COUNT(*) FROM annotations WHERE campanha_id = ? AND pdf_id = ?");
            $anotacoesStmt->execute([$row['campanha_id'], $pdf['pdf_id']]);
            $anotacoesFeitas = (int)$anotacoesStmt->fetchColumn();

            $totalAnotacoes += min($anotacoesFeitas, (int)$pdf['itens']);
        }

        $porcentagem = $totalItens > 0 ? round(($totalAnotacoes / $totalItens) * 100) : 0;

        $typeStmt = $conn->prepare("
            SELECT 
                `type`, COUNT(*) as total 
            FROM annotations 
            WHERE campanha_id = ? 
            GROUP BY `type`
        ");
        $typeStmt->execute([$row['campanha_id']]);

        $tipos = ['CERTO' => 0, 'ERRADO' => 0, 'COMENTAR' => 0];
        while ($typeRow = $typeStmt->fetch(PDO::FETCH_ASSOC)) {
            $tipos[$typeRow['type']] = (int) $typeRow['total'];
        }



        $campanhas[] = [
            'id' => $row['id'],
            'titulo' => $row['titulo'],
            'campanha_id' => $row['campanha_id'],
            'periodo1' => $row['periodo1_formatado'],
            'periodo2' => $row['periodo2_formatado'],
            'progresso' => $porcentagem,
            'dataCadastro' => $row['dataCadastro_formatado'],
            'acertos' => $tipos['CERTO'],
            'erros' => $tipos['ERRADO'],
            'comentarios' => $tipos['COMENTAR'],

        ];
    }

    echo json_encode([
        'success' => true,
        'response' => $campanhas
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
