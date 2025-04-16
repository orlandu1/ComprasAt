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

    // Receber dados do formulário
    $input = json_decode(file_get_contents('php://input'), true);
    $login = $input['usuario'] ?? '';
    $senha = $input['senha'] ?? '';

    if (empty($login) || empty($senha)) {
        throw new Exception('Usuário e senha são obrigatórios');
    }

    // Buscar usuário no banco de dados
    $stmt = $pdo->prepare("SELECT * FROM usuarios WHERE loginUsuario = :login LIMIT 1");
    $stmt->bindParam(':login', $login);
    $stmt->execute();
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    // Verificar se usuário existe e a senha está correta
    if (!$usuario || !password_verify($senha, $usuario['senhaUsuario'])) {
        throw new Exception('Credenciais inválidas');
    }

    // Verificar se usuário está bloqueado
    if ($usuario['bloqueioUsuario']) {
        throw new Exception('Usuário bloqueado');
    }

    // Preparar dados da sessão
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

    // Atualizar último acesso
    $stmt = $pdo->prepare("UPDATE usuarios SET ultimoAcesso = NOW() WHERE id = :id");
    $stmt->bindParam(':id', $usuario['id']);
    $stmt->execute();

    // Retornar resposta de sucesso
    echo json_encode([
        'response' => 'success',
        'session' => $dataSession
    ]);

} catch (Exception $e) {
    // Retornar erro
    echo json_encode([
        'response' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>