<?php
header('Content-Type: application/json');


header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

$env = parse_ini_file(__DIR__ . '/../.env');

$servername = $env['DB_HOST'];
$username = $env['DB_USER'];
$password = $env['DB_PASS'];
$dbname = $env['DB_NAME'];

$inputData = json_decode(file_get_contents('php://input'), true);

$login = $inputData['login'];

try {
    // Conex�o com o banco de dados
    $pdo = new PDO("mysql:host=$servername;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Buscar todos os usu�rios no banco de dados
    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE loginUsuario <> ?");

    $stmt->bindValue(1, $login, PDO::PARAM_STR);
    
    $stmt->execute();

    // Buscar todos os usu�rios como array associativo
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