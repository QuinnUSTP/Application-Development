# 🚀 Quick Start Guide

Get RedStore up and running in 5 minutes!

## Frontend (Instant - No Setup Required ✅)

### Option 1: Direct File Opening
1. Open `index.html` in your browser
2. Click "Explore Now"
3. Add items to cart
4. View cart - everything works!

### Option 2: Live Server (Recommended)
```bash
# If you have Python 3
python -m http.server 8000

# If you have Node.js
npx http-server

# Open: http://localhost:8000
```

## Backend (Database Integration Ready)

### Prerequisites Check
```bash
# Check Node.js (required)
node --version    # Should be v14+

# Check npm (comes with Node.js)
npm --version

# Check MongoDB (for database)
mongod --version  # Or skip - use MongoDB Atlas cloud
```

### Installation (2 Steps)

**Step 1: Install Dependencies**
```bash
cd backend
npm install
```

**Step 2: Create Environment File**
```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

Edit `.env`:
```
MONGODB_URI=mongodb://localhost:27017/redstore
JWT_SECRET=my_super_secret_key_123
NODE_ENV=development
PORT=5000
```

### Run Backend
```bash
cd backend
npm run dev
```

Expected output:
```
Server is running on port 5000
MongoDB Connected: localhost
API is running
```

### Test Backend
Open in browser: `http://localhost:5000/api/health`

Should see:
```json
{
  "success": true,
  "message": "API is running"
}
```

## 🎯 What Works Now

### ✅ Frontend (100% Functional)
- [x] Browse products
- [x] Add to cart
- [x] View cart
- [x] Update quantities
- [x] Remove items
- [x] Cart totals
- [x] Sort products
- [x] Pagination

### ✅ Backend (Ready to Connect)
- [x] Product API
- [x] User authentication
- [x] Order management
- [x] Role-based access
- [x] JWT tokens

## 📱 Test the Cart

1. Go to `index.html`
2. Click on any product's "Add to Cart" button
3. You'll see:
   - ✅ Notification popup
   - ✅ Cart counter updated (top right)
   - ✅ Item saved in browser storage
4. Go to cart page
5. Update quantity or remove items
6. See totals update automatically

## 🔗 Connect Frontend to Backend

Once backend is running, update `js/api.js`:

```javascript
// Line 10 - Change from:
const apiService = new APIService();

// To:
const apiService = new APIService('http://localhost:5000/api');
```

Then products will load from your database!

## 📝 Create Sample Products

### Via Postman/cURL
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cool T-Shirt",
    "price": 49.99,
    "description": "Awesome shirt",
    "category": "clothing",
    "image": "images/product-1.jpg",
    "stock": 10
  }'
```

Or use the JSON file: `data/products.json` is already populated!

## 🎨 Customize

**Change colors**: Edit `:root` in `style.css`
**Change products**: Edit `data/products.json`
**Add new page**: Create new HTML file + JS script

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Cart empty after refresh | It should persist! Check localStorage is enabled |
| "Cannot GET /api/products" | Backend not running - `cd backend && npm run dev` |
| Port 5000 in use | Change PORT in `.env` to 5001, 5002, etc. |
| MongoDB connection error | Install MongoDB or use MongoDB Atlas cloud |
| "Module not found" | Run `npm install` in backend folder |

## 📚 Next Steps

1. **Backend Setup**: Follow `backend/README.md`
2. **Database**: Set up MongoDB locally or Atlas
3. **API Testing**: Use Postman to test endpoints
4. **Connect Frontend**: Update baseUrl in `api.js`
5. **Deployment**: Deploy to Heroku/Netlify

## 📞 Still Need Help?

Check these files:
- `README.md` - Full documentation
- `backend/README.md` - Backend API docs
- `backend/.env.example` - Configuration options
- Code comments - Every file has detailed comments

## 🎉 You're All Set!

Your e-commerce platform is ready to use!

**What to do next:**
1. ✅ Test the frontend
2. ✅ Set up the backend
3. ✅ Connect them together
4. ✅ Add your database
5. ✅ Deploy to production

Happy coding! 🚀
