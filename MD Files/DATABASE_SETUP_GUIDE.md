# RedStore E-Commerce with Database Integration - Complete Setup Guide

## Overview
This guide walks you through setting up and running the RedStore e-commerce website with full MongoDB database integration, user authentication, shopping cart, and order management.

---

## Prerequisites

### Software Required
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (Community Edition) - [Download](https://www.mongodb.com/try/download/community)
- **Git** (optional, for version control)
- **VS Code** (optional, code editor)

### Verify Installation
```powershell
node --version
npm --version
mongod --version
```

---

## Part 1: Database Setup

### 1.1 Start MongoDB
Open a terminal and start MongoDB server:

```powershell
# Windows - if installed globally
mongod

# Or if MongoDB is installed as a service, it should start automatically
```

You should see:
```
[initandlisten] Listening on 127.0.0.1:27017
```

**Keep this terminal open!** MongoDB needs to keep running.

### 1.2 Verify MongoDB Connection
Open a new terminal and test:

```powershell
mongo
```

If successful, you'll enter the MongoDB shell. Type `exit` to quit.

---

## Part 2: Backend Setup

### 2.1 Navigate to Backend Directory
```powershell
cd "s:\appdev\rsanimesh.github.io-master\Appdev\backend"
```

### 2.2 Install Dependencies
```powershell
npm install
```

This installs all required packages listed in `package.json`:
- express (web framework)
- mongoose (MongoDB driver)
- jsonwebtoken (for authentication)
- bcryptjs (for password hashing)
- cors (for cross-origin requests)
- dotenv (for environment variables)

### 2.3 Verify .env Configuration
Open `.env` file and check:
```
MONGODB_URI=mongodb://localhost:27017/redstore
JWT_SECRET=sk_dev_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
PORT=5000
NODE_ENV=development
```

**Important:** Keep the MongoDB URI as is since MongoDB is running locally.

### 2.4 Seed Database (Initialize Products)
Run the seed script to populate initial products and categories:

```powershell
node seed.js
```

You should see:
```
✅ MongoDB Connected: localhost
📦 Categories seeded successfully
✅ Products seeded successfully
```

### 2.5 Start Backend Server
```powershell
npm run dev
```

Or use the standard start:
```powershell
npm start
```

You should see:
```
✅ MongoDB Connected: localhost
📊 Database: redstore
Server is running on port 5000
```

**Keep this terminal open!** The backend server needs to keep running.

---

## Part 3: Frontend Setup

### 3.1 Open Frontend in Browser
The frontend is already set up. Just open a browser and navigate to:
```
file:///s:/appdev/rsanimesh.github.io-master/Appdev/index.html
```

Or better, serve it locally using VS Code's Live Server extension.

### 3.2 Verify Backend Connection
When the page loads, check the browser console (F12):
```
✅ Backend API is available at http://localhost:5000/api
```

If you see a warning about backend not being available, make sure MongoDB and the backend server are both running.

---

## Testing the Application

### User Registration & Login

1. **Navigate to Account Page**
   - Click "Account" in the navbar

2. **Register New User**
   - Click "Register" tab
   - Fill in: Username, Email, Password (min 6 characters)
   - Click "Register"
   - You'll be logged in automatically and redirected to home

3. **Login**
   - Click "Login" tab
   - Enter Username and Password
   - Click "Login"

### Shopping Experience

1. **Browse Products**
   - Click "Products" in navbar
   - See all products from database
   - Sort by price, rating, or newest
   - Pagination works with 12 products per page

2. **View Product Details**
   - Click on any product
   - See full details from database
   - Adjust quantity
   - Click "Add to Cart"

3. **Shopping Cart**
   - Click cart icon in navbar
   - See all cart items
   - Change quantities
   - Remove items
   - See subtotal, tax (15%), and total

4. **Checkout**
   - Must be logged in to checkout
   - Click "Proceed to Checkout"
   - Order is saved to database
   - See order receipt with details
   - Cart is automatically cleared

5. **View Order Receipt**
   - After checkout, receipt page displays
   - Shows order ID, items, prices, totals
   - Print receipt option available

---

## Database Models

### User
```javascript
{
  username: String (unique, 3-30 characters),
  email: String (unique, valid email),
  password: String (hashed, min 6 characters),
  role: String ('user' or 'admin'),
  createdAt: Date
}
```

### Product
```javascript
{
  name: String,
  description: String,
  price: Number,
  category: String ('clothing', 'accessories', 'footwear'),
  image: String (URL/path),
  rating: Number (0-5),
  stock: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Order
```javascript
{
  user: ObjectId (reference to User),
  items: [
    {
      product: ObjectId (reference to Product),
      quantity: Number,
      price: Number
    }
  ],
  totalAmount: Number,
  status: String ('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
  shippingAddress: {
    street, city, state, zip, country
  },
  paymentMethod: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Endpoints

### Products
- `GET /api/products` - Get all products with filters
  - Query params: `sortBy`, `category`, `page`, `limit`
- `GET /api/products/:id` - Get single product

### Users (Authentication)
- `POST /api/users/register` - Register new user
  - Body: `{ username, email, password }`
- `POST /api/users/login` - Login user
  - Body: `{ username, password }`
- `GET /api/users/profile` - Get current user profile (requires auth)

### Orders (Requires Authentication)
- `POST /api/orders` - Create new order
  - Body: `{ items, totalAmount, shippingAddress, paymentMethod }`
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get specific order

### Health
- `GET /api/health` - Check if API is running

---

## File Structure

```
frontend/
├── index.html              (Homepage)
├── products.html           (Products listing)
├── products-details.html   (Single product page)
├── cart.html               (Shopping cart)
├── account.html            (Login/Register)
├── receipt.html            (Order receipt)
├── style.css               (Main styles)
└── js/
    ├── api.js              (API service with auth)
    ├── cart.js             (Cart management)
    ├── ui-utils.js         (UI utilities)
    ├── auth.js             (Authentication)
    ├── products.js         (Products page logic)
    ├── product-details.js  (Product details logic)
    ├── cart-page.js        (Cart page logic)
    ├── receipt.js          (Receipt page logic)
    └── index.js            (Homepage logic)

backend/
├── server.js               (Express server)
├── seed.js                 (Database seeding)
├── .env                    (Configuration)
├── package.json            (Dependencies)
├── models/
│   ├── User.js             (User schema)
│   ├── Product.js          (Product schema)
│   ├── Order.js            (Order schema)
│   └── Category.js         (Category schema)
├── controllers/
│   ├── userController.js   (Auth logic)
│   ├── productController.js
│   ├── orderController.js
│   └── categoryController.js
├── routes/
│   ├── users.js
│   ├── products.js
│   ├── orders.js
│   └── categories.js
└── middleware/
    └── auth.js             (JWT verification)
```

---

## Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"
**Solution:** 
- Make sure MongoDB server is running
- Run `mongod` in a terminal
- Check that port 27017 is not blocked

### Issue: "Backend not available" in console
**Solution:**
- Restart the backend server: `npm run dev`
- Make sure MongoDB is running
- Check that port 5000 is not in use

### Issue: Products not loading
**Solution:**
- Seed the database: `node seed.js`
- Check browser console for errors (F12)
- Verify backend is running and MongoDB is connected

### Issue: Cannot login/register
**Solution:**
- Check that backend server is running
- Open browser console (F12) to see error details
- Verify user data is being saved by checking MongoDB:
  ```powershell
  mongo
  > use redstore
  > db.users.find()
  ```

### Issue: Checkout fails
**Solution:**
- Must be logged in first
- Check that order data is valid
- Verify product IDs match what's in the database
- Check browser console for specific error

---

## Performance Tips

1. **Pagination:** Products load 12 per page for better performance
2. **Lazy Loading:** Images load as needed
3. **Caching:** Local storage caches cart and user session
4. **Indexing:** MongoDB creates indexes on frequently queried fields

---

## Security Notes

1. **Password Hashing:** All passwords are hashed with bcryptjs before storage
2. **JWT Tokens:** Tokens expire in 30 days (configurable)
3. **CORS:** Configured to allow requests from frontend
4. **Input Validation:** All inputs validated on both frontend and backend
5. **Authorization:** Orders can only be accessed by the user who created them

---

## Next Steps (Future Enhancements)

- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] Email notifications for orders
- [ ] Product reviews and ratings
- [ ] Wishlist feature
- [ ] Coupon/discount codes
- [ ] Admin dashboard
- [ ] Analytics and reporting
- [ ] Search functionality
- [ ] Product filters and categories
- [ ] User profile management
- [ ] Order tracking
- [ ] Push notifications

---

## Support & Documentation

- **Express.js:** https://expressjs.com/
- **Mongoose:** https://mongoosejs.com/
- **MongoDB:** https://docs.mongodb.com/
- **JWT:** https://jwt.io/
- **Fetch API:** https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API

---

**Last Updated:** March 8, 2026

For issues or questions, check the browser console (F12) for detailed error messages.
