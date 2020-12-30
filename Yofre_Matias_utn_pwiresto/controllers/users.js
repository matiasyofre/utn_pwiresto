const controller = {};

const Sequelize = require('sequelize');
const { db_host, db_name, db_user, db_password, db_port } = require("../database/db_connection");
const db = new Sequelize(`mysql://${db_user}:${db_password}@${db_host}:${db_port}/${db_name}`);

const jwt = require('jsonwebtoken');
const signature = require('../server/jwt.js');

//Controller para crear usuario
controller.crearCuenta = (req, res) => {
    const nuevoUsuario = req.body;
    db.query(
        `INSERT INTO users (
            username,
            fullname,
            email,
            phoneNumber,
            user_address,
            password
        )
        VALUE (
            :username,
            :fullname,
            :email,
            :phoneNumber,
            :user_address,
            :password
        )`,
        {
            replacements: nuevoUsuario
        }
    ).then(() => {
        res.status(201).json({
            mensaje: 'The User: ' + nuevoUsuario.username + ' was succesfully created'
        });
    })
    .catch(err => {
        res.status(500).json({
            mensaje: 'Internal Server Error',
            err: err
        });
    });
}

//Controller para crear un usuario admin
controller.crearAdmin = (req, res) => {
    const nuevoUsuario = req.body;
    db.query(
        `INSERT INTO users (
            username,
            password,
            is_admin
        )
        VALUE (
            :username,
            :password,
            1
        )`,
        {
            replacements: nuevoUsuario
        }
    ).then(() => {
        res.status(201).json({
            mensaje: 'The admin: ' + nuevoUsuario.username + ' was succesfully added to the database'
        });
    })
    .catch(err => {
        res.status(500).json({
            mensaje: 'Internal Server Error',
            err: err
        });
    });
}

//Controller para mostrar usuarios
controller.mostrarUsuarios = (req, res) => {
    const token = req.headers.authorization.split(" ")[0];
    let verification = jwt.verify(token, signature);


    console.log("User" + verification.is_admin);
    if(verification.is_admin === 1){
        db.query(
            'SELECT * FROM users',{
                type: db.QueryTypes.SELECT
            })
        .then(response => {
            res.status(200).json(response);
        })
        .catch(err => {
            res.status(500).json({
                mensaje: 'Internal Server Error',
                err: err
            });
        });
    }else{
        db.query(
            'SELECT username, fullname, phoneNumber, user_address, email, password FROM users WHERE user_id = :id',{
                type: db.QueryTypes.SELECT,
                replacements:{id: verification.user_id}
            })
            .then(response => {
                res.status(200).json(response);
            })
            .catch(err => {
                res.status(500).json({
                    mensaje: 'Internal Server Error',
                    err: err
                });
            });
    }
    

}

//Controller para mostrar usuarios por nombre
controller.mostrarUsuariosPorNombre = (req, res) => {
    const username = req.params.id;

    db.query(
        `SELECT * FROM users WHERE username = username`, {
            type: db.QueryTypes.SELECT,
            
                replacements: {username: username}
        })
        .then(response => {
            res.status(200).json(response);
        })
        .catch(err => {
            res.status(500).json({
                mensaje: 'Internal Server Error',
                err: err
        });
    });
}

//Controller para logueo
controller.login = (req, res) => {
    const input = req.body;
    db.query(
        'SELECT * FROM users WHERE username = :username',{
            type: db.QueryTypes.SELECT,
            replacements: {username: input.username}
        })
        .then(response =>{
            const data = response[0];
            const token = crearToken({
                username: data.username,
                user_id: data.user_id,
                is_admin: data.is_admin,
                is_active: data.is_active
            });
            res.status(200).json(token);
        })
        .catch(err => {
            res.status(500).json({
                mensaje: 'Internal Server Error',
                err: err
            });
        });
}

//Funcion para crear token
function crearToken(info){
    return jwt.sign(info, signature);
}


module.exports = controller;