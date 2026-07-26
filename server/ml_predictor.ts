import { spawn } from 'child_process';
import path from 'path';

/**
 * ML Predictor: Wrapper around Python ML model for no-show risk prediction
 * Uses child_process to call Python script for predictions
 */

export interface PredictionInput {
  dayOfWeek: number;      // 0-6 (Monday-Sunday)
  leadTimeDays: number;   // Days between booking and appointment
  priorNoShows: number;   // Number of previous no-shows
  timeOfDay: number;      // 0-23 (hour of day)
}

/**
 * Predict no-show risk using the trained ML model
 * Returns a score between 0 and 1 (0 = low risk, 1 = high risk)
 */
export async function predictNoShowRisk(input: PredictionInput): Promise<number> {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, 'ml_predict.py');
    
    const python = spawn('python3', [pythonScript, JSON.stringify(input)]);
    
    let output = '';
    let error = '';
    
    python.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    python.on('close', (code) => {
      if (code !== 0) {
        console.error(`[ML Predictor] Python script error: ${error}`);
        // Return a default risk score if prediction fails
        resolve(0.3);
        return;
      }
      
      try {
        const result = JSON.parse(output.trim());
        const riskScore = Math.min(1, Math.max(0, result.risk_score));
        resolve(riskScore);
      } catch (e) {
        console.error(`[ML Predictor] Failed to parse prediction output: ${output}`);
        resolve(0.3);
      }
    });
  });
}

/**
 * Calculate no-show risk based on appointment features
 * This is a synchronous version that uses heuristics when ML model is unavailable
 */
export function calculateNoShowRiskHeuristic(input: PredictionInput): number {
  let risk = 0.1; // baseline risk
  
  // Day of week: Monday (0) and Friday (4) have higher no-show rates
  if (input.dayOfWeek === 0 || input.dayOfWeek === 4) {
    risk += 0.1;
  }
  
  // Lead time: shorter lead times have higher no-show rates
  if (input.leadTimeDays < 7) {
    risk += 0.15;
  } else if (input.leadTimeDays < 14) {
    risk += 0.08;
  }
  
  // Prior no-shows: strong indicator of future no-shows
  if (input.priorNoShows > 0) {
    risk += Math.min(0.2, 0.05 * input.priorNoShows);
  }
  
  // Time of day: late afternoon appointments have higher no-show rates
  if (input.timeOfDay >= 15 && input.timeOfDay <= 18) {
    risk += 0.08;
  }
  
  // Clamp to [0, 1]
  return Math.min(1, Math.max(0, risk));
}
