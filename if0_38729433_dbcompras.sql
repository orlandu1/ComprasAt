-- phpMyAdmin SQL Dump
-- version 4.9.0.1
-- https://www.phpmyadmin.net/
--
-- Host: sql313.infinityfree.com
-- Tempo de geração: 07/05/2025 às 17:47
-- Versão do servidor: 10.6.19-MariaDB
-- Versão do PHP: 7.2.22

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `if0_38729433_dbcompras`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `annotations`
--

CREATE TABLE `annotations` (
  `id` bigint(20) NOT NULL,
  `pdf_id` varchar(50) NOT NULL,
  `user_name` varchar(100) NOT NULL,
  `type` enum('CERTO','ERRADO','COMENTAR') NOT NULL,
  `position_x` float NOT NULL,
  `position_y` float NOT NULL,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `hashpdf`
--

CREATE TABLE `hashpdf` (
  `id` int(11) NOT NULL,
  `praca` varchar(40) NOT NULL,
  `hash` varchar(100) NOT NULL,
  `user` varchar(20) DEFAULT NULL,
  `data_upload` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Despejando dados para a tabela `hashpdf`
--

INSERT INTO `hashpdf` (`id`, `praca`, `hash`, `user`, `data_upload`) VALUES
(1, 'df', '77dcbefe84ca11d418f6926594fc195c', 'orland360207', '2025-04-23 08:53:31');

-- --------------------------------------------------------

--
-- Estrutura para tabela `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `loginUsuario` varchar(50) NOT NULL,
  `nomeUsuario` varchar(100) NOT NULL,
  `senhaUsuario` varchar(255) NOT NULL,
  `emailUsuario` varchar(100) DEFAULT NULL,
  `matriculaUsuario` varchar(20) DEFAULT NULL,
  `fotoUsuario` varchar(255) DEFAULT NULL,
  `hierarquia` int(11) DEFAULT 1,
  `bloqueioUsuario` tinyint(1) DEFAULT 0,
  `dataCadastro` timestamp NOT NULL DEFAULT current_timestamp(),
  `ultimoAcesso` timestamp NULL DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Despejando dados para a tabela `usuarios`
--

INSERT INTO `usuarios` (`id`, `loginUsuario`, `nomeUsuario`, `senhaUsuario`, `emailUsuario`, `matriculaUsuario`, `fotoUsuario`, `hierarquia`, `bloqueioUsuario`, `dataCadastro`, `ultimoAcesso`) VALUES
(1, 'orland360207', 'ORLANDO ALVES MARTINS', '$2y$10$4OjC9GdohhUe28BqPNf9iOe9VwCNrGEZXf4JMzIUKylOqLBHIadqm', NULL, '360207', '../uploads/fotos/orland360207.png', 9, 0, '2025-04-16 07:13:37', '2025-04-24 01:53:57'),
(2, 'marcos359280', 'MARCOS RIBEIRO DA SILVA', '$2y$10$5YS0gPqGKTH80W7VevrxjeFUYo7atLXJBCRFr8VE3nt.2pOZvn4hC', NULL, '360207', '../uploads/fotos/marcos359280.png', 9, 0, '2025-04-16 07:13:49', '2025-04-24 06:37:03');

--
-- Índices de tabelas apagadas
--

--
-- Índices de tabela `annotations`
--
ALTER TABLE `annotations`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `hashpdf`
--
ALTER TABLE `hashpdf`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `hash` (`hash`);

--
-- Índices de tabela `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `loginUsuario` (`loginUsuario`),
  ADD KEY `emailUsuario_2` (`emailUsuario`),
  ADD KEY `emailUsuario_3` (`emailUsuario`);

--
-- AUTO_INCREMENT de tabelas apagadas
--

--
-- AUTO_INCREMENT de tabela `hashpdf`
--
ALTER TABLE `hashpdf`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de tabela `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
