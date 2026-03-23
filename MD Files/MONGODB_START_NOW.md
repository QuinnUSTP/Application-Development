# ⚡ MongoDB - Run RIGHT NOW!

## The Issue
`mongod` command not found in PowerShell

## The Fix
Use the **full path** to mongod.exe:

```powershell
S:\mongodb\bin\mongod.exe
```

**That's it!** MongoDB will start.

---

## Visual Guide

### What You Need to Do:

```
Terminal 1 (First):
Run: S:\mongodb\bin\mongod.exe
Wait for: "Waiting for connections" message
Keep this terminal OPEN ✅

Terminal 2 (Second):
Run: cd "S:\appdev\rsanimesh.github.io-master\Appdev\backend"
Run: npm run dev
Keep this terminal OPEN ✅

Browser:
Open: file:///S:/appdev/rsanimesh.github.io-master/Appdev/index.html
Use your website! ✅
```

---

## Expected Output

When you run `S:\mongodb\bin\mongod.exe`, you should see:

```
MongoDB starting :
  by the MongoDB Team

[initandlisten] MongoDB 4.4.x or higher...
[initandlisten] listening on 127.0.0.1:27017
[initandlisten] Waiting for connections
```

**✅ That means MongoDB is working!**

---

## Copy-Paste These Commands

### Terminal 1 - Start MongoDB:
```powershell
S:\mongodb\bin\mongod.exe
```

### Terminal 2 - Start Backend:
```powershell
cd "S:\appdev\rsanimesh.github.io-master\Appdev\backend"
npm run dev
```

### Browser - Open Website:
```
file:///S:/appdev/rsanimesh.github.io-master/Appdev/index.html
```

---

## Permanent Fix (Optional)

Want to use just `mongod` instead of the full path forever?

See: **MONGODB_PATH_FIX.md** for steps to add MongoDB to Windows PATH

---

## Quick Troubleshooting

### MongoDB won't start?
```powershell
# Make sure the file exists:
Test-Path "S:\mongodb\bin\mongod.exe"

# If True: Use full path above
# If False: MongoDB is in different location
```

### How do I know it's working?
Look for this message:
```
[initandlisten] Waiting for connections
```

### How do I stop MongoDB?
Press **Ctrl + C** in the Terminal 1

---

## Next Steps

1. **Open Terminal 1**
2. **Paste:** `S:\mongodb\bin\mongod.exe`
3. **Wait for:** "Waiting for connections"
4. **Open Terminal 2**
5. **Paste:** `cd "S:\appdev\rsanimesh.github.io-master\Appdev\backend" && npm run dev`
6. **Open Browser**
7. **Paste:** `file:///S:/appdev/rsanimesh.github.io-master/Appdev/index.html`

**Done! 🎉**
