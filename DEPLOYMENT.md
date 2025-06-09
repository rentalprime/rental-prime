# Deployment Guide

This guide provides instructions for deploying the Rental Prima application to various hosting platforms (excluding Vercel).

## Backend Deployment

### Option 1: Render (Recommended)

1. **Create a Render Account**
   - Go to [render.com](https://render.com) and sign up

2. **Deploy Backend**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure the service:
     - **Name**: `rental-prima-backend`
     - **Root Directory**: `backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
   - Add environment variables:
     - `NODE_ENV`: `production`
     - `SUPABASE_URL`: Your Supabase URL
     - `SUPABASE_ANON_KEY`: Your Supabase anonymous key
     - `SUPABASE_KEY`: Your Supabase service role key

3. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note the deployed URL (e.g., `https://your-app.onrender.com`)

### Option 2: Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app) and sign up

2. **Deploy Backend**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Configure:
     - **Root Directory**: `backend`
     - Add the same environment variables as above

### Option 3: Heroku

1. **Install Heroku CLI**
   ```bash
   # Install Heroku CLI (varies by OS)
   npm install -g heroku
   ```

2. **Deploy Backend**
   ```bash
   cd backend
   heroku create your-app-name
   heroku config:set NODE_ENV=production
   heroku config:set SUPABASE_URL=your_supabase_url
   heroku config:set SUPABASE_ANON_KEY=your_supabase_anon_key
   heroku config:set SUPABASE_KEY=your_supabase_service_key
   git push heroku main
   ```

## Frontend Deployment

### Option 1: Netlify (Recommended)

1. **Build Configuration**
   - Update `frontend/public/env-config.js` with your backend URL
   - Or set environment variables in Netlify dashboard

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com) and sign up
   - Click "New site from Git"
   - Connect your GitHub repository
   - Configure build settings:
     - **Base directory**: `frontend`
     - **Build command**: `npm run build`
     - **Publish directory**: `frontend/build`
   - Add environment variables:
     - `REACT_APP_API_URL`: Your deployed backend URL
     - `REACT_APP_SUPABASE_URL`: Your Supabase URL
     - `REACT_APP_SUPABASE_ANON_KEY`: Your Supabase anonymous key

3. **Deploy**
   - Click "Deploy site"
   - Wait for deployment to complete

### Option 2: GitHub Pages

1. **Install gh-pages**
   ```bash
   cd frontend
   npm install --save-dev gh-pages
   ```

2. **Update package.json**
   ```json
   {
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d build"
     },
     "homepage": "https://yourusername.github.io/your-repo-name"
   }
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

### Option 3: Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Firebase**
   ```bash
   cd frontend
   firebase login
   firebase init hosting
   ```

3. **Configure firebase.json**
   ```json
   {
     "hosting": {
       "public": "build",
       "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

4. **Deploy**
   ```bash
   npm run build
   firebase deploy
   ```

## Environment Variables

### Backend Environment Variables
- `NODE_ENV`: Set to `production`
- `PORT`: Port number (usually set by hosting provider)
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_KEY`: Your Supabase service role key

### Frontend Environment Variables
- `REACT_APP_API_URL`: Your deployed backend URL
- `REACT_APP_SUPABASE_URL`: Your Supabase project URL
- `REACT_APP_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Post-Deployment Steps

1. **Update CORS Settings**
   - Add your frontend domain to the backend's CORS configuration
   - Update `backend/server.js` allowedOrigins array

2. **Test the Application**
   - Visit your deployed frontend URL
   - Test login functionality
   - Verify API connectivity

3. **Monitor Logs**
   - Check backend logs for any errors
   - Monitor frontend console for issues

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure frontend domain is added to backend CORS settings
   - Check that API URL is correctly configured

2. **Environment Variables Not Loading**
   - Verify all required environment variables are set
   - Check variable names match exactly (case-sensitive)

3. **Build Failures**
   - Check Node.js version compatibility
   - Ensure all dependencies are properly installed

4. **API Connection Issues**
   - Verify backend is running and accessible
   - Check API URL configuration in frontend
   - Test API endpoints directly

For additional support, check the hosting provider's documentation or contact their support team.
