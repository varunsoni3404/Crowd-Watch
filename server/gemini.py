from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import json
from PIL import Image
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found. Please set it in your .env file.")
genai.configure(api_key=api_key)

app = Flask(__name__)
CORS(app)

CATEGORIES = [
    "pothole on road",
    "drainage issue",
    "garbage problem",
    "streetlight not working"
]

# ✅ Health check route
@app.route('/health', methods=['GET'])
def health_check():
    """
    Simple route to verify that the server and Gemini API key are working.
    """
    try:
        # Optional: minimal call to ensure the model is available
        genai.GenerativeModel('gemini-2.5-flash')
        return jsonify({
            "status": "healthy",
            "gemini_api_key_loaded": True,
            "message": "Server is running and Gemini API is configured correctly."
        }), 200
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "gemini_api_key_loaded": bool(api_key),
            "error": str(e)
        }), 500


@app.route('/report-issue', methods=['POST'])
def report_issue():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    file = request.files['image']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        img = Image.open(file.stream)
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"""
        Analyze the provided image of a civic issue.
        Based ONLY on the image, generate a JSON object with three keys: "title", "description", and "category".

        1.  "title": A short, descriptive title for the issue (max 10 words).
        2.  "description": A brief, one-sentence description of the problem.
        3.  "category": Classify the issue into ONLY ONE of the following categories: {', '.join(CATEGORIES)}.

        If the image does not clearly show one of these issues, you MUST set the category to "invalid".
        Your entire response must be ONLY the raw JSON object, with no extra text or markdown.
        """
        response = model.generate_content([prompt, img])
        cleaned_text = response.text.strip().replace('```json', '').replace('```', '')
        data = json.loads(cleaned_text)
        category = data.get("category", "invalid").lower()
        if category not in CATEGORIES:
            data["category"] = "invalid"
        else:
            data["category"] = category
        return jsonify(data)
    except json.JSONDecodeError:
        return jsonify({"error": "Failed to parse response from AI model"}), 500
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"error": "An internal error occurred"}), 500


if __name__ == '__main__':
    app.run(debug=True, port=8080)
