@echo off
echo ===================================================
echo Starting RouteMind Platform (Backend + Frontend)
echo ===================================================

:: Add portable Node.js directory to local path
set "PATH=C:\Users\ganig\.gemini\antigravity\scratch\node\node-v20.11.1-win-x64;%PATH%"

start "RouteMind FastAPI Backend" cmd /k "cd backend && .\venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"

start "RouteMind React Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo RouteMind services started!
echo - Frontend Dashboard: http://localhost:5173
echo - Backend API Docs:   http://localhost:8000/docs
echo ===================================================
