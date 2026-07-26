#!/usr/bin/env python3
"""
ML Prediction Script
Loads the trained model and makes predictions for appointment no-show risk.
"""

import sys
import json
import pickle
import numpy as np
from pathlib import Path

def predict(features_dict):
    """Load model and predict no-show risk."""
    try:
        # Get the directory where this script is located
        script_dir = Path(__file__).parent
        
        # Load model and scaler
        model_path = script_dir / 'ml_model.pkl'
        scaler_path = script_dir / 'ml_scaler.pkl'
        
        if not model_path.exists() or not scaler_path.exists():
            # If model doesn't exist, return a default risk score
            return {'risk_score': 0.3, 'error': 'Model files not found'}
        
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        
        with open(scaler_path, 'rb') as f:
            scaler = pickle.load(f)
        
        # Extract features
        day_of_week = features_dict.get('dayOfWeek', 0)
        lead_time_days = features_dict.get('leadTimeDays', 7)
        prior_no_shows = features_dict.get('priorNoShows', 0)
        time_of_day = features_dict.get('timeOfDay', 12)
        
        # Prepare features array
        features = np.array([[day_of_week, lead_time_days, prior_no_shows, time_of_day]])
        features_scaled = scaler.transform(features)
        
        # Get probability of no-show
        risk_score = model.predict_proba(features_scaled)[0][1]
        
        return {'risk_score': float(risk_score)}
    
    except Exception as e:
        return {'risk_score': 0.3, 'error': str(e)}

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(json.dumps({'risk_score': 0.3, 'error': 'No input provided'}))
        sys.exit(0)
    
    try:
        features = json.loads(sys.argv[1])
        result = predict(features)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({'risk_score': 0.3, 'error': str(e)}))
