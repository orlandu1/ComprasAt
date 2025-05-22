<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");


class userRegister
{
    private $nome;
    private $login;
    private $matricula;
    private $senha;

    public function __construct(
        $nome,
        $login,
        $matricula,
        $senha
    ) {
        $this->nome = $nome;
        $this->login = $login;
        $this->matricula = $matricula;
        $this->senha = $senha;
    }

    public function verDados()
    {

        return "$this->nome - $this->login - $this->matricula - $this->senha";
    }

    public function register()
    {

        try {

            $env = parse_ini_file(__DIR__ . '/../.env');

            $servername = $env['DB_HOST'];
            $username = $env['DB_USER'];
            $password = $env['DB_PASS'];
            $dbname = $env['DB_NAME'];

            $pdo = new PDO("mysql:host=$servername;dbname=$dbname;charset=utf8", $username, $password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            $stmt = $pdo->prepare("INSERT INTO usuarios (
                loginUsuario,
                nomeUsuario,
                senhaUsuario,
                matriculaUsuario,
                hierarquia
            ) VALUES (?, ?, ?, ?, ?)");

            if (!$pdo) {
                echo json_encode(["response" => "Falha na conexão com o banco de dados."]);
                return;
            }

            $stmt->bindValue(1, $this->login, PDO::PARAM_STR);
            $stmt->bindValue(2, $this->nome, PDO::PARAM_STR);
            $stmt->bindValue(3, password_hash($this->senha, PASSWORD_BCRYPT), PDO::PARAM_STR);
            $stmt->bindValue(4, $this->matricula, PDO::PARAM_STR);
            $stmt->bindValue(5, 1, PDO::PARAM_INT);

            if ($stmt->execute()) {
                echo json_encode(["response" => "Dados gravados com sucesso!"]);

            } else {
                echo json_encode(["response" => "ocorreu um erro ao gravar os dados!"]);
            }
        } catch (Exception $e) {
            return 'Caught exception: ' . $e->getMessage() . "\n";
        }
    }
}

$inputData = json_decode(file_get_contents('php://input'), true);

if ($inputData) {

    $nome = $inputData['nome'];
    $login = $inputData['login'];
    $matricula = $inputData['matricula'];
    $senha = $inputData['senha'];

    $userRegister = new userRegister($nome, $login, $matricula, $senha);
    echo $userRegister->register();


} else {
    echo json_encode(["response" => "Erro: Dados inválidos!!"]);
}
