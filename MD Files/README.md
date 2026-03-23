# RedStore E-Commerce Platform - Database Ready Architecture

## 📋 Overview

This is a fully functional e-commerce platform built with a **clean, database-ready architecture**. The frontend is 100% functional with dynamic data loading, and the backend structure is ready for database integration using MongoDB and Express.js.

## 🏗️ Project Structure

```
Appdev/
├── index.html                 # Homepage
├── products.html              # Products listing page
├── cart.html                  # Shopping cart
├── account.html               # Login/Registration
├── products-details.html      # Product details
├── style.css                  # Global styles
├── js/                        # Frontend JavaScript modules
│   ├── api.js                # API service layer (handles all backend calls)
│   ├── cart.js               # Cart management with localStorage
│   ├── ui-utils.js           # UI utilities (formatting, notifications)
│   ├── index.js              # Homepage logic
│   ├── products.js           # Products page logic
│   └── cart-page.js          # Cart page logic
├── data/                      # Static data (can be replaced with API calls)
│   ├── products.json         # Products data
│   └── categories.json       # Categories data
├── backend/                   # Node.js backend (ready for implementation)
│   ├── package.json          # Dependencies
│   ├── server.js             # Express server entry point
│   ├── .env.example          # Environment variables template
│   ├── middleware/
│   │   └── auth.js           # JWT authentication middleware
│   ├── models/
│   │   ├── Product.js        # Product schema
│   │   ├── User.js           # User schema
│   │   └── Order.js          # Order schema
│   ├── controllers/
│   │   ├── productController.js
│   │   ├── userController.js
│   │   └── orderController.js
│   └── routes/
│       ├── products.js
│       ├── users.js
│       └── orders.js
└── images/                    # Asset images
```

## ✨ Frontend Features (Fully Functional)

### ✅ Currently Working
- **Dynamic Product Loading**: Products load from `data/products.json` 
- **Shopping Cart**: Fully functional cart with localStorage persistence
- **Add to Cart**: Click any "Add to Cart" button to add items
- **Cart Management**: Update quantities, remove items, automatic total calculation
- **Product Sorting**: Sort by price (ascending/descending), rating, newest
- **Pagination**: Browse products across multiple pages
- **Notifications**: Visual feedback for user actions
- **Responsive Design**: Works on mobile and desktop
- **Cart Counter**: Shows item count in navbar

### 🎯 User Actions
1. Click "Explore Now" to browse products
2. Sort products using the dropdown
3. Click "Add to Cart" to add items to your cart
4. View cart at any time
5. Update quantities or remove items from cart
6. See real-time totals with tax calculation

## 🔧 Backend Architecture (Ready to Connect)

### Models
- **Product**: Name, price, category, image, rating, stock
- **User**: Username, email, password (hashed), role
- **Order**: User ID, items, total amount, status, shipping address

### API Endpoints (Ready to Implement)

#### Products
- `GET /api/products` - Get all products with filtering
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

#### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (protected)

#### Orders
- `POST /api/orders` - Create order (protected)
- `GET /api/orders` - Get user's orders (protected)
- `GET /api/orders/:id` - Get order details (protected)
- `PUT /api/orders/:id` - Update order status (admin)

## 🚀 Getting Started

### Frontend (Works Immediately)
1. Open `index.html` in a web browser
2. All features work with the static JSON data
3. Cart persists in browser localStorage

### Backend Setup (MongoDB + Express)

#### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)

#### Installation
```bash
cd backend
npm install
```

#### Configuration
1. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

2. Update `.env` with your MongoDB URI:
```
MONGODB_URI=mongodb://localhost:27017/redstore
JWT_SECRET=your_super_secret_key
NODE_ENV=development
PORT=5000
```

#### Run Backend
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will run at `http://localhost:5000`

## 🔄 Switching to Live API

The frontend is already built to work with a real API. Just update the `baseUrl` in `js/api.js`:

```javascript
// Change from empty string (uses local JSON)
const apiService = new APIService('http://localhost:5000/api');
```

## 📊 Database Schema

### Products Collection
```json
{
  "id": 1,
  "name": "Red Printed T-Shirt",
  "price": 50.00,
  "image": "images/product-1.jpg",
  "rating": 4,
  "category": "clothing",
  "description": "Comfortable red printed t-shirt",
  "stock": 15,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Users Collection
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "hashed_password",
  "role": "user",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Orders Collection
```json
{
  "user": "ObjectId",
  "items": [
    {
      "product": "ObjectId",
      "quantity": 2,
      "price": 50.00
    }
  ],
  "totalAmount": 100.00,
  "status": "pending",
  "shippingAddress": {...},
  "paymentMethod": "credit_card"
}
```

## 🛡️ Security Features (Implemented)

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Role-based authorization (user/admin)
- ✅ Protected routes
- ✅ Input validation

## 📝 API Service Layer (Frontend)

All API calls go through `js/api.js` for easy switching between static data and live API:

```javascript
// Works with both static JSON and live API
const products = await apiService.getProducts();
const product = await apiService.getProduct(productId);
const result = await apiService.createOrder(orderData);
```

## 💾 Data Persistence

### Frontend
- Cart data stored in **localStorage**
- Survives page refresh
- Access via `cartManager.getItems()`

### Backend (When Connected)
- All data stored in **MongoDB**
- Automatic timestamps
- Indexed queries for performance

## 🧪 Testing

### Frontend Features
1. ✅ Add items to cart
2. ✅ Remove items from cart
3. ✅ Update quantities
4. ✅ See price totals
5. ✅ Sort products
6. ✅ Browse pages
7. ✅ Notifications work

### Backend Endpoints (Use Postman)
```bash
# Health check
GET http://localhost:5000/api/health

# Get products
GET http://localhost:5000/api/products

# Create order (requires auth token)
POST http://localhost:5000/api/orders
Headers: { "Authorization": "Bearer <token>" }
Body: { "items": [...], "totalAmount": 100, ... }
```

## 📦 Dependencies

### Frontend
- Pure JavaScript (no framework required!)
- Font Awesome (icons)
- Google Fonts (Poppins)

### Backend
- Express.js - Web framework
- MongoDB + Mongoose - Database
- bcryptjs - Password hashing
- jsonwebtoken - Authentication
- cors - Cross-origin support
- dotenv - Environment variables

## 🎨 Customization

### Adding New Products
Edit `data/products.json`:
```json
{
  "id": 7,
  "name": "New Product",
  "price": 99.99,
  "image": "images/product-7.jpg",
  "rating": 4.5,
  "category": "clothing",
  "description": "Product description",
  "stock": 20
}
```

### Styling
- Global styles in `style.css`
- CSS variables for colors in `:root`
- Responsive grid system (col-2, col-3, col-4)

## 🚨 Common Issues & Solutions

**Cart not showing items?**
- Check browser console for errors
- Clear localStorage: `localStorage.clear()`

**API calls failing?**
- Ensure backend is running on port 5000
- Check CORS settings in `server.js`

**Products not loading?**
- Verify `data/products.json` exists
- Check file paths are correct

## 📚 Next Steps

1. **Connect to Live API**: Update `api.js` baseUrl to your backend
2. **Implement Checkout**: Create `checkout.html` page
3. **Add Payment**: Integrate Stripe/PayPal
4. **Deploy**: Use Heroku for backend, Netlify for frontend
5. **Admin Panel**: Create admin dashboard for product management

## 📄 License

This project is open source and available for modification.

## 👨‍💻 Author

Built with ❤️ for a scalable, database-ready e-commerce platform.

---

**Questions?** Check the backend `README.md` or review the inline code comments!
