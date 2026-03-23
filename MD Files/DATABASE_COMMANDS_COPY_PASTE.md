# 🚀 Database Check - Copy-Paste Commands

## Quick Start (Do These in Order)

### Terminal 1: Start MongoDB
```powershell
S:\mongodb\bin\mongod.exe --dbpath "C:\data\db"
```

### Terminal 2: Seed Database (First Time Only)
```powershell
cd "S:\appdev\rsanimesh.github.io-master\Appdev\backend"
node seed.js
```

### Terminal 3: Start Backend
```powershell
cd "S:\appdev\rsanimesh.github.io-master\Appdev\backend"
npm run dev
```

### Browser: Open Website
```
file:///S:/appdev/rsanimesh.github.io-master/Appdev/index.html
```

---

## MongoDB Terminal Commands

### Connect to MongoDB
```powershell
S:\mongodb\bin\mongo.exe
```

### Inside MongoDB Shell

```javascript
// Check database
use redstore

// ===== COUNT EVERYTHING =====
db.products.countDocuments()      // Should show: 12 (after seed)
db.categories.countDocuments()    // Should show: 3 (after seed)
db.users.countDocuments()         // Shows registered users
db.orders.countDocuments()        // Shows completed orders

// ===== VIEW EVERYTHING =====
db.products.find().pretty()
db.users.find().pretty()
db.orders.find().pretty()
db.categories.find().pretty()

// ===== VIEW ONE ITEM =====
db.products.findOne({ name: "Red Printed T-Shirt" })
db.users.findOne({ username: "testuser" })
db.orders.findOne({ _id: ObjectId("...") })

// ===== SEARCH BY FIELD =====
db.products.find({ category: "clothing" })
db.products.find({ price: { $gt: 50 } })          // price > 50
db.users.find({ email: "test@example.com" })

// ===== DATABASE STATS =====
db.stats()
db.collection_name.stats()

// ===== COUNT BY CATEGORY =====
db.products.countDocuments({ category: "clothing" })
db.products.countDocuments({ category: "footwear" })
db.products.countDocuments({ category: "accessories" })

// ===== SHOW ALL DATABASES =====
show databases

// ===== SHOW ALL COLLECTIONS =====
show collections

// ===== DELETE ALL (⚠️ CAREFUL!) =====
db.products.deleteMany({})
db.users.deleteMany({})
db.orders.deleteMany({})

// ===== DROP COLLECTION (⚠️ CAREFUL!) =====
db.products.drop()
db.users.drop()
db.orders.drop()
db.categories.drop()

// ===== EXIT MONGODB =====
exit
```

---

## Windows PowerShell Commands

### Check MongoDB Port
```powershell
Get-NetTCPConnection -LocalPort 27017
```

### Check Port 5000 (Backend)
```powershell
Get-NetTCPConnection -LocalPort 5000
```

### Create Data Directory
```powershell
New-Item -ItemType Directory -Path "C:\data\db" -Force
```

### Navigate to Backend Folder
```powershell
cd "S:\appdev\rsanimesh.github.io-master\Appdev\backend"
```

### Install Dependencies (If Needed)
```powershell
npm install
```

### View Logs
```powershell
npm run dev
```

### Stop Server
```
Press Ctrl + C
```

---

## API Endpoints to Test

### Get All Products
```
GET http://localhost:5000/api/products
```

### Get Product by ID
```
GET http://localhost:5000/api/products/1
```

### Get Categories
```
GET http://localhost:5000/api/categories
```

### Health Check
```
GET http://localhost:5000/api/health
```

### Register User (POST)
```
POST http://localhost:5000/api/users/register
Body:
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

### Login User (POST)
```
POST http://localhost:5000/api/users/login
Body:
{
  "username": "testuser",
  "password": "password123"
}
```

### Get User Profile
```
GET http://localhost:5000/api/users/profile
Header: Authorization: Bearer [YOUR_JWT_TOKEN]
```

### Create Order (POST)
```
POST http://localhost:5000/api/orders
Header: Authorization: Bearer [YOUR_JWT_TOKEN]
Body:
{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ],
  "totalAmount": 115,
  "shippingAddress": "123 Main St"
}
```

---

## Browser Console Commands (Press F12)

### Check if Backend is Available
```javascript
fetch('http://localhost:5000/api/products')
  .then(r => r.json())
  .then(d => console.log('✅ Backend working!', d))
  .catch(e => console.log('❌ Backend down', e))
```

### Check Products
```javascript
fetch('http://localhost:5000/api/products')
  .then(r => r.json())
  .then(products => console.log(`Found ${products.length} products:`, products))
```

### Check Local Storage (Cart & Token)
```javascript
localStorage.getItem('redstore_cart')    // Shows cart items
localStorage.getItem('token')            // Shows JWT token
localStorage.getItem('user')             // Shows user info
```

### Clear Local Storage
```javascript
localStorage.clear()
```

### Check Products from JSON Fallback
```javascript
fetch('./data/products.json')
  .then(r => r.json())
  .then(d => console.log('Products from JSON:', d))
```

---

## File Paths Quick Reference

```powershell
# MongoDB Installation
S:\mongodb\bin\mongod.exe
S:\mongodb\bin\mongo.exe

# MongoDB Data
C:\data\db\

# Backend Folder
S:\appdev\rsanimesh.github.io-master\Appdev\backend\

# Seed File
S:\appdev\rsanimesh.github.io-master\Appdev\backend\seed.js

# Server File
S:\appdev\rsanimesh.github.io-master\Appdev\backend\server.js

# Frontend Index
S:\appdev\rsanimesh.github.io-master\Appdev\index.html

# API Service
S:\appdev\rsanimesh.github.io-master\Appdev\js\api.js

# Products JSON Fallback
S:\appdev\rsanimesh.github.io-master\Appdev\data\products.json
```

---

## Startup Script (Save as START_DB.ps1)

```powershell
# Check and create data directory
if (!(Test-Path "C:\data\db")) {
    New-Item -ItemType Directory -Path "C:\data\db" -Force | Out-Null
    Write-Host "✅ Created C:\data\db" -ForegroundColor Green
}

# Start MongoDB in background
Write-Host "Starting MongoDB..." -ForegroundColor Cyan
$mongo = Start-Process -FilePath "S:\mongodb\bin\mongod.exe" `
    -ArgumentList '--dbpath "C:\data\db"' `
    -PassThru -WindowStyle Minimized

Start-Sleep -Seconds 2

# Verify MongoDB
$check = Get-NetTCPConnection -LocalPort 27017 -ErrorAction SilentlyContinue
if ($check) {
    Write-Host "✅ MongoDB running on port 27017" -ForegroundColor Green
} else {
    Write-Host "❌ MongoDB failed to start" -ForegroundColor Red
    exit 1
}

# Start Backend
Write-Host "Starting Backend..." -ForegroundColor Cyan
Set-Location "S:\appdev\rsanimesh.github.io-master\Appdev\backend"
npm run dev

# Keep services running (close window to stop)
Write-Host "Services running. Close this window to stop." -ForegroundColor Yellow
Read-Host
```

---

## Common Issues & Quick Fixes

### Issue: MongoDB won't start
```powershell
# Check if port is in use
Get-NetTCPConnection -LocalPort 27017

# Kill previous MongoDB process
Stop-Process -Name mongod -Force

# Try again
S:\mongodb\bin\mongod.exe --dbpath "C:\data\db"
```

### Issue: Can't find data directory
```powershell
# Create it
New-Item -ItemType Directory -Path "C:\data\db" -Force
```

### Issue: Backend can't connect to MongoDB
```powershell
# 1. Check MongoDB is running
Get-NetTCPConnection -LocalPort 27017

# 2. Check backend is in right folder
cd "S:\appdev\rsanimesh.github.io-master\Appdev\backend"

# 3. Check .env file exists and has correct MONGODB_URI
type .env
```

### Issue: No products showing
```powershell
# 1. Seed database
cd "S:\appdev\rsanimesh.github.io-master\Appdev\backend"
node seed.js

# 2. Verify seed worked
# In MongoDB terminal:
use redstore
db.products.countDocuments()  # Should show 12
```

### Issue: Can't register user
```javascript
// Check in browser console
fetch('http://localhost:5000/api/users/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  })
})
.then(r => r.json())
.then(d => console.log(d))
```

---

## Verification Checklist

```
MongoDB Running?
  [ ] Run: Get-NetTCPConnection -LocalPort 27017
  [ ] Should see connection on 127.0.0.1:27017

Database Seeded?
  [ ] Run: node seed.js (in backend folder)
  [ ] Run: db.products.countDocuments() → Should show 12

Backend Running?
  [ ] Run: npm run dev
  [ ] Should see: ✅ MongoDB Connected: localhost

Frontend Working?
  [ ] Open: file:///S:/appdev/rsanimesh.github.io-master/Appdev/index.html
  [ ] Press F12, check console for: ✅ Products fetched from backend

User Registration?
  [ ] Register user
  [ ] Run: db.users.countDocuments() → Should increase

Checkout Working?
  [ ] Add product to cart
  [ ] Click checkout
  [ ] Run: db.orders.countDocuments() → Should increase
  [ ] Receipt page should show Order ID

All Working? ✅ Your database system is complete!
```

---

## One-Liner Diagnostics

```powershell
# Check everything in one command
Write-Host "MongoDB: " -NoNewline; 
  (Get-NetTCPConnection -LocalPort 27017 -ErrorAction SilentlyContinue | 
   Measure-Object).Count -gt 0 ? "✅" : "❌" | Write-Host

# Check if npm is installed
npm --version

# Check if node is installed
node --version

# Check if mongod exists
Test-Path "S:\mongodb\bin\mongod.exe"

# Check data directory exists
Test-Path "C:\data\db"
```

---

**Tip:** Save these commands in a text file for quick reference! 📝
