import React from "react";
import "./ResultDisplay.css"; // Import the CSS file

const ResultDisplay = ({ result }) => {
    if (!result) return null;

    // Convert description and preventive measures into bullet points
    const descriptionPoints = result.description.split(".").filter(point => point.trim() !== "");
    const preventivePoints = result.preventive_measures.split(".").filter(point => point.trim() !== "");

    return (
        <div className="result-container">
            <div className="result-left">
                <h2 className="result-title">Disease: {result.fruit}-{result.disease_name}</h2>
                <img src={result.segmented_image} alt="Segmented" className="result-image" />
                <p><strong>Fertilizer:</strong> {result.fertilizer}</p>
                <p><strong>Disease Spread:</strong> {result.disease_spread_percentage}%</p>
            </div>
            {/* Vertical Divider */}
            <div className="dividery"></div>

            <div className="result-right">
                <h3 className="result-title">Disease Information</h3>
                <div className="result-details">
                    <p><strong>Description:</strong></p>
                    <ul>
                        {descriptionPoints.map((point, index) => (
                            <li key={index}>{point.trim()}</li>
                        ))}
                    </ul>

                    <p><strong>Preventive Measures:</strong></p>
                    <ul>
                        {preventivePoints.map((point, index) => (
                            <li key={index}>{point.trim()}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ResultDisplay;
