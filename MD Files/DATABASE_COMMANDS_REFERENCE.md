# 🔍 Database Check - Quick Reference Card

## ⚡ One-Command Checks

### Check MongoDB is Running
```powershell
Get-NetTCPConnection -LocalPort 27017
```
✅ Should show connection on 127.0.0.1:27017

### Connect to MongoDB Terminal
```powershell
S:\mongodb\bin\mongo.exe
```

### Check Database Stats
```mongodb
use redstore
db.stats()
```

---

## 📊 Database Collections & Record Counts

| Collection | Count Command | Expected Data |
|-----------|---------------|--------------|
| **Products** | `db.products.countDocuments()` | 12 (after seed.js) |
| **Categories** | `db.categories.countDocuments()` | 3 (after seed.js) |
| **Users** | `db.users.countDocuments()` | Grows when you register |
| **Orders** | `db.orders.countDocuments()` | Grows when you checkout |

---

## 🛠️ Database Operations

### Seed Database (First Time Only)
```powershell
cd "S:\appdev\rsanimesh.github.io-master\Appdev\backend"
node seed.js
```

### View All Documents
```mongodb
# Products
db.products.find().pretty()

# Users (registered accounts)
db.users.find().pretty()

# Orders (completed purchases)
db.orders.find().pretty()

# Categories
db.categories.find().pretty()
```

### View Single Product
```mongodb
db.products.findOne({ name: "Red Printed T-Shirt" })
```

### Search by Price
```mongodb
db.products.find({ price: { $gt: 50 } }).pretty()  // Greater than 50
db.products.find({ price: { $lt: 100 } }).pretty() // Less than 100
```

### Count Specific Category
```mongodb
db.products.countDocuments({ category: "clothing" })
```

---

## 🔐 User Schema (What Gets Stored)

| Field | Type | Example |
|-------|------|---------|
| `username` | String | "testuser" |
| `email` | String | "test@example.com" |
| `password` | String | "[hashed]" (bcrypt) |
| `role` | String | "user" \| "admin" |
| `createdAt` | Date | 2026-03-08T18:22:54.000Z |

### Create Test User Manually
```mongodb
db.users.insertOne({
  username: "testuser",
  email: "test@example.com",
  password: "hashedpassword",
  role: "user",
  createdAt: new Date()
})
```

---

## 📦 Product Schema (What Gets Stored)

| Field | Type | Example |
|-------|------|---------|
| `name` | String | "Red Printed T-Shirt" |
| `description` | String | "High quality cotton..." |
| `price` | Number | 50.00 |
| `category` | String | "clothing" |
| `image` | String | "images/product-1.jpg" |
| `rating` | Number | 4.0 |
| `stock` | Number | 15 |
| `createdAt` | Date | 2026-03-08T18:22:54.000Z |

---

## 📋 Order Schema (What Gets Stored)

| Field | Type | Example |
|-------|------|---------|
| `user` | ObjectId | (Reference to Users) |
| `items` | Array | [{product: ObjectId, quantity: 2, price: 50}] |
| `totalAmount` | Number | 115.00 (with tax) |
| `status` | String | "pending" |
| `shippingAddress` | Object | {street, city, state, zip} |
| `paymentMethod` | String | "credit_card" |
| `createdAt` | Date | 2026-03-08T18:22:54.000Z |

### View Customer's Orders
```mongodb
# First find user ID
var userId = db.users.findOne({ username: "testuser" })._id

# Then find their orders
db.orders.find({ user: userId }).pretty()
```

---

## 🔄 Verify Full Stack Working

### Step 1: Check MongoDB
```
✅ MongoDB running: Get-NetTCPConnection -LocalPort 27017
✅ Database exists: use redstore → db.stats()
✅ Collections exist: show collections
```

### Step 2: Check Backend Connection
```
✅ Backend console should show:
   ✅ MongoDB Connected: localhost
   📊 Database: redstore
```

### Step 3: Check Frontend
```
✅ Browser console (F12) should show:
   ✅ Products fetched from backend: 12 items
```

