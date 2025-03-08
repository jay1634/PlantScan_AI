import React, { useState, useRef } from "react";
import axios from "axios";
import Webcam from "react-webcam";
import "./FileUpload.css";

const FileUpload = ({ setResult, user }) => { // Add user as a prop
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const webcamRef = useRef(null);

  const openWebcam = () => setShowWebcam(true);
  const closeWebcam = () => setShowWebcam(false);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setPreview(imageSrc);
    setShowWebcam(false);

    fetch(imageSrc)
      .then((res) => res.blob())
      .then((blob) => {
        setImage(new File([blob], "captured.jpg", { type: "image/jpeg" }));
      });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const removePreview = () => {
    setImage(null);
    setPreview(null);
  };

  const handleUpload = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append("file", image);
    formData.append("userId", user.uid); // Use user.uid

    try {
      const response = await axios.post("http://127.0.0.1:5000/predict", formData);
      setResult(response.data);
    } catch (error) {
      console.error("Error uploading file", error);
    }
  };

  return (
    <div className="file-upload-container">
      <h1 className="title">Upload or Capture a Clear Leaf Image for Disease Detection!</h1>
      <h1></h1>
      <div className="button-container">
        <label className="btn file-btn" style={{ width: "200px", textAlign: "center" }}>
          <input type="file" accept="image/*" onChange={handleFileChange} hidden />
          📁 Open Gallery
        </label>
        <button className="btn camera-btn" onClick={openWebcam}>
          📷 Start Camera
        </button>
      </div>
      <h1></h1>
      {showWebcam && (
        <div className="webcam-container">
          <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="webcam" />
          <button className="close-btn" onClick={closeWebcam}>
            X
          </button>
          <button className="btn capture-btn" onClick={capture}>
            Capture
          </button>
        </div>
      )}
      <hr className="divider" />
      {preview && (
        <div className="preview-container">
          <img src={preview} alt="Leaf Preview" className="preview-img" />
          <button className="close-btn" onClick={removePreview}>
            X
          </button>
        </div>
      )}
      <h1></h1>
      <button className="btn detect-btn" onClick={handleUpload}>
        Detect
      </button>
    </div>
  );
};

export default FileUpload;