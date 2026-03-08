# RedStore Backend API

Complete Express.js + MongoDB backend for the RedStore e-commerce platform.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
```bash
cp .env.example .env
```

Edit `.env`:
```
MONGODB_URI=mongodb://localhost:27017/redstore
JWT_SECRET=your_super_secret_key_change_in_production
NODE_ENV=development
PORT=5000
```

### 3. MongoDB Setup (Choose One)

**Option A: Local MongoDB**
```bash
# Windows
mongod

# Mac/Linux
brew services start mongodb-community
```

**Option B: MongoDB Atlas (Cloud)**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/redstore
```

### 4. Run Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server runs at: `http://localhost:5000`

## 📡 API Endpoints

### Health Check
```
GET /api/health
```

### Products API

**Get All Products (Paginated)**
```
GET /api/products?page=1&limit=12&sortBy=newest&category=clothing

Response:
{
  "success": true,
  "count": 12,
  "total": 100,
  "page": 1,
  "pages": 9,
  "data": [...]
}
```

**Get Single Product**
```
GET /api/products/:id
```

**Create Product** (Admin Only)
```
POST /api/products
Header: Authorization: Bearer <token>
Body:
{
  "name": "Product Name",
  "price": 50.00,
  "description": "Description",
  "category": "clothing",
  "image": "url",
  "stock": 15
}
```

**Update Product** (Admin Only)
```
PUT /api/products/:id
Header: Authorization: Bearer <token>
Body: { ...fields to update }
```

**Delete Product** (Admin Only)
```
DELETE /api/products/:id
Header: Authorization: Bearer <token>
```

### User API

**Register**
```
POST /api/users/register
Body:
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "jwt_token",
  "user": { "id": "...", "username": "...", "email": "..." }
}
```

**Login**
```
POST /api/users/login
Body:
{
  "username": "john_doe",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "jwt_token",
  "user": { ... }
}
```

**Get Profile** (Protected)
```
GET /api/users/profile
Header: Authorization: Bearer <token>
```

### Orders API

**Create Order** (Protected)
```
POST /api/orders
Header: Authorization: Bearer <token>
Body:
{
  "items": [
    {
      "product": "product_id",
      "quantity": 2,
      "price": 50.00
    }
  ],
  "totalAmount": 100.00,
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "USA"
  },
  "paymentMethod": "credit_card"
}
```

**Get User Orders** (Protected)
```
GET /api/orders
Header: Authorization: Bearer <token>
```

**Get Order Details** (Protected)
```
GET /api/orders/:id
Header: Authorization: Bearer <token>
```

**Update Order Status** (Admin Only)
```
PUT /api/orders/:id
Header: Authorization: Bearer <token>
Body: { "status": "shipped" }

Valid statuses: pending, processing, shipped, delivered, cancelled
```

## 🔐 Authentication

All requests requiring authentication must include:
```
Authorization: Bearer <jwt_token>
```

The JWT token is received from login/register endpoints and valid for 30 days.

## 📊 Database Models

### Product Schema
```javascript
{
  name: String (required),
  description: String (required),
  price: Number (required, min: 0),
  category: String (enum: ['clothing', 'accessories', 'footwear']),
  image: String (required),
  rating: Number (0-5, default: 0),
  stock: Number (required, default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### User Schema
```javascript
{
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed, required),
  role: String (enum: ['user', 'admin'], default: 'user'),
  createdAt: Date
}
```

### Order Schema
```javascript
{
  user: ObjectId (ref: User, required),
  items: [
    {
      product: ObjectId (ref: Product),
      quantity: Number,
      price: Number
    }
  ],
  totalAmount: Number (required),
  status: String (enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String
  },
  paymentMethod: String (enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer']),
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Testing with Postman

### Import Collection
1. New → HTTP
2. Enter endpoint URL
3. Set method (GET, POST, etc.)
4. Add headers: `Authorization: Bearer <token>`
5. Add body for POST/PUT requests

### Example Flow
1. **Register**: POST `/api/users/register`
2. **Copy token** from response
3. **Create Order**: POST `/api/orders` with token in header
4. **Check Orders**: GET `/api/orders` with token

## 🛡️ Security Features

- ✅ Password hashing (bcrypt, 10 salt rounds)
- ✅ JWT authentication (30-day expiry)
- ✅ Role-based access control
- ✅ CORS enabled
- ✅ Input validation
- ✅ Error handling middleware
- ✅ Protected routes

## 📝 Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/redstore

# JWT
JWT_SECRET=your_super_secret_key_change_this

# Server
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
REACT_APP_API_URL=http://localhost:5000/api
```

## 🐛 Error Handling

All errors return standardized format:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not found
- `500` - Server error

## 📦 Project Structure

```
backend/
├── server.js                 # Express app entry point
├── package.json             # Dependencies
├── .env.example             # Environment template
├── middleware/
│   └── auth.js             # JWT & role verification
├── models/
│   ├── Product.js          # Product schema
│   ├── User.js             # User schema
│   └── Order.js            # Order schema
├── controllers/
│   ├── productController.js
│   ├── userController.js
│   └── orderController.js
└── routes/
    ├── products.js
    ├── users.js
    └── orders.js
```

## 🔄 Workflow

1. **Client** sends request to endpoint
2. **Middleware** validates JWT token (if protected)
3. **Controller** processes request
4. **Model** interacts with MongoDB
5. **Response** sent back to client

## 💡 Tips

- **Pagination**: Use `?page=1&limit=12` for large datasets
- **Filtering**: Add query parameters for sorting/filtering
- **Validation**: All inputs are validated before database operations
- **Performance**: Products indexed by category and ratings

## 🚀 Deployment

### Deploy to Heroku
```bash
heroku login
heroku create your-app-name
git push heroku main
heroku config:set JWT_SECRET=production_secret
heroku addons:create mongolab:sandbox
```

### Deploy to AWS/GCP
1. Create server instance
2. Install Node.js
3. Clone repository
4. Set environment variables
5. Run with PM2 for persistence

## 📚 Additional Resources

- [Express.js Docs](https://expressjs.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [JWT Auth](https://jwt.io/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)

## 🆘 Troubleshooting

**Connection refused**
- Check MongoDB is running
- Verify MONGODB_URI in .env

**JWT errors**
- Token expired? Get new one from login
- Invalid token? Check JWT_SECRET

**CORS errors**
- Backend and frontend URLs must be added to CORS whitelist
- Check Access-Control-Allow-Origin headers

---

Happy coding! 🎉