### Step 4: Check API Endpoints

Use Postman or curl to test:

```powershell
# Get all products
curl http://localhost:5000/api/products

# Get product by ID
curl http://localhost:5000/api/products/1

# Get categories
curl http://localhost:5000/api/categories

# Health check
curl http://localhost:5000/api/health
```

---

## 🐛 Troubleshooting

### Products Count is 0
```
❌ Problem: db.products.countDocuments() returns 0
✅ Solution: Run node seed.js in backend folder
```

### Can't Connect to Database
```
❌ Problem: ❌ MongoDB Connection Error
✅ Solution: Start MongoDB with:
   S:\mongodb\bin\mongod.exe --dbpath "C:\data\db"
```

### Users Not Saving on Register
```
❌ Problem: Register works but db.users.countDocuments() stays 0
✅ Solution: 
   1. Check backend is running (npm run dev)
   2. Check MongoDB is connected (should show ✅ MongoDB Connected)
   3. Try registering again
```

### Orders Not Creating on Checkout
```
❌ Problem: Checkout works but db.orders.countDocuments() stays 0
✅ Solution:
   1. Must be logged in (check user token in localStorage)
   2. MongoDB must be running
   3. Backend must be running
   4. Check browser console (F12) for errors
```

---

## 📍 File Locations Reference

```
Backend Folder:
S:\appdev\rsanimesh.github.io-master\Appdev\backend\
├── server.js           ← Start backend here (npm run dev)
├── seed.js             ← Seed database (node seed.js)
├── .env                ← Database config
├── models/
│   ├── Product.js      ← Product schema
│   ├── User.js         ← User schema
│   ├── Order.js        ← Order schema
│   └── Category.js     ← Category schema
├── routes/
│   ├── products.js     ← Product API endpoints
│   ├── users.js        ← User API endpoints
│   ├── orders.js       ← Order API endpoints
│   └── categories.js   ← Category API endpoints
└── controllers/
    ├── productController.js
    ├── userController.js
    ├── orderController.js

Frontend Folder:
S:\appdev\rsanimesh.github.io-master\Appdev\
├── index.html          ← Home page
├── account.html        ← Register/Login
├── products.html       ← Products list
├── cart.html           ← Shopping cart
├── js/
│   ├── api.js          ← API service (connects to backend)
│   ├── auth.js         ← Authentication logic
│   ├── cart.js         ← Cart logic
│   └── cart-page.js    ← Cart display
└── data/products.json  ← Fallback products file
```

---

## 🎯 Common MongoDB Commands

```mongodb
# Show all databases
show databases

# Create/use database
use redstore

# Show all collections
show collections

# Count documents
db.products.countDocuments()
db.users.countDocuments()
db.orders.countDocuments()

# Find all documents
db.products.find()

# Find with pretty print
db.products.find().pretty()

# Find specific document
db.products.findOne({ name: "Red Printed T-Shirt" })

# Find with conditions
db.products.find({ category: "clothing" })
db.products.find({ price: { $gt: 50 } })

# Delete all documents (⚠️ USE WITH CARE)
db.products.deleteMany({})

# Drop entire collection
db.products.drop()

# Drop entire database
db.dropDatabase()

# Exit MongoDB
exit
```

---

## ✅ Success Indicators

You'll know everything is working when:

1. ✅ **MongoDB running:** `Get-NetTCPConnection -LocalPort 27017` shows connection
2. ✅ **Database seeded:** `db.products.countDocuments()` returns 12
3. ✅ **Backend connected:** Backend console shows "✅ MongoDB Connected"
4. ✅ **Frontend loaded:** Browser console shows "✅ Products fetched from backend"
5. ✅ **Can register:** `db.users.countDocuments()` increases after registration
6. ✅ **Can order:** `db.orders.countDocuments()` increases after checkout
7. ✅ **Receipt shows:** Order ID appears on receipt page

**If all 7 checkmarks are ✅, your database system is fully working!**
