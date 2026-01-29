# Flask-React Crop Prediction Integration Guide

This guide explains how to set up and run the integrated crop prediction system with Flask backend and React frontend.

## 🚀 Quick Start

### 1. Install Flask Dependencies
```bash
# Install Python dependencies
pip install -r requirements.txt

# Or using npm script
npm run flask:install
```

### 2. Start Flask Server
```bash
# Option 1: Using the start script (recommended)
python start_flask.py

# Option 2: Using npm script
npm run flask:start

# Option 3: Direct Flask run
python app.py
```

### 3. Start React Development Server
```bash
# In a new terminal
npm run dev
```

### 4. Test the Integration
1. Open your React app (usually http://localhost:5173)
2. Navigate to the Crop Prediction page
3. Enter coordinates (e.g., 28.6139, 77.2090)
4. Click "Get Prediction"

## 📁 Project Structure

```
├── app.py                          # Flask backend server
├── start_flask.py                  # Flask startup script
├── requirements.txt                # Python dependencies
├── data/
│   ├── HWSD_DATA.csv              # Soil data
│   └── crop_data.csv              # Crop training data
├── mu_global_centroids.json       # Geographic centroids
├── src/
│   ├── services/
│   │   └── cropPrediction.ts      # API service layer
│   └── pages/
│       └── CropPrediction.tsx     # React component
└── FLASK_SETUP.md                 # Detailed Flask setup
```

## 🔧 How It Works

### Backend (Flask)
1. **Data Loading**: Loads soil data from CSV files and geographic centroids
2. **Location Matching**: Finds nearest soil data point based on coordinates
3. **Weather Integration**: Fetches real-time weather from Tomorrow.io API
4. **Crop Prediction**: Uses machine learning model to recommend crops
5. **API Response**: Returns JSON with crop recommendation and environmental data

### Frontend (React)
1. **User Input**: Collects latitude/longitude coordinates
2. **API Call**: Sends request to Flask backend
3. **Data Processing**: Transforms Flask response to match UI requirements
4. **Display**: Shows crop recommendation with soil and weather data

## 🌐 API Endpoints

### Health Check
```
GET /health
Response: {"status": "healthy", "timestamp": "..."}
```

### Crop Prediction
```
POST /submit
Body: {"latitude": 28.6139, "longitude": 77.2090}
Response: {
  "crop": "Wheat",
  "temperature": 25.5,
  "humidity": 65,
  "soil_data": {...}
}
```

## 🔑 Configuration

### Environment Variables
Create a `.env` file for sensitive data:
```
TOMORROW_IO_API_KEY=your_api_key_here
FLASK_ENV=development
```

### API Key Setup
1. Get a free API key from [Tomorrow.io](https://www.tomorrow.io/)
2. Replace the API key in `app.py` or use environment variables

## 🐛 Troubleshooting

### Common Issues

**1. Flask server not starting**
- Check if all required data files exist
- Verify Python dependencies are installed
- Ensure port 5000 is not in use

**2. CORS errors in browser**
- Flask-CORS should be installed and enabled
- Check browser console for specific error messages

**3. Prediction fails**
- Verify Flask server is running on http://localhost:5000
- Check Flask server logs for errors
- Test API directly with curl

**4. Missing data files**
- Ensure `data/HWSD_DATA.csv` exists
- Ensure `data/crop_data.csv` exists
- Ensure `mu_global_centroids.json` exists

### Testing Commands

```bash
# Test Flask health
curl http://localhost:5000/health

# Test prediction API
curl -X POST http://localhost:5000/submit \
  -H "Content-Type: application/json" \
  -d '{"latitude": 28.6139, "longitude": 77.2090}'
```

## 📊 Data Flow

```
User Input (Lat/Lng) 
    ↓
React Frontend
    ↓
HTTP POST to Flask
    ↓
Flask Backend:
  - Find nearest soil data
  - Fetch weather data
  - Run ML prediction
    ↓
JSON Response
    ↓
React UI Update
```

## 🚀 Production Deployment

### Flask Backend
- Use a production WSGI server (Gunicorn, uWSGI)
- Set up proper environment variables
- Configure CORS for your domain
- Use a reverse proxy (Nginx)

### React Frontend
- Update API URL in `cropPrediction.ts`
- Build for production: `npm run build`
- Deploy static files to CDN/hosting service

## 📝 Development Notes

- Flask runs in debug mode for development
- React development server proxies API calls
- Hot reload works for both frontend and backend changes
- Error handling provides helpful messages for debugging

## 🤝 Contributing

1. Make changes to Flask backend in `app.py`
2. Update React service layer in `src/services/cropPrediction.ts`
3. Test integration thoroughly
4. Update documentation as needed