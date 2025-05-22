<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
date_default_timezone_set('America/Sao_Paulo');
$env = parse_ini_file(__DIR__ . '/../.env');

$servername = $env['DB_HOST'];
$username = $env['DB_USER'];
$password = $env['DB_PASS'];
$dbname = $env['DB_NAME'];


try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $stmt = $conn->prepare("SELECT id, type, user_name, position_x, position_y, comment FROM annotations WHERE pdf_id = :pdf_id");
    $stmt->execute([':pdf_id' => $_GET['pdf_id']]);
    
    $annotations = [];
    while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $annotations[] = [
            'id' => $row['id'],
            'type' => $row['type'],
            'user_name' => $row['user_name'],
            'position' => [
                'x' => $row['position_x'],
                'y' => $row['position_y']
            ],
            'comment' => $row['comment']
        ];
    }

    echo json_encode([
        'success' => true,
        'annotations' => $annotations
    ]);

} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
