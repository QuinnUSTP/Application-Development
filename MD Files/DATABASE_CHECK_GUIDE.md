# 🗄️ How to Check Your Database System

## 1️⃣ Check MongoDB Connection Status

### Via Backend Console
When you run `npm run dev`, you should see:
```
✅ MongoDB Connected: localhost
📊 Database: redstore
```

If you see this, MongoDB is connected! ✅

### Via MongoDB Terminal
Open a new PowerShell and run:
```powershell
S:\mongodb\bin\mongo.exe
```

You should see:
```
connecting to: mongodb://127.0.0.1:27017/?directConnection=true
```

Then list databases:
```
show databases
```

You should see your `redstore` database listed.

---

## 2️⃣ Check Collections (Tables)

In MongoDB terminal, use your database:
```
use redstore
```

List all collections:
```
show collections
```

You should see:
```
categories
orders
products
users
```

---

## 3️⃣ Seed Sample Data Into Database

### First Time Setup - Populate Products
Run this command in the backend folder:
```powershell
cd "S:\appdev\rsanimesh.github.io-master\Appdev\backend"
node seed.js
```

You should see:
```
✅ Database seeded successfully!
- Categories: 3 added
- Products: 12 added
```

### Check Seeds Were Added
In MongoDB terminal:
```
use redstore
db.products.count()     // Should show: 12
db.categories.count()   // Should show: 3
db.users.count()        // Should show: 0 (empty until you register)
```

---

## 4️⃣ View Your Database Data

### See All Products
In MongoDB terminal:
```
db.products.find().pretty()
```

Output example:
```json
{
  "_id": ObjectId("65a1b2c3d4e5f6g7h8i9j0k1"),
  "name": "Red Printed T-Shirt",
  "price": 50,
  "description": "High quality cotton t-shirt with red print",
  "category": "clothing",
  "stock": 15,
  "rating": 4
}
```

### Count Records
```
db.products.countDocuments()      // Count products
db.users.countDocuments()         // Count registered users
db.orders.countDocuments()        // Count placed orders
db.categories.countDocuments()    // Count categories
```

### Search Specific Product
```
db.products.findOne({ name: "Red Printed T-Shirt" })
```

---

## 5️⃣ Database Schema Overview

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String,      // e.g., "testuser"
  email: String,         // e.g., "test@example.com"
  password: String,      // Hashed with bcrypt
  role: String,          // "user" or "admin"
  createdAt: Date,
  updatedAt: Date
}
```

### Products Collection
```javascript
{
  _id: ObjectId,
  name: String,          // e.g., "Red Printed T-Shirt"
  description: String,
  price: Number,         // e.g., 50.00
  category: String,      // e.g., "clothing"
  image: String,         // Path to image
  rating: Number,        // 1-5
  stock: Number,         // Quantity available
  createdAt: Date
}
```

### Orders Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId,        // Reference to Users collection
  items: [
    {
      product: ObjectId,
      quantity: Number,
      price: Number
    }
  ],
  totalAmount: Number,
  status: String,        // "pending", "shipped", etc.
  shippingAddress: String,
  paymentMethod: String,
  createdAt: Date
}
```

### Categories Collection
```javascript
{
  _id: ObjectId,
  name: String,          // e.g., "Clothing"
  description: String,
  image: String
}
```

---

## 6️⃣ Check via Frontend Console

### Browser Developer Tools
1. Open your website: `file:///S:/appdev/rsanimesh.github.io-master/Appdev/index.html`
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. You should see messages like:

```
✅ Products fetched from backend: 12 items
```

If you see this, the database is working! ✅

---

## 7️⃣ API Testing - Check Data Routes

### Get All Products
```
GET http://localhost:5000/api/products
```

### Get Single Product
```
GET http://localhost:5000/api/products/1
```

### Get User Profile (Requires Login Token)
```
GET http://localhost:5000/api/users/profile
```

### Get User Orders
```
GET http://localhost:5000/api/orders/my-orders
```

Use **Postman** or **Thunder Client** (VS Code extension) to test these.

---

## 8️⃣ Common Database Issues & Fixes

### Issue: "MongoDB not running"
```
❌ MongoDB Connection Error: connect ECONNREFUSED
```

**Fix:** Start MongoDB
```powershell
S:\mongodb\bin\mongod.exe --dbpath "C:\data\db"
```

### Issue: "Cannot find data directory"
```
❌ Data directory \data\db not found
```

**Fix:** Create the directory
```powershell
New-Item -ItemType Directory -Path "C:\data\db" -Force
```

### Issue: "No products showing"

**Possible causes:**
1. MongoDB not running → Start it with command above
2. Database not seeded → Run `node seed.js`
3. Backend not running → Run `npm run dev` in backend folder

**Fix all at once:**
1. Start MongoDB: `S:\mongodb\bin\mongod.exe --dbpath "C:\data\db"`
2. In new terminal, seed database: `node seed.js`
3. Start backend: `npm run dev`
4. Refresh browser

---

## 9️⃣ Database File Locations

| Item | Location |
|------|----------|
| **MongoDB Installation** | `S:\mongodb\bin\` |
| **MongoDB Data** | `C:\data\db\` |
| **Backend Code** | `S:\appdev\rsanimesh.github.io-master\Appdev\backend\` |
| **Models** | `backend\models\` |
| **Database Configuration** | `backend\.env` |
| **Seed File** | `backend\seed.js` |

---

## 🔟 Quick Test Steps

### 1. Verify MongoDB Running
```powershell
Get-NetTCPConnection -LocalPort 27017
# Should show connection on 127.0.0.1:27017
```

### 2. Seed Database
```powershell
cd "S:\appdev\rsanimesh.github.io-master\Appdev\backend"
node seed.js
```

### 3. Start Backend
```powershell
npm run dev
# Should show: ✅ MongoDB Connected: localhost
```

### 4. Open Website
```
file:///S:/appdev/rsanimesh.github.io-master/Appdev/index.html
```

### 5. Register User (Creates User in Database)
- Go to Account → Register
- Username: `testuser`
- Email: `test@example.com`
- Password: `password123`
- Click Register

### 6. Verify in MongoDB
```
use redstore
db.users.find()
# Should show your registered user
```

---

## Summary

✅ **Working Database System:**
- MongoDB running on localhost:27017
- Connected to `redstore` database
- 4 collections: products, users, orders, categories
- Backend API available at localhost:5000
- Frontend fetching from backend API
- Fallback to JSON if backend unavailable

🎯 **To Check Everything is Working:**
1. See "✅ MongoDB Connected" in backend console
2. See "✅ Products fetched from backend" in browser console
3. Register user and see it in MongoDB
4. Create order and see it in MongoDB orders collection
