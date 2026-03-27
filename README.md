# RedStore E-Commerce Platform (Full Stack)

## 📋 Overview

This is a full-stack e-commerce platform with a static frontend (vanilla JS) and a Node/Express + MongoDB backend.

Key implementation details in this repo:
- ✅ **Database-backed cart** (requires login)
- ✅ **Cookie-based auth** (httpOnly cookie) for browser usage
- ✅ **Payment method selection** at checkout
- ✅ Currency formatting: **PHP (₱)**

Important: because auth is cookie-based, you **must open the frontend via http://localhost** (not `file:///`). Use the provided PowerShell start scripts.

- requirements.txt (project-style) - generated from package.json files
- This project is primarily Node.js + Express + MongoDB (backend in ./backend).
- The file lists top-level Node dependencies and devDependencies in a Python-like
- `package==version` format so it's easy to read or keep alongside other projects.

## Backend dependencies (from backend/package.json)
```
- bcryptjs==2.4.3
- cookie-parser==1.4.6
- cors==2.8.5
- dotenv==16.0.3
- express==4.18.2
- express-validator==7.0.0
- jsonwebtoken==9.0.0
- mongodb==7.1.0
- mongoose==7.0.0
```
## Backend devDependencies
- jest==29.0.0
- nodemon==2.0.20

## Notes
 - To install Node dependencies: run `npm install` in the project root and `npm install` inside `backend/`.
 - This is not a Python virtualenv requirements file; use it as a helpful manifest for tooling or for cross-team clarity.
 - MongoDB is required for running the backend server. This project expects a running MongoDB instance (or URI in .env).
 - If you want a machine-readable JSON list, consider `npm ls --prod --json` or `npm list --depth=0 --json`.

## Optional: Node and npm versions (if known) — you can add your local versions here:
```
Node==<your-node-version>
npm==<your-npm-version>
```

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
│   ├── cart.js               # Cart manager (loads from backend cart API)
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
- **Dynamic Product Loading**: Products load from backend API
- **Shopping Cart**: Fully functional cart stored in MongoDB (server-side)
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

## 🚀 Getting Started (Windows)

### 1) Start everything (recommended)

Run the full stack launcher (starts MongoDB + backend + a local static server for the frontend):

```powershell
./START_FULL_STACK.ps1
```

Then open:
- Frontend: `http://127.0.0.1:5500/index.html`
- Backend health: `http://127.0.0.1:5000/api/health`

### 2) Start frontend only

If your backend is already running, you can just serve the frontend:

```powershell
./START_FRONTEND.ps1
```

### ⚠️ Do NOT open via file://

Avoid double-clicking `index.html` (which opens `file:///...`). Cookie-based login won’t persist across pages on `file:///`.

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

## 🔄 API Notes

The frontend is configured to use the backend by default via `js/api.js`:

- `const backendUrl = 'http://localhost:5000/api'`

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

### Backend (source of truth)
- Cart stored in MongoDB and tied to the logged-in user
- Orders stored in MongoDB
- Shipping address stored in MongoDB (`/api/users/address`)

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

**Login seems to work but you look logged out on another page?**
- Make sure you opened the site via `http://127.0.0.1:5500/index.html` (use `START_FRONTEND.ps1`)
- Don’t mix `file:///` with `http://127.0.0.1:5500`

**API calls failing?**
- Ensure backend is running on port 5000
- Check CORS settings in `server.js`

**Products not loading?**
- Verify `data/products.json` exists
- Check file paths are correct

## 📚 Next Steps

1. Add a real payment gateway integration (GCash/Stripe/etc.)
2. Improve address UX (force entry before checkout)
3. Add end-to-end browser tests (Playwright)

## 📄 License

This project is open source and available for modification.

## 👨‍💻 Author

Built with ❤️ for a scalable, database-ready e-commerce platform.

---

**Questions?** Check the backend `README.md` or review the inline code comments!
