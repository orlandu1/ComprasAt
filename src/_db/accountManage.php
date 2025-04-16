<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$env = parse_ini_file(__DIR__ . '/../.env');

$servername = $env['DB_HOST'];
$username = $env['DB_USER'];
$password = $env['DB_PASS'];
$dbname = $env['DB_NAME'];

class Manager
{

    private $action;
    private $login;
    private $newPassword;

    public function __construct($action, $login, $newPassword)
    {
        $this->action = $action;
        $this->login = $login;
        $this->newPassword = $newPassword;
    }

    private function Delete()
    {

        try {
            $env = parse_ini_file(__DIR__ . '/../.env');

            $servername = $env['DB_HOST'];
            $username = $env['DB_USER'];
            $password = $env['DB_PASS'];
            $dbname = $env['DB_NAME'];

            $pdo = new PDO("mysql:host=$servername;dbname=$dbname;charset=utf8", $username, $password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            $stmt = $pdo->prepare("DELETE FROM usuarios WHERE loginUsuario = ?");

            if (!$pdo) {
                echo json_encode(["response" => "Falha na conexão com o banco de dados."]);
                return;
            }

            $stmt->bindValue(1, $this->login, PDO::PARAM_STR);

            if ($stmt->execute()) {
                echo json_encode(["response" => "Conta excluída com sucesso!"]);
                return 1;
            } else {
                echo json_encode(["response" => "ocorreu um erro ao excluir esta conta!"]);
            }
        } catch (Exception $e) {
            return 'Caught exception: ' . $e->getMessage() . "\n";
        }
    }

    private function Reset()
    {

        try {
            $env = parse_ini_file(__DIR__ . '/../.env');

            $servername = $env['DB_HOST'];
            $username = $env['DB_USER'];
            $password = $env['DB_PASS'];
            $dbname = $env['DB_NAME'];

            $defaultPassword = password_hash("saturno", PASSWORD_BCRYPT);

            $pdo = new PDO("mysql:host=$servername;dbname=$dbname;charset=utf8", $username, $password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            $stmt = $pdo->prepare("UPDATE usuarios SET senhaUsuario = ? WHERE loginUsuario = ?;");

            if (!$pdo) {
                echo json_encode(["response" => "Falha na conexão com o banco de dados."]);
                return;
            }

            $stmt->bindValue(1, $defaultPassword, PDO::PARAM_STR);
            $stmt->bindValue(2, $this->login, PDO::PARAM_STR);

            if ($stmt->execute()) {
                echo json_encode(["response" => "Senha de $this->login alterada com sucesso!"]);
                return 1;
            } else {
                echo json_encode(["response" => "ocorreu um erro ao alterada a senha desta conta  $this->login !"]);
            }
        } catch (Exception $e) {
            return 'Caught exception: ' . $e->getMessage() . "\n";
        }
    }

    public function SelfReset()
    {

        try {
            $env = parse_ini_file(__DIR__ . '/../.env');

            $servername = $env['DB_HOST'];
            $username = $env['DB_USER'];
            $password = $env['DB_PASS'];
            $dbname = $env['DB_NAME'];

            $defaultPassword = password_hash("saturno", PASSWORD_BCRYPT);

            $pdo = new PDO("mysql:host=$servername;dbname=$dbname;charset=utf8", $username, $password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            $stmt = $pdo->prepare("UPDATE usuarios SET senhaUsuario = ? WHERE loginUsuario = ?;");

            if (!$pdo) {
                echo json_encode(["response" => "Falha na conexão com o banco de dados."]);
                return;
            }

            $stmt->bindValue(1, password_hash($this->newPassword, PASSWORD_BCRYPT), PDO::PARAM_STR);
            $stmt->bindValue(2, $this->login, PDO::PARAM_STR);

            if ($stmt->execute()) {
                echo json_encode(["response" => "Senha de $this->login resetada com sucesso!"]);
                return 1;
            } else {
                echo json_encode(["response" => "ocorreu um erro ao resetar a senha desta conta  $this->login !"]);
            }
        } catch (Exception $e) {
            return 'Caught exception: ' . $e->getMessage() . "\n";
        }
    }

    public function Execute()
    {
        if ($this->action == 'delete') {
            $this->Delete();
        } elseif ($this->action == 'reset') {
            $this->Reset();
        }
    }
}


$inputData = json_decode(file_get_contents('php://input'), true);

if ($inputData) {

    $action = $inputData['action'];
    $login = $inputData['login'];
    $newPassword = isset($inputData['newPassword']) && $inputData['newPassword'] !== '' ? $inputData['newPassword'] : NULL;


    if ($action == 'selfReset') {

        $gerenciador = new Manager($action, $login, $newPassword);
        $gerenciador->SelfReset();
    } else {

        $gerenciador = new Manager($action, $login, $newPassword);
        $gerenciador->Execute();
    }
} else {
    echo json_encode(["response" => "Erro: Dados inválidos!!"]);
}
