# Vercel Frontend Deployment Guide

## Prerequisites
- Vercel account
- Railway backend deployed and running
- GitHub repository connected to Vercel

## Environment Variables Setup

### 1. In Vercel Dashboard
Set these environment variables in your Vercel project settings:

```
NEXT_PUBLIC_API_URL=https://your-backend-app.railway.app
NEXT_PUBLIC_WS_URL=wss://your-backend-app.railway.app
```

### 2. Replace Railway URLs
- Replace `your-backend-app.railway.app` with your actual Railway backend URL
- The WebSocket URL should use `wss://` (secure WebSocket)
- The API URL should use `https://` (secure HTTP)

## Deployment Steps

### 1. Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect the Next.js app in the `frontend` folder

### 2. Configure Build Settings
Vercel will automatically use the `vercel.json` configuration:
- **Root Directory**: `frontend`
- **Build Command**: `pnpm --filter frontend build`
- **Install Command**: `pnpm install --recursive`

### 3. Set Environment Variables
In Vercel project settings, add:
- `NEXT_PUBLIC_API_URL` = Your Railway backend URL
- `NEXT_PUBLIC_WS_URL` = Your Railway WebSocket URL

### 4. Deploy
Click "Deploy" and Vercel will:
1. Install dependencies
2. Build the Next.js app
3. Deploy to Vercel's CDN

## Configuration Files

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/next"
    }
  ],
  "installCommand": "pnpm install --recursive",
  "buildCommand": "pnpm --filter frontend build",
  "env": {
    "NEXT_PUBLIC_API_URL": "@api_url",
    "NEXT_PUBLIC_WS_URL": "@ws_url"
  }
}
```

### Key Features
- ✅ **Environment Variables** - Dynamic backend URL configuration
- ✅ **WebSocket Support** - Real-time price streaming
- ✅ **API Integration** - REST API calls to Railway backend
- ✅ **Responsive Design** - Mobile and desktop optimized
- ✅ **Theme Support** - Dark/light mode toggle
- ✅ **Real-time Updates** - Live price tracking

## Testing Deployment

### 1. Check Frontend
- Visit your Vercel URL
- Verify the app loads correctly
- Check browser console for errors

### 2. Test Backend Connection
- Try adding a ticker (e.g., BTCUSD)
- Check if prices load
- Verify WebSocket connection status

### 3. Debug Issues
- Check Vercel function logs
- Verify environment variables are set
- Ensure Railway backend is running

## Production URLs
- **Frontend**: `https://your-app.vercel.app`
- **Backend API**: `https://your-backend.railway.app`
- **WebSocket**: `wss://your-backend.railway.app`

## Troubleshooting

### Common Issues
1. **WebSocket connection failed**
   - Check `NEXT_PUBLIC_WS_URL` is set correctly
   - Ensure Railway backend is running
   - Verify WebSocket URL uses `wss://`

2. **API calls failing**
   - Check `NEXT_PUBLIC_API_URL` is set correctly
   - Verify Railway backend is accessible
   - Check CORS configuration

3. **Build errors**
   - Ensure all dependencies are installed
   - Check TypeScript compilation
   - Verify environment variables are available at build time

## Next Steps
1. Deploy frontend to Vercel
2. Set environment variables
3. Test the full application
4. Monitor logs for any issues
5. Enjoy your real-time crypto tracker! 🚀
