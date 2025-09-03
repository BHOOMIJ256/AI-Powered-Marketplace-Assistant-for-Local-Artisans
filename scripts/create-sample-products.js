// Script to create sample products with images
// Run with: node scripts/create-sample-products.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const sampleProducts = [
  {
    name: "Hand-made Bamboo Basket",
    description: "Beautiful handwoven bamboo basket perfect for storage and decoration",
    price: 400, // ₹4.00 in paise
    stock: 20,
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop"
  },
  {
    name: "Hand-painted Diya",
    description: "Traditional clay diya with intricate hand-painted designs",
    price: 299, // ₹2.99 in paise
    stock: 19,
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop"
  },
  {
    name: "Ceramic Pottery Bowl",
    description: "Handcrafted ceramic bowl with unique glazing patterns",
    price: 750, // ₹7.50 in paise
    stock: 15,
    imageUrl: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=300&fit=crop"
  },
  {
    name: "Embroidered Textile Art",
    description: "Traditional embroidered textile showcasing local craftsmanship",
    price: 1200, // ₹12.00 in paise
    stock: 8,
    imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop"
  },
  {
    name: "Wooden Handicraft",
    description: "Intricately carved wooden handicraft item",
    price: 850, // ₹8.50 in paise
    stock: 12,
    imageUrl: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=300&fit=crop"
  }
];

async function createSampleProducts() {
  try {
    console.log('🔄 Creating sample products...');
    
    // First, find an artisan to assign products to
    const artisan = await prisma.user.findFirst({
      where: { role: 'artisan' }
    });

    if (!artisan) {
      console.log('❌ No artisan found. Please create an artisan account first.');
      return;
    }

    console.log(`👨‍🎨 Found artisan: ${artisan.name} (ID: ${artisan.id})`);

    // Check if products already exist
    const existingProducts = await prisma.product.findMany();
    console.log(`📦 Found ${existingProducts.length} existing products`);

    if (existingProducts.length > 0) {
      console.log('✅ Products already exist. Updating images...');
      
      for (let i = 0; i < existingProducts.length && i < sampleProducts.length; i++) {
        const product = existingProducts[i];
        const sampleProduct = sampleProducts[i];
        
        await prisma.product.update({
          where: { id: product.id },
          data: { 
            imageUrl: sampleProduct.imageUrl,
            name: sampleProduct.name,
            description: sampleProduct.description
          }
        });
        
        console.log(`✅ Updated ${product.name} with image and details`);
      }
    } else {
      console.log('🆕 Creating new products...');
      
      for (const productData of sampleProducts) {
        const product = await prisma.product.create({
          data: {
            ...productData,
            artisanId: artisan.id
          }
        });
        
        console.log(`✅ Created ${product.name}`);
      }
    }

    console.log('🎉 Sample products ready!');
  } catch (error) {
    console.error('❌ Error creating sample products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleProducts();
