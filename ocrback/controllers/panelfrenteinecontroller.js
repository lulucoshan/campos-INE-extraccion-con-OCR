//recuperacion de todos los datos en un datatable en componente /scr/panelfrente.js
const connectDB = require('../models/db');

//recupera todos los datos del frente para ser visualizados en un datatable
const obtenerRegistrosINE = (req, res) => {
  const query = 'SELECT * FROM ine_anverso';

  connectDB.query(query, (err, results) => {
    if (err) {
      console.error('Error en DB:', err);
      return res.status(500).json({ error: 'Error al obtener datos' });
    }

    res.json(results);
  });
};

module.exports = {
  obtenerRegistrosINE,
};