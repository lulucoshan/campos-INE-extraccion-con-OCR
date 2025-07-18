//llamadas a controladores logicos
const express = require('express');
const router = express.Router();
const {login} = require('../controllers/loginController');
const { registrarINE } = require('../controllers/ine.frente.controller');
const {obtenerRegistrosINE} =require('../controllers/panelfrenteinecontroller');
const { geoCodingRoutes } = require('../controllers/geocode');


//endpoint para login archivo relacionado en /controllers/pingControler
router.post('/login', login)

//endpoint para registrar INE a la db controador en /controllers/ine.frente.controller
router.post('/api/ine', registrarINE)

//endpoint para obtener los registros de el frente en nuestro panel administrativo /controllers/panelfrenteinecontroller
router.get('/api/panel-admin', obtenerRegistrosINE );


module.exports = router;