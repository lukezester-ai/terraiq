@echo off
echo ====================================================
echo             TERRAIQ - PROPRIETARY BOOTLOADER
echo ====================================================

echo [1] Starting Enterprise Data Infrastructure (Docker)...
docker compose up -d

echo [2] Waiting for Databases to initialize (15 seconds)...
timeout /t 15

echo [3] Activating AI Environment...
cd api\fastapi
call venv\Scripts\activate

echo [4] Seeding Databases with TerraAlpha Holding Data...
python infrastructure\seed_data.py

echo [5] Starting Intelligence Core (Backend)...
start cmd /k "title TerraIQ Backend && call venv\Scripts\activate && uvicorn main:app --reload --port 8000"

echo [6] Starting Executive Dashboard (Frontend)...
cd ..\..\frontend\next-app
start cmd /k "title TerraIQ Frontend && npm run dev"

echo ====================================================
echo SYSTEM ONLINE. 
echo Dashboard: http://localhost:3000
echo ====================================================
pause
