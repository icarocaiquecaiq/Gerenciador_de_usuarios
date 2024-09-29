
    CREATE TABLE users(
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(300) NOT NULL,
        senha VARCHAR(20) NOT NULL,
        isAtivo BOOLEAN DEFAULT TRUE,
        papel varchar(200) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT PapelOptionsCheck CHECK(papel in ('administrador', 'desenvolvedor', 'gerente', 'usuario'))
    );




    INSERT INTO users(name, email, senha, isAtivo, papel) VALUES('Ícaro', 'icaro@gmail.teste.com', '123Mudar', false, 'administrador');
    INSERT INTO users(name, email, senha, isAtivo, papel) VALUES('Leticia', 'leticia@gmail.teste.com', '123Change', true, 'desenvolvedor');
