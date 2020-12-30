const controller = {};

const Sequelize = require('sequelize');
const { db_host, db_name, db_user, db_password, db_port } = require("../database/db_connection");
const db = new Sequelize(`mysql://${db_user}:${db_password}@${db_host}:${db_port}/${db_name}`);

//Controller para agregar un producto
controller.agregarProducto = (req, res) => {
    const newProduct = req.body;
    db.query(
        `INSERT INTO products(
            name,
            price,
            description,
            img_url
        )
        VALUE(
            :name,
            :price,
            :description,
            :img_url
        )`,{
            replacements: newProduct
        })
        .then(() => {
            res.status(200).json("The product (" + newProduct.name + ") has been added to the menu");
        })
        .catch(err =>{
            res.json({
                mensaje:"Internal Server Error",
                err: err
        });
    })
}

//Controller para editar un producto
controller.editarProducto = (req, res) => {
    const id = req.params.id;
    const newValues = req.body;

    console.log("-" + newValues.is_active);

    db.query(
        `SELECT * FROM products WHERE product_id = :id`, {
            type: db.QueryTypes.SELECT,
            
                replacements: {id: id}
        })
        .then(response => {
            if(response.length !== 0) {
                db.query(`UPDATE products
                    SET name = :name, price = :price, description = :description, img_url = :img_url, is_active = :is_active
                    WHERE product_id = :id`,{
                    replacements: {
                        name: newValues.name,
                        price: newValues.price,
                        description: newValues.description,
                        img_url: newValues.img_url,
                        is_active: newValues.is_active,
                        id: id
                    }
                })
                .then(response => {
                    res.status(200).json({
                        message: "The product (" + newValues.name + ") was succefully edited"
                    })
                })
            }else {
                res.status(404).json({
                    mensaje: 'product not found'
                })
            }
        })
        .catch(err =>{
            res.json({
                mensaje:"Internal Server error",
                err: err
        });
    })
}

//Controller para desahabilitar un producto
controller.deshabilitarProducto = (req, res) => {
    const product = req.params.id;

    db.query(
        'UPDATE products SET is_active = false WHERE product_id = :id',{
            replacements: {id : product}
        })
        .then(response => {
            res.status(202).json({
                message: "the product has been disabled"
        })
    })  
}

//Controller para mostrar todos los productos
controller.mostrarProductosDisponibles = (req, res) => {
    db.query(
        'SELECT name, price, description, img_url FROM products WHERE is_active = TRUE',{
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
}

//Controller para mostrar los productos disponibles
controller.mostrarTodosLosProductos = (req, res) => {
    db.query(
        'SELECT * FROM products',{
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
}

//Controller para mostrar los productos por ID
controller.mostrarProductosPorId = (req, res) => {
    const id = req.params.id;

    db.query(
        `SELECT * FROM products WHERE product_id = :id AND is_active = TRUE`, {
            type: db.QueryTypes.SELECT,
            
                replacements: {id: id}
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

module.exports = controller;
