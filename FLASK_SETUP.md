# Flask Crop Prediction API Setup

This guide will help you set up and run the Flask backend for crop prediction functionality.

## Prerequisites

- Python 3.8 or higher
- pip (Python package installer)
- Tomorrow.io API key (free tier available)

## Installation

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   ```bash
   # Copy the example environment file
   cp .env.flask.example .env.flask
   
   # Edit .env.flask and add your Tomorrow.io API key
   # TOMORROW_IO_API_KEY=your_actual_api_key_here
   ```

3. **Get Tomorrow.io API Key:**
   - Visit [Tomorrow.io](https://www.tomorrow.io/)
   - Sign up for a free account
   - Get your API key from the dashboard
   - Add it to `.env.flask`

4. **Verify required data files exist:**
   - `data/HWSD_DATA.csv`
   - `data/crop_data.csv`
   - `mu_global_centroids.json`

## Running the Flask Server

### Option 1: Using the start script (Recommended)
```bash
python start_flask.py
```

### Option 2: Direct Flask run
```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

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

## Environment Configuration

### .env.flask File
```bash
TOMORROW_IO_API_KEY=your_api_key_here
FLASK_ENV=development
FLASK_DEBUG=True
```

**Important:** Never commit your `.env.flask` file to version control. It's already added to `.gitignore`.

## Integration with React Frontend

The React frontend automatically connects to the Flask API when you:

1. Start the Flask server (port 5000)
2. Use the crop prediction feature in the React app
3. Enter coordinates and click "Get Prediction"

## Troubleshooting

### Common Issues:

1. **Weather API not working**: 
   - Check if `TOMORROW_IO_API_KEY` is set in `.env.flask`
   - Verify your API key is valid
   - Check API quota limits

2. **CORS errors**: Make sure Flask-CORS is installed and enabled

3. **Missing data files**: Ensure all CSV and JSON files are in the correct locations

4. **Port conflicts**: If port 5000 is busy, modify the port in `start_flask.py`

### Testing the API

You can test the API directly using curl:

```bash
curl -X POST http://localhost:5000/submit \
  -H "Content-Type: application/json" \
  -d '{"latitude": 28.6139, "longitude": 77.2090}'
```

## Development Notes

- The Flask server runs in debug mode for development
- CORS is enabled to allow requests from the React frontend
- The API returns JSON responses compatible with the React frontend
- Weather data is fetched from Tomorrow.io API with fallback to mock data
- Environment variables are loaded from `.env.flask` file