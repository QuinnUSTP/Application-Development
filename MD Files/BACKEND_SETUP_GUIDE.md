# 🔧 Backend Setup Guide - RedStore

## 📋 Overview

Your backend is **Node.js + Express** with **MongoDB** database. All code is ready to use—just follow the setup steps.

---

## 🛠️ Tools & Technologies Used

### **Core Framework**
- **Express.js** (v4.18.2) - Web framework for building REST API
- **Node.js** - Runtime environment

### **Database**
- **MongoDB** - NoSQL database for storing products, users, orders
- **Mongoose** (v7.0.0) - ODM (Object Data Modeling) for MongoDB

### **Authentication & Security**
- **JWT (jsonwebtoken)** (v9.0.0) - Token-based authentication
- **bcryptjs** (v2.4.3) - Password hashing and encryption

### **API & Validation**
- **CORS** (v2.8.5) - Cross-Origin Resource Sharing (connects frontend to backend)
- **express-validator** (v7.0.0) - Input validation and sanitization

### **Development Tools**
- **nodemon** (v2.0.20) - Auto-restart server during development
- **dotenv** (v16.0.3) - Load environment variables from `.env` file
- **jest** (v29.0.0) - Testing framework (optional)

---

## 📦 Dependencies Breakdown

```json
{
  "express": "Web server framework",
  "cors": "Allow frontend to call backend API",
  "dotenv": "Manage secure config files",
  "mongoose": "Database connection & models",
  "bcryptjs": "Secure password hashing",
  "jsonwebtoken": "User authentication tokens",
  "express-validator": "Validate user inputs",
  "nodemon": "Auto-reload on file changes",
  "jest": "Run unit tests"
}
```

---

## 🚀 Step-by-Step Setup

### **Step 1: Prerequisites (Install If Needed)**

#### **Node.js & npm**
Check if installed:
```powershell
node --version
npm --version
```

If not installed:
- Download from https://nodejs.org/ (LTS version recommended)
- Install and restart PowerShell

#### **MongoDB**
Choose ONE option:

**Option A: Local MongoDB (Windows)**
```powershell
# Download from https://www.mongodb.com/try/download/community
# Run installer and follow prompts
# Then start MongoDB:
mongod
# Leave running in separate terminal
```

**Option B: MongoDB Atlas (Cloud - Easier)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/redstore`
5. Use in `.env` file

---

### **Step 2: Install Backend Dependencies**

Open PowerShell in your backend folder:

```powershell
cd s:\appdev\rsanimesh.github.io-master\Appdev\backend
npm install
```

Wait for installation to complete (30-60 seconds).

**What gets installed:**
- All packages from `package.json`
- Creates `node_modules/` folder
- Updates `package-lock.json`

---

### **Step 3: Setup Environment Variables**

Create `.env` file in backend folder:

```powershell
# Copy example file
Copy-Item .env.example .env
```

Open `.env` and configure:

```env
# Database Connection
MONGODB_URI=mongodb://localhost:27017/redstore
# OR if using MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/redstore

# Security
JWT_SECRET=your_super_secret_key_12345_change_this_in_production

# Server
NODE_ENV=development
PORT=5000
```

**Important:** Change `JWT_SECRET` to something random in production!

---

### **Step 4: Start the Backend Server**

**Development Mode** (with auto-reload):
```powershell
npm run dev
```

**Production Mode:**
```powershell
npm start
```

**Expected Output:**
```
[nodemon] starting `node server.js`
MongoDB Connected: localhost
Server is running on port 5000
API is running
```

Server is now ready at: **http://localhost:5000**

---

## 🧪 Test the Backend

### **Test 1: Health Check Endpoint**
```powershell
# In another PowerShell window:
Invoke-WebRequest http://localhost:5000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "API is running"
}
```

### **Test 2: Get All Products**
```powershell
Invoke-WebRequest http://localhost:5000/api/products
```

### **Test 3: Get User by ID**
```powershell
Invoke-WebRequest http://localhost:5000/api/users/1
```

---

## 📁 Backend File Structure

```
backend/
├── server.js                 # Main entry point
├── package.json             # Dependencies
├── .env                      # Configuration (CREATE THIS)
├── .env.example             # Example config
├── README.md                # API documentation
│
├── models/                   # Database schemas
│   ├── Product.js           # Product model
│   ├── User.js              # User model
│   └── Order.js             # Order model
│
├── controllers/              # Business logic
│   ├── productController.js  # Product operations
│   ├── userController.js     # User operations
│   └── orderController.js    # Order operations
│
├── routes/                   # API endpoints
│   ├── products.js          # GET, POST, PUT, DELETE /api/products
│   ├── users.js             # User endpoints
│   └── orders.js            # Order endpoints
│
└── middleware/               # Custom middleware
    ├── auth.js              # JWT authentication
    ├── errorHandler.js      # Error handling
    └── validation.js        # Input validation
```

---

## 🔌 Connect Frontend to Backend

Once backend is running, update `js/api.js`:

Change this:
```javascript
const baseUrl = process.env.NODE_ENV === 'production' 
  ? 'https://api.redstore.com' 
  : 'http://localhost:5000/api';
```

Or simply:
```javascript
const baseUrl = 'http://localhost:5000/api';
```

Now your frontend will fetch from the backend instead of static JSON files!

---

## 📡 API Endpoints Available

### **Products**
```
GET    /api/products                    # Get all products (paginated)
GET    /api/products/:id                # Get single product
POST   /api/products                    # Create product (admin)
PUT    /api/products/:id                # Update product (admin)
DELETE /api/products/:id                # Delete product (admin)
```

### **Users**
```
GET    /api/users/:id                   # Get user profile
POST   /api/users/register              # Register new user
POST   /api/users/login                 # User login
PUT    /api/users/:id                   # Update profile
```

### **Orders**
```
GET    /api/orders                      # Get user's orders
POST   /api/orders                      # Create new order
GET    /api/orders/:id                  # Get order details
PUT    /api/orders/:id                  # Update order status
```

---

## 🐛 Troubleshooting

### **"MongoDB Connected" but no data shows**
- MongoDB not running
- Wrong `MONGODB_URI` in `.env`
- Database has no data yet (need to seed data)

**Fix:**
```powershell
# Check if MongoDB is running
mongod
# Or check .env file has correct connection string
```

### **"EADDRINUSE: address already in use :::5000"**
- Port 5000 already in use (another process)

**Fix:**
```powershell
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### **"Cannot find module 'express'"**
- Dependencies not installed

**Fix:**
```powershell
npm install
```

### **CORS errors in browser console**
- Frontend trying to reach wrong backend URL

**Fix:**
- Ensure backend is running on port 5000
- Check frontend `js/api.js` baseUrl is `http://localhost:5000/api`
- Backend has CORS enabled (already in code)

---

## 📊 Database Models

### **Product Schema**
```javascript
{
  _id: ObjectId,
  name: String,
  price: Number,
  description: String,
  category: String,
  image: String,
  rating: Number,
  stock: Number,
  createdAt: Date
}
```

### **User Schema**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  phone: String,
  address: String,
  createdAt: Date
}
```

### **Order Schema**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  items: [
    {
      productId: ObjectId,
      quantity: Number,
      price: Number
    }
  ],
  total: Number,
  status: String,
  createdAt: Date
}
```

---

## 🔐 Authentication Flow

1. **User Registers**
   - POST `/api/users/register` with email/password
   - Password hashed with bcryptjs
   - User saved to MongoDB

2. **User Logs In**
   - POST `/api/users/login` with email/password
   - Password compared with stored hash
   - JWT token generated and sent back

3. **Protected Requests**
   - Include token in header: `Authorization: Bearer <token>`
   - Middleware verifies token
   - Request processed or rejected

---

## 📝 Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `MONGODB_URI` | Database connection | `mongodb://localhost:27017/redstore` |
| `JWT_SECRET` | Token signing key | `my_secret_key_12345` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | Server port | `5000` |

---

## ✅ Verification Checklist

- [ ] Node.js installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] MongoDB running (local or Atlas)
- [ ] `.env` file created and configured
- [ ] `npm install` completed
- [ ] `npm run dev` starts without errors
- [ ] Health check returns success
- [ ] Frontend can fetch from backend
- [ ] Products display with live data

---

## 🚀 Next Steps

1. **Seed Sample Data** (optional)
   - Add products to MongoDB collection
   - Or keep using static JSON files

2. **Connect Frontend to Backend**
   - Update `js/api.js` baseUrl
   - Test on index.html

3. **Test All Features**
   - View products
   - Search/filter
   - Add to cart
   - Checkout

4. **Deploy** (when ready)
   - Backend: Heroku, Railway, Render
   - Frontend: Netlify, Vercel, GitHub Pages
   - Database: MongoDB Atlas (free tier available)

---

## 📞 Quick Commands Reference

```powershell
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Start development server (with auto-reload)
npm run dev

# Start production server
npm start

# Run tests
npm test

# Stop server
Ctrl + C
```

---

## 💡 Tips for Success

1. **Keep MongoDB running** in a separate terminal
2. **Don't commit `.env`** file (already in `.gitignore`)
3. **Use MongoDB Atlas** if you don't want to install MongoDB locally
4. **Test endpoints** with Postman or browser before connecting frontend
5. **Check console logs** for debugging errors
6. **Backend ready now**—just follow the steps above!

Your backend is fully coded and ready to go! 🎉
