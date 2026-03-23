# 🗄️ Database System - Visual Overview

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Browser)                       │
│  index.html, products.html, cart.html, account.html         │
│                                                              │
│  JavaScript Files:                                          │
│  ├─ api.js (connects to backend API)                       │
│  ├─ auth.js (handles login/register)                       │
│  ├─ cart.js (shopping cart logic)                          │
│  └─ cart-page.js (displays cart UI)                        │
└──────────────────────────────────────────────────────────────┘
                           ↕️ HTTP/JSON
                    (localhost:5000)
┌──────────────────────────────────────────────────────────────┐
│              BACKEND (Node.js + Express.js)                  │
│              server.js (port 5000)                           │
│                                                              │
│  API Routes:                                                │
│  ├─ /api/products     (Get all products, filters)          │
│  ├─ /api/users        (Register, Login, Profile)           │
│  ├─ /api/orders       (Create order, Get orders)           │
│  └─ /api/categories   (Get categories)                     │
│                                                              │
│  Controllers:                                               │
│  ├─ productController.js                                   │
│  ├─ userController.js                                      │
│  ├─ orderController.js                                     │
│  └─ Others...                                              │
└──────────────────────────────────────────────────────────────┘
                           ↕️ MongoDB Protocol
                    (localhost:27017)
┌──────────────────────────────────────────────────────────────┐
│                  MONGODB DATABASE                            │
│            (localhost:27017 | redstore)                     │
│                                                              │
│  Collections (Tables):                                      │
│  ├─ products       (12 items after seed.js)                │
│  │  ├─ name, description, price                            │
│  │  ├─ category, image, rating, stock                      │
│  │  └─ createdAt, updatedAt                                │
│  │                                                          │
│  ├─ users          (grow as users register)                │
│  │  ├─ username, email, password (hashed)                  │
│  │  ├─ role, createdAt, updatedAt                          │
│  │  └─ _id (ObjectId for reference)                        │
│  │                                                          │
│  ├─ orders         (grow as users checkout)                │
│  │  ├─ user (ref to Users collection)                      │
│  │  ├─ items (array: product, quantity, price)             │
│  │  ├─ totalAmount, status                                 │
│  │  ├─ shippingAddress, paymentMethod                      │
│  │  └─ createdAt                                           │
│  │                                                          │
│  └─ categories     (3 items after seed.js)                 │
│     ├─ name, description, image                            │
│     └─ _id (ObjectId)                                      │
│                                                              │
│  Data Storage:                                              │
│  └─ C:\data\db\ (MongoDB data files)                       │
└──────────────────────────────────────────────────────────────┘
```

---

## Data Flow Example: User Registration

```
1. USER ENTERS DATA
   ┌──────────────────┐
   │ Username: john   │
   │ Email: john@...  │
   │ Password: 123456 │
   └──────────────────┘
            ↓
2. FRONTEND SENDS TO API
   POST http://localhost:5000/api/users/register
   Content-Type: application/json
   {
     "username": "john",
     "email": "john@...",
     "password": "123456"
   }
            ↓
3. BACKEND PROCESSES
   ✓ Validates email format
   ✓ Checks username not taken
   ✓ Hashes password with bcrypt
   ✓ Creates new user document
            ↓
4. SAVES TO DATABASE
   MongoDB inserts into users collection:
   {
     _id: ObjectId("..."),
     username: "john",
     email: "john@...",
     password: "$2a$10$..." (hashed),
     role: "user",
     createdAt: 2026-03-08T18:22:54.000Z
   }
            ↓
5. FRONTEND RECEIVES RESPONSE
   {
     "success": true,
     "message": "Registration successful!"
   }
            ↓
6. USER SEES SUCCESS MESSAGE ✅
```

---

## Data Flow Example: Product Purchase

```
1. USER ADDS TO CART
   Product: "Red T-Shirt" (ID: 1)
   Quantity: 2
   └─ Stored in browser localStorage (no backend yet)
            ↓
