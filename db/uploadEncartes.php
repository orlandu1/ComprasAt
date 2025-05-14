<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
date_default_timezone_set('America/Sao_Paulo');

class UploadEncartes
{
    private $pdo;
    private $uploadDir;
    private $tokenCampanha;

    public function __construct()
    {
        $this->uploadDir = __DIR__ . '/../uploads/encartes/';
        $this->tokenCampanha = $_POST['tokenCampanha'] ?? null;

        if (!$this->tokenCampanha) {
            http_response_code(400);
            echo json_encode(['error' => 'Token da campanha ausente.']);
            exit;
        }

        $this->conectarBanco();
        $this->garantirDiretorio();
    }

    private function conectarBanco()
    {
        $env = parse_ini_file(__DIR__ . '/../.env');
        try {
            $this->pdo = new PDO(
                "mysql:host={$env['DB_HOST']};dbname={$env['DB_NAME']}",
                $env['DB_USER'],
                $env['DB_PASS'],
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
            );
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Erro ao conectar ao banco de dados.']);
            exit;
        }
    }

    private function garantirDiretorio()
    {
        if (!is_dir($this->uploadDir)) {
            mkdir($this->uploadDir, 0777, true);
        }
    }

    public function processarUploads()
    {
        foreach ($_FILES['files']['name'] as $praca => $nomeOriginal) {
            $tmpName = $_FILES['files']['tmp_name'][$praca];
            $erro = $_FILES['files']['error'][$praca];

            if ($erro === UPLOAD_ERR_OK) {
                $hash = md5(md5_file($tmpName) . microtime(true));
                $login = $_POST['login'];
                $destino = "{$this->uploadDir}/{$hash}.pdf";

                if (move_uploaded_file($tmpName, $destino)) {
                    $this->registrarHash($praca, $hash, $login);

                    echo json_encode(["success" => "✅ Arquivo de praça {$praca} salvo com sucesso.\n"]);
                } else {
                    echo json_encode(["error" => "❌ Falha ao mover o arquivo da praça {$praca}.\n"]);
                }
            } else {
                echo json_encode(["error" => "❌ Erro ao enviar arquivo da praça {$praca}. Código: {$erro}\n"]);
            }
        }
    }

    private function registrarHash($praca, $hash, $login)
    {
        $stmt = $this->pdo->prepare("INSERT INTO hashpdf (praca, campanha_id, pdf_id, user) VALUES (?, ?, ?, ?)");
        $stmt->execute([$praca, $this->tokenCampanha, $hash, $login]);
    }
}

// Executa o processo
$upload = new UploadEncartes();
$upload->processarUploads();
