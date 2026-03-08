/**
 * Seed Database with Sample Products and Categories
 * Run this once to populate MongoDB with initial data
 * Command: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const Category = require('./models/Category');

const CATEGORIES = [
  {
    name: "Clothing",
    description: "Men's and Women's Apparel",
    image: "images/category-clothing.jpg"
  },
  {
    name: "Footwear",
    description: "Shoes and Sneakers",
    image: "images/category-footwear.jpg"
  },
  {
    name: "Accessories",
    description: "Watches, Socks, and More",
    image: "images/category-accessories.jpg"
  }
];

const PRODUCTS = [
  {
    name: "Red Printed T-Shirt",
    price: 50.00,
    description: "High quality cotton t-shirt with red print",
    category: "clothing",
    image: "images/product-1.jpg",
    rating: 4,
    stock: 15
  },
  {
    name: "Blue Jeans",
    price: 60.00,
    description: "Comfortable blue denim jeans",
    category: "clothing",
    image: "images/product-2.jpg",
    rating: 4,
    stock: 20
  },
  {
    name: "Black T-Shirt",
    price: 45.00,
    description: "Classic black t-shirt",
    category: "clothing",
    image: "images/product-3.jpg",
    rating: 3.5,
    stock: 25
  },
  {
    name: "White Sneakers",
    price: 80.00,
    description: "Premium white sneaker shoes",
    category: "footwear",
    image: "images/product-4.jpg",
    rating: 4.5,
    stock: 10
  },
  {
    name: "Brown Shoes",
    price: 70.00,
    description: "Casual brown shoes",
    category: "footwear",
    image: "images/product-5.jpg",
    rating: 4,
    stock: 12
  },
  {
    name: "Summer Dress",
    price: 55.00,
    description: "Light summer dress perfect for warm weather",
    category: "clothing",
    image: "images/product-6.jpg",
    rating: 4,
    stock: 8
  },
  {
    name: "Winter Jacket",
    price: 120.00,
    description: "Warm winter jacket",
    category: "clothing",
    image: "images/product-7.jpg",
    rating: 3.5,
    stock: 6
  },
  {
    name: "Sport Shoes",
    price: 90.00,
    description: "Professional sport shoes",
    category: "footwear",
    image: "images/product-8.jpg",
    rating: 4.5,
    stock: 14
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/redstore');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('🗑️  Cleared existing products and categories');

    // Insert categories
    const categoriesResult = await Category.insertMany(CATEGORIES);
    console.log(`✅ Seeded ${categoriesResult.length} categories`);

    // Insert new products
    const result = await Product.insertMany(PRODUCTS);
    console.log(`✅ Seeded ${result.length} products`);

    // Show what was inserted
    console.log('\n📊 Categories in database:');
    const categories = await Category.find();
    categories.forEach(c => {
      console.log(`  - ${c.name}`);
    });

    console.log('\n📊 Products in database:');
    const products = await Product.find();
    products.forEach(p => {
      console.log(`  - ${p.name}: $${p.price}`);
    });

    console.log('\n✅ Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
