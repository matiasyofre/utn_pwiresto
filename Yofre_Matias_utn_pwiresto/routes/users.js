const express = require('express');
const router = express.Router();

const Sequelize = require('sequelize');
const { db_host, db_name, db_user, db_password, db_port } = require("../database/db_connection");
const db = new Sequelize(`mysql://${db_user}:${db_password}@${db_host}:${db_port}/${db_name}`);

const controller = require('../controllers/users');
const middlewares = require('../middlewares/middlewares');


//Solo usuario admin puede ver los usuarios creados
router.get('/', middlewares.validarToken, controller.mostrarUsuarios);

//Login
router.post('/login', middlewares.loginCheck, middlewares.estadoCuenta, controller.login);

//Crear cuenta
router.post('/', middlewares.chequearExistenciaUsuario, middlewares.chequearCamposVacios, controller.crearCuenta);

//Crear cuenta admin
router.post('/admin', middlewares.isAdmin, middlewares.chequearExistenciaUsuario, middlewares.chequearCamposVaciosAdmin, controller.crearAdmin);


module.exports = router;