const jwt = require('jsonwebtoken');
const signature = require('../server/jwt.js');

const Sequelize = require('sequelize');
const { db_host, db_name, db_user, db_password, db_port } = require("../database/db_connection");
const db = new Sequelize(`mysql://${db_user}:${db_password}@${db_host}:${db_port}/${db_name}`);

const middlewares = {};

//Middlewares de usuarios

//Middleware para ver si estan todos los campos obligatorios completos
middlewares.chequearCamposVacios = (req, res, next) => {
    const fields = req.body;
    
    if(!fields.username || !fields.fullname || !fields.email || !fields.phoneNumber || !fields.user_address || !fields.password){
        res.status(400).json({
            message: "There are some fields that are empty, remember the fields needed are (username, fullname, email, phoneNumber, user_addres, password)"
        })
    }else{
        next();
    }
}

//Middleware para ver si estan todos los campos oblilgatorios completos del usuario admin
middlewares.chequearCamposVaciosAdmin = (req, res, next) => {
    const fields = req.body;
    
    if(!fields.username || !fields.password){
        res.status(400).json({
            message: "There are some fields that are empty, remember the fields needed are (username, password)"
        })
    }else{
        next();
    }
}

//Middleware para chequear la existencia de un usuario
middlewares.chequearExistenciaUsuario = (req, res, next) => {
    const fields = req.body;
    
    db.query(
        'SELECT * FROM users WHERE username = :username ',
        {
            type: db.QueryTypes.SELECT,
            replacements: {username: fields.username}
        })
        .then(response => {
            if(response.length !== 0){
                res.status(409).json({message: "User already exists"})   
            }else{
                next();
            }
        })
            .catch(err => {
                res.status(500).json({
                    mensaje: 'Internal Server Error',
                    err: err
                });
            });
}

//Middleware para chequear el login
middlewares.loginCheck = (req, res, next) => {
    const {username, password} = req.body;
    db.query(
        'SELECT * FROM users WHERE username = :username AND password = :password ',
        {
            type: db.QueryTypes.SELECT,
            replacements: {username: username,
                            password: password}
        })  
        .then(response => {
            if(response.length == 0){
                res.status(409).json({message: "Invalid username or password"})   
            }else{
                next();
            }
        })
            .catch(err => {
                res.status(500).json({
                    mensaje: 'Internal Server Error',
                    err: err
                });
            });
}

//Middleware para ver el estado de la cuenta
middlewares.estadoCuenta = (req, res, next) => {
    const input = req.body;
    db.query(
        'SELECT is_active FROM users WHERE username = :username',{
            type: db.QueryTypes.SELECT,
            replacements: {username: input.username}
        })
        .then(response => {
            const data = response[0];
            console.log(data);
            if(data.is_active == 1){
                next();
            }else{
                res.status(409).json({message: "The account is disabled"});
            }
        })
        .catch(err => {
            res.status(500).json({
                mensaje: 'Internal Server Error',
                err: err
            });
    });
}

//Middleware para validar si existe el usuario
middlewares.chequearUsuarioExiste = (req, res, next) => {

    const username = req.params.username;
    console.log("Si existe" + username);

    db.query(
        'SELECT * FROM users WHERE username = :username',{
            type: db.QueryTypes.SELECT,
            replacements: {
                username: username
            }
        })
        .then(response => {
            if(response.length !== 0){
                next();

            }
            else{
                res.status(404).json({
                    message: "The user you're looking for doesn't exist" 
                })
            }
        })
}

//Middlewares generales

//Middleware para validar si el usuario es admin
middlewares.isAdmin = (req, res, next) => {
    const headerExists = req.headers.authorization;
    if(headerExists){
        const token = req.headers.authorization.split(" ")[0];
    
        if(token == ""){
            res.status(402).json({message: "You need to be logged to access"})
        }else{
                const verification = jwt.verify(token, signature);
                if(verification.is_admin == 0){
                    res.status(401).json({message: "Unauthorized - You dont have permission for this action"})
                }else{
                    req.locals = {
                        ...req.locals,
                        idUser: verification.user_id,
                        isAdmin: verification.is_admin
                    }
                    next();
                }        
        }
        }else{
        res.status(404).json({message:"Unauthorized, please add the field authorization with your token in the header"})
    }
}

