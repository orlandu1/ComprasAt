<?php
header('Content-Type: application/json');

$env = parse_ini_file(__DIR__ . '/../.env');

$servername = $env['DB_HOST'];
$username = $env['DB_USER'];
$password = $env['DB_PASS'];
$dbname = $env['DB_NAME'];

try {
    // Conexão com o banco de dados
    $pdo = new PDO("mysql:host=$servername;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Buscar todos os usuários no banco de dados
    $stmt = $pdo->prepare("SELECT * FROM usuarios");
    $stmt->execute();

    // Buscar todos os usuários como array associativo
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Retornar os dados em formato JSON
    echo json_encode([
        'response' => 'success',
        'data' => $usuarios
    ]);

} catch (Exception $e) {
    // Retornar erro
    echo json_encode([
        'response' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>
