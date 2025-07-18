#socket de python para realizar el ocr y enviar esto a nodejs
from flask import Flask, request, jsonify 
from paddleocr import PaddleOCR #paddleOCR en modo cpu para el reconocimiento optico de caracteres
import numpy as np #numpy para pasar los arreglos de datos extraidos por paddle y aplicar correciones con cv2
import cv2 #procesado de imagenes para mejor resultado con openComputer vision
import re 

app = Flask(__name__)
ocr = PaddleOCR(use_doc_orientation_classify=False, use_doc_unwarping=False, use_textline_orientation=False, lang='es') #inicializar ocr

# Funcion para buscar en la lista resultante del ocr los campos con regex
def buscar_en_lista(pattern, lista):
    for line in lista: 
        match = re.search(pattern, line) 
        if match: 
            return match.group(1)  
    return ''
# Funcion para solo buscar el numero de seccion con una expresion regular
def buscar_seccion(lista):
    for line in lista: 
        if re.fullmatch(r'\d{4}', line.strip()):  #4 digitos y solo 4 digitos en la linea
            return line.strip() 
    return ''

#metodo para extraer los campos del frente menos el nombre, para extraer el nombre lo podemos extraer de la parte trasera sin agregar mucho al codigo
#acontinuacion una explicacion de cada regex para esta zona
def extraer_campos_ine(texts):
    campos = {
        'es_ine': any('INSTITUTO NACIONAL ELECTORAL' in line.upper() for line in texts), #en todas las lineas extraidas por el ocr busca las palabras 'INSTITUTO NACIONAL ELECTORAL' si no las encuentra se pone en false
        'curp': buscar_en_lista(r'([A-Z]{4}[0-9]{6}[HMX]{1}[A-Z]+[0-9]+)', texts), #encuentra el curp buscando 4 letras, 6 numeros 1 caracter hm o x para el genero caracteres de la a-z variables y numeros
        'clave_elector': buscar_en_lista(r'\b([A-Z]{6}\d{6,8}[A-Z0-9]{2,4})\b', texts), #encuentra la clave de elector 6 letras 6 u 8 digitos 2 u 4 letras de la a-z
        'fecha_nacimiento': buscar_en_lista(r'\b(\d{2}/\d{2}/\d{4})\b', texts), #busca una fecha en formato dd/mm/aaaa
        'anio_registro': buscar_en_lista(r'(\d{4}\s\d+)', texts), #busca el año de registro junto con el numero de veces que se a otorgado una credencial de votar por formato de 4 digitos espacio y digitos
        'seccion': buscar_seccion(texts), # referirse a funcion buscar_seccion arriba
        'vigencia': buscar_en_lista(r'(\d{4}\s[-]?\s?\d{4})', texts), #vigencia en formato de inicio - final 4 digitos espacio guion 4 digitos en caso de solo tener 4 digitos regresa eso
        'sexo': buscar_en_lista(r'\b(H|M|X)\b', texts), # busca sexo
        'pais': 'Mex'
    }

    #funciones especiales para obtener la direccion separada en calle, colonia, estado lo ideal seria reemplazar todo esto
    #por un modelo KIE (key information extraction) pero se necesitan muchas imagenes de credenciales para entrenarlo
    # DOMICILIO
    dom_index = next((i for i, line in enumerate(texts) if 'DOMICILIO' in line.upper()), None)
    if dom_index is not None:
        campos['calle'] = texts[dom_index + 1] if len(texts) > dom_index + 1 else '' #separa la calle
        campos['colonia'] = texts[dom_index + 2] if len(texts) > dom_index + 2 else '' #separa la colonia
        campos['estado'] = texts[dom_index + 3] if len(texts) > dom_index + 3 else '' #separa el estado
    else:
        campos['calle'] = campos['colonia'] = campos['estado'] = ''

    # Número
    match_num = re.search(r'\b(\d{1,5}[A-Z]?(?:\s*INT\.?\s*\d+)?)\b', campos['calle']) #busca varias instancias de un digito de 1 a 5 caracteres 
    campos['numero'] = match_num.group(1) if match_num else ''

    # CP
    campos['codigo_postal'] = buscar_en_lista(r'\b(\d{5})\b', [campos['colonia'], campos['estado']]) #codigo postal busca en la direccion partida 5 numeros juntos
    return campos

#extraccion de las 2 lineas ocr y el nombre  mas verificacion de ser el reverso de la credencial
def extraer_campos_reverso(texto):
    resultado = {
        'linea1': '',
        'linea2': '',
        'apellido_paterno': '',
        'apellido_materno': '',
        'nombre_reverso': '',
        'es_ine': False
    }

    if len (texto) != 3 or not texto[0].startswith('IDMEX'): #busca IDMEX en el texto para verificar que es reverso con codigo ocr
        return resultado

    #separa el resultado en 2 lineas
    resultado["es_ine"] = True
    resultado["linea1"] = texto[0]
    resultado["linea2"] = texto[1]

    line3 = texto[2]
    name_parts = [p for p in line3.split("<") if p]
    if len(name_parts) >= 1:
        resultado["apellido_paterno"] = name_parts[0]
    if len(name_parts) >= 2:
        resultado["apellido_materno"] = name_parts[1]
    if len(name_parts) >= 3:
        resultado["nombre_reverso"] = "".join(name_parts[2:])

    return resultado

# === ENDPOINT ANVERSO ===
@app.route('/ocr', methods=['POST'])
def ocr_anverso():
    #si la imagen no esta en el request al back da error
    if 'imagen' not in request.files:
        return jsonify({'error': 'No se envió la imagen'}), 400

    #archivo temporal de imagen
    file = request.files['imagen']
    npimg = np.frombuffer(file.read(), np.uint8)
    #pre proceso con opencv para mejorar la vista del ocr
    img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    #resultado del ocr y division en textos buscables para nuestra expresion regular
    result = ocr.predict(img)
    texts = result[0]['rec_texts'] if result else []

    #datos extraidos
    datos = extraer_campos_ine(texts)
    #remover para desplige solo para debug y testing imprime los datos en formato (key):(value)
    print("\n=== DATOS ANVERSO ===")
    for k, v in datos.items():
        print(f"{k}: {v}")

    return jsonify(datos)

# === ENDPOINT REVERSO ===
@app.route('/ocrreverso', methods=['POST'])
def ocr_reverso():
    #si la imagen no esta en el request al back da error
    if 'imagen' not in request.files:
        return jsonify({'error': 'No se envió la imagen'}), 400

    #archivo temporal de imagen
    file = request.files['imagen']
    npimg = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

    #pre proceso con opencv para mejorar la vista del ocr
    result = ocr.predict(img)
    texts = result[0]['rec_texts'] if result else []

    #datos extraidos
    datos = extraer_campos_reverso(texts)

    #remover para desplige solo para debug y testing imprime los datos en formato (key):(value)
    print("\n=== DATOS REVERSO ===")
    for k, v in datos.items():
        print(f"{k}: {v}")

    #regresa datos en formato json
    return jsonify(datos)

# === MAIN ===
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True) #remover debug true para despliegue ajustar por y host a la necesidad