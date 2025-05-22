<?php
ob_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");
date_default_timezone_set('America/Sao_Paulo');

class UploadEncartes
{
    private $pdo;
    private $uploadDir;
    private $maxFileSize = 8 * 1024 * 1024; // 8MB por arquivo

    public function __construct()
    {
        $this->uploadDir = __DIR__ . '/../uploads/encartes/';
        $this->validateRequest();
        $this->conectarBanco();
        $this->garantirDiretorio();
    }

    private function validateRequest()
    {
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            exit;
        }

        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->sendError('Método não permitido', 405);
        }

        if (
            !isset($_FILES['files']) ||
            empty($_FILES['files']['tmp_name']) ||
            !is_array($_FILES['files']['tmp_name'])
        ) {
            $this->sendError('Nenhum arquivo enviado', 400);
        }

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
            $this->sendError('Erro ao conectar ao banco de dados', 500);
        }
    }

    private function garantirDiretorio()
    {
        if (!is_dir($this->uploadDir) && !mkdir($this->uploadDir, 0755, true)) {
            $this->sendError('Falha ao criar diretório de upload', 500);
        }
    }

    public function processarUpload()
    {
        $tokenCampanha = $_POST['tokenCampanha'] ?? '';
        $login = $_POST['login'] ?? '';
        $pracaIds = $_POST['pracaIds'] ?? [];

        if (empty($tokenCampanha)) {
            $this->sendError('Token da campanha ausente', 400);
        }

        if (
            !isset($_FILES['files']) ||
            empty($_FILES['files']['tmp_name']) ||
            !is_array($_FILES['files']['tmp_name'])
        ) {
            $this->sendError('Nenhum arquivo enviado', 400);
        }


        $files = $_FILES['files'];
        $resultados = [];

        foreach ($files['tmp_name'] as $index => $tmpName) {
            $arquivo = [
                'name' => $files['name'][$index],
                'type' => $files['type'][$index],
                'tmp_name' => $files['tmp_name'][$index],
                'error' => $files['error'][$index],
                'size' => $files['size'][$index],
            ];

            $pracaId = $pracaIds[$index] ?? null;

            $resultados[] = $this->processarArquivo($arquivo, $pracaId, $tokenCampanha, $login);
        }

        echo json_encode([
            'success' => true,
            'resultados' => $resultados
        ]);
    }



    private function processarArquivo($file, $pracaId, $tokenCampanha, $login)
    {
        if ($file['error'] !== UPLOAD_ERR_OK) {
            return [
                'nome' => $file['name'],
                'success' => false,
                'error' => $this->getUploadErrorMessage($file['error'])
            ];
        }

        if ($file['size'] > $this->maxFileSize) {
            return [
                'nome' => $file['name'],
                'success' => false,
                'error' => 'Arquivo excede o tamanho máximo de 8MB'
            ];
        }

        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($file['tmp_name']);

        if ($mime !== 'application/pdf') {
            return [
                'nome' => $file['name'],
                'success' => false,
                'error' => 'Apenas arquivos PDF são permitidos'
            ];
        }

        $hash = $this->generateFileHash($file['tmp_name']);
        $destino = $this->uploadDir . $hash . '.pdf';

        if (!move_uploaded_file($file['tmp_name'], $destino)) {
            return [
                'nome' => $file['name'],
                'success' => false,
                'error' => 'Falha ao mover o arquivo'
            ];
        }

        try {
            $stmt = $this->pdo->prepare(
                "INSERT INTO hashpdf (praca, campanha_id, pdf_id, user) VALUES (?, ?, ?, ?)"
            );
            $stmt->execute([$pracaId, $tokenCampanha, $hash, $login]);
        } catch (PDOException $e) {
            unlink($destino);
            return [
                'nome' => $file['name'],
                'success' => false,
                'error' => 'Erro ao registrar no banco de dados'
            ];
        }

        return [
            'nome' => $file['name'],
            'success' => true,
            'fileId' => $hash
        ];
    }

    private function generateFileHash($filePath)
    {
        return hash_file('sha256', $filePath) . uniqid();
    }

    private function getUploadErrorMessage($errorCode)
    {
        $errors = [
            UPLOAD_ERR_INI_SIZE => 'Arquivo excede o tamanho máximo permitido',
            UPLOAD_ERR_FORM_SIZE => 'Arquivo excede o tamanho máximo do formulário',
            UPLOAD_ERR_PARTIAL => 'Upload foi realizado parcialmente',
            UPLOAD_ERR_NO_FILE => 'Nenhum arquivo foi enviado',
            UPLOAD_ERR_NO_TMP_DIR => 'Diretório temporário não encontrado',
            UPLOAD_ERR_CANT_WRITE => 'Falha ao gravar arquivo no disco',
            UPLOAD_ERR_EXTENSION => 'Upload interrompido por extensão PHP'
        ];

        return $errors[$errorCode] ?? 'Erro desconhecido durante o upload';
    }

    private function sendError($message, $code = 400)
    {
        http_response_code($code);
        echo json_encode([
            'success' => false,
            'error' => $message
        ]);
        exit;
    }
}

try {
    $upload = new UploadEncartes();
    $upload->processarUpload();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro interno no servidor'
    ]);
}

ob_end_flush();
