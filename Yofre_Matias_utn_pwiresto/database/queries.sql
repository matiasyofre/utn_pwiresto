DROP DATABASE IF EXISTS db_utn_pwiresto;
CREATE DATABASE db_utn_pwiresto;
USE db_utn_pwiresto;

DROP TABLE IF EXISTS users;
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(70) NOT NULL,
    fullname VARCHAR (120) NOT NULL,
    email VARCHAR (120) NOT NULL,
    phoneNumber INT(20) NOT NULL,
    user_address VARCHAR(255) NOT NULL,
    password VARCHAR(70) NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

DROP TABLE IF EXISTS products;
CREATE TABLE products (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(70) NOT NULL,
    price FLOAT NOT NULL,
    description VARCHAR (255) NOT NULL,
    img_url VARCHAR (255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    order_state VARCHAR (50) NOT NULL,
    order_date DATETIME NOT NULL,
    order_description VARCHAR(255) NOT NULL,
    payment_method VARCHAR (70) NOT NULL,
    payment_amount FLOAT NOT NULL,
    updatedAt DATETIME,
    user_id INT NOT NULL
);

DROP TABLE IF EXISTS orders_products;
CREATE TABLE orders_products (
    order_product_id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    product_id INT NOT NULL,
    order_id INT NOT NULL,
    product_price INT NOT NULL,
    product_amount INT NOT NULL,
    total INT NOT NULL
);


INSERT INTO users
(user_id, username, fullname, email, phoneNumber, user_address, password, is_admin)
VALUE
(
    1,
    "Matiyofre",
    "Yofre Matias",
    "matiasyofre@gmail.com",
    1234567,
    "Calle Falsa 123",
    "123456",
    TRUE
),
(
    2,
    "Leomessi",
    "Messi Lionel",
    "messi@gmail.com",
    9876541,
    "Calle falsa 987",
    "Mateo",
    FALSE
);
INSERT INTO products (name, price, description, img_url)
VALUES
    ('Bagel de salmon', 425, 'Sandwinch de Salmon Rosado', 'https://placeralplato.com/files/2016/09/Sandwich-de-salmon-e1473086689659.jpg'),
    ('Ensalada Veggie', 340, 'Ensalada de vegetales varios', 'https://d26lpennugtm8s.cloudfront.net/stores/001/166/947/products/ensalada-veggie1-0817ecee8a992f4a5115953663145389-640-0.jpg'),
    ('Sandwich Veggie', 310, 'Sandwich de vegetales varios', 'https://www.danzadefogones.com/wp-content/fotos/Veggie-sandwich/Veggie-sandwich-3.jpg'),
    ('Hambuerguesa Clasica', 350, 'Hamburguesa Clasica con tomate, lechuga y queso', 'https://sifu.unileversolutions.com/image/es-MX/recipe-topvisual/2/1260-709/hamburguesa-clasica-50425188.jpg');



INSERT INTO orders (order_state, order_date, order_description, payment_method, payment_amount , user_id)
VALUES(
    "delivered",
    NOW(),
    "2x Bagel de salmon - 4x Hambuerguesa Clasica",
    "cash",
    2250,
    2
);

