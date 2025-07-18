const connectDB = require('../models/db');
const jwt = require('jsonwebtoken'); //jsonwebtoken para asegurar las sesiones de los usuarios con un token unico

//logica para iniciar sesion
module.exports.login = (req, res) => {
    const {correo_electronico, contrasenia} = req.body;
    
    //query con parametros para verificar que el login es correcto
    //no remover los simbolos de interrogacion ni pasar datos directamente
    const consult = 'SELECT * FROM usuarios WHERE correo_electronico = ? AND contrasenia = ?';
    
    try{
        connectDB.query(consult, [correo_electronico, contrasenia], (err, result) =>{
            if(err){
                res.send(err);
                return;
            }
            //comprobacion de usuario
            if(result.length > 0){
                const token = jwt.sign({correo_electronico}, "stack", {
                    expiresIn: '10m' //tiempo de expiracion del jwt ajustar como se desee
                });
                res.send({token});
            } else {
                console.log('wrong user');
                res.send({message: 'wrong user'});
            }
        })
    } catch (e) {
        console.error(error, e); //log error
    }
}