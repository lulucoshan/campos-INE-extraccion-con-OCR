//index default de la applicacion react no eliminar
import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css'; //importe de los estilos bootstrap para usar bootstrap
import 'datatables.net-dt/css/dataTables.dataTables.css'//estilos de las Datatables
import App from './App';

//root constante sin modificar
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
