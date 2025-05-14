<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

$env = parse_ini_file(__DIR__ . '/../.env');

$servername = $env['DB_HOST'];
$username = $env['DB_USER'];
$password = $env['DB_PASS'];
$dbname = $env['DB_NAME'];

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);

    $data = json_decode($_POST['data'], true);
    $action = $_POST['action'];
    $pdf_id = $_POST['pdf_id'];
    $tokenCamp = $_POST['TokenCamp'];

    if ($pdf_id == 'null' || $pdf_id == '') {
        return;
    }

    switch ($action) {
        case 'add':
            $stmt = $conn->prepare("
                INSERT INTO annotations 
                (id, pdf_id, campanha_id, user_name, type, position_x, position_y, comment)
                VALUES (:id, :pdf_id, :campanha_id, :user, :type, :x, :y, :comment)
                ON DUPLICATE KEY UPDATE
                type = VALUES(type), 
                position_x = VALUES(position_x), 
                position_y = VALUES(position_y), 
                comment = VALUES(comment)
            ");

            // Executar APENAS para 'add'
            $stmt->execute([
                ':id' => $data['id'],
                ':pdf_id' => $pdf_id,
                ':campanha_id' => $tokenCamp,
                ':user' => $data['user_name'] ?? 'Anônimo',
                ':type' => $data['type'],
                ':x' => $data['position']['x'],
                ':y' => $data['position']['y'],
                ':comment' => $data['comment'] ?? null
            ]);
            break;

        case 'delete':
            $stmt = $conn->prepare("DELETE FROM annotations WHERE id = :id");
            // Executar APENAS para 'delete'
            $stmt->execute([':id' => $data['id']]);
            break;
    }

    echo json_encode(['success' => true]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>