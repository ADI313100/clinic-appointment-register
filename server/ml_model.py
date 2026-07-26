#!/usr/bin/env python3
"""
No-Show Risk Prediction Model
Trains a logistic regression classifier to predict appointment no-show risk.
Features: day_of_week, lead_time_days, prior_no_shows, time_of_day
"""

import json
import pickle
import numpy as np
from datetime import datetime, timedelta
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

# Set random seed for reproducibility
np.random.seed(42)

def generate_synthetic_data(n_samples=200):
    """Generate synthetic appointment data for training."""
    data = []
    
    for i in range(n_samples):
        # Random day of week (0-6, where 0 is Monday)
        day_of_week = np.random.randint(0, 7)
        
        # Lead time in days (1-60)
        lead_time_days = np.random.randint(1, 61)
        
        # Prior no-shows (0-5)
        prior_no_shows = np.random.randint(0, 6)
        
        # Time of day (0-23 hours)
        time_of_day = np.random.randint(0, 24)
        
        # Target: no-show (1) or show (0)
        # Higher no-show probability for:
        # - Monday/Friday (day_of_week 0 or 4)
        # - Short lead time (< 7 days)
        # - Multiple prior no-shows
        # - Late afternoon appointments (15-18)
        no_show_prob = 0.1  # baseline
        
        if day_of_week in [0, 4]:  # Monday or Friday
            no_show_prob += 0.1
        
        if lead_time_days < 7:
            no_show_prob += 0.15
        
        if prior_no_shows > 0:
            no_show_prob += 0.05 * prior_no_shows
        
        if 15 <= time_of_day <= 18:
            no_show_prob += 0.08
        
        # Clamp probability
        no_show_prob = min(0.4, no_show_prob)
        
        no_show = 1 if np.random.random() < no_show_prob else 0
        
        data.append({
            'day_of_week': day_of_week,
            'lead_time_days': lead_time_days,
            'prior_no_shows': prior_no_shows,
            'time_of_day': time_of_day,
            'no_show': no_show
        })
    
    return data

def train_model():
    """Train the no-show prediction model."""
    # Generate synthetic training data
    print("Generating synthetic training data...")
    data = generate_synthetic_data(n_samples=200)
    
    # Extract features and target
    X = np.array([[d['day_of_week'], d['lead_time_days'], d['prior_no_shows'], d['time_of_day']] for d in data])
    y = np.array([d['no_show'] for d in data])
    
    # Split into train/test sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train logistic regression model
    print("Training logistic regression model...")
    model = LogisticRegression(random_state=42, max_iter=1000)
    model.fit(X_train_scaled, y_train)
    
    # Evaluate model
    y_pred = model.predict(X_test_scaled)
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, zero_division=0)
    recall = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    
    print(f"Model Performance:")
    print(f"  Accuracy:  {accuracy:.3f}")
    print(f"  Precision: {precision:.3f}")
    print(f"  Recall:    {recall:.3f}")
    print(f"  F1 Score:  {f1:.3f}")
    
    # Save model and scaler
    with open('server/ml_model.pkl', 'wb') as f:
        pickle.dump(model, f)
    
    with open('server/ml_scaler.pkl', 'wb') as f:
        pickle.dump(scaler, f)
    
    print("Model saved to server/ml_model.pkl and server/ml_scaler.pkl")
    
    return model, scaler

def predict_no_show_risk(day_of_week, lead_time_days, prior_no_shows, time_of_day, model=None, scaler=None):
    """
    Predict no-show risk for an appointment.
    Returns a risk score between 0 and 1.
    """
    if model is None or scaler is None:
        # Load model and scaler
        with open('server/ml_model.pkl', 'rb') as f:
            model = pickle.load(f)
        with open('server/ml_scaler.pkl', 'rb') as f:
            scaler = pickle.load(f)
    
    # Prepare features
    features = np.array([[day_of_week, lead_time_days, prior_no_shows, time_of_day]])
    features_scaled = scaler.transform(features)
    
    # Get probability of no-show
    risk_score = model.predict_proba(features_scaled)[0][1]
    
    return float(risk_score)

if __name__ == '__main__':
    train_model()
