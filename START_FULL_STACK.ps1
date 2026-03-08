# Start MongoDB and Backend - PowerShell Script

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
$mongoProcess = Start-Process -FilePath "S:\mongodb\bin\mongod.exe" -ArgumentList "--dbpath `"$mongoDataPath`"" -PassThru -WindowStyle Minimized
Start-Sleep -Seconds 2

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

# Start backend
Set-Location "S:\appdev\rsanimesh.github.io-master\Appdev\backend"
npm run dev

# Note: This script keeps running to keep MongoDB and Backend alive
# Close this window to stop both services
