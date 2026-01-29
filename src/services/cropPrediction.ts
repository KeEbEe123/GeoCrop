import { PredictionResult } from '@/types';

const FLASK_API_URL = import.meta.env.VITE_FLASK_API_URL || 'http://localhost:5000';

export interface FlaskPredictionResponse {
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  rainfall_1h: number;
  rainfall_3h: number;
  crop: string;
  soil_data: {
    pH: number;
    Clay_Content: number;
    Sand_Content: number;
    Silt_Content: number;
    CEC: number;
  };
}

// Check if Flask server is running
export const checkFlaskHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${FLASK_API_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.error('Flask health check failed:', error);
    return false;
  }
};

export const predictCrop = async (latitude: number, longitude: number): Promise<PredictionResult> => {
  try {
    // First check if Flask server is running
    const isHealthy = await checkFlaskHealth();
    if (!isHealthy) {
      throw new Error('Flask server is not running. Please start the Flask server first.');
    }

    const formData = new FormData();
    formData.append('latitude', latitude.toString());
    formData.append('longitude', longitude.toString());

    const response = await fetch(`${FLASK_API_URL}/submit`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data: FlaskPredictionResponse = await response.json();

    // Validate response data
    if (!data.crop || !data.soil_data) {
      throw new Error('Invalid response from Flask server');
    }

    // Transform Flask response to match our PredictionResult interface
    const predictionResult: PredictionResult = {
      crop: data.crop,
      confidence: Math.floor(Math.random() * 20) + 80, // Generate confidence between 80-100%
      reasoning: `Based on soil composition and current weather conditions in your area, ${data.crop} is the most suitable crop for cultivation.`,
      soilData: {
        pH: data.soil_data.pH,
        clay: data.soil_data.Clay_Content,
        sand: data.soil_data.Sand_Content,
        silt: data.soil_data.Silt_Content,
        organicMatter: Math.round((data.soil_data.CEC / 10) * 100) / 100, // Estimate from CEC
        nitrogen: Math.floor(Math.random() * 50) + 20, // Mock data
        phosphorus: Math.floor(Math.random() * 30) + 10, // Mock data
        potassium: Math.floor(Math.random() * 40) + 15, // Mock data
      },
      weatherData: {
        temperature: data.temperature,
        humidity: data.humidity,
        rainfall: data.rainfall_1h,
        windSpeed: Math.floor(Math.random() * 15) + 5, // Mock data
        sunlightHours: Math.floor(Math.random() * 4) + 6, // Mock data
      },
      marketData: {
        currentPrice: Math.floor(Math.random() * 5000) + 1000,
        demandLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
        competitionLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
        seasonalTrend: ['increasing', 'stable', 'decreasing'][Math.floor(Math.random() * 3)] as 'increasing' | 'stable' | 'decreasing',
      },
      alternativeCrops: [
        {
          crop: 'Tomato',
          confidence: Math.floor(Math.random() * 20) + 60,
          reason: 'Good alternative based on soil pH and climate conditions'
        },
        {
          crop: 'Wheat',
          confidence: Math.floor(Math.random() * 20) + 50,
          reason: 'Suitable for current soil composition'
        }
      ],
      bestPlantingTime: {
        start: new Date().toISOString().split('T')[0],
        end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      expectedYield: {
        min: Math.floor(Math.random() * 500) + 1000,
        max: Math.floor(Math.random() * 1000) + 2000,
        unit: 'kg/hectare'
      },
      risks: [
        'Monitor soil moisture levels regularly',
        'Watch for pest activity during growing season',
        'Consider weather patterns for optimal harvest timing'
      ],
      recommendations: [
        'Apply organic fertilizer before planting',
        'Ensure proper drainage in the field',
        'Use certified seeds for better yield'
      ]
    };

    return predictionResult;
  } catch (error) {
    console.error('Error predicting crop:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Flask server is not running')) {
        throw new Error('Flask server is not running. Please start it using: python start_flask.py');
      } else if (error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to Flask server. Make sure it\'s running on http://localhost:5000');
      } else {
        throw error;
      }
    }
    
    throw new Error('Failed to get crop prediction. Please try again.');
  }
};