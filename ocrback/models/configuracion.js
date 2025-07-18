//nota todas las variables de entorno estan en el archivo .env por seguridad para ajustar 
//la conexion a la base de datos modificar archivo .env
const config = {
    host: process.env.HOST, //host
    user: process.env.USER, // usuario
    password: process.env.PASSWORD, //password
    database: process.env.DATABASE, //base de datos
};

module.exports = config;