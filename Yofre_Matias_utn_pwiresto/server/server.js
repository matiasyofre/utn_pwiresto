//Express
const express = require('express');
const server = express ();

//Body Parser
const bodyParser = require('body-parser');

// Database
const Sequelize = require('sequelize');
const { db_host, db_name, db_user, db_password, db_port } = require("../database/db_connection");
const db = new Sequelize(`mysql://${db_user}:${db_password}@${db_host}:${db_port}/${db_name}`);

//Conexion con archivos de rutas
const products = require('../routes/products.js');
const users = require('../routes/users');
const orders = require('../routes/orders');

//Inicializar servidor
server.listen(3000, () => {
    const date = new Date();
    console.log("Server initialized " + date);
})
//Middlewares
server.use(bodyParser.json());

//Routes Handler
server.use('/products', products);
server.use('/users', users);
server.use('/orders', orders);


