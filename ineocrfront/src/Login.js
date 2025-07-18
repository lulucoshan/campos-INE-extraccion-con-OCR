//inicio de sesion
import { useState } from 'react';
import axios from 'axios';
import { FormLabel, Button, Form, Container, Navbar, Card, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Login() {

    const [email, setEmail] = useState (''); //parametro email
    const [password, setPassword] = useState (''); //parametro contraseña
    const navigate = useNavigate();

    const handleLogin = async (e) =>{
        e.preventDefault();

        //impide que el usuario envie el formulario si los datos no estan llenados
        if (!email || !password){
            alert('todos los campos deben ser llenados');
            return;
        } 

        // intentar contactar con el handler de login
        try{
            const response = await axios.post('http://localhost:8081/login', {
                correo_electronico: email,
                contrasenia: password,
            });
            if (response.data.token){
                console.log(response.data.token);
                localStorage.setItem('token', response.data.token);
                navigate('/Home');
            } else {
                alert('login fallo');
            }
            // envia una alerta al usuario
        } catch (error) {
            console.error('error al logear usuario:', error.response?.data || error.message);
            alert('Error al enviar datos al servidor');
        }
    }

//contenedor campos login
  return (
    <div className='bg-color-secondary'>
         <Navbar expand='lg' bg="dark" data-bs-theme="dark">
        <Container>
            <Navbar.Brand href='/Home'>Sistema captura INE</Navbar.Brand>
        </Container>
        </Navbar>

        <Container className='py-5'>
            <Row className='justify-content-center'>
                <Col md={8} lg={6}>
                    <Card className='p-5 shadow-sm align-items-center bg-secondary-color'>
                        <h3 className='mb-3 p-3'>Iniciar sesion</h3>
                        <Form>
                            <Form.Group className='mb-3' controlId='usrmail'>
                                <FormLabel>correo electronico</FormLabel>
                                <Form.Control onChange={(e) => setEmail(e.target.value)} type='email' placeholder='Ingrese su Correo'/>
                            </Form.Group>
                            <Form.Group className='mb-3' controlId='usrpasswrd'>
                                <FormLabel>contraseña</FormLabel>
                                <Form.Control onChange={(e) => setPassword(e.target.value)} type='password' placeholder='contraseña'/>
                            </Form.Group>
                            <Button variant='primary' type='submit' onClick={handleLogin}>Iniciar sesion</Button>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </Container>




    </div>
  )
}

export default Login