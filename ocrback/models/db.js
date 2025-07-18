//crea una conexion a nuestro mysql
const mysql = require("mysql2");
const config = require("./configuracion");

//conexion a nuestra db con el archivo de configuracion y las variables de entorno
//nota modificar para cuado se requiera un pool
const connectDB = mysql.createConnection(config);


module.exports = connectDB;