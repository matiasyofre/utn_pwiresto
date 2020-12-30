const express = require('express');
const router = express.Router();

const Sequelize = require('sequelize');
const { db_host, db_name, db_user, db_password, db_port } = require("../database/db_connection");
const db = new Sequelize(`mysql://${db_user}:${db_password}@${db_host}:${db_port}/${db_name}`);

const controller = require('../controllers/orders');
const middlewares = require('../middlewares/middlewares');

router.get('/', middlewares.validaToken , controller.obtenerPedido);

router.get('/:id', middlewares.isAdmin , controller.obtenerPedido);

router.post('/', middlewares.validaToken, middlewares.idProductoexiste, controller.crearPedido);

router.put('/:id', middlewares.isAdmin, controller.EditarEstadoPedido);

router.delete('/:id' , middlewares.isAdmin, middlewares.existePedido, controller.borrarPedido);

module.exports = router;