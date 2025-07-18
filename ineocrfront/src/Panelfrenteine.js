//panel de administrador para los datos del frente ine
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import $ from 'jquery';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import 'datatables.net';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

//definicion de nuestro panel de administrador para mostrar todos los datos
const Panelfrenteine = () => {
  const [data, setData] = useState([]);
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  //obtiene los datos a mostrar en el panel
  useEffect(() => {
    axios.get('http://localhost:8081/api/panel-admin')
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error('Error al obtener datos:', err);
      });
  }, []);
//crea tabla para mostrar los datos del frente de la id
  useEffect(() => {
  if (data.length > 0) {
    $('#tablaIne').DataTable().clear().destroy();

    //obtiene todos los datos del frente
    $('#tablaIne').DataTable({
      data: data,
      columns: [
        { data: 'nombre_ine', title: 'Nombre' },
        { data: 'sexo', title: 'Sexo' },
        { data: 'domicilio', title: 'Domicilio' },
        { data: 'curp', title: 'CURP' },
        { data: 'cve_elector', title: 'Clave Elector' },
        { data: 'fecha_de_nacimiento', title: 'Fecha Nacimiento' },
        {
          data: null,
          title: 'Ver en mapa',
          render: (data, type, row) => `<button class="btn-ver-mapa" data-dir="${row.domicilio}">📍</button>`,
        },
        { data: 'anio_registro', title: 'año de registro'},
        { data: 'seccion', title: 'sección'},
        { data: 'vigencia', title: 'vigencia'},
      ],
    });

    $('#tablaIne tbody')
      .off('click', '.btn-ver-mapa')
      .on('click', '.btn-ver-mapa', function () {
        const direccion = $(this).data('dir');
        mostrarMapa(direccion);
      });
  }
}, [data]);
  //muestra mapa
  const mostrarMapa = async (direccion) => {
  try {
    const response = await fetch(`http://localhost:8081/api/geocoding?address=${encodeURIComponent(direccion)}`); //llama api de google maps
    const result = await response.json();

    if (response.ok && result.lat && result.lon) {
      const { lat, lon } = result;

      //renderizado de mapas por leaflet
      if (!mapRef.current) {
        mapRef.current = L.map(mapContainerRef.current).setView([lat, lon], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapRef.current);
      } else {
        mapRef.current.setView([lat, lon], 15);
      }

      L.marker([lat, lon]).addTo(mapRef.current).bindPopup(direccion).openPopup();
    } else {
      alert('Dirección no encontrada');
      console.warn('Respuesta del backend:', result);
    }
  } catch (error) {
    console.error('Error al contactar con el servidor de geocoding:', error);
    alert('Error al contactar con el servidor de geocoding');
  }
};
  //constuccion html de la tabla de datos
  return (
    <div>
      <h2>PanelAdmin</h2>
      <table id="tablaIne" className="display" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Sexo</th>
            <th>Domicilio</th>
            <th>CURP</th>
            <th>Clave Elector</th>
            <th>Fecha Nacimiento</th>
            <th>Ver en mapa</th>
          </tr>
        </thead>
      </table>

      <div ref={mapContainerRef} id="map" style={{ height: '400px', marginTop: '20px' }}></div>
    </div>
  );
};

export default Panelfrenteine;