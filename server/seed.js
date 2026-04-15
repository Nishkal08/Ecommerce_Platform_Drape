const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');
const Coupon = require('./models/Coupon');

const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const users = [
  {
    name: 'Admin User',
    email: 'admin@drape.com',
    password: 'Admin@123',
    role: 'admin',
  },
  {
    name: 'Test User',
    email: 'user@drape.com',
    password: 'User@123',
    role: 'user',
  },
];

const products = [
  // MEN
  {
    name: 'Classic Linen Blazer',
    description: 'Tailored linen blazer with a relaxed silhouette. Perfect for warm evenings and layered editorial looks. Features a single-button closure and patch pockets.',
    price: 4999,
    comparePrice: 6999,
    stock: 25,
    category: 'men',
    tags: ['blazer', 'linen', 'formal', 'summer'],
    images: [{ url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80', public_id: 'blazer1' }],
    sizes: ['S', 'M', 'L', 'XL'],
    isFeatured: true,
  },
  {
    name: 'Midnight Black Oversize Tee',
    description: 'Premium heavyweight cotton oversized t-shirt in deep black. Drop shoulders, ribbed neckline, and a boxy fit that drapes effortlessly.',
    price: 1499,
    comparePrice: 0,
    stock: 60,
    category: 'men',
    tags: ['tshirt', 'oversize', 'black', 'basics'],
    images: [{ url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', public_id: 'tee1' }],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    isFeatured: true,
  },
  {
    name: 'Washed Denim Jacket',
    description: 'Vintage-wash denim jacket with brass buttons. A wardrobe essential that pairs with everything from chinos to joggers.',
    price: 3499,
    comparePrice: 4499,
    stock: 30,
    category: 'men',
    tags: ['denim', 'jacket', 'casual', 'vintage'],
    images: [{ url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&q=80', public_id: 'denim1' }],
    sizes: ['S', 'M', 'L', 'XL'],
    isFeatured: false,
  },
  {
    name: 'Slim Fit Chinos — Sand',
    description: 'Flat-front chinos in warm sand tone. Tailored slim fit with stretch for comfort. Ideal for smart-casual and editorial styling.',
    price: 2299,
    comparePrice: 0,
    stock: 45,
    category: 'men',
    tags: ['chinos', 'pants', 'slim', 'sand'],
    images: [{ url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&q=80', public_id: 'chinos1' }],
    sizes: ['S', 'M', 'L', 'XL'],
    isFeatured: false,
  },
  {
    name: 'Merino Wool Crewneck',
    description: 'Luxurious merino wool crewneck sweater. Ultra-soft, breathable, and perfect for layering in transitional seasons.',
    price: 3999,
    comparePrice: 5499,
    stock: 20,
    category: 'men',
    tags: ['sweater', 'wool', 'merino', 'winter'],
    images: [{ url: 'https://images.unsplash.com/photo-1614975059251-992f11792571?w=800&q=80', public_id: 'wool1' }],
    sizes: ['M', 'L', 'XL'],
    isFeatured: true,
  },
  {
    name: 'Essential Hoodie — Charcoal',
    description: 'Premium French terry hoodie with a minimal aesthetic. Features a kangaroo pocket, adjustable drawstring hood, and ribbed cuffs.',
    price: 2499,
    comparePrice: 0,
    stock: 50,
    category: 'men',
    tags: ['hoodie', 'charcoal', 'basics', 'streetwear'],
    images: [{ url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80', public_id: 'hoodie1' }],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    isFeatured: false,
  },
  {
    name: 'Silk Blend Relaxed Polo',
    description: 'A luxurious silk-cotton blend polo shirt with a relaxed, draped fit. Features a low-profile collar and pearl buttons for a refined editorial look.',
    price: 2999,
    comparePrice: 3999,
    stock: 20,
    category: 'men',
    tags: ['polo', 'silk', 'summer', 'refined'],
    images: [{ url: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=800&q=80', public_id: 'polo1' }],
    sizes: ['M', 'L', 'XL'],
    isFeatured: false,
  },
  {
    name: 'Pleated Wool Trousers',
    description: 'Italian wool trousers with single pleats and a slight taper. Designed with a high rise for a classic, sophisticated silhouette.',
    price: 3999,
    comparePrice: 0,
    stock: 25,
    category: 'men',
    tags: ['trousers', 'wool', 'tailored', 'formal'],
    images: [{ url: 'https://images.unsplash.com/photo-1594932224011-041d577ca13f?w=800&q=80', public_id: 'trousers1' }],
    sizes: ['S', 'M', 'L', 'XL'],
    isFeatured: true,
  },
  {
    name: 'Structured Oversize Blazer',
    description: 'A contemporary take on the power suit. This oversized blazer features sharp shoulders and a boxy frame in a charcoal grey hue.',
    price: 5499,
    comparePrice: 7999,
    stock: 15,
    category: 'men',
    tags: ['blazer', 'structured', 'oversize', 'outerwear'],
    images: [{ url: 'https://images.unsplash.com/photo-1444491741275-3747c53c99b4?w=800&q=80', public_id: 'blazer2' }],
    sizes: ['M', 'L', 'XL'],
    isFeatured: true,
  },
  {
    name: 'Suede Chelsea Boots',
    description: 'Handcrafted suede Chelsea boots with a slim profile and stacked heel. Features pull tabs and elastic side panels for easy wear.',
    price: 4599,
    comparePrice: 5999,
    stock: 18,
    category: 'men',
    tags: ['boots', 'suede', 'footwear', 'chelsea'],
    images: [{ url: 'https://images.unsplash.com/photo-1635391114940-d99641ab347f?w=800&q=80', public_id: 'boots1' }],
    sizes: ['M', 'L', 'XL'],
    isFeatured: false,
  },
  {
    name: 'Ribbed Modal Tank',
    description: 'An essential layering piece. This ribbed tank is made from sustainable modal fabric, offering a soft second-skin feel and incredible drape.',
    price: 999,
    comparePrice: 0,
    stock: 100,
    category: 'men',
    tags: ['tank', 'ribbed', 'layering', 'basics'],
    images: [{ url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80', public_id: 'tank1' }],
    sizes: ['S', 'M', 'L', 'XL'],
    isFeatured: false,
  },
  {
    name: 'Structured Polo — Navy',
    description: 'Piqué cotton polo with a structured collar and contrast tipping. A refined take on a timeless essential.',
    price: 1799,
    comparePrice: 0,
    stock: 40,
    category: 'men',
    tags: ['polo', 'navy', 'smart-casual'],
    images: [{ url: 'https://images.unsplash.com/photo-1625910513413-5fc08ef56dc7?w=800&q=80', public_id: 'polo1' }],
    sizes: ['S', 'M', 'L', 'XL'],
    isFeatured: false,
  },
  // WOMEN
  {
    name: 'Silk Wrap Dress — Ivory',
    description: 'Flowing silk wrap dress in soft ivory. Features a flattering V-neckline, adjustable waist tie, and a midi-length hem that moves beautifully.',
    price: 5999,
    comparePrice: 7999,
    stock: 15,
    category: 'women',
    tags: ['dress', 'silk', 'wrap', 'ivory', 'elegant'],
    images: [{ url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80', public_id: 'dress1' }],
    sizes: ['XS', 'S', 'M', 'L'],
    isFeatured: true,
  },
  {
    name: 'Tailored Wide-Leg Trousers',
    description: 'High-waisted wide-leg trousers with a flowing silhouette. Crafted from a premium wool blend with pressed creases for a polished look.',
    price: 3299,
    comparePrice: 0,
    stock: 35,
    category: 'women',
    tags: ['trousers', 'wide-leg', 'tailored', 'formal'],
    images: [{ url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80', public_id: 'trousers1' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    isFeatured: false,
  },
  {
    name: 'Cashmere V-Neck Sweater',
    description: 'Pure cashmere V-neck in heather grey. Incredibly soft with a relaxed fit that drapes elegantly. A luxurious layering piece.',
    price: 6499,
    comparePrice: 8999,
    stock: 12,
    category: 'women',
    tags: ['cashmere', 'sweater', 'luxury', 'grey'],
    images: [{ url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80', public_id: 'cashmere1' }],
    sizes: ['XS', 'S', 'M', 'L'],
    isFeatured: true,
  },
  {
    name: 'Cropped Leather Jacket',
    description: 'Butter-soft leather jacket with an asymmetric zip. Cropped length with silver hardware and quilted shoulder detail.',
    price: 8999,
    comparePrice: 12999,
    stock: 10,
    category: 'women',
    tags: ['leather', 'jacket', 'cropped', 'biker'],
    images: [{ url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80', public_id: 'leather1' }],
    sizes: ['XS', 'S', 'M', 'L'],
    isFeatured: true,
  },
  {
    name: 'Relaxed Linen Shirt — White',
    description: 'Effortless linen shirt in crisp white. Oversized fit with rolled-up sleeves and a clean mandarin collar.',
    price: 1999,
    comparePrice: 0,
    stock: 40,
    category: 'women',
    tags: ['linen', 'shirt', 'white', 'summer'],
    images: [{ url: 'https://images.unsplash.com/photo-1604695573706-53170668f6a6?w=800&q=80', public_id: 'linen1' }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    isFeatured: false,
  },
  {
    name: 'High-Rise Straight Jeans',
    description: 'Premium Japanese denim in a flattering high-rise straight cut. Rigid fabric that softens with every wear for a personal fit.',
    price: 3799,
    comparePrice: 0,
    stock: 30,
    category: 'women',
    tags: ['jeans', 'denim', 'high-rise', 'straight'],
    images: [{ url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&q=80', public_id: 'jeans1' }],
    sizes: ['XS', 'S', 'M', 'L'],
    isFeatured: false,
  },
  // ACCESSORIES
  {
    name: 'Leather Tote — Cognac',
    description: 'Full-grain vegetable-tanned leather tote in rich cognac. Spacious interior with internal pockets and magnetic snap closure.',
    price: 4499,
    comparePrice: 5999,
    stock: 20,
    category: 'accessories',
    tags: ['bag', 'tote', 'leather', 'cognac'],
    images: [{ url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80', public_id: 'tote1' }],
    sizes: ['FREE'],
    isFeatured: true,
  },
  {
    name: 'Minimalist Analog Watch',
    description: 'Clean dial analog watch with a brushed steel case and Italian leather strap. Japanese quartz movement. Water-resistant to 30m.',
    price: 7999,
    comparePrice: 9999,
    stock: 15,
    category: 'accessories',
    tags: ['watch', 'minimalist', 'steel', 'leather'],
    images: [{ url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80', public_id: 'watch1' }],
    sizes: ['FREE'],
    isFeatured: true,
  },
  {
    name: 'Wool Scarf — Camel',
    description: 'Lightweight woven wool scarf in warm camel. Finished with subtle fringe detailing. Perfect for adding texture to any outfit.',
    price: 1299,
    comparePrice: 0,
    stock: 50,
    category: 'accessories',
    tags: ['scarf', 'wool', 'camel', 'winter'],
    images: [{ url: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80', public_id: 'scarf1' }],
    sizes: ['FREE'],
    isFeatured: false,
  },
  {
    name: 'Aviator Sunglasses — Gold',
    description: 'Classic aviator frames with polarized green lenses and gold metal frame. 100% UV protection with a vintage-inspired design.',
    price: 2499,
    comparePrice: 3499,
    stock: 25,
    category: 'accessories',
    tags: ['sunglasses', 'aviator', 'gold', 'polarized'],
    images: [{ url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80', public_id: 'sunglass1' }],
    sizes: ['FREE'],
    isFeatured: false,
  },
  {
    name: 'Canvas Belt — Tan',
    description: 'Woven canvas belt with burnished brass buckle. Adjustable fit that complements both casual and tailored looks.',
    price: 899,
    comparePrice: 0,
    stock: 60,
    category: 'accessories',
    tags: ['outerwear', 'classic', 'beige', 'editorial'],
    images: [{ url: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&q=80', public_id: 'trench1' }],
    sizes: ['S', 'M', 'L'],
    isFeatured: true,
  },
  {
    name: 'Bias-cut Silk Midi Skirt',
    description: 'A fluid silk midi skirt cut on the bias for a beautiful drape. Features a hidden elastic waistband and a subtle sheen. Pairs perfectly with knits or oversized blazers.',
    price: 2499,
    comparePrice: 3499,
    stock: 35,
    category: 'women',
    tags: ['skirt', 'silk', 'midi', 'bias-cut'],
    images: [{ url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&q=80', public_id: 'skirt1' }],
    sizes: ['S', 'M', 'L'],
    isFeatured: true,
  },
  {
    name: 'Double-breasted Oversized Blazer',
    description: 'An oversized double-breasted blazer with peaked lapels and structured shoulders. Elevated tailoring for a modern feminine look.',
    price: 4999,
    comparePrice: 0,
    stock: 20,
    category: 'women',
    tags: ['blazer', 'oversized', 'outerwear', 'grey'],
    images: [{ url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80', public_id: 'wblazer1' }],
    sizes: ['S', 'M', 'L'],
    isFeatured: true,
  },
  {
    name: 'Wide-leg Linen Palazzo',
    description: 'High-waisted linen palazzo pants with a dramatic wide leg. Breathable, comfortable, and perfect for resort wear or warm days in the city.',
    price: 2299,
    comparePrice: 3299,
    stock: 40,
    category: 'women',
    tags: ['palazzo', 'linen', 'wide-leg', 'summer'],
    images: [{ url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80', public_id: 'pants2' }],
    sizes: ['S', 'M', 'L', 'XL'],
    isFeatured: false,
  },
  {
    name: 'Knitted Square Neck Bodysuit',
    description: 'A sleek square-neck bodysuit in a soft ribbed knit. Designed to provide a smooth, tucked-in look under trousers or skirts.',
    price: 1499,
    comparePrice: 0,
    stock: 60,
    category: 'women',
    tags: ['bodysuit', 'knit', 'essentials', 'black'],
    images: [{ url: 'https://images.unsplash.com/photo-1525171254930-643fc658b64e?w=800&q=80', public_id: 'bodysuit1' }],
    sizes: ['XS', 'S', 'M', 'L'],
    isFeatured: false,
  },
  {
    name: 'Chunky Leather Loafers',
    description: 'Loafers with a modern twist. Features a thick lug sole, premium leather upper, and minimal hardware. Adds a cool, masculine edge to feminine outfits.',
    price: 3499,
    comparePrice: 4999,
    stock: 15,
    category: 'women',
    tags: ['loafers', 'leather', 'footwear', 'chunky'],
    images: [{ url: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80', public_id: 'loafers1' }],
    sizes: ['S', 'M', 'L'],
    isFeatured: false,
  },
  {
    name: 'Leather Card Holder — Black',
    description: 'Slim card holder in smooth black leather. Holds up to 8 cards with a center cash slot. Embossed DRAPE logo.',
    price: 1199,
    comparePrice: 0,
    stock: 45,
    category: 'accessories',
    tags: ['wallet', 'card-holder', 'leather', 'black'],
    images: [{ url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80', public_id: 'cardholder1' }],
    sizes: ['FREE'],
    isFeatured: false,
  },
];

const coupons = [
  {
    code: 'DRAPE10',
    discountType: 'percent',
    discountValue: 10,
    minOrderValue: 1000,
    maxUses: 100,
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    code: 'WELCOME20',
    discountType: 'percent',
    discountValue: 20,
    minOrderValue: 2000,
    maxUses: 50,
    expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
  {
    code: 'FLAT200',
    discountType: 'flat',
    discountValue: 200,
    minOrderValue: 1500,
    maxUses: 200,
    expiresAt: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
    isActive: true,
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Coupon.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const createdUsers = await User.create(users);
    const adminId = createdUsers[0]._id;
    console.log('Users seeded');

    // Create products with admin as creator
    const productsWithCreator = products.map((p) => ({ ...p, createdBy: adminId }));
    await Product.create(productsWithCreator);
    console.log(`Products seeded (${products.length} items)`);

    // Create coupons
    await Coupon.create(coupons);
    console.log('Coupons seeded');

    console.log('\n✅ Database seeded successfully!');
    console.log('Admin: admin@drape.com / Admin@123');
    console.log('User:  user@drape.com  / User@123');
    console.log('Coupons: DRAPE10, WELCOME20, FLAT200\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDB();
