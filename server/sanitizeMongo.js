const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');

dotenv.config();

const sanitize = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const products = await Product.find({});
    console.log(`Found ${products.length} products`);

    let updatedCount = 0;

    for (const product of products) {
      let modified = false;
      product.images = product.images.map(img => {
        if (img.url.includes('localhost:')) {
          console.log(`Found local image in product ${product.name}: ${img.url}`);
          modified = true;
          return { ...img, url: 'https://images.unsplash.com/photo-1550614000-4b95d4ebfaad?q=80&w=800&auto=format&fit=crop' }; // fallback
        }
        return img;
      });

      if (modified) {
        await product.save();
        updatedCount++;
      }
    }

    console.log(`Sanitized ${updatedCount} products from localhost dependencies.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

sanitize();
