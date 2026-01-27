import os
import json
import pdfplumber
import google.generativeai as genai

# Configurar Gemini
GENAI_KEY = os.environ.get("GEMINI_API_KEY")
if GENAI_KEY:
    genai.configure(api_key=GENAI_KEY)


def extract_text_from_pdf(file_obj):
    """Extrae texto crudo del PDF."""
    text = ""
    with pdfplumber.open(file_obj) as pdf:
        for page in pdf.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
    return text


def parse_catalog_with_gemini(pdf_text):
    """Procesa el texto con Gemini 1.5 Flash para obtener JSON."""
    if not GENAI_KEY:
        raise ValueError("Falta la GEMINI_API_KEY en las variables de entorno")

    model = genai.GenerativeModel("gemini-1.5-flash")

    prompt = f"""
    Actua como un experto en extraccion de datos tecnicos.
    Analiza el siguiente texto de un catalogo de productos electricos.

    OBJETIVO:
    Genera una lista JSON con los productos encontrados.

    CAMPOS REQUERIDOS:
    - modelo: Codigo o referencia (Ej: C027966).
    - descripcion: Nombre completo del producto.
    - marca_detectada: Si encuentras la marca en el texto (ej: Weidmuller), ponla. Si no, null.
    - categoria_inferida: Que tipo de producto parece ser (ej: Borne, Rele).
    - especificaciones: Un objeto con claves y valores (Tension, Corriente, Seccion, etc).

    FORMATO DE SALIDA:
    Solo devuelve el JSON puro, sin bloques de codigo markdown (```json).

    TEXTO:
    {pdf_text[:30000]}
    """

    try:
        response = model.generate_content(prompt)
        raw_text = response.text

        clean_text = raw_text.replace("```json", "").replace("```", "").strip()

        data = json.loads(clean_text)

        if isinstance(data, dict):
            for key in data:
                if isinstance(data[key], list):
                    return data[key]
            return []

        return data

    except Exception as e:
        print(f"Error en Gemini: {e}")
        return []
