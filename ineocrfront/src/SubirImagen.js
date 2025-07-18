//componente de registro de credenciales para votar
import React, { useRef, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Button, Card, Image, Nav, Navbar, NavDropdown, ProgressBar, Form, Alert} from 'react-bootstrap';
import { CameraFill, Check, Upload, ArrowLeft } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom'; //navegacion en la pagina

//funcion principal de nuestro programa subir imagen
function SubirImagen() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  //setters de los datos a enviar
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [frontOcrData, setFrontOcrData] = useState(null);
  const [backOcrData, setBackOcrData] = useState(null);
  const [currentStep, setCurrentStep] = useState('front');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const usuarioId = 'c743cde1-61bf-11f0-b70c-60cf84a016d3';
//handler para mostrar las previstas
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      if (currentStep === 'front') {
        setFrontImage(imageUrl);
      } else {
        setBackImage(imageUrl);
      }
    }
  };
// llamar a nuestro socket de ocr en python
  const handleOCR = async () => {
    const file = fileInputRef.current?.files?.[0] || cameraInputRef.current?.files?.[0];
    if (!file) {
      setErrorMessage('Es necesario tomar o subir una foto para continuar');
      return;
    }
    setErrorMessage(null);
    setIsLoading(true);

    //enviar datos como forma
    const formData = new FormData();
    formData.append('imagen', file);

    try {
      const endpoint = currentStep === 'front'
        ? 'http://localhost:8081/api/ocr'//ruta del ocr
        : 'http://localhost:8081/api/ocrreverso'; // ruta del socket ocr reverso

      const res = await axios.post(endpoint, formData);
      if (!res.data.es_ine) {
        setErrorMessage("No se detectó una credencial del INE válida.");
      } else if (currentStep === 'front') {
        setFrontOcrData(res.data);
        setCurrentStep('back');
      } else {
        setBackOcrData(res.data);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Error procesando la imagen');
    } finally {
      setIsLoading(false);
    }
  };

  // enviar datos a la db
  const handleSubmit = async () => {
    try {
      const requiredFrontFields = [
        'sexo', 'calle', 'numero', //datos requeridos del frente
        'colonia', 'codigo_postal', 'estado', 'pais', 'clave_elector', 'curp', 'anio_registro',
        'fecha_nacimiento', 'seccion', 'vigencia'
      ];
      for (let field of requiredFrontFields) {
        if (!frontOcrData[field]) {
          alert(`Falta el campo: ${field}`);
          return;
        }
      }
      //combinar datos para su envio al back end
      const combinedData = {
        ...frontOcrData,
        ...backOcrData,
        id_usuario1: usuarioId,
      };

      const response = await axios.post('http://localhost:8081/api/ine', combinedData); //api para registrar nuestros datos en la base de datos
      if (response.status === 200) {
        alert("INE registrada con éxito");
        navigate('/PanelAdmin');
      }
    } catch (error) {
      console.error('Error al enviar INE:', error);
      alert('Error al registrar la INE');
    }
  };

  const getPreviewImage = () => currentStep === 'front' ? frontImage : backImage; //pasos de la imagen tomada
  const getStepTitle = () => currentStep === 'front' ? 'Tome una foto del frente de su INE' : 'Tome una foto del reverso de su INE'; //titulo que aparece cuando tomamos una foto


  //script html con bootstrap muestra elementos dependiendo de el paso de la imagen tomada y al final despliega el formulario de registro
  //orden del script
  //una nav bar, container de subida, container de imagen y forma final.
  return (
    <div>
      {/* barra de navegacion */}
      <Navbar expand='lg' bg="dark" data-bs-theme="dark">
        <Container>
          <Navbar.Brand>Sistema captura INE</Navbar.Brand>
          <Navbar.Toggle aria-controls='basic-navbar-nav'/>
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav className='me-auto'>
              <Nav.Link href="/Home">Inicio</Nav.Link>
              <Nav.Link href='/RegistrarUsuario'>Registrarse</Nav.Link>
              <NavDropdown title="mas acciones" id="basic-nav-dropdown">
                <NavDropdown.Item href='/PanelAdmin'>Panel Administrador</NavDropdown.Item>
              </NavDropdown>
              <Button variant='danger' onClick={() => {localStorage.removeItem('token'); navigate('/Login');}}>cerrar sesion</Button> 
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

        {/* contenedor de la subida de imagenes cambia dependiendo de el paso en el que se encuentre el usuario */}
      <Container fluid className="py-5">
        <Row>
          <Col md={4}>
            <Card className="p-3 shadow-sm">
              <h5>{getStepTitle()}</h5> {/* titulo del paso */}
              {errorMessage && <Alert variant="danger">{errorMessage}</Alert>} 
              <div className="d-grid gap-3">
                <Button variant="primary" size="lg" onClick={() => cameraInputRef.current?.click()}>
                  <CameraFill className="me-2" /> Tomar foto
                </Button>
                <div className="text-muted">o</div>
                <Button variant="secondary" size="lg" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="me-2" /> Subir foto desde el dispositivo
                </Button>
                <div className="d-flex justify-content-between mt-3">
                  {currentStep === 'back' && <Button variant="outline-secondary" onClick={() => setCurrentStep('front')}><ArrowLeft className="me-1" /> Volver al frente</Button>} {/* boton para re procesar el frente*/}
                  <Button variant='primary' size='lg' onClick={handleOCR} disabled={!getPreviewImage()}> {/* pre vista de la imagen ocr*/}
                    <Check className='me-2' /> {currentStep === 'front' ? 'Procesar frente' : 'Procesar reverso'}
                  </Button>
                </div>
              </div>
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleImageChange} />
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
              {frontImage && <><hr/><h6>Frente:</h6><Image src={frontImage} fluid rounded /></>}
              {backImage && <><hr/><h6>Reverso:</h6><Image src={backImage} fluid rounded /></>}
            </Card>
          </Col>
            {/* elemento que muestra el formulario de los datos recabados de la identificacion se activa solo al recibir los datos del backend*/}
          {frontOcrData && backOcrData && (
            <Col md={8}>
              <Card className="shadow-sm">
                <Card.Header className="bg-primary text-white">Datos extraídos frente</Card.Header>
                <Card.Body>
                  <Form>
                    {/* inicio de datos del frente, por orden apellido paterno, materno, nombre, sexo, calle, numero, colonia, codigo postal, estado pais, cve elector, curp, año de registro, fecha nacimiento, seccion vigencia linea 1 y 2 del reverso*/}
                    <h5 className="mb-3">Datos del Frente</h5>
                    <Row className="mb-3">
                      <Col md={4}><Form.Label>Apellido Paterno</Form.Label><Form.Control value={backOcrData.apellido_paterno || ''} onChange={(e) => setBackOcrData({ ...backOcrData, apellido_paterno: e.target.value })} /></Col>
                      <Col md={4}><Form.Label>Apellido Materno</Form.Label><Form.Control value={backOcrData.apellido_materno || ''} onChange={(e) => setBackOcrData({ ...backOcrData, apellido_materno: e.target.value })} /></Col>
                      <Col md={4}><Form.Label>Nombre</Form.Label><Form.Control value={backOcrData.nombre_reverso || ''} onChange={(e) => setBackOcrData({ ...backOcrData, nombre_reverso: e.target.value })} /></Col>
                    </Row>
                    <Row className="mb-3">
                      <Col md={2}><Form.Label>Sexo</Form.Label><Form.Control value={frontOcrData.sexo || ''} onChange={(e) => setFrontOcrData({ ...frontOcrData, sexo: e.target.value })} /></Col>
                      <Col md={5}><Form.Label>Calle</Form.Label><Form.Control value={frontOcrData.calle || ''} onChange={(e) => setFrontOcrData({ ...frontOcrData, calle: e.target.value })} /></Col>
                      <Col md={2}><Form.Label>Número</Form.Label><Form.Control value={frontOcrData.numero || ''} onChange={(e) => setFrontOcrData({ ...frontOcrData, numero: e.target.value })} /></Col>
                      <Col md={3}><Form.Label>Colonia</Form.Label><Form.Control value={frontOcrData.colonia || ''} onChange={(e) => setFrontOcrData({ ...frontOcrData, colonia: e.target.value })} /></Col>
                    </Row>
                    <Row className="mb-3">
                      <Col md={3}><Form.Label>CP</Form.Label><Form.Control value={frontOcrData.codigo_postal || ''} onChange={(e) => setFrontOcrData({ ...frontOcrData, codigo_postal: e.target.value })} /></Col>
                      <Col md={3}><Form.Label>Alcaldia / Municipio</Form.Label><Form.Control value={frontOcrData.estado || ''} onChange={(e) => setFrontOcrData({ ...frontOcrData, estado: e.target.value })} /></Col>
                      <Col md={3}><Form.Label>Estado</Form.Label><Form.Control value={frontOcrData.pais || ''} onChange={(e) => setFrontOcrData({ ...frontOcrData, pais: e.target.value })} /></Col>
                      <Col md={3}><Form.Label>Clave Elector</Form.Label><Form.Control value={frontOcrData.clave_elector || ''} onChange={(e) => setFrontOcrData({ ...frontOcrData, clave_elector: e.target.value })} /></Col>
                    </Row>
                    <Row className="mb-3">
                      <Col md={4}><Form.Label>CURP</Form.Label><Form.Control value={frontOcrData.curp || ''} onChange={(e) => setFrontOcrData({ ...frontOcrData, curp: e.target.value })} /></Col>
                      <Col md={4}><Form.Label>Año Registro</Form.Label><Form.Control value={frontOcrData.anio_registro || ''} onChange={(e) => setFrontOcrData({ ...frontOcrData, anio_registro: e.target.value })} /></Col>
                      <Col md={4}><Form.Label>Fecha Nacimiento</Form.Label><Form.Control value={frontOcrData.fecha_nacimiento || ''} onChange={(e) => setFrontOcrData({ ...frontOcrData, fecha_nacimiento: e.target.value })} /></Col>
                    </Row>
                    <Row className="mb-3">
                      <Col md={6}><Form.Label>Sección</Form.Label><Form.Control value={frontOcrData.seccion || ''} onChange={(e) => setFrontOcrData({ ...frontOcrData, seccion: e.target.value })} /></Col>
                      <Col md={6}><Form.Label>Vigencia</Form.Label><Form.Control value={frontOcrData.vigencia || ''} onChange={(e) => setFrontOcrData({ ...frontOcrData, vigencia: e.target.value })} /></Col>
                    </Row>
                    <Card className='shadow-sm'>
                      <Card.Header className="bg-primary text-white">Datos extraídos Reverso</Card.Header>
                      <Card.Body>
                      <h5 className="mb-3 mt-4">Datos del Reverso</h5>
                      <Row className="mb-3">
                      <Col md={6}><Form.Label>Línea 1</Form.Label><Form.Control value={backOcrData.linea1 || ''} onChange={(e) => setBackOcrData({ ...backOcrData, linea1: e.target.value })} /></Col>
                      <Col md={6}><Form.Label>Línea 2</Form.Label><Form.Control value={backOcrData.linea2 || ''} onChange={(e) => setBackOcrData({ ...backOcrData, linea2: e.target.value })} /></Col>
                      </Row>
                      <div className="d-flex justify-content-end">
                        <Button variant="success" onClick={handleSubmit}>Registrar INE</Button>
                      </div>
                      </Card.Body>
                    </Card>
      
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          )}
        </Row>
      </Container>
          {/* barra de carga*/}
      {isLoading && (
        <div className="fixed-top p-3 bg-light">
          <p className="mb-2 text-center">Procesando imagen...</p>
          <ProgressBar animated now={100} variant="info" />
        </div>
      )}
    </div>
  );
}

export default SubirImagen;
