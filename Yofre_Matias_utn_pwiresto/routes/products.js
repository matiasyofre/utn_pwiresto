const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const signature = require('../server/jwt.js');

const Sequelize = require('sequelize');
const { db_host, db_name, db_user, db_password, db_port } = require("../database/db_connection");
const db = new Sequelize(`mysql://${db_user}:${db_password}@${db_host}:${db_port}/${db_name}`);

const controller = require('../controllers/products');
const middlewares = require('../middlewares/middlewares');

//ROUTES

//Obtener productos disponibles
router.get('/', middlewares.validarToken, controller.mostrarProductosDisponibles);

//Obtener todos los productos(solo admin)
router.get('/allProducts',middlewares.isAdmin, controller.mostrarTodosLosProductos);

//Obtener producto por ID
router.get('/:id',middlewares.validarToken, controller.mostrarProductosPorId);

//Agregar un producto
router.post('/', middlewares.isAdmin, middlewares.chequearCamposVaciosProductos, middlewares.validarInfoProducto, controller.agregarProducto);

//Editar un producto existente
router.put('/:id', middlewares.isAdmin, middlewares.chequearProductoExiste, middlewares.chequearCamposVaciosProductos, controller.editarProducto);

//Deshabilitar un producto
router.delete('/:id', middlewares.isAdmin, middlewares.chequearProductoExiste, controller.deshabilitarProducto);


module.exports = router;