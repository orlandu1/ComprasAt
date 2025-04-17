<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");


class FileUploader
{
    private $login;
    private $file;
    private $uploadType;

    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const UPLOAD_TYPES = ['foto', 'encarte'];

    public function __construct($login, $file, $uploadType)
    {
        $this->login = $this->sanitizeFilename($login);
        $this->file = $file;
        $this->uploadType = $uploadType;
    }

    public function processUpload()
    {
        try {
            $this->validateInput();
            $targetPath = $this->getTargetPath();

            if (!move_uploaded_file($this->file['tmp_name'], $targetPath)) {
                throw new Exception('Falha ao mover arquivo');
            }

            // Atualiza o banco somente se for foto de perfil
            if ($this->uploadType === 'foto') {
                // Caminho relativo para salvar no banco
                $relativePath = '../uploads/fotos/' . $this->login . '.png';

                $env = parse_ini_file(__DIR__ . '/../.env');

                $servername = $env['DB_HOST'];
                $username = $env['DB_USER'];
                $password = $env['DB_PASS'];
                $dbname = $env['DB_NAME'];

                $pdo = new PDO("mysql:host=$servername;dbname=$dbname;charset=utf8", $username, $password);
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

                $stmt = $pdo->prepare("UPDATE usuarios SET fotoUsuario = ? WHERE loginUsuario = ?");
                $stmt->execute([$relativePath, $this->login]);
            }

            return ['status' => 'success', 'message' => 'Arquivo processado'];
        } catch (Exception $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }

    private function validateInput()
    {
        // Valida tipo de upload
        if (!in_array($this->uploadType, self::UPLOAD_TYPES)) {
            throw new Exception('Tipo de upload inválido');
        }

        // Valida tipo de arquivo
        if (!in_array($this->file['type'], self::ALLOWED_TYPES)) {
            throw new Exception('Tipo de arquivo não permitido');
        }

        // Valida tamanho do arquivo
        if ($this->file['size'] > self::MAX_SIZE) {
            throw new Exception('Arquivo excede o tamanho máximo permitido (5MB)');
        }

        // Valida login
        if (empty($this->login)) {
            throw new Exception('Login do usuário não informado');
        }
    }

    private function getTargetPath()
    {
        $baseDir = "../uploads/";

        if ($this->uploadType === 'foto') {
            $dir = $baseDir . 'fotos/';
            $filename = $this->login . '.png';
            $this->cleanPreviousFiles($dir);
        } else {
            $dir = $baseDir . 'encartes/';
            $filename = md5_file($this->file['tmp_name']) . '.pdf';
            $this->cleanPreviousFiles($dir);
        }

        $this->createDirectory($dir);
        return $dir . $filename;
    }

    private function cleanPreviousFiles($dir)
    {
        // Padrão de busca baseado no tipo de arquivo
        $pattern = ($this->uploadType === 'encarte') 
            ? $dir . '*'  // Remove todos os encartes
            : $dir . $this->login . '.*'; // Remove todas as fotos do usuário
    
        $existingFiles = glob($pattern);
    
        foreach ($existingFiles as $file) {
            if (is_file($file)) {
                unlink($file);
            }
        }
    }

    private function sanitizeFilename($name)
    {
        return preg_replace('/[^a-zA-Z0-9\-\._]/', '', $name);
    }

    private function createDirectory($path)
    {
        if (!file_exists($path) && !mkdir($path, 0755, true)) {
            error_log("Falha ao criar diretório: " . $path);
            throw new Exception('Erro ao criar diretório de armazenamento');
        }
    }
}

// Processamento da requisição
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Verifica se o arquivo foi enviado corretamente
        if (!isset($_FILES['arquivo']) || $_FILES['arquivo']['error'] !== UPLOAD_ERR_OK) {
            throw new Exception('Erro no upload do arquivo');
        }

        // Valida parâmetros
        $uploadType = $_POST['tipo'] ?? 'encarte';
        $login = $_POST['login'] ?? '';

        // Valida tipo de upload
        if (!in_array($uploadType, ['foto', 'encarte'])) {
            throw new Exception('Tipo de upload inválido');
        }

        $uploader = new FileUploader($login, $_FILES['arquivo'], $uploadType);
        $result = $uploader->processUpload();

        echo json_encode($result);
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Método não permitido']);
}
