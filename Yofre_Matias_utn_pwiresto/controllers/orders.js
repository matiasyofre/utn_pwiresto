const controller = {};

const Sequelize = require('sequelize');
const { db_host, db_name, db_user, db_password, db_port } = require("../database/db_connection");
const db = new Sequelize(`mysql://${db_user}:${db_password}@${db_host}:${db_port}/${db_name}`);

const jwt = require('jsonwebtoken');
const signature = require('../server/jwt.js');

//Controller para crear pedido
controller.crearPedido = (req, res) => {
    const productsArray = req.body.products; 
    const paymentMethod = req.body.payment_method;
    const idUser = req.locals.idUser; 
    const products = req.locals.products; 

    let description = [];
    let paymentValue = 0;

    products.forEach(product => {
        const reqProduct = productsArray.find(p => p.product_id === product.product_id); 
        product.product_amount = reqProduct.product_amount;
        console.log(reqProduct);
        product.subtotal = product.price * product.product_amount;
        paymentValue += product.subtotal; 
        description.push(`${reqProduct.product_amount}x ${product.name}`);
    });
    
    const replacements = {
        idUser: idUser,
        state: 'nuevo',
        createdAt: new Date(),
        paymentMethod,
        paymentValue,
        description: description.join(' - ')
    };
    db.query(
        `
            INSERT INTO orders (user_id, order_state, order_date, order_description, payment_method, payment_amount)
            VALUES (:idUser, :state, :createdAt, :description, :paymentMethod, :paymentValue)
        `,
        { replacements }
    ).then (rta => {
        const idOrder = rta[0];
        const values = products.map(product => `(${product.product_id}, ${idOrder}, ${product.price}, ${product.product_amount}, ${product.subtotal})`);
        db
            .query(`
                INSERT INTO orders_products (product_id, order_id, product_price, product_amount, total)
                VALUES ${values.join(',')}
            `) 
            .then(() => {
                res.status(201).json({
                    response: {
                        message: 'Order created successfully:',
                        rta
                    }
                });
            })
            .catch(err => {
                res.status(500).json({
                    mensaje: 'Internal Server Error',
                    err: err
                });
            });
    }).catch(err => {
        res.status(500).json({
            mensaje: 'Internal Server Error',
            err: err
        });
    });
}

//Controller para editar estado del pedido
controller.EditarEstadoPedido = (req, res) => {
    const id = req.params.id;
    const newState = req.body.newState;
    const updatedAt = new Date();
    db.query(
        'SELECT * FROM orders WHERE order_id = :id',{
            type: db.QueryTypes.SELECT,
            replacements: {id: id}
        })
        .then(response => {
            
            if(response.length === 0){
                res.status(405).json({message: "The order you're looking for does not exists"})
            }else{
                const idOrder = response[0].order_id;
                db.query(
                    'UPDATE orders SET order_state = :state, updatedAt = :updatedAt WHERE order_id = :id',{
                        replacements:{state: newState, updatedAt: updatedAt, id: idOrder}
                    })
                    .then(response => {
                        res.status(202).json({message: "The order was succesfully Edited"})
                    })
            }
        })
        .catch(err => {
            res.status(500).json({
                mensaje: 'Internal Server Error',
                err: err
            });
        });
}

//Controller para obtener pedido
controller.obtenerPedido = (req, res) => {
    const idOrder = req.params.id;
    const { idUser, isAdmin } = req.locals;
    const conditions = {};
    if (!isAdmin) {
        conditions['u.user_id'] = idUser;
    }
    if (idOrder) {
        conditions['o.order_id'] = idOrder;
    }
    const WHERE = getWhereClause(conditions); 
    db.query(`
            SELECT 
                o.order_id, o.order_state, o.order_date, o.order_description, o.payment_method, o.payment_amount, o.updatedAt,
                u.user_id as user_id, u.username, u.fullname, u.user_address, u.email, u.phoneNumber,
                p.product_id as product_id, p.name, op.product_price, op.product_amount, op.total
            FROM 
                orders o
            INNER JOIN 
                users u ON u.user_id = o.user_id
            INNER JOIN
                orders_products op ON op.order_id = o.order_id
            INNER JOIN 
                products p ON p.product_id = op.product_id
            ${WHERE}
        `, {   
            type: db.QueryTypes.SELECT
        })
        .then(rawResponse => {
            console.log(rawResponse);
            const response = [];
            
            rawResponse.forEach(rawItem => {
                const orderItem = response.find(item => item.order_id === rawItem.order_id);
                if (orderItem) {
                    orderItem.products.push(itemProducto(rawItem))
                } else {
                    response.push(crearItemPedido(rawItem))
                }
            });
            res.status(200).json(
                idOrder ? (response[0] || null) : response
                
            );
            // console.log(response[2]);
        })
        .catch(err => {
            res.status(500).json({
                mensaje: 'Internal Server Error',
                err: err
            });
        });
}

controller.borrarPedido = (req, res) => {
    let id = req.params.id;
    // id = parseInt(id);
    db.query(
        'DELETE FROM orders WHERE order_id = :id',{
            replacements: {id : id}
        }).then(response => {
            if(response.length === 0){
                res.status(404).json({message: "order not found"})
            }else{
                db.query(
                    'DELETE FROM orders_products WHERE order_id = :id',{
                        replacements: {id: id}
                    }).then(() => {
                        res.status(200).json({message: "order succesfully deleted"})
                    })
                    .catch(err => {
                        res.status(500).json({
                            mensaje: 'Internal Server Error',
                            err: err
                        });
                    }); 
            }
        })
        .catch(err => {
            res.status(500).json({
                mensaje: 'Internal Server Error',
                err: err
            });
        });
}

// Funciones Generales
const crearItemPedido = (rawItem) => {
    return {
        order_id: rawItem.order_id,
        state: rawItem.order_state,
        description: rawItem.order_description,
        payment: {
            method : rawItem.payment_method,
            total : rawItem.payment_amount
        },
        user: {
            id: rawItem.user_id,
            username: rawItem.username,
            fullname: rawItem.fullname,
            address: rawItem.user_address,
            email: rawItem.email,
            phoneNumber: rawItem.phoneNumber
        },
        products: [itemProducto(rawItem)],
        createdAt: rawItem.order_date,
        updatedAt: rawItem.updatedAt
    };
};


const itemProducto = (rawItem) => {
    return {
        id: rawItem.product_id,
        name: rawItem.name,
        price: rawItem.price,
        amount: rawItem.product_amount,
        subtotal: rawItem.total
    };
};

const getWhereClause = (conditions) => {
    const keys = Object.keys(conditions);
    if (keys.length) {
        const whereClauses = keys.map(key => {
            return `${key}=${conditions[key]}`;
        });
        return `WHERE ${whereClauses.join(' AND ')}`;
    } else {
        return '';
    }
}


module.exports = controller;