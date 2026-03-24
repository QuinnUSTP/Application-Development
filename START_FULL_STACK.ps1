# Start MongoDB and Backend - PowerShell Script

$ErrorActionPreference = 'Continue'

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Starting Full Stack E-Commerce!" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if MongoDB data directory exists
$mongoDataPath = "C:\data\db"
if (!(Test-Path $mongoDataPath)) {
    Write-Host "Creating MongoDB data directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $mongoDataPath -Force | Out-Null
}

# Start MongoDB in background
Write-Host "Starting MongoDB..." -ForegroundColor Green

$mongodPath = "S:\mongodb\bin\mongod.exe"
if (-not (Test-Path $mongodPath)) {
    # Try to find mongod.exe on PATH
    $cmd = Get-Command mongod -ErrorAction SilentlyContinue
    if ($cmd) { $mongodPath = $cmd.Source }
}

if (Test-Path $mongodPath) {
    $mongoProcess = Start-Process -FilePath $mongodPath -ArgumentList "--dbpath `"$mongoDataPath`"" -PassThru -WindowStyle Minimized
    Start-Sleep -Seconds 2
} else {
    Write-Host "⚠️ mongod.exe not found at S:\mongodb\bin\mongod.exe and not found on PATH." -ForegroundColor Yellow
    Write-Host "   If MongoDB is already running, you can ignore this." -ForegroundColor DarkGray
}

# Verify MongoDB is running
$mongoCheck = Get-NetTCPConnection -LocalPort 27017 -ErrorAction SilentlyContinue
if ($mongoCheck) {
    Write-Host "✅ MongoDB started successfully on port 27017" -ForegroundColor Green
} else {
    Write-Host "⚠️ MongoDB may not have started. Check if port 27017 is in use." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting Backend Server..." -ForegroundColor Green
Write-Host "Location: S:\appdev\rsanimesh.github.io-master\Appdev\backend" -ForegroundColor Cyan

# Start backend in a new terminal (so this script doesn't block)
Write-Host "Starting backend in a new terminal..." -ForegroundColor Cyan
$backendCwd = Join-Path $PSScriptRoot 'backend'
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -Path '$backendCwd'; npm run dev"

# Wait for backend health before starting frontend to avoid UI flicker
$healthUrl = 'http://127.0.0.1:5000/api/health'
Write-Host "Waiting for backend to become healthy..." -ForegroundColor Cyan
$backendReady = $false
$maxWaitSeconds = 45
$start = Get-Date
while (-not $backendReady -and ((Get-Date) - $start).TotalSeconds -lt $maxWaitSeconds) {
    try {
        $r = Invoke-WebRequest -UseBasicParsing $healthUrl -TimeoutSec 2
        if ($r.StatusCode -eq 200) {
            $backendReady = $true
            break
        }
    } catch {
        # keep waiting
    }
    Start-Sleep -Milliseconds 500
}

if ($backendReady) {
    Write-Host "✅ Backend is healthy: $healthUrl" -ForegroundColor Green
} else {
    Write-Host "⚠️ Backend health check timed out after $maxWaitSeconds seconds." -ForegroundColor Yellow
    Write-Host "   Frontend will still start, but you may see missing data until the backend finishes booting." -ForegroundColor DarkGray
}

# Start frontend in a new terminal
Write-Host "Starting frontend in a new terminal..." -ForegroundColor Cyan
$frontScript = Join-Path $PSScriptRoot 'START_FRONTEND.ps1'
if (Test-Path $frontScript) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -Path '$PSScriptRoot'; .\\START_FRONTEND.ps1"
} else {
    Write-Host "Frontend start script not found: $frontScript" -ForegroundColor Yellow
}

Write-Host "\n✅ Frontend + backend starting. Keep the opened terminals running." -ForegroundColor Green
Write-Host "Frontend: http://127.0.0.1:5500/index.html" -ForegroundColor Green
Write-Host "Backend:  http://127.0.0.1:5000/api/health" -ForegroundColor Green

# Keep this script alive so the MongoDB process started here stays alive.
# If invoked from a non-interactive runner, don't loop forever.
if ($Host.Name -notmatch 'ConsoleHost') {
    exit 0
}

Write-Host "\n(Press Ctrl+C in this window to stop)" -ForegroundColor DarkGray
while ($true) { Start-Sleep -Seconds 5 }
