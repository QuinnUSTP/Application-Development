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
  if ($httpServer) {
    # Use resolved command path directly (safer than relying on PATH refresh behavior).
    & $httpServer.Source -p $port -c-1
    return $true
  }

  $npx = Get-Command npx -ErrorAction SilentlyContinue
  if ($npx) {
    Write-Host "http-server not found on PATH. Starting via npx..." -ForegroundColor Yellow
    & $npx.Source --yes http-server -p $port -c-1
    return $true
  }

  Write-Host "http-server and npx not found. Installing globally (npm i -g http-server)..." -ForegroundColor Yellow
  npm i -g http-server | Out-Host

  # npm global bin on Windows commonly lands under %APPDATA%\npm
  $npmPrefix = (npm config get prefix 2>$null | Out-String).Trim()
  if ($npmPrefix) {
    $httpServerCmd = Join-Path $npmPrefix 'http-server.cmd'
    if (Test-Path $httpServerCmd) {
      & $httpServerCmd -p $port -c-1
      return $true
    }
  }

  # Last try: command discovery after install
  $httpServerAfterInstall = Get-Command http-server -ErrorAction SilentlyContinue
  if ($httpServerAfterInstall) {
    & $httpServerAfterInstall.Source -p $port -c-1
    return $true
  }

  Write-Host "Unable to run http-server after install. Try reopening PowerShell or run: npx --yes http-server -p $port -c-1" -ForegroundColor Red
  return $false
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
