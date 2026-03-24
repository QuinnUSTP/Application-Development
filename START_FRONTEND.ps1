# Starts a local static web server for the frontend.
# This avoids opening HTML via file:/// which breaks cookies/CORS.
#
# Usage (PowerShell):
#   .\START_FRONTEND.ps1
#
# It will prefer Node's http-server (installs globally if missing),
# otherwise it will fall back to Python's built-in http.server.

$ErrorActionPreference = 'Continue'

$port = 5500
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

Write-Host "Frontend root: $root"
Write-Host "Starting static server on port $port..." -ForegroundColor Cyan
Write-Host "Open: http://127.0.0.1:$port/index.html" -ForegroundColor Green
Write-Host "(Keep this window open while browsing)" -ForegroundColor DarkGray
Write-Host ""

function Start-WithNode {
  $node = Get-Command node -ErrorAction SilentlyContinue
  if (-not $node) { return $false }

  $httpServer = Get-Command http-server -ErrorAction SilentlyContinue
  if (-not $httpServer) {
    Write-Host "http-server not found. Installing globally (npm i -g http-server)..." -ForegroundColor Yellow
    npm i -g http-server | Out-Host
  }

  # http-server is a long-running process. If it starts successfully it will
  # block this script until you stop it (Ctrl+C). We should not "exit 1" after.
  http-server -p $port -c-1
  return $true
}

function Start-WithPython {
  $py = Get-Command py -ErrorAction SilentlyContinue
  if ($py) {
    py -m http.server $port
    return $true
  }

  $python = Get-Command python -ErrorAction SilentlyContinue
  if ($python) {
    python -m http.server $port
    return $true
  }

  return $false
}

if (Start-WithNode) { return }

Write-Host "Node not available. Trying Python..." -ForegroundColor Yellow
if (Start-WithPython) { return }

Write-Host "\nCould not start a server because Node and Python were not found." -ForegroundColor Red
Write-Host "Install one of these and re-run:" -ForegroundColor Red
Write-Host "  - Node.js (recommended) https://nodejs.org" -ForegroundColor Red
Write-Host "  - Python https://www.python.org" -ForegroundColor Red
exit 1
