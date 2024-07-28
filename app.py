from flask import Flask, request, jsonify
import os
import google.generativeai as genai
import pandas as pd

app = Flask(__name__)

# Configurar la API de Google AI
genai.configure(api_key="AIzaSyBoPmYeHtVbQ6_Pmx54C0Wjp88DOTh14qk")

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
file_path = 'dataset_combinado.csv'
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
    "empleados", "registros", "documentación"
]

def generar_respuesta(informacion, pregunta):
    prompt = f"{informacion}\n\nPregunta: {pregunta}\nRespuesta: "
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

if __name__ == "__main__":
    app.run(port=5000)
