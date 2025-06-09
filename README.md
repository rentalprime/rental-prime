# Rental Prima

A full-stack admin dashboard for the Rental Prima platform with modern UI and comprehensive management features.

## Deployment

### Backend Deployment (Render)

The backend is currently deployed on Render at: `https://rental-prime-main-backend.onrender.com`

To deploy your own backend:
1. Push your code to a GitHub repository
2. Log in to Render (https://render.com)
3. Create a new Web Service
4. Connect your GitHub repository and select the `backend` directory
5. Add the following environment variables:
   - `NODE_ENV`: Set to `production`
   - `SUPABASE_URL`: Your Supabase URL
   - `SUPABASE_ANON_KEY`: Your Supabase anonymous key
6. Deploy the service

### Frontend Deployment Options

#### Option 1: Netlify
1. Push your code to a GitHub repository
2. Log in to Netlify (https://netlify.com)
3. Click "New site from Git" and connect your repository
4. Set build directory to `frontend`
5. Set build command to `npm run build`
6. Set publish directory to `frontend/build`
7. Add environment variables:
   - `REACT_APP_API_URL`: Your deployed backend URL
   - `REACT_APP_SUPABASE_URL`: Your Supabase URL
   - `REACT_APP_SUPABASE_ANON_KEY`: Your Supabase anonymous key

#### Option 2: GitHub Pages
1. Build the project: `cd frontend && npm run build`
2. Install gh-pages: `npm install --save-dev gh-pages`
3. Add to package.json scripts: `"deploy": "gh-pages -d build"`
4. Run: `npm run deploy`

#### Option 3: Traditional Web Hosting
1. Build the project: `cd frontend && npm run build`
2. Upload the contents of the `frontend/build` directory to your web server
3. Configure your web server to serve the React app (handle client-side routing)

## Project Structure

The project is divided into two main parts:
- `frontend`: React.js application with TailwindCSS
- `backend`: Node.js with Express RESTful API

## Features

- Modern, vibrant UI with neumorphic/glassmorphism elements
- JWT-based authentication
- Role-based access control (RBAC)
- Comprehensive dashboard with system stats
- User and admin management
- Categories and listings management
- Billing and payment plans
- System settings and notifications
- Help and support

## Getting Started

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

## API Documentation

The API is organized around REST with predictable resource-oriented URLs, accepts JSON-encoded request bodies, returns JSON-encoded responses, and uses standard HTTP response codes.

Base URL: `/api`

### Available Endpoints

- `/api/auth`: Authentication endpoints
- `/api/users`: User management
- `/api/admins`: Admin management
- `/api/categories`: Categories management
- `/api/listings`: Listings management
- `/api/payments`: Payment history
- `/api/plans`: Pricing plans
- `/api/settings`: System settings
- `/api/notifications`: Notification management
- `/api/support`: Help and support

## License

[MIT](LICENSE)
