# TerraIQ Enterprise Bootloader Script (PowerShell)
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "            TERRAIQ - PROPRIETARY BOOTLOADER        " -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

$root = $PSScriptRoot

Write-Host "[1] Starting Enterprise Data Infrastructure (Docker)..." -ForegroundColor Yellow
Set-Location $root
docker compose up -d

Write-Host "[2] Waiting for Databases & Broker to initialize (15 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host "[3] Seeding Knowledge Graph, Telemetry & RAG Databases..." -ForegroundColor Yellow
Set-Location "$root\api\fastapi"
& "$root\api\fastapi\venv\Scripts\python.exe" infrastructure\seed_data.py

Write-Host "[4] Launching Intelligence Core (FastAPI Backend on port 8000)..." -ForegroundColor Green
Start-Process cmd -ArgumentList "/k title TerraIQ Backend && cd /d `"$root\api\fastapi`" && venv\Scripts\activate && uvicorn main:app --reload --port 8000"

Write-Host "[5] Launching Executive Dashboard (Next.js Frontend on port 3000)..." -ForegroundColor Green
Start-Process cmd -ArgumentList "/k title TerraIQ Frontend && cd /d `"$root\frontend\next-app`" && npm run dev"

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "SYSTEM ONLINE." -ForegroundColor Green
Write-Host "Dashboard: http://localhost:3000" -ForegroundColor White
Write-Host "Backend API Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "====================================================" -ForegroundColor Cyan