2. USER CLICKS CHECKOUT
   ├─ Check if user is logged in
   └─ Verify MongoDB connection
            ↓
3. FRONTEND SENDS ORDER TO BACKEND
   POST http://localhost:5000/api/orders
   {
     "items": [
       {
         "productId": 1,
         "quantity": 2
       }
     ],
     "totalAmount": 115.00,
     "shippingAddress": "123 Main St..."
   }
   Header: Authorization: Bearer [JWT_TOKEN]
            ↓
4. BACKEND PROCESSES ORDER
   ✓ Validates JWT token
   ✓ Checks product stock (need 2 of product 1)
   ✓ Reduces product stock by 2
   ✓ Creates order document
            ↓
5. SAVES TO DATABASES
   a) Reduces product stock in products collection:
      db.products.updateOne(
        { _id: ObjectId("...") },
        { $set: { stock: 13 } }  // Was 15, now 13
      )
   
   b) Creates new order in orders collection:
      {
        _id: ObjectId("123"),
        user: ObjectId("user_id"),
        items: [
          {
            product: ObjectId("product_id"),
            quantity: 2,
            price: 50
          }
        ],
        totalAmount: 115.00,
        status: "pending",
        createdAt: 2026-03-08T18:23:00.000Z
      }
            ↓
6. BACKEND RETURNS ORDER ID
   {
     "success": true,
     "orderId": "123",
     "totalAmount": 115.00
   }
            ↓
7. FRONTEND SHOWS RECEIPT
   ✓ Clears shopping cart
   ✓ Redirects to receipt.html
   ✓ Displays Order ID: 123 ✅
```

---

## Database Schema Relationships

```
┌────────────────┐
│     USERS      │  (registered accounts)
├────────────────┤
│ _id            │◄─┐
│ username       │  │
│ email          │  │
│ password       │  │
│ role           │  │
│ createdAt      │  │
└────────────────┘  │
                    │ One User has many Orders
                    │ (Referenced by user field in Order)
                    │
┌────────────────┐  │
│    ORDERS      │  │
├────────────────┤  │
│ _id            │  │
│ user ──────────┼──┘ (ObjectId pointing to User)
│ items[]        │
│ totalAmount    │
│ status         │
│ createdAt      │
└────────────────┘
       │
       │ Each order item references a Product
       │
       └─► product (ObjectId) ─────┐
                                   │
           ┌────────────────┐      │
           │   PRODUCTS     │      │
           ├────────────────┤      │
           │ _id ◄──────────┼──────┘
           │ name           │
           │ price          │
           │ description    │
           │ category       │
           │ stock          │
           │ image          │
           │ rating         │
           │ createdAt      │
           └────────────────┘
                  ▲
                  │ Category filter
                  │
           ┌──────────────────┐
           │   CATEGORIES     │
           ├──────────────────┤
           │ _id              │
           │ name             │
           │ description      │
           │ image            │
           └──────────────────┘
```

---

## Collection Sizes Over Time

```
INITIAL STATE (After seed.js)
┌───────────────┐
│    Products   │ ████████████ 12 items
│   Categories  │ ███ 3 items
│     Users     │ (empty)
│    Orders     │ (empty)
└───────────────┘

AFTER 1 USER REGISTERS
┌───────────────┐
│    Products   │ ████████████ 12 items
│   Categories  │ ███ 3 items
│     Users     │ ▮ 1 user
│    Orders     │ (empty)
└───────────────┘

AFTER USER MAKES 3 PURCHASES
┌───────────────┐
│    Products   │ ████████████ 12 items (stock decreased)
│   Categories  │ ███ 3 items
│     Users     │ ▮ 1 user
│    Orders     │ ███ 3 orders
└───────────────┘

