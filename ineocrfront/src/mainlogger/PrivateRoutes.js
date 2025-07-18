//protector de las rutas privadas
import { Navigate } from 'react-router-dom';

//metodo para proteger todas las rutas a los que los usuarios sin cuenta no deberian entrar
function parseJwt(token) {
  if (!token) return null;
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64).split('').map(c => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`).join('')
  );
  return JSON.parse(jsonPayload);
}

//verificacion de validez del token
const isTokenValid = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const payload = parseJwt(token);
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp && payload.exp > currentTime;
  } catch (err) {
    console.error('Error al verificar el token:', err);
    return false;
  }
};

//si el token no es valido y se intenta acceder a una ruta protegida la funcion nos lleva a login
const PrivateRoutes = ({ element }) => {
  return isTokenValid() ? element : <Navigate to="/Login" />;
};



export default PrivateRoutes;