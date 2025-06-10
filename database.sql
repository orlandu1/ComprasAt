-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS `orlando` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE `orlando`;

-- Tabela: annotations
CREATE TABLE `annotations` (
    `id` BIGINT(20) NOT NULL AUTO_INCREMENT,
    `pdf_id` VARCHAR(100) NOT NULL,
    `campanha_id` VARCHAR(100) NOT NULL,
    `user_name` VARCHAR(100) NOT NULL,
    `type` ENUM('CERTO', 'ERRADO', 'COMENTAR') NOT NULL,
    `position_x` FLOAT NOT NULL,
    `position_y` FLOAT NOT NULL,
    `comment` TEXT,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;


-- Tabela: hashpdf
CREATE TABLE `hashpdf` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `praca` VARCHAR(40) NOT NULL,
    `campanha_id` VARCHAR(100) NOT NULL,
    `pdf_id` VARCHAR(100) NOT NULL UNIQUE,
    `objectPng` TEXT,
    `itens` INT(11) DEFAULT 0,
    `user` VARCHAR(20),
    `data_upload` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- Tabela: usuarios
CREATE TABLE `usuarios` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `loginUsuario` VARCHAR(50) NOT NULL UNIQUE,
    `nomeUsuario` VARCHAR(100) NOT NULL,
    `senhaUsuario` VARCHAR(255) NOT NULL,
    `emailUsuario` VARCHAR(100),
    `matriculaUsuario` VARCHAR(20),
    `fotoUsuario` VARCHAR(255),
    `hierarquia` INT(11) DEFAULT 1,
    `bloqueioUsuario` TINYINT(1) DEFAULT 0,
    `dataCadastro` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `ultimoAcesso` TIMESTAMP NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `emailUsuario_idx` (`emailUsuario`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

INSERT INTO
    `usuarios` (
        `id`,
        `loginUsuario`,
        `nomeUsuario`,
        `senhaUsuario`,
        `emailUsuario`,
        `matriculaUsuario`,
        `fotoUsuario`,
        `hierarquia`,
        `bloqueioUsuario`,
        `dataCadastro`,
        `ultimoAcesso`
    )
VALUES (
        1,
        'orland360207',
        'ORLANDO ALVES MARTINS',
        '$2y$10$4OjC9GdohhUe28BqPNf9iOe9VwCNrGEZXf4JMzIUKylOqLBHIadqm',
        NULL,
        '360207',
        '../uploads/fotos/orland360207.png',
        9,
        0,
        '2025-04-16 07:13:37',
        '2025-04-24 01:53:57'
    ),
    (
        2,
        'marcos359280',
        'MARCOS RIBEIRO DA SILVA',
        '$2y$10$5YS0gPqGKTH80W7VevrxjeFUYo7atLXJBCRFr8VE3nt.2pOZvn4hC',
        NULL,
        '359280',
        '../uploads/fotos/marcos359280.png',
        9,
        0,
        '2025-04-16 07:13:49',
        '2025-04-24 06:37:03'
    );

-- Tabela: Campanhas
CREATE TABLE `campanhas` (
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(100) NOT NULL,
    `campanha_id` VARCHAR(100) NOT NULL,
    `periodo1` DATE,
    `periodo2` DATE,
    `progresso` INT(10) DEFAULT 0,
    `dataCadastro` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;


