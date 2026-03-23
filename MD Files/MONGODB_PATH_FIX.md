# 🔧 MongoDB Setup Guide - Windows PATH Issue

## Problem
You're getting this error:
```
mongod : The term 'mongod' is not recognized...
```

This means MongoDB is installed, but Windows doesn't know where to find it.

---

## Solution: Run MongoDB with Full Path

### Option 1: Quick Fix (Right Now) ⚡

In PowerShell, use the full path to mongod:

```powershell
S:\mongodb\bin\mongod.exe
```

**That's it!** MongoDB will start.

You should see:
```
[initandlisten] Listening on 127.0.0.1:27017
[initandlisten] Waiting for connections
```

---

## Option 2: Add MongoDB to PATH (Permanent Fix) ⭐

This is a one-time setup so you can use `mongod` directly forever.

### Step 1: Open Environment Variables
1. Press **Windows Key**
2. Type: **Environment Variables**
3. Click: **Edit the system environment variables**

### Step 2: Edit PATH
1. Click **Environment Variables** button
2. Under "User variables", click **New**
   - Variable name: `Path` (if it doesn't exist)
   - Variable value: `S:\mongodb\bin`
3. Click **OK** three times

### Step 3: Verify
Close and reopen PowerShell, then try:
```powershell
mongod
```

It should work! ✅

---

## Option 3: Create a Batch File (Easy Launcher) 📁

Create a file named `start-mongodb.bat` in your Appdev folder:

```batch
@echo off
echo Starting MongoDB...
S:\mongodb\bin\mongod.exe
pause
```

Then you can double-click it to start MongoDB!

---

## Quick Start Commands

### Using Full Path (Works Now):
```powershell
# Terminal 1 - Start MongoDB
S:\mongodb\bin\mongod.exe

# Terminal 2 - Start Backend
cd "S:\appdev\rsanimesh.github.io-master\Appdev\backend"
npm run dev

# Browser - Open website
S:\appdev\rsanimesh.github.io-master\Appdev\index.html
```

### After Adding to PATH (Works Forever):
```powershell
# Terminal 1 - Start MongoDB
mongod

# Terminal 2 - Start Backend
cd "S:\appdev\rsanimesh.github.io-master\Appdev\backend"
npm run dev

# Browser - Open website
S:\appdev\rsanimesh.github.io-master\Appdev\index.html
```

---

## Test MongoDB Connection

### Test 1: Check mongod is Running
In a new PowerShell window:
```powershell
S:\mongodb\bin\mongo.exe
```

You should see:
```
MongoDB shell version...
connecting to: mongodb://127.0.0.1:27017/test
```

If you see this, MongoDB is working! ✅

### Test 2: View Your Database
```powershell
> use redstore
> db.products.count()
12  # or however many products you have
```

---

## MongoDB Installation Location

Based on your file explorer, MongoDB is installed here:
```
S:\mongodb\bin\
```

Files:
- `mongod.exe` - The server
- `mongo.exe` - The client/shell
- `mongos.exe` - Shard server
- `mongos.pdb` - Debug symbols

---

## Troubleshooting

### Still getting "mongod not recognized"?
```powershell
# Check if the file exists
Test-Path "S:\mongodb\bin\mongod.exe"

# If it returns True, the file exists. Try full path:
S:\mongodb\bin\mongod.exe

# If it returns False, MongoDB might be in a different location
# Search for mongod.exe:
Get-ChildItem -Path "S:\" -Name "mongod.exe" -Recurse
```

### mongod starts but immediately closes?
```powershell
# Add --dbpath to specify data directory
S:\mongodb\bin\mongod.exe --dbpath "S:\mongodb\data"

# Or create the data folder first:
mkdir "S:\mongodb\data"
```

### Port 27017 already in use?
```powershell
# Use different port:
S:\mongodb\bin\mongod.exe --port 27018

# Then update .env to use port 27018
# MONGODB_URI=mongodb://localhost:27018/redstore
```

---

## Recommended Setup

### Step 1: Add MongoDB to PATH (5 minutes)
- Follow "Option 2: Add MongoDB to PATH" above
- This is a one-time setup

### Step 2: Start MongoDB
```powershell
mongod
```

### Step 3: Start Backend (in another terminal)
```powershell
cd "S:\appdev\rsanimesh.github.io-master\Appdev\backend"
npm run dev
```

### Step 4: Open Website
```
file:///S:/appdev/rsanimesh.github.io-master/Appdev/index.html
```

---

## Quick Command Reference

```powershell
# Run MongoDB with full path (works now)
S:\mongodb\bin\mongod.exe

# Check if mongod is running
Get-Process mongod

# Kill mongod process
Stop-Process -Name mongod

# Check MongoDB version
S:\mongodb\bin\mongod.exe --version

# Connect to database
S:\mongodb\bin\mongo.exe

# Show all databases
> show dbs

# Use specific database
> use redstore

# Show all collections
> show collections

# Count products
> db.products.count()

# Exit mongo shell
> exit
```

---

## MongoDB Default Locations

**After adding to PATH, you can use just:**
```powershell
mongod
```

**Until then, use the full path:**
```powershell
S:\mongodb\bin\mongod.exe
```

---

## Next Steps

1. **Right Now:** Use `S:\mongodb\bin\mongod.exe` to start MongoDB
2. **Then:** Start backend with `npm run dev`
3. **Finally:** Open website and test
4. **Optional:** Add to PATH later for easier future use

---

**Ready to go!** 🚀

The MongoDB installation is there, you just need to use the full path or add it to Windows PATH.
