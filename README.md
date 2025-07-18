
# sistema ocr Ine

una aplicacion web impulsada por paddlepaddle ocr para el reconocimiento y extraccion de informacion en una credencial de elector Mexicana ademas de su visualización en un panel de administrador.


## Tech Stack

**Cliente:** React, Bootstrap, leaflet datatables

**Servidor:** Node, Express, python


## Documentation

[Documentacion del proyecto](https://linktodocumentation)


## Instalación

### requisitos

se necesita python.3 o superior con pip y virtual enviroments

node.js

### pasos para la Instalación

**instalar back end:**
navegar a la carpeta del back end en su editor de codigo y ejecutar el siguiente comando

```bash
  npm install ocrback
```

**configurar variables de entorno:**
abrir archivo .env el cual viene con la estructura para introducir sus propias variables 

**instalar front end:**
 navegar a la carpeta del frontend en su editor de codigo y ejecutra el siguiente comando
npm install


```bash
  npm install ineocrfront
```

**preparar ambiente virtual para microservicio ocr**
crear un nuevo ambiente virtual para los archivos ocr_service_c2.py y requirements.txt

instalar packetes con el siguiente comando

```bash
    pip install -r requirements.txt
```


## correr localmente

clonar el proyecto

```bash
  git clone https://github.com/lulucoshan/campos-INE-extraccion-con-OCR/tree/main?tab=readme-ov-file
```

Navegar al proyecto del directorio

```bash
  cd 'sistema ocr ine'
```

**Instalar dependencias como se detalla en la seccion de instalacion**


arrancar el servidor

```bash
  cd ocrback
  npm run server
```

arrancar el front end

```bash
    cd ineocrfront
    npm start
```
arrancar microservicio python

```bash
    cd ocrservice
    \Scripts\activate
    py ocr_service_v2.py
```