//Middleware para validar token
middlewares.validaToken = (req, res, next) => {
    const headerExists = req.headers.authorization;
    if(headerExists){
        const token = req.headers.authorization.split(" ")[0];
    
            const verification = jwt.verify(token, signature);
            db.query(
                'SELECT * FROM users WHERE user_id = :id',{
                    type: db.QueryTypes.SELECT,
                    replacements:{id: verification.user_id}
                })
                .then(response =>{
                    if(response.length == 0){
                        res.status(404).json({message: "user not found"})
                    }else{
                        req.locals = {
                            ...req.locals,
                            idUser: verification.user_id,
                            isAdmin: verification.is_admin
                        }
                        next();
                    }
                })    
    }else{
        res.status(402).json({message:"You need to be logged to access"})
    }
}


//Middlewares de productos

//Middleware para validar info del producto
middlewares.validarInfoProducto = (req, res, next) => {
    const newProduct = req.body;

    db.query(
        'SELECT name FROM products WHERE name=:name',{
            type: db.QueryTypes.SELECT,
            replacements : {
                name: newProduct.name
            }
        })
        .then(response => {
            if(response.length !== 0){
                res.status(409).json({
                    message: 'The product ' + newProduct.name + ' Already exists'
                })
            }
            else{
                next();
            }
        })
}

//Middleware para ver si el producto existe
middlewares.chequearProductoExiste = (req, res, next) => {
    const product = req.params.id;


    db.query(
        'SELECT * FROM products WHERE product_id = :id',{
            type: db.QueryTypes.SELECT,
            replacements: {
                id: product
            }
        })
        .then(response => {
            if(response.length == 0){
                res.status(409).json({
                    message: "The product you're looking for doesn't exist" 
                })
            }
            else{
                next();
            }
        })
}

//Middleware para ver si estan todos los campos obligatorios completos
middlewares.chequearCamposVaciosProductos = (req, res, next) => {
    const fields = req.body;
    console.log(fields);
    if(!fields.name || !fields.price || !fields.description || !fields.img_url || !fields.is_active){
        res.status(400).json({
            message: "There are some fields that are empty, remember the fields needed are (name, price, description, img_url, is_active)"
        })
    }else{
        next();
    }
}

//Middleware para validar token
middlewares.validarToken = (req, res, next) => {
    let headerExists = req.headers.authorization;
    //console.log("-" + headerExists);
    if(headerExists){
        const token = req.headers.authorization.split(" ")[0];
    
        if(token == ""){
            res.status(402).json({message: "You need to be logged to access"})
        }else{
            const verification = jwt.verify(token, signature);
            db.query(
                'SELECT * FROM users WHERE user_id = :id',{
                    type: db.QueryTypes.SELECT,
                    replacements:{id: verification.user_id}
                })
                .then(response =>{
                    if(response.length == 0){
                        res.status(404).json({message: "user not found"})
                    }else{
                        next();
                    }
                })
        }
    }else{
        res.status(403).json({message:"Unauthorized, please add the field authorization with your token in the header"})

    }
}

//Middlewares de pedidos

//Middleware para verificar si el id de producto existe en el pedido
middlewares.idProductoexiste = (req, res, next) => {
    const productsArray = req.body.products;
    const productsIds = productsArray.map(product => product.product_id);
        console.log(productsIds);

    const productsWhere = `WHERE ${productsIds.map(productId => `product_id=${productId}`).join(' OR ')}`;
    db.query(`SELECT * FROM products ${productsWhere}`, {
            type: db.QueryTypes.SELECT
        })
        .then(products => {
            if (products.length !== productsArray.length) {
                res.status(404).json({
                    response: {
                        message: 'One or more products not found',
                    }
                });
            } else {
                req.locals = {
                    ...req.locals,
                    products
                }
                next();
            }
        })
        .catch(err => res.status(500).json(err))
}

//Middleware para verificar si el producto existe
middlewares.existePedido = (req, res, next) => {
    const order = req.params.id;

    db.query(
        'SELECT * FROM orders WHERE order_id = :id',{
            type: db.QueryTypes.SELECT,
            replacements: {
                id: order
            }
        })
        .then(response => {
            if(response.length == 0){
                res.status(409).json({
                    message: "The order you're looking for doesn't exist" 
                })
            }
            else{
                next();
            }
        })
}


//Funcion para crear Token

function crearToken(input){
    return jwt.sign(input, signature);
}
module.exports = middlewares;