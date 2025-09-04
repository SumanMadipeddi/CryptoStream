# Render Deployment Guide

This guide will help you deploy the CryptoStream backend to Render.

## Prerequisites

- Render account
- GitHub repository with your code

## Backend Deployment (Render)

### Option 1: Using Docker (Recommended)

1. Go to [Render](https://render.com) and sign in
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `crypto-tracker-backend`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `backend/Dockerfile.render`
   - **Root Directory**: `backend`

### Option 2: Using Build Command

1. Go to [Render](https://render.com) and sign in
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `crypto-tracker-backend`
   - **Environment**: `Node`
   - **Root Directory**: `backend`
   - **Build Command**: `pnpm install --frozen-lockfile`
   - **Start Command**: `pnpm start`

### Environment Variables

In your Render service dashboard, go to "Environment" and add:

```
NODE_ENV=production
FRONTEND_URL=https://your-vercel-app.vercel.app
```

Render will automatically set:
- `PORT` (usually 10000)
- `RENDER_EXTERNAL_URL` (your Render domain)

### WebSocket Configuration

For WebSocket support on Render, you need to:

1. **Enable WebSocket support** in your service settings
2. **Update the WebSocket URL** in your frontend environment variables

The WebSocket URL will be: `wss://your-app-name.onrender.com`

## Frontend Configuration

Update your Vercel environment variables:

```
NEXT_PUBLIC_API_URL=https://your-app-name.onrender.com
NEXT_PUBLIC_WS_URL=wss://your-app-name.onrender.com
```

## Testing the Deployment

1. **Backend Health Check**: Visit `https://your-app-name.onrender.com/health`
2. **Frontend**: Visit your Vercel URL
3. **Add a ticker**: Try adding `BTCUSD` to test the full flow

## Troubleshooting

### Common Issues

1. **Lockfile Mismatch Error**: 
   - Use `Dockerfile.simple` which doesn't rely on lockfile
   - Or use `--no-frozen-lockfile` in build commands
   - Run `pnpm install` locally to update lockfile

2. **Build Failures**: 
   - Use `Dockerfile.simple` for simplest deployment
   - Check that all dependencies are in `dependencies` not `devDependencies`

3. **WebSocket Issues**:
   - Ensure WebSocket support is enabled in Render
   - Use `wss://` (secure) protocol in production

4. **CORS Errors**:
   - Make sure `FRONTEND_URL` matches your Vercel URL exactly

### Render-Specific Notes

- Render uses port 10000 by default
- WebSocket support needs to be explicitly enabled
- Free tier has some limitations on WebSocket connections
- Consider upgrading to paid plan for better WebSocket performance

## Files for Render Deployment

- `backend/Dockerfile.render` - Simplified Dockerfile for Render
- `backend/render.yaml` - Render configuration file
- `backend/package.json` - Updated with tsx as production dependency

## Environment Variables Reference

### Backend (Render)
```
NODE_ENV=production
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL=https://your-app-name.onrender.com
NEXT_PUBLIC_WS_URL=wss://your-app-name.onrender.com
```

## Quick Deploy

1. Push your code to GitHub
2. Connect repository to Render
3. Use `backend/Dockerfile.render` as Dockerfile
4. Set environment variables
5. Deploy!

Your backend will be available at `https://your-app-name.onrender.com` 🚀
