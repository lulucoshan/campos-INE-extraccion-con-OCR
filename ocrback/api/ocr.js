//maneja las rutas de ocr desde el socket python hasta el back end y maneja la api de google maps para los mapas en el admin panel
const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('Form-data');

const upload = multer(); //usamos multer para subir la imagen a nuestro backend y de aqui enviarlo a las funciones de nuestro socket python

//funcion para enviar imagen al socket python
router.post('/ocr', upload.single('imagen'), async (req, res) => {
    try{
        const form = new FormData();
        //parametros de procesado multer
        form.append('imagen', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        });
        //generar respuesta en formato json
        const response = await axios.post('http://localhost:5001/ocr', form, {
            headers: form.getHeaders(),
        });

        res.json(response.data);
    } catch (error) {
        //eror a la consola
        console.error('error al llamar al microservicio ocr:', error);
        res.status(500).json({error: 'error al procesar la imagen ocr'});
    }
});
//proceso similar al anterior pero con la ruta de el socket para el reverso
router.post('/ocrreverso', upload.single('imagen'), async (req, res) => {
    try {
        const form = new FormData();
        form.append('imagen', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype
        });

        // Enviar al endpoint de reverso en Python
        const response = await axios.post('http://localhost:5001/ocrreverso', form, {
            headers: {
                ...form.getHeaders(),
                'Content-Length': form.getLengthSync()
            }
        });
        
        res.json(response.data);
    } catch (error) {
        console.error('Error al procesar el reverso:', error);
        res.status(500).json({error: 'Error al procesar el reverso de la INE'});
    }
});
//config para adquirir nuestro token
require('dotenv').config();

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY; //ver dotenv para acceder al token

router.get('/geocoding', async (req, res) => {
    const { address } = req.query;

    if (!address) {
        return res.status(400).json({ error: 'La dirección es requerida' });
    }

    try {
        const response = await axios.get(
            'https://maps.googleapis.com/maps/api/geocode/json',
            {
                params: {
                    address,
                    key: GOOGLE_API_KEY
                }
            }
        );

        const { results } = response.data;

        if (results.length === 0) {
            return res.status(404).json({ error: 'Dirección no encontrada' });
        }

        const location = results[0].geometry.location;
        res.json({ lat: location.lat, lon: location.lng });
    } catch (error) {
        console.error('Error al obtener coordenadas:', error.message);
        res.status(500).json({ error: 'Error en el servidor de geocoding' });
    }
});

module.exports = router;