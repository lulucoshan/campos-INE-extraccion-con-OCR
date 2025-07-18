const connectDB = require('../models/db');

//funcion para insertar el anverso de la ine
function insertarAnverso(data, callback) {
  const {
    apellido_paterno, apellido_materno, nombre_reverso,
    calle, numero, colonia, codigo_postal, estado, pais,
    sexo, clave_elector, curp, fecha_nacimiento,
    anio_registro, seccion, vigencia
  } = data;

  const nombre_ine = `${apellido_paterno} ${apellido_materno} ${nombre_reverso}`.trim(); //concadenacion de el nombre
  const domicilio = [ //concatenacion de domicilio para la base de datos
    calle,
    numero,
    colonia,
    codigo_postal,
    estado,
    pais
  ].filter(Boolean).join(', ');
//query parametrizada para el anverso
  const insertAnverso = `
    INSERT INTO ine_anverso 
    (nombre_ine, sexo, domicilio, cve_elector, curp, fecha_de_nacimiento, anio_registro, seccion, vigencia)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
//array de datos para el anverso
  const anversoData = [nombre_ine, sexo, domicilio, clave_elector, curp, fecha_nacimiento, anio_registro, seccion, vigencia];

  connectDB.query(insertAnverso, anversoData, (err, result) => {
    if (err) return callback(err);

    // Obtener el UUID recién insertado
    connectDB.query('SELECT cve_registro_ine_anverso FROM ine_anverso ORDER BY hora_de_modificacion DESC LIMIT 1', (err2, rows) => {
      if (err2) return callback(err2);
      if (rows.length === 0) return callback(new Error('No se encontró el anverso insertado'));
      callback(null, rows[0].cve_registro_ine_anverso);
    });
  });
}

//funcion para insertar las dos lineas de reverso
function insertarReverso({ linea1, linea2 }, callback) {
  //query parametrizada para el reverso
  const query = `
    INSERT INTO ine_reverso (ocr_linea1, ocr_linea2)
    VALUES (?, ?)
  `;
  const data = [linea1 || '', linea2 || ''];

  connectDB.query(query, data, (err, result) => {
    if (err) return callback(err);
    //obtener uuid de el reverso para insertar en credencial
    connectDB.query('SELECT cve_registro_ine_reverso FROM ine_reverso ORDER BY hora_de_modificacion DESC LIMIT 1', (err2, rows) => {
      if (err2) return callback(err2);
      if (rows.length === 0) return callback(new Error('No se encontró el reverso insertado'));
      callback(null, rows[0].cve_registro_ine_reverso);
    });
  });
}

//relacionar inverso reverso y el usuario
function insertarCredencial(anversoId, reversoId, usuarioId, callback) {
  const query = `
    INSERT INTO credencial_ine 
    (cve_registro_ine_anverso1, cve_registro_ine_reverso1, id_usuario1)
    VALUES (?, ?, ?)
  `;
  connectDB.query(query, [anversoId, reversoId, usuarioId], (err, result) => {
    if (err) return callback(err);
    callback(null, result.insertId);
  });
}

//flujo principal al llamar registrar ine
const registrarINE = (req, res) => {
  const data = req.body;
  const { id_usuario1, linea1, linea2 } = data;

  if (!id_usuario1) {
    return res.status(400).json({ error: 'Falta el ID del usuario' }); //en caso de no encontrar ID usuario
  }
// envio de datos a cada insert
//para anverso
  insertarAnverso(data, (errAnverso, anversoId) => {
    if (errAnverso) {
      console.error('Error al guardar ine_anverso:', errAnverso);
      return res.status(500).json({ error: 'Error al guardar anverso' });
    }

    //para reverso
    if (linea1 || linea2) {
      insertarReverso(data, (errReverso, reversoId) => {
        if (errReverso) {
          console.error('Error al guardar ine_reverso:', errReverso);
          return res.status(500).json({ error: 'Error al guardar reverso' });
        }

        //relacion de las credenciales
        insertarCredencial(anversoId, reversoId, id_usuario1, (errCred, credId) => {
          if (errCred) {
            console.error('Error al guardar credencial:', errCred);
            return res.status(500).json({ error: 'Error al guardar credencial' });
          }

          return res.status(200).json({ message: 'INE completa registrada', credencial_id: credId });
        });
      });
    } else {
      //en caso de registrar una ine sin reverso (imposible por ahora)
      insertarCredencial(anversoId, null, id_usuario1, (errCred, credId) => {
        if (errCred) {
          console.error('Error al guardar credencial:', errCred);
          return res.status(500).json({ error: 'Error al guardar credencial' });
        }

        return res.status(200).json({ message: 'INE sin reverso registrada', credencial_id: credId });
      });
    }
  });
};

module.exports = { registrarINE };