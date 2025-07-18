//rutas manejadas por react router dom y estilos 
import {BrowserRouter, Routes, Route} from 'react-router-dom' //enrutador router-dom
import SubirImagen from './SubirImagen'; //componente de subida de imagen
import Login from './Login';  //sistema de login
import PrivateRoutes from './mainlogger/PrivateRoutes'; //enrutacion privada
import Panelfrenteine from './Panelfrenteine' //subida a la db datos credencial


// enrutador principal de la applicacion
// home es la ruta default , panel admin nuestra datasheet con la info del frente
// login es la funcion de iniciar sesion
function App() {
  return (
    <div className="App">
      <BrowserRouter>
      <Routes>
        <Route path='/Home' element={<PrivateRoutes element={<SubirImagen />} />} />
        <Route path='/PanelAdmin' element={<PrivateRoutes element={<Panelfrenteine />} />} />
        <Route path='Login' element={<Login />}></Route>
      </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;

//<Route path='/Home' element={<PrivateRoutes element={<SubirImagen />} />} />