// Script to add sample product images to existing products
// Run with: node scripts/add-sample-images.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const sampleImages = [
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop', // Bamboo basket
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop', // Diya/lamp
  'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=300&fit=crop', // Pottery
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop', // Textile
  'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=300&fit=crop', // Wooden craft
];

async function addSampleImages() {
  try {
    console.log('🔄 Adding sample images to products...');
    
    const products = await prisma.product.findMany({
      where: {
        imageUrl: null
      }
    });

    console.log(`📦 Found ${products.length} products without images`);

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const imageIndex = i % sampleImages.length;
      
      await prisma.product.update({
        where: { id: product.id },
        data: { imageUrl: sampleImages[imageIndex] }
      });
      
      console.log(`✅ Updated ${product.name} with image`);
    }

    console.log('🎉 All products now have sample images!');
  } catch (error) {
    console.error('❌ Error adding sample images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleImages();
