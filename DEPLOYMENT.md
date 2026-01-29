# Flask API Deployment Guide for Render

This guide will help you deploy your Flask crop prediction API to Render.

## 🚀 Quick Deployment Steps

### 1. Prepare Your Repository
Ensure these files are in your repository:
- `Dockerfile` ✅
- `requirements.txt` ✅
- `gunicorn.conf.py` ✅
- `render.yaml` ✅
- All your data files (`data/`, `mu_global_centroids.json`) ✅

### 2. Deploy to Render

#### Option A: Using Render Dashboard
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Render will auto-detect the Dockerfile
5. Set environment variables (see below)
6. Click "Create Web Service"

#### Option B: Using render.yaml (Infrastructure as Code)
1. Push `render.yaml` to your repository
2. In Render Dashboard, click "New +" → "Blueprint"
3. Connect your repository
4. Render will use the `render.yaml` configuration

### 3. Configure Environment Variables

In Render Dashboard, add these environment variables:

```
FLASK_ENV=production
PYTHONUNBUFFERED=1
TOMORROW_IO_API_KEY=your_actual_api_key_here
```

**Important:** Never commit your API key to the repository!

### 4. Update React Frontend

Once deployed, update your React app's `.env` file:

```bash
# Replace with your actual Render URL
VITE_FLASK_API_URL=https://your-app-name.onrender.com
```

## 📋 Deployment Configuration

### Dockerfile Features:
- **Python 3.11** slim base image
- **Production-ready** with Gunicorn WSGI server
- **Security** - runs as non-root user
- **Health checks** for monitoring
- **Optimized** for container deployment

### Gunicorn Configuration:
- **2 workers** (adjustable via `WEB_CONCURRENCY` env var)
- **120s timeout** for ML model processing
- **Auto-restart** workers to prevent memory leaks
- **Production logging** with access logs

### Render Configuration:
- **Auto-deploy** on git push
- **Health checks** on `/health` endpoint
- **Persistent disk** for data files (1GB)
- **Environment variables** management

## 🔧 Testing Your Deployment

### 1. Health Check
```bash
curl https://your-app-name.onrender.com/health
```

Expected response:
```json
{"status": "healthy", "timestamp": "2024-01-29T..."}
```

### 2. Prediction Test
```bash
curl -X POST https://your-app-name.onrender.com/submit \
  -H "Content-Type: application/json" \
  -d '{"latitude": 28.6139, "longitude": 77.2090}'
```

### 3. React Integration Test
1. Update `VITE_FLASK_API_URL` in your React `.env`
2. Build and deploy your React app
3. Test crop prediction feature

## 🐛 Troubleshooting

### Common Issues:

**1. Build Failures:**
- Check if all data files are included in repository
- Verify requirements.txt has all dependencies
- Check Dockerfile syntax

**2. Runtime Errors:**
- Check Render logs in dashboard
- Verify environment variables are set
- Test API endpoints individually

**3. CORS Issues:**
- Ensure Flask-CORS is installed
- Check if your React domain is allowed
- Verify API URL is correct in React app

**4. Timeout Issues:**
- Increase Gunicorn timeout if needed
- Check if data files are loading properly
- Monitor memory usage

### Render-Specific:

**Free Tier Limitations:**
- Service sleeps after 15 minutes of inactivity
- 512MB RAM limit
- 750 hours/month limit

**Performance Tips:**
- Use persistent disk for data files
- Enable auto-deploy for continuous deployment
- Monitor logs for performance issues

## 📊 Monitoring

### Render Dashboard:
- **Metrics** - CPU, memory, response times
- **Logs** - Real-time application logs
- **Events** - Deployment history
- **Settings** - Environment variables, scaling

### Application Logs:
```bash
# View logs in Render dashboard or via CLI
render logs -s your-service-name
```

## 🔄 Continuous Deployment

With the current setup:
1. **Push to main branch** → Automatic deployment
2. **Environment changes** → Manual redeploy needed
3. **Data updates** → Upload to persistent disk

## 💰 Cost Estimation

**Free Tier:**
- Web service: Free (with limitations)
- Persistent disk: Free up to 1GB

**Paid Tier:**
- Web service: $7/month (starter)
- Additional storage: $0.25/GB/month

## 🔐 Security Best Practices

1. **Never commit API keys** to repository
2. **Use environment variables** for sensitive data
3. **Enable HTTPS** (automatic on Render)
4. **Monitor access logs** for suspicious activity
5. **Keep dependencies updated** regularly

Your Flask API will be production-ready and scalable on Render! 🚀