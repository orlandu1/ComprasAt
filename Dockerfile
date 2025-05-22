# Dockerfile
FROM php:8.2-apache

# Instala extensões necessárias
RUN docker-php-ext-install pdo pdo_mysql mysqli

# Instala o bash
RUN apt-get update && apt-get install -y bash && rm -rf /var/lib/apt/lists/*

# Configura o limite de upload para 20M
RUN echo "upload_max_filesize=50M\npost_max_size=50M" > /usr/local/etc/php/conf.d/uploads.ini

# Permite arquivos .htaccess e reescrita
RUN a2enmod rewrite
