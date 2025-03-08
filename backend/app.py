import os
import cv2
import numpy as np
import pandas as pd
import tensorflow as tf
from flask import Flask, request, jsonify, send_from_directory, url_for
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from werkzeug.utils import secure_filename
from flask_cors import CORS
from firebase_admin import credentials, firestore, initialize_app

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Firebase
cred = credentials.Certificate("keys/serviceAccountKey.json")
initialize_app(cred)
db = firestore.client()

# Load trained model
MODEL_PATH = "model/new_plant_densenet_model.h5"
model = load_model(MODEL_PATH)

# Load disease information from CSV
CSV_PATH = "disease_data.csv"
disease_data = pd.read_csv(CSV_PATH)

# Create directories
UPLOAD_FOLDER = "static/uploaded_images"
SEGMENTED_FOLDER = "static/segmented_images"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(SEGMENTED_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["SEGMENTED_FOLDER"] = SEGMENTED_FOLDER

# Function to preprocess image for model prediction
def preprocess_image(img_path):
    img = image.load_img(img_path, target_size=(128, 128))
    img_array = image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

# Function to detect disease spread
def detect_disease_spread(img_path, output_path):
    img = cv2.imread(img_path)
    if img is None:
        return None, 0.0

    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    lower_bound = np.array([20, 50, 50])
    upper_bound = np.array([35, 255, 255])
    mask = cv2.inRange(hsv, lower_bound, upper_bound)

    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    infected_area = sum(cv2.contourArea(cnt) for cnt in contours)
    total_area = img.shape[0] * img.shape[1]
    spread_percentage = (infected_area / total_area) * 100

    cv2.drawContours(img, contours, -1, (255, 0, 0), 2)
    cv2.imwrite(output_path, img)

    return output_path, spread_percentage

# Serve segmented images
@app.route("/segmented_images/<filename>")
def get_segmented_image(filename):
    return send_from_directory(SEGMENTED_FOLDER, filename)

# Prediction route
@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    user_id = request.form.get("userId")
    filename = secure_filename(file.filename)
    img_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(img_path)

    # Preprocess and predict
    img_array = preprocess_image(img_path)
    predictions = model.predict(img_array)
    predicted_class_index = np.argmax(predictions)
    
    # Ensure disease data is valid
    try:
        predicted_class = list(disease_data["Disease"])[predicted_class_index]
        disease_info = disease_data[disease_data["Disease"] == predicted_class].iloc[0]
    except (IndexError, KeyError):
        return jsonify({"error": "Disease data not found for prediction"}), 500

    # Process segmented image
    segmented_img_path = os.path.join(SEGMENTED_FOLDER, filename)
    segmented_img_path, spread_percentage = detect_disease_spread(img_path, segmented_img_path)

    # Construct full URL for segmented image
    segmented_img_url = url_for("get_segmented_image", filename=filename, _external=True) if segmented_img_path else None

    disease_info = disease_data[disease_data["Disease"] == predicted_class].iloc[0]
    result = {
        "disease_name": predicted_class,
        "fruit": disease_info["Fruit"],
        "fertilizer": disease_info["Fertilizer"],
        "description": disease_info["Description"],
        "preventive_measures": disease_info["Preventive Measures"],
        "disease_spread_percentage": round(spread_percentage, 2),
        "segmented_image": segmented_img_url
    }
     # Store result in Firestore
    if user_id:
        user_ref = db.collection("users").document(user_id)
        user_ref.collection("history").add({
            "result": result,
            "timestamp": firestore.SERVER_TIMESTAMP
        })
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)
