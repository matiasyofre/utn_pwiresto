* utn_pwiresto
Proyecto inicial solo de backend para la diplomatura de Programación Web de la UTN de Buenos Aires

* Documentacion
Importar en el archivo 'openapi.yaml' en [Swagger](https://editor.swagger.io)
Alli se encontrara la documentacion sobre el uso de la API

* Instalacion

- Clonar proyecto

- Clonar el reporsitorio desde [este link](https://github.com/matiasyofre/utn_pwiresto)

* Instalar dependecias

```
npm init
npm install
npm i express
npm install --save sequelize
npm i body-parser
npm i router
```

* Cargar Base de datos

- Abrir XAMPP e inicializar el servidor MySQL (asegurarse que el puerto de MySQL sea el 3306)
- Ingresar ingresar al administrador de sesiones HeidiSQL
- Ir a la opcion archivo, cargar archivo SQL y ejecutar la siguiente query (database/queries.sql)
- El usuario es 'root' y no hay contraseña, de ser necesario se puede editar en (database/db_connection.js)

* Iniciar el servidor

Abrir el archivo (server/server.js) desde node

`node server.js`

* Abrir Postman e importar el utn_pwiresto.postman_collection.json

Ejecutar los distintos endpoints para probar la API.
