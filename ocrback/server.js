const express = require("express");// framework de nuestro backend
const dotenv = require("dotenv");// dot env para tener nuestros archivos con logins sensibles de la db en un .env
dotenv.config(); //inicializacion de dot env
const cors = require("cors"); //soporte de peticiones de origen cruzado
const connectDB = require("./models/db"); //conexion vestigial a la db remover despues
const port = process.env.PORT //puerto de escucha especificado en nuestro .env
const routes = require('./api/endpoints') //router default
const OcrRoute = require('./api/ocr')   //ruta para hacer ocr

const app = express();

app.use(express.json()); //parsear datos a formato json en su llegada a nuestro backend
app.use(express.urlencoded({extended: false}));

app.use(cors()); //especificar uso de cors
app.use('/api', OcrRoute) //ruta hacia la api ocr lado node js

app.use('/', routes);

//aplicacion escuchando en el puerto especificacido en .env
app.listen(port, '0.0.0.0', () =>{
    console.log(`server running on port: ${port}`)
});