# Admin Panel Quick Start

## Login as Admin

1. **Go to**: http://localhost/account.html
2. **Enter Credentials**:
   - Username: `admin`
   - Password: `admin123`
3. **Click "Login"**

## You Should See ✅

- **Admin Dashboard** with your username in the header
- **4 tabs**: Products, Users, Orders, Settings
- **Logout button** in the top right

## Quick Tasks

### ➕ Add a Product
1. Click **"Products"** tab
2. Click **"➕ Add New Product"**
3. Fill in the form:
   - **Name**: "Test Product"
   - **Price**: 99.99
   - **Category**: "Clothing"
   - **Description**: "Test description"
   - **Image URL**: "images/product-1.jpg"
   - **Stock**: 50
4. Click **"Save Product"**

### 📦 Update Product Stock
1. In **Products** tab
2. Find a product in the table
3. Click in the **Stock** column (number input)
4. Change the value
5. Press Tab/Enter - updates automatically!

### ❌ Delete a Product
1. In **Products** tab
2. Find a product
3. Click **"Delete"** button
4. Confirm the popup
5. Product removed!

### 👥 View All Users
1. Click **"Users"** tab
2. See table with all registered users
3. See their email and role (Admin/User)

### ⭐ Promote User to Admin
1. In **Users** tab
2. Find a regular user (role = "user")
3. Click **"Promote"** button
4. Confirm the popup
5. Role changes to "admin"!

### 📋 View All Orders
1. Click **"Orders"** tab
2. See table with all customer orders
3. See order ID, customer name, total, status, and date

### 🔄 Update Order Status
1. In **Orders** tab
2. Find an order
3. Click the **Status dropdown**
4. Select new status:
   - Pending
   - Processing
   - Shipped
   - Delivered
   - Cancelled
5. Status updates immediately!

### ⚙️ Change Admin Password
1. Click **"Settings"** tab
2. Click **"Change Password"**
3. Enter:
   - Current Password
   - New Password
   - Confirm New Password
4. Click **"Update Password"**

## Admin Panel Layout

```
╔═══════════════════════════════════════════╗
║     🔐 Admin Dashboard      [Logout]      ║
╠═══════════════════════════════════════════╣
║  [📦 Products]  [👥 Users]  [📋 Orders]  [⚙️ Settings] ║
╠═══════════════════════════════════════════╣
║                                           ║
║  Tab Content Area                         ║
║                                           ║
║                                           ║
╚═══════════════════════════════════════════╝
```

## Features by Tab

### 📦 Products
- ✅ View all products
- ✅ See price, stock, category
- ✅ Edit stock inline
- ✅ Add new product
- ✅ Delete products

### 👥 Users
- ✅ View all users
- ✅ See email and role
- ✅ Promote to admin
- ✅ See creation date

### 📋 Orders
- ✅ View all orders
- ✅ See customer name and email
- ✅ See total amount
- ✅ Change order status
- ✅ See order date

### ⚙️ Settings
- ✅ View admin username
- ✅ View admin email
- ✅ Change password

## Test User Account

To test the **customer dashboard** (not admin):

1. **Go to**: http://localhost/account.html
2. **Enter Credentials**:
   - Username: `testuser`
   - Password: `password123`
3. **You Should See**:
   - Customer dashboard (different UI!)
   - 4 tabs: Profile, Orders, Addresses, Settings
   - NO product management options

## Troubleshooting

### "Page not loading"
- Check if backend is running: `cd backend && npm start`
- Wait 3 seconds for MongoDB connection

### "Admin panel doesn't show"
- Check console (F12): Press F12 → Console tab
- Should see: `✅ AuthManager initialized`
- If error, refresh page (Ctrl+R)

### "Can't login"
- Check credentials are exactly: `admin` / `admin123`
- Check Caps Lock is OFF
- Try refresh page first

### "Add product button doesn't work"
- Check browser console (F12) for errors
- Check backend is running
- Try refresh page

### "Table shows 'User list endpoint not yet implemented'"
- This is normal if you haven't created the endpoint yet
- The admin panel is still functional for products

## What Gets Saved?

### Products
- ✅ Stored in MongoDB
- ✅ Visible to all customers
- ✅ Stock decreases when purchased

### Users
- ✅ Stored in MongoDB
- ✅ Can be promoted to admin
- ✅ Passwords are hashed

### Orders
- ✅ Stored in MongoDB
- ✅ Status tracked
- ✅ Stock updated automatically

### Password Changes
- ✅ Hashed before storing
- ✅ Takes effect immediately
- ✅ Re-login required with new password

## Keyboard Shortcuts

- **Tab**: Move between form fields
- **Enter**: Submit form or update field
- **Esc**: Cancel (not implemented yet)

## Mobile Access

The admin panel is **responsive**!

- Works on tablets
- Works on phones (landscape view recommended)
- Touch-friendly buttons
- Swipe between tabs

## Security Notes

✅ **What's Protected**
- Admin routes require JWT token
- Backend checks user role
- Products endpoint checks authorization
- Users endpoint checks authorization

⚠️ **Best Practices**
- Don't share admin credentials
- Change password regularly
- Logout when done
- Use strong passwords for production

## Next Steps

1. **Test adding products** - Create 5 test items
2. **Test stock updates** - Change stock levels
3. **Test user promotion** - Promote testuser to admin
4. **Test order management** - Update order statuses
5. **Test settings** - Change admin password

---

**Need Help?** Check the full guide: `ADMIN_PANEL_GUIDE.md`
