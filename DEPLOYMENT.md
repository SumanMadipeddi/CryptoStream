# Deployment Guide

This guide will help you deploy the CryptoStream application to Vercel (frontend) and Railway (backend).

## Prerequisites

- Vercel account
- Railway account
- GitHub repository with your code

## Backend Deployment (Railway)

### 1. Deploy to Railway

1. Go to [Railway](https://railway.app) and sign in
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Choose the `backend` folder as the root directory
5. Railway will automatically detect the Node.js application

### 2. Configure Environment Variables

In your Railway project dashboard, go to the "Variables" tab and add:

```
NODE_ENV=production
FRONTEND_URL=https://your-vercel-app.vercel.app
```

Railway will automatically set:
- `PORT` (usually 3001)
- `WS_PORT` (usually 3002)
- `RAILWAY_PUBLIC_DOMAIN` (your Railway domain)

### 3. Get Your Backend URLs

After deployment, Railway will provide:
- **API URL**: `https://your-app-name.railway.app`
- **WebSocket URL**: `wss://your-app-name.railway.app:3002`

## Frontend Deployment (Vercel)

### 1. Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and sign in
2. Click "New Project" → "Import Git Repository"
3. Select your repository
4. Set the **Root Directory** to `frontend`
5. Vercel will automatically detect the Next.js application

### 2. Configure Environment Variables

In your Vercel project dashboard, go to "Settings" → "Environment Variables" and add:

```
NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app
NEXT_PUBLIC_WS_URL=wss://your-railway-app.railway.app:3002
```

Replace `your-railway-app` with your actual Railway app name.

### 3. Deploy

Click "Deploy" and Vercel will build and deploy your frontend.

## Testing the Deployment

1. **Backend Health Check**: Visit `https://your-railway-app.railway.app/health`
2. **Frontend**: Visit your Vercel URL
3. **Add a ticker**: Try adding `BTCUSD` to test the full flow

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure `FRONTEND_URL` in Railway matches your Vercel URL exactly
2. **WebSocket Connection Failed**: Ensure the WebSocket URL uses `wss://` (secure) in production
3. **API Calls Failing**: Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel

### Backend Issues

- Check Railway logs for errors
- Ensure all dependencies are installed
- Verify the build process completed successfully

### Frontend Issues

- Check Vercel build logs
- Verify environment variables are set
- Check browser console for errors

## Environment Variables Reference

### Backend (Railway)
```
NODE_ENV=production
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app
NEXT_PUBLIC_WS_URL=wss://your-railway-app.railway.app:3002
```

## Local Development

To run locally:

```bash
# Install dependencies
pnpm install:all

# Start both frontend and backend
pnpm dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- WebSocket: ws://localhost:3002

## Production URLs

After deployment, your application will be available at:
- Frontend: `https://your-vercel-app.vercel.app`
- Backend API: `https://your-railway-app.railway.app`
- WebSocket: `wss://your-railway-app.railway.app:3002`
