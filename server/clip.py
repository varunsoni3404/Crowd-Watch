from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import torch

app = Flask(__name__)
CORS(app)

print("Loading CLIP model...")
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
print("Model loaded successfully!")

CATEGORIES = [
    "pothole on road",
    "drainage issue",
    "garbage problem",
    "streetlight not working"
]

def classify_issue(image_path, citizen_text=None):
    image = Image.open(image_path).convert("RGB")

    texts = CATEGORIES.copy()
    if citizen_text:
        # Combine text with categories 
        texts = [f"{cat}. Description: {citizen_text}" for cat in CATEGORIES]

    # Preprocess
    inputs = processor(text=texts, images=image, return_tensors="pt", padding=True)
    outputs = model(**inputs)

    probs = outputs.logits_per_image.softmax(dim=1)

    idx = probs.argmax().item()
    confidence = float(probs[0][idx])
    return CATEGORIES[idx], confidence

@app.route("/")
def home():
    return "Civic Issue Classification API is running. Use POST /classify to classify images."

@app.route("/classify", methods=["POST"])
def classify():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image_file = request.files["image"]
    description = request.form.get("description", "")

    # Save image temporarily
    image_path = "temp.jpg"
    image_file.save(image_path)

    # Run classification
    category, confidence = classify_issue(image_path, description)

    #handle low confidence
    if confidence < 0.2:
        category = "Needs manual review"

    return jsonify({
        "category": category,
        # "confidence": round(confidence, 3)
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