AFTER 100 USERS REGISTER & BUY
┌───────────────┐
│    Products   │ ████████████ 12 items (stock varies)
│   Categories  │ ███ 3 items
│     Users     │ █████████ 100 users
│    Orders     │ ████████████████████ 200+ orders
└───────────────┘
```

---

## Check Points (Verification Checklist)

### ✅ Startup Sequence

```
1. Start MongoDB
   Command: S:\mongodb\bin\mongod.exe --dbpath "C:\data\db"
   Look for: "Waiting for connections"
   
2. Seed Database (First time only)
   Command: node seed.js (in backend folder)
   Look for: "✅ Database seeded successfully!"
   
3. Start Backend
   Command: npm run dev (in backend folder)
   Look for: "✅ MongoDB Connected: localhost"
             "Server is running on port 5000"
   
4. Open Website
   URL: file:///S:/appdev/rsanimesh.github.io-master/Appdev/index.html
   Browser console (F12): "✅ Products fetched from backend: 12 items"
```

### ✅ During Use

```
REGISTER USER
├─ See success message
├─ Check: db.users.countDocuments() increased
└─ Check: New user appears in MongoDB

LOGIN USER
├─ Token saved in localStorage
├─ See authenticated UI
└─ Check: Browser localStorage has 'token'

BROWSE PRODUCTS
├─ See 12 products from database
├─ Can click on product details
└─ Check: Browser console shows API calls

ADD TO CART
├─ See cart count increase
├─ Click product → "Add to Cart"
└─ Check: localStorage 'redstore_cart' has items

CHECKOUT
├─ Click "Checkout" button
├─ Should redirect to receipt
├─ Check: db.orders.countDocuments() increased
└─ Check: Receipt shows Order ID

VIEW RECEIPT
├─ See Order ID, Date, Items, Total
├─ Click "Print" to print
└─ Check: MongoDB order document contains all data
```

---

## Example MongoDB Query Results

### View All Products
```javascript
> db.products.find().pretty()
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "name": "Red Printed T-Shirt",
  "description": "High quality cotton t-shirt with red print",
  "price": 50,
  "category": "clothing",
  "image": "images/product-1.jpg",
  "rating": 4,
  "stock": 15,
  "createdAt": ISODate("2026-03-08T18:22:54.000Z"),
  "__v": 0
}
```

### View All Users
```javascript
> db.users.find().pretty()
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "username": "testuser",
  "email": "test@example.com",
  "password": "$2a$10$...", // hashed
  "role": "user",
  "createdAt": ISODate("2026-03-08T18:22:54.000Z"),
  "updatedAt": ISODate("2026-03-08T18:22:54.000Z"),
  "__v": 0
}
```

### View All Orders
```javascript
> db.orders.find().pretty()
{
  "_id": ObjectId("507f1f77bcf86cd799439013"),
  "user": ObjectId("507f1f77bcf86cd799439012"),
  "items": [
    {
      "product": ObjectId("507f1f77bcf86cd799439011"),
      "quantity": 2,
      "price": 50
    }
  ],
  "totalAmount": 115,
  "status": "pending",
  "shippingAddress": "123 Main Street",
  "paymentMethod": "credit_card",
  "createdAt": ISODate("2026-03-08T18:23:00.000Z"),
  "__v": 0
}
```

---

## Summary

**Your database system is working when:**

| Component | Check | Status |
|-----------|-------|--------|
| MongoDB | Running on port 27017 | ✅ |
| Database | Name: "redstore" | ✅ |
| Collections | 4 total (products, users, orders, categories) | ✅ |
| Products | 12 in database (after seed.js) | ✅ |
| Backend | Running on port 5000, connected to DB | ✅ |
| Frontend | Fetches from API, shows products | ✅ |
| Authentication | Register/Login creates users | ✅ |
| Orders | Checkout creates order documents | ✅ |
| Stock | Decreases when order is placed | ✅ |
| Receipts | Shows order details from database | ✅ |

**All green = Your e-commerce platform is fully operational!** 🎉
