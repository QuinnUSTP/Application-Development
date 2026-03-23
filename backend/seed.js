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
    price: 50.0,
    description: "Comfortable red printed t-shirt for casual wear.",
    category: "clothing",
    image: "images/product-1.jpg",
    rating: 4,
    stock: 15,
  },
  {
    name: "The Runnie SapaShoes",
    price: 45.0,
    description: "Stylish running shoes designed for everyday comfort.",
    category: "footwear",
    image: "images/product-2.jpg",
    rating: 4,
    stock: 20,
  },
  {
    name: "Gray TrackPants",
    price: 55.0,
    description: "Comfortable track pants for active movement.",
    category: "clothing",
    image: "images/product-3.jpg",
    rating: 3.5,
    stock: 10,
  },
  {
    name: "The POLO",
    price: 60.0,
    description: "Classic polo shirt for sporty casual wear.",
    category: "clothing",
    image: "images/product-4.jpg",
    rating: 4.5,
    stock: 25,
  },
  {
    name: "AirWalk Heavens HIGHCUT",
    price: 120.0,
    description: "High-cut footwear built for style and support.",
    category: "footwear",
    image: "images/product-5.jpg",
    rating: 4,
    stock: 18,
  },
  {
    name: "The LionJump T-Shirt",
    price: 95.0,
    description: "Lightweight t-shirt for everyday wear.",
    category: "clothing",
    image: "images/product-6.jpg",
    rating: 4.5,
    stock: 12,
  },
  {
    name: "Cogon Rated Socks",
    price: 35.0,
    description: "Comfortable rated socks for daily use.",
    category: "accessories",
    image: "images/product-7.jpg",
    rating: 4,
    stock: 30,
  },
  {
    name: "Fossil BangBang Watch",
    price: 65.0,
    description: "Stylish watch with a sporty look.",
    category: "accessories",
    image: "images/product-8.jpg",
    rating: 3.5,
    stock: 22,
  },
  {
    name: "Roadster Watch",
    price: 85.0,
    description: "Modern watch designed for everyday wear.",
    category: "accessories",
    image: "images/product-9.jpg",
    rating: 4,
    stock: 16,
  },
  {
    name: "Running Shoes 46",
    price: 150.0,
    description: "Running shoes with a supportive fit.",
    category: "footwear",
    image: "images/product-10.jpg",
    rating: 4.5,
    stock: 10,
  },
  {
    name: "Running Shoes 1",
    price: 75.0,
    description: "Slim-fit running shoes for active comfort.",
    category: "footwear",
    image: "images/product-11.jpg",
    rating: 4,
    stock: 14,
  },
  {
    name: "NIKE TrackPants",
    price: 45.0,
    description: "Nike-branded track pants for athletic style.",
    category: "clothing",
    image: "images/product-12.jpg",
    rating: 4.5,
    stock: 20,
  },
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
