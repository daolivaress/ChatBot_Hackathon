from flask import Flask, request, jsonify
import os
import google.generativeai as genai
import pandas as pd
from config import API_KEY
from flask_cors import CORS
from pymongo import MongoClient
import json
from bson import ObjectId


app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})


client = MongoClient('mongodb+srv://ainfantem:uhUqtSiXYE4PJCSA@historialbot.xs6zk3t.mongodb.net/?retryWrites=true&w=majority&appName=HistorialBot')
db = client['chat_db']
chat_collection = db['chat_history']

# Configurar la API de Google AI
genai.configure(api_key=API_KEY)

# Crear el modelo con la configuración sugerida
generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 300,
    "response_mime_type": "text/plain",
}

model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
)

# Cargar y preprocesar los datos
file_path = 'procesos_restaurante.csv'
data = pd.read_csv(file_path)
data = data[['text_input', 'output']]
data['text'] = data.apply(lambda row: f"Pregunta: {row['text_input']}\nRespuesta: {row['output']}", axis=1)
informacion = "\n\n".join(data['text'].tolist())

# Definir palabras clave relevantes
palabras_clave = [
    "factura", "registro", "verificación", "validez", "número", "emisión", "proveedor", "monto", 
    "prioridad de pago", "digitalización", "archivado", "recurrentes", "seguimiento", "retraso", 
    "conciliación", "duplicados", "compras", "suministros", "aprobación", "devoluciones", 
    "control de calidad", "monitoreo de costos", "selección de proveedores", "criterios", 
    "inspección", "métodos de pago", "transferencias", "tarjeta de crédito", "cheques", 
    "efectivo", "historial de pagos", "moneda extranjera", "disputas", "comunicación", 
    "departamentos", "notificaciones", "recordatorios", "sistema financiero", "gestión", 
    "informes", "gestión documental", "políticas", "términos", "estándares", "calidad", 
    "cumplimiento", "presupuesto", "tendencias de precios", "herramientas", "software", 
    "informes financieros", "tipo de cambio", "diferencias cambiarias", "vegetales", 

    # Compras y Almacenamiento de Alimentos
    "adquisición", "ingredientes", "frescos", "envasados", "calidad", "productos", 
    "almacenamiento", "gestión", "inventarios",
    
    # Preparación de Alimentos
    "cocinar", "cortar", "mezclar", "mise en place", "menú", "utensilios", 
    "limpieza", "cocina", "temperatura",
    
    # Servicio de Comida
    "atención", "cliente", "pedido", "sistema", "comandas", "bebidas", "servicio", 
    "mesa", "quejas",
    
    # Limpieza y Mantenimiento
    "limpieza", "cocina", "sala", "baños", "áreas", "comunes", "mantenimiento", 
    "equipos", "utensilios",
    
    # Contabilidad y Administración
    "contabilidad", "administración",
    "inventarios", "pagos", "nóminas", "planificación", "financiera", 
    "presupuestos", "decisiones",
    
    # Reservas y Gestión de Mesas
    "reservas", "digital", "asignación", "mesas", "atención", "clientes", 
    "llegada", "listas", "espera", "cancelacion",
    
    # Servicios de Catering
    "comida", "eventos", "pedidos", "logística", "transporte", "servicio", "catering",

    # Seguridad Alimentaria y Salubridad
    "seguridad alimentaria", "medidas", "regulaciones", "sanitarias", "capacitación", 
    "empleados", "registros", "documentación", "hola", "saludos"
]

def generar_respuesta(informacion, pregunta):
    prompt = f"{informacion}\n\nPregunta: {pregunta}\nPor favor, proporciona una respuesta en un máximo de 150 palabras.\nRespuesta: "
    chat_session = model.start_chat(history=[])
    response = chat_session.send_message(prompt)
    return response.text

@app.route("/preguntar", methods=["POST"])
def preguntar():
    data = request.json
    pregunta = data["pregunta"]
    
    # Verificar si la pregunta contiene alguna palabra clave
    if any(palabra in pregunta.lower() for palabra in palabras_clave):
        respuesta = generar_respuesta(informacion, pregunta)
        return jsonify({"respuesta": respuesta})
    else:
        return jsonify({"respuesta": "Lo siento, solo puedo responder preguntas relacionadas con la información proporcionada."})
    
@app.route('/historial', methods=['POST'])
def save_history():
    data = request.get_json()
    conversation = data.get("conversation")
    if conversation:
        chat_collection.insert_one(conversation)
        return jsonify({"status": "success"}), 200
    return jsonify({"status": "error", "message": "No conversation provided"}), 400

@app.route('/historial', methods=['GET'])
def get_history():
    # Recuperar todas las conversaciones almacenadas en la base de datos
    conversations = list(chat_collection.find())
    
    # Convertir el cursor a una lista de diccionarios y eliminar el campo `_id`
    for conversation in conversations:
        conversation['_id'] = str(conversation['_id'])
    
    return jsonify(conversations)

@app.route('/historial/<conversation_id>', methods=['GET'])
def get_history_item(conversation_id):
    try:
        item = chat_collection.find_one({"conversationId": conversation_id})
        if item:
            item['_id'] = str(item['_id'])  # Convertir ObjectId a cadena
            return jsonify(item)
        return jsonify({"status": "error", "message": "Item not found"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400

@app.route('/historial/<conversation_id>', methods=['PUT'])
def update_history_item(conversation_id):
    try:
        data = request.get_json()
        new_messages = data.get("messages")
        if not new_messages:
            return jsonify({"status": "error", "message": "No messages provided"}), 400

        # Encontrar la conversación y actualizar los mensajes
        result = chat_collection.update_one(
            {"conversationId": conversation_id},
            {"$push": {"messages": {"$each": new_messages}}}
        )

        if result.matched_count == 0:
            return jsonify({"status": "error", "message": "Conversation not found"}), 404

        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400
    
if __name__ == "__main__":
    app.run(port=5000)
