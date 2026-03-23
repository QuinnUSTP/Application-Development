# Admin Panel System Documentation

## Overview

The admin panel is a comprehensive management system that allows administrators to control all aspects of the e-commerce platform including:

- **Products Management**: Create, read, update, and delete products
- **Pricing & Stock Control**: Manage product prices and inventory levels
- **User Management**: View all users and promote users to admin roles
- **Order Management**: View all orders and update order statuses

The system uses **role-based access control (RBAC)** where:
- Users with `role: 'user'` see the customer account dashboard
- Users with `role: 'admin'` see the admin panel

## Architecture

### Frontend Files

#### `js/admin-manager.js` (NEW)
- **Purpose**: Core admin panel management logic
- **Key Methods**:
  - `initialize()`: Detects user role and renders appropriate panel
  - `renderAdminPanel()`: Renders the admin dashboard with 4 tabs
  - `switchTab()`: Handle tab switching
  - `loadProducts()`: Fetch and display all products in a table
  - `loadUsers()`: Fetch and display all users
  - `loadOrders()`: Fetch and display all orders
  - `addProduct()`: Create new product
  - `deleteProduct()`: Delete a product
  - `updateStock()`: Update product stock levels
  - `updateOrderStatus()`: Change order status
  - `promoteToAdmin()`: Promote a user to admin
  - `logout()`: Logout admin user

#### `account.html` (UPDATED)
- Added script: `<script src="js/admin-manager.js"></script>`
- The page now checks user role on load:
  - If role is 'admin': AdminManager.initialize() → Admin panel
  - If role is 'user': AccountManager.initialize() → Customer dashboard

#### `style.css` (EXTENDED)
- **New Classes** (400+ lines):
  - `.admin-container`: Main admin panel container
  - `.admin-header`: Header with logout button
  - `.admin-tabs`: Tab navigation
  - `.admin-tab-content`: Tab content areas
  - `.admin-table`: Professional data tables
  - `.admin-form`: Form styling for product creation
  - `.btn-edit`, `.btn-delete`, `.btn-promote`: Action buttons
  - `.badge`: Status badges (admin/user)
  - `.status`: Order status indicators
  - Responsive design for mobile (768px breakpoint)

### Backend Changes

#### `controllers/userController.js` (EXTENDED)
- **Updated Methods**:
  - `registerUser()`: Now includes role in response
  - `loginUser()`: Now includes role in response
  
- **New Methods**:
  - `getAllUsers()`: GET all users (admin only)
  - `promoteToAdmin()`: Promote user to admin role
  - `changePassword()`: Allow users to change password

#### `routes/users.js` (UPDATED)
- **New Routes**:
  ```javascript
  GET  /api/users/list           - Get all users (admin only)
  PUT  /api/users/:id/promote    - Promote user to admin (admin only)
  POST /api/users/change-password - Change password (protected)
  ```

#### `controllers/orderController.js` (EXTENDED)
- **New Method**:
  - `getAllOrders()`: GET all orders with user and product details (admin only)

#### `routes/orders.js` (UPDATED)
- **New Route**:
  ```javascript
  GET /api/orders/all - Get all orders (admin only)
  ```

#### `models/User.js` (NO CHANGES NEEDED)
- Already has `role` field: `{ type: String, enum: ['user', 'admin'], default: 'user' }`

#### `backend/seed-admin.js` (NEW)
- Creates test admin and test user in database
- Run with: `node seed-admin.js`
- **Test Credentials**:
  - Admin: username="admin", password="admin123"
  - User: username="testuser", password="password123"

## Admin Panel Features

### 📦 Products Tab

**View Products**
- Table with all products
- Columns: ID, Name, Price, Stock, Category, Actions
- Stock field is editable inline
- Edit and Delete buttons for each product

**Add Product**
- Form to create new product
- Fields:
  - Product Name (required)
  - Price (number, step 0.01)
  - Category (text)
  - Description (textarea)
  - Image URL (text)
  - Stock (number)
  - Rating (0-5, optional)

**Edit Product** (placeholder for future)
**Delete Product** (with confirmation)
**Update Stock** (inline edit)

### 👥 Users Tab

**View Users**
- Table with all users
- Columns: ID, Username, Email, Role, Created Date, Actions
- Shows role as badge (Admin=orange, User=blue)
- Promote button for non-admin users

**Promote to Admin**
- Convert regular user to admin
- Requires confirmation
- Updates user role in real-time

### 📋 Orders Tab

**View Orders**
- Table with all orders
- Columns: Order ID, Customer, Total, Items, Status, Date, Actions
- Status shown as colored badge:
  - Pending: Yellow
  - Processing: Blue
  - Shipped: Green
  - Delivered: Dark Green
  - Cancelled: Red

**Update Order Status**
- Dropdown to change order status
- Options: Pending, Processing, Shipped, Delivered, Cancelled
- Updates in real-time

### ⚙️ Settings Tab

**Admin Information**
- Display admin username and email
- Change password form
- Current password validation
- New password confirmation

## User Flow

### Admin Login Flow
1. User navigates to `account.html`
2. Enters credentials: username="admin", password="admin123"
3. Login succeeds, backend returns user object with `role: 'admin'`
4. `admin-manager.js` detects `role === 'admin'`
5. Admin panel renders instead of customer dashboard
6. Admin can manage products, users, and orders

### Customer Login Flow
1. User navigates to `account.html`
2. Enters credentials: username="testuser", password="password123"
3. Login succeeds, backend returns user object with `role: 'user'`
4. `account-manager.js` renders customer dashboard
5. Customer can view profile, orders, addresses, and settings

### Logout Flow
1. Admin clicks "Logout" button
2. Tokens and user data are cleared from localStorage
3. User is redirected to `account.html`
4. Page shows login form again

## API Endpoints Summary

### Products
```
GET    /api/products                - Get all products
GET    /api/products/:id            - Get single product
POST   /api/products                - Create product (admin)
PUT    /api/products/:id            - Update product (admin)
DELETE /api/products/:id            - Delete product (admin)
```

### Users
```
POST   /api/users/register          - Register new user
POST   /api/users/login             - Login user
GET    /api/users/profile           - Get user profile (protected)
POST   /api/users/change-password   - Change password (protected)
GET    /api/users/list              - Get all users (admin)
PUT    /api/users/:id/promote       - Promote to admin (admin)
```

### Orders
```
POST   /api/orders                  - Create order (protected)
GET    /api/orders                  - Get user's orders (protected)
GET    /api/orders/all              - Get all orders (admin)
GET    /api/orders/:id              - Get single order (protected)
PUT    /api/orders/:id              - Update order status (admin)
```

## Data Structures

### Admin User Response
```json
{
  "id": "user_id",
  "username": "admin",
  "email": "admin@redstore.com",
  "role": "admin"
}
```

### Product Table Row
```json
{
  "_id": "product_id",
  "name": "Product Name",
  "price": 99.99,
  "stock": 50,
  "category": "Clothing",
  "image": "url",
  "description": "...",
  "rating": 4.5
}
```

### User Table Row
```json
{
  "_id": "user_id",
  "username": "testuser",
  "email": "user@example.com",
  "role": "user",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Order Table Row
```json
{
  "_id": "order_id",
  "user": {
    "username": "customer",
    "email": "customer@example.com"
  },
  "items": [
    {
      "product": {...},
      "quantity": 2
    }
  ],
  "totalAmount": 199.98,
  "status": "pending",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

## Security Features

- **Role-Based Access Control**: Backend routes use `authorize('admin')` middleware
- **JWT Authentication**: All admin operations require valid JWT token
- **Admin-Only Endpoints**: Users can only access endpoints matching their role
- **Confirmation Dialogs**: Destructive operations require user confirmation
- **Password Hashing**: Passwords are hashed with bcryptjs
- **Token Expiration**: JWT tokens expire after 30 days

## Testing

### Test Admin Account
- **Username**: admin
- **Password**: admin123
- **Role**: admin
- **Email**: admin@redstore.com

### Test User Account
- **Username**: testuser
- **Password**: password123
- **Role**: user
- **Email**: testuser@redstore.com

### Testing Steps

1. **Login as Admin**
   - Navigate to `account.html`
   - Enter admin credentials
   - Verify admin panel appears with 4 tabs

2. **Test Products Management**
   - Click "Products" tab
   - View product table
   - Edit stock inline
   - Click "Add New Product" and create a test product
   - Verify product appears in table
   - Delete test product

3. **Test Users Management**
   - Click "Users" tab
   - View all users table
   - Create a new test user via register
   - Login as admin again
   - Promote the test user to admin
   - Verify role badge changes

4. **Test Orders Management**
   - Click "Orders" tab
   - View all orders
   - Change order status via dropdown
   - Verify status updates

5. **Test Settings**
   - Click "Settings" tab
   - View admin info
   - Test "Change Password" button

6. **Test Logout**
   - Click "Logout" button
   - Verify redirected to account page
   - Verify login form appears

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (responsive design)

## Performance Considerations

- Admin tables load up to 100 items by default
- Product creation validates all required fields client-side
- Inline stock updates are optimistic (show immediately)
- Order status changes are optimistic (show immediately)
- Tables are paginated on backend (future enhancement)

## Future Enhancements

1. **Product Edit** (currently placeholder)
   - Pre-populate form with current product data
   - Update individual product fields

2. **Bulk Operations**
   - Bulk product price/stock updates
   - Bulk order status updates

3. **Admin Dashboard Analytics**
   - Total revenue
   - Order count by status
   - Most sold products
   - User growth trends

4. **Inventory Alerts**
   - Low stock warnings
   - Auto-reorder triggers

5. **Admin Activity Log**
   - Track admin actions
   - Audit trail

6. **Multi-level Admin Roles**
   - Super Admin (all permissions)
   - Product Admin (products only)
   - Order Admin (orders only)

## Troubleshooting

### Admin panel not showing
- Ensure backend is running on port 5000
- Check user role in browser DevTools: `JSON.parse(localStorage.getItem('user_data'))`
- Verify JWT token is valid: `localStorage.getItem('token')`

### Products table empty
- Ensure products exist in MongoDB
- Check network tab for API errors
- Verify admin is authenticated

### Can't promote users
- Ensure user is logged in as admin
- Check backend logs for authorize middleware errors
- Verify user ID is valid

### Stock update fails
- Check if product exists
- Verify stock is a valid number
- Check network response for error messages

## Database Requirements

- MongoDB 4.0+
- User collection with role field
- Product collection with stock field
- Order collection with status field

## Environment Variables

```
MONGODB_URI=mongodb://localhost:27017/redstore
JWT_SECRET=your_secret_key
NODE_ENV=development
PORT=5000
```

## Files Modified/Created

### Created
- `js/admin-manager.js` - Admin panel manager class
- `backend/seed-admin.js` - Admin user seeding script

### Modified
- `account.html` - Added admin-manager.js script
- `style.css` - Added 400+ lines of admin panel styling
- `backend/controllers/userController.js` - Added admin methods
- `backend/routes/users.js` - Added admin routes
- `backend/controllers/orderController.js` - Added getAllOrders method
- `backend/routes/orders.js` - Added getAllOrders route

### Already Present (No Changes)
- `backend/models/User.js` - Already has role field
- `backend/routes/products.js` - Already has admin routes
- `backend/controllers/productController.js` - Already has CRUD methods

## Getting Started

1. **Ensure Backend is Running**
   ```bash
   cd backend
   npm start
   ```

2. **Seed Admin User (if needed)**
   ```bash
   cd backend
   node seed-admin.js
   ```

3. **Open in Browser**
   - Navigate to `http://localhost/account.html`

4. **Login as Admin**
   - Username: admin
   - Password: admin123

5. **Start Managing**
   - Navigate between tabs
   - Create, edit, delete products
   - Manage users and orders

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Status**: Production Ready
