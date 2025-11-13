# Setup Guide

## Frontend-Backend Connection

The frontend and backend are now connected without CORS by using:

1. **Development Mode**: Vite proxy forwards `/api` requests to the backend
2. **Production Mode**: Express serves the built frontend from `frontend/dist`

## Running the Application

### Development Mode (Recommended)

Run both frontend and backend separately for hot-reload:

```bash
# Terminal 1 - Backend (runs on port 3000)
npm run dev:backend

# Terminal 2 - Frontend (runs on port 5173)
npm run dev:frontend
```

Or run both in parallel:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` and will proxy API requests to `http://localhost:3000/api`.

### Production Mode

Build the frontend and serve it from the backend:

```bash
# Build the frontend
npm run build

# Start the backend server
npm start
```

The application will be available at `http://localhost:3000` (both frontend and backend on the same port).

## API Endpoints

The backend provides these endpoints:

- `POST /api/upload` - Upload learning material
- `GET /api/process/:id` - Check processing status
- `GET /api/materials` - Get all materials
- `GET /api/material/:id` - Get specific material
- `POST /api/session/start` - Start a learning session
- `POST /api/chunk/submit` - Submit chunk response

## Architecture

### No CORS Required

By using this setup, CORS is not needed because:

1. **In Development**: The Vite dev server proxies API requests to the backend, making them appear to come from the same origin
2. **In Production**: The frontend is served by the same Express server as the API, so they share the same origin

### File Structure

```
/
├── app.js                 # Express backend setup
├── routes/
│   ├── api.js            # API routes
│   └── index.js          # Serves frontend in production
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js    # API client (uses relative /api paths)
│   │   └── pages/        # React components
│   ├── vite.config.js    # Vite config with proxy
│   └── dist/             # Built frontend (served by Express)
└── package.json          # Scripts to run dev/build
```

## Testing the Connection

1. Build the frontend: `npm run build`
2. Start the server: `npm start`
3. Visit `http://localhost:3000`
4. Test API: `curl http://localhost:3000/api/materials`
