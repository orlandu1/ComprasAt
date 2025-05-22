<?php
header('Content-Type: application/json');
date_default_timezone_set('America/Sao_Paulo');

$env = parse_ini_file(__DIR__ . '/../.env');

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

$servername = $env['DB_HOST'];
$username = $env['DB_USER'];
$password = $env['DB_PASS'];
$dbname = $env['DB_NAME'];


try {
    $pdo = new PDO("mysql:host=$servername;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $input = json_decode(file_get_contents('php://input'), true);
    $login = $input['usuario'] ?? '';
    $senha = $input['senha'] ?? '';

    if (empty($login) || empty($senha)) {
        echo json_encode(['response' => 'error', 'message' => 'Usuário e senha são obrigatórios!']);
        return;
    }

    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE loginUsuario = :login LIMIT 1");
    $stmt->bindParam(':login', $login);
    $stmt->execute();
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$usuario || !password_verify($senha, $usuario['senhaUsuario'])) {
        echo json_encode(['response' => 'error', 'message' => 'Usuário ou Senha inválidos!']);
        return;
    }

    if ($usuario['bloqueioUsuario']) {
        echo json_encode(['response' => 'error', 'message' => 'Usuário bloqueado!']);
        return;
    }

    $dataSession = [
        'acesso' => true,
        'bloqueioUsuario' => (bool) $usuario['bloqueioUsuario'],
        'emailUsuario' => $usuario['emailUsuario'],
        'fotoUsuario' => $usuario['fotoUsuario'],
        'hierarquia' => (int) $usuario['hierarquia'],
        'loginUsuario' => $usuario['loginUsuario'],
        'matriculaUsuario' => $usuario['matriculaUsuario'],
        'nomeUsuario' => $usuario['nomeUsuario'],
        'ultimoAcesso' => $usuario['ultimoAcesso'],
        'dataCadastro' => $usuario['dataCadastro']


    ];

    $dataHora = date('Y-m-d H:i:s');
    $stmt = $pdo->prepare("UPDATE usuarios SET ultimoAcesso = :dataHora WHERE id = :id");
    $stmt->bindParam(':dataHora', $dataHora);
    $stmt->bindParam(':id', $usuario['id']);
    $stmt->execute();

    echo json_encode([
        'response' => 'success',
        'session' => $dataSession
    ]);
} catch (Exception $e) {

    echo json_encode([
        'response' => 'error',
        'message' => $e->getMessage()
    ]);
}
