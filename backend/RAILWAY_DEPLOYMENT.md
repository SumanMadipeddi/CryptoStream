# Railway Deployment Guide

## Prerequisites
- Railway account
- GitHub repository connected to Railway
- Node.js 18+ and pnpm 8+

## Deployment Steps

### 1. Connect Repository
1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Select the `backend` folder as the root directory

### 2. Environment Variables
Set these in Railway dashboard:
```
NODE_ENV=production
PORT=3001
WS_PORT=3002
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### 3. Build Configuration
Railway will automatically detect:
- `package.json` with pnpm
- `railway.json` configuration
- TypeScript build process

### 4. Deployment Process
Railway will:
1. Install dependencies with `pnpm install`
2. Run `pnpm railway:build` (builds TypeScript + installs Playwright)
3. Start with `pnpm railway:start`

## Files Required

### Essential Files
- ✅ `package.json` - Dependencies and scripts
- ✅ `railway.json` - Railway configuration
- ✅ `railway.toml` - Alternative Railway config
- ✅ `Dockerfile` - Docker deployment option
- ✅ `src/server.ts` - Main server file
- ✅ `tsconfig.json` - TypeScript configuration

### Key Features
- ✅ **Playwright Support** - Chromium browser installed
- ✅ **Health Check** - `/health` endpoint
- ✅ **WebSocket Support** - Real-time price streaming
- ✅ **CORS Configured** - Frontend integration ready
- ✅ **Graceful Shutdown** - Proper cleanup on restart

## Troubleshooting

### Common Issues
1. **Playwright browser not found**
   - Solution: `--with-deps` flag installs system dependencies
   
2. **Build timeout**
   - Solution: Increased healthcheck timeout to 300s
   
3. **Memory issues**
   - Solution: Optimized Playwright args for cloud deployment

### Logs
Check Railway logs for:
- Browser initialization
- Price streaming startup
- WebSocket connections
- Health check responses

## Production URLs
- **Backend API**: `https://your-app.railway.app`
- **Health Check**: `https://your-app.railway.app/health`
- **WebSocket**: `wss://your-app.railway.app:3002`

## Next Steps
1. Deploy backend to Railway
2. Get the Railway URL
3. Update frontend WebSocket URL
4. Deploy frontend to Vercel
5. Test real-time functionality
