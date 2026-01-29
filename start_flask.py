#!/usr/bin/env python3
"""
Script to start the Flask crop prediction server
"""
import os
import sys

def main():
    # Check if required files exist
    required_files = [
        'data/HWSD_DATA.csv',
        'data/crop_data.csv',
        'mu_global_centroids.json'
    ]
    
    missing_files = []
    for file in required_files:
        if not os.path.exists(file):
            missing_files.append(file)
    
    if missing_files:
        print("❌ Missing required files:")
        for file in missing_files:
            print(f"   - {file}")
        print("\nPlease ensure all required data files are present before starting the server.")
        sys.exit(1)
    
    # Check for environment file
    if not os.path.exists('.env.flask'):
        print("⚠️  Warning: .env.flask file not found")
        print("   Weather API functionality may not work without TOMORROW_IO_API_KEY")
        print("   Create .env.flask with your Tomorrow.io API key for full functionality")
        print()
    
    print("✅ All required files found")
    print("🚀 Starting Flask crop prediction server...")
    print("📍 Server will be available at: http://localhost:5000")
    print("🔄 Make sure your React app is configured to use this URL")
    print("🌤️  Weather data will be fetched from Tomorrow.io API")
    print("\n" + "="*50)
    
    # Import and run the Flask app
    from app import app
    app.run(debug=True, host='0.0.0.0', port=5000)

if __name__ == '__main__':
    main()