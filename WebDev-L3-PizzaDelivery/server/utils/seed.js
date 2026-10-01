require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Category = require('../models/Category');
const Pizza = require('../models/Pizza');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pizzahub';

const categories = [
  { name: 'Classic', slug: 'classic', description: 'Timeless favorites everyone loves', sortOrder: 1 },
  { name: 'Veggie', slug: 'veggie', description: 'Fresh vegetables, bold flavors', sortOrder: 2 },
  { name: 'Non-Veg', slug: 'non-veg', description: 'Meat lovers rejoice', sortOrder: 3 },
  { name: 'Premium', slug: 'premium', description: 'Gourmet ingredients, extraordinary taste', sortOrder: 4 },
  { name: 'Spicy', slug: 'spicy', description: 'For those who like it hot', sortOrder: 5 },
];

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Pizza.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // Create categories
    const createdCategories = await Category.insertMany(categories);
    const catMap = {};
    createdCategories.forEach((c) => { catMap[c.slug] = c._id; });
    console.log('📁 Categories seeded');

    // Create admin and customer users (model handles password hashing via pre-save)
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@pizzahub.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '9999999999',
    });
    await adminUser.save();

    const customerUser = new User({
      name: 'Demo Customer',
      email: 'customer@pizzahub.com',
      password: 'Customer@123',
      role: 'customer',
      phone: '8888888888',
    });
    await customerUser.save();
    console.log('👥 Users seeded');

    // Create pizzas
    const pizzas = [
      {
        name: 'Margherita Classic',
        slug: 'margherita-classic',
        description: 'The original Italian pizza with fresh tomatoes, creamy mozzarella, and aromatic basil. A timeless masterpiece.',
        category: catMap['classic'],
        isVeg: true, isSpicy: false, isBestseller: true, isFeatured: true,
        ingredients: ['San Marzano Tomatoes', 'Fresh Mozzarella', 'Basil', 'Olive Oil', 'Garlic'],
        sizes: [
          { name: 'Small', price: 199, discountPrice: 0 },
          { name: 'Medium', price: 299, discountPrice: 269 },
          { name: 'Large', price: 399, discountPrice: 359 },
          { name: 'XL', price: 499, discountPrice: 449 },
        ],
        basePrice: 199,
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80',
        stock: 150, isAvailable: true,
        ratings: { average: 4.8, count: 1240 },
        preparationTime: 15,
        addOns: [{ name: 'Extra Cheese', price: 40 }, { name: 'Jalapeños', price: 20 }],
        tags: ['vegetarian', 'classic', 'bestseller'],
      },
      {
        name: 'BBQ Chicken Feast',
        slug: 'bbq-chicken-feast',
        description: 'Smoky BBQ sauce, juicy grilled chicken, caramelized onions, and a blend of three cheeses. Absolutely indulgent.',
        category: catMap['non-veg'],
        isVeg: false, isSpicy: false, isBestseller: true, isFeatured: true,
        ingredients: ['BBQ Sauce', 'Grilled Chicken', 'Caramelized Onions', 'Mozzarella', 'Cheddar', 'Red Bell Peppers'],
        sizes: [
          { name: 'Small', price: 249, discountPrice: 0 },
          { name: 'Medium', price: 369, discountPrice: 329 },
          { name: 'Large', price: 479, discountPrice: 429 },
          { name: 'XL', price: 579, discountPrice: 519 },
        ],
        basePrice: 249,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80',
        stock: 120, isAvailable: true,
        ratings: { average: 4.7, count: 980 },
        preparationTime: 20,
        addOns: [{ name: 'Extra Chicken', price: 60 }, { name: 'Extra BBQ', price: 20 }],
        tags: ['non-veg', 'bbq', 'chicken', 'bestseller'],
      },
      {
        name: 'Paneer Tikka Masala',
        slug: 'paneer-tikka-masala',
        description: 'A desi twist on a classic — tandoori marinated paneer, tikka sauce, onions, and capsicum on a buttery crust.',
        category: catMap['veggie'],
        isVeg: true, isSpicy: true, isBestseller: true, isFeatured: true,
        ingredients: ['Paneer', 'Tikka Sauce', 'Onions', 'Capsicum', 'Mint Chutney', 'Mozzarella'],
        sizes: [
          { name: 'Small', price: 229, discountPrice: 0 },
          { name: 'Medium', price: 339, discountPrice: 299 },
          { name: 'Large', price: 449, discountPrice: 399 },
          { name: 'XL', price: 549, discountPrice: 489 },
        ],
        basePrice: 229,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80',
        stock: 90, isAvailable: true,
        ratings: { average: 4.9, count: 1540 },
        preparationTime: 18,
        addOns: [{ name: 'Extra Paneer', price: 50 }, { name: 'Green Chutney', price: 15 }],
        tags: ['vegetarian', 'indian', 'spicy', 'bestseller'],
      },
      {
        name: 'Pepperoni Inferno',
        slug: 'pepperoni-inferno',
        description: 'Double layer of premium pepperoni, fiery arrabbiata sauce, and molten mozzarella. Spice meets savory.',
        category: catMap['spicy'],
        isVeg: false, isSpicy: true, isBestseller: false, isFeatured: true,
        ingredients: ['Premium Pepperoni', 'Arrabbiata Sauce', 'Mozzarella', 'Red Chilli Flakes', 'Oregano'],
        sizes: [
          { name: 'Small', price: 259, discountPrice: 0 },
          { name: 'Medium', price: 379, discountPrice: 349 },
          { name: 'Large', price: 489, discountPrice: 449 },
          { name: 'XL', price: 589, discountPrice: 529 },
        ],
        basePrice: 259,
        image: 'https://images.unsplash.com/photo-1548369937-47519962c11a?w=600&q=80',
        stock: 80, isAvailable: true,
        ratings: { average: 4.6, count: 760 },
        preparationTime: 20,
        addOns: [{ name: 'Extra Pepperoni', price: 55 }, { name: 'Ghost Pepper Sauce', price: 25 }],
        tags: ['non-veg', 'spicy', 'pepperoni'],
      },
      {
        name: 'Garden Supreme',
        slug: 'garden-supreme',
        description: 'A garden of fresh vegetables — mushrooms, bell peppers, olives, onions, and corn on a herbed tomato base.',
        category: catMap['veggie'],
        isVeg: true, isSpicy: false, isBestseller: false, isFeatured: false,
        ingredients: ['Mushrooms', 'Bell Peppers', 'Black Olives', 'Onions', 'Sweet Corn', 'Tomatoes', 'Mozzarella'],
        sizes: [
          { name: 'Small', price: 209, discountPrice: 0 },
          { name: 'Medium', price: 319, discountPrice: 289 },
          { name: 'Large', price: 419, discountPrice: 379 },
          { name: 'XL', price: 519, discountPrice: 469 },
        ],
        basePrice: 209,
        image: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600&q=80',
        stock: 110, isAvailable: true,
        ratings: { average: 4.4, count: 620 },
        preparationTime: 16,
        addOns: [{ name: 'Extra Veggies', price: 30 }, { name: 'Pesto Drizzle', price: 25 }],
        tags: ['vegetarian', 'healthy'],
      },
      {
        name: 'Truffle Mushroom',
        slug: 'truffle-mushroom',
        description: 'A premium gourmet pizza with wild mushrooms, black truffle oil, ricotta, and fresh thyme. Restaurant quality.',
        category: catMap['premium'],
        isVeg: true, isSpicy: false, isBestseller: false, isFeatured: true,
        ingredients: ['Wild Mushrooms', 'Black Truffle Oil', 'Ricotta', 'Thyme', 'Garlic', 'Parmesan'],
        sizes: [
          { name: 'Small', price: 349, discountPrice: 0 },
          { name: 'Medium', price: 499, discountPrice: 449 },
          { name: 'Large', price: 649, discountPrice: 589 },
          { name: 'XL', price: 799, discountPrice: 729 },
        ],
        basePrice: 349,
        image: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?w=600&q=80',
        stock: 50, isAvailable: true,
        ratings: { average: 4.9, count: 380 },
        preparationTime: 25,
        addOns: [{ name: 'Extra Truffle', price: 80 }, { name: 'Burrata Cheese', price: 90 }],
        tags: ['vegetarian', 'gourmet', 'premium'],
      },
      {
        name: 'Chicken Tikka',
        slug: 'chicken-tikka',
        description: 'Juicy marinated chicken tikka chunks, mint chutney base, onions, and a sprinkle of chaat masala.',
        category: catMap['non-veg'],
        isVeg: false, isSpicy: true, isBestseller: true, isFeatured: false,
        ingredients: ['Chicken Tikka', 'Mint Chutney', 'Onions', 'Capsicum', 'Chaat Masala', 'Mozzarella'],
        sizes: [
          { name: 'Small', price: 239, discountPrice: 0 },
          { name: 'Medium', price: 359, discountPrice: 319 },
          { name: 'Large', price: 469, discountPrice: 419 },
          { name: 'XL', price: 569, discountPrice: 509 },
        ],
        basePrice: 239,
        image: 'https://images.unsplash.com/photo-1555072956-7758afb20e8f?w=600&q=80',
        stock: 100, isAvailable: true,
        ratings: { average: 4.8, count: 1100 },
        preparationTime: 22,
        addOns: [{ name: 'Extra Chicken', price: 60 }, { name: 'Mint Chutney', price: 15 }],
        tags: ['non-veg', 'indian', 'chicken', 'spicy'],
      },
      {
        name: 'Four Cheese Delight',
        slug: 'four-cheese-delight',
        description: 'Mozzarella, Cheddar, Parmesan, and Gouda come together on a garlic butter base. A cheese lover\'s dream.',
        category: catMap['premium'],
        isVeg: true, isSpicy: false, isBestseller: true, isFeatured: true,
        ingredients: ['Mozzarella', 'Cheddar', 'Parmesan', 'Gouda', 'Garlic Butter', 'Oregano'],
        sizes: [
          { name: 'Small', price: 299, discountPrice: 0 },
          { name: 'Medium', price: 449, discountPrice: 399 },
          { name: 'Large', price: 599, discountPrice: 539 },
          { name: 'XL', price: 749, discountPrice: 679 },
        ],
        basePrice: 299,
        image: 'https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?w=600&q=80',
        stock: 70, isAvailable: true,
        ratings: { average: 4.9, count: 890 },
        preparationTime: 20,
        addOns: [{ name: 'Extra Cheese', price: 50 }, { name: 'Honey Drizzle', price: 20 }],
        tags: ['vegetarian', 'cheese', 'premium', 'bestseller'],
      },
      {
        name: 'Spicy Jalapeño Bomb',
        slug: 'spicy-jalapeno-bomb',
        description: 'Loaded with jalapeños, habanero sauce, spicy sausage, and pepper jack cheese. Not for the faint-hearted!',
        category: catMap['spicy'],
        isVeg: false, isSpicy: true, isBestseller: false, isFeatured: false,
        ingredients: ['Jalapeños', 'Habanero Sauce', 'Spicy Sausage', 'Pepper Jack', 'Red Onions', 'Cilantro'],
        sizes: [
          { name: 'Small', price: 269, discountPrice: 0 },
          { name: 'Medium', price: 399, discountPrice: 359 },
          { name: 'Large', price: 519, discountPrice: 469 },
          { name: 'XL', price: 629, discountPrice: 569 },
        ],
        basePrice: 269,
        image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600&q=80',
        stock: 60, isAvailable: true,
        ratings: { average: 4.5, count: 450 },
        preparationTime: 20,
        addOns: [{ name: 'Extra Jalapeños', price: 20 }, { name: 'Cooling Ranch', price: 20 }],
        tags: ['non-veg', 'spicy', 'sausage'],
      },
      {
        name: 'Mediterranean Delight',
        slug: 'mediterranean-delight',
        description: 'Sun-dried tomatoes, Kalamata olives, feta cheese, artichokes, and fresh spinach on an olive oil base.',
        category: catMap['veggie'],
        isVeg: true, isSpicy: false, isBestseller: false, isFeatured: false,
        ingredients: ['Sun-dried Tomatoes', 'Kalamata Olives', 'Feta Cheese', 'Artichokes', 'Spinach', 'Olive Oil'],
        sizes: [
          { name: 'Small', price: 249, discountPrice: 0 },
          { name: 'Medium', price: 369, discountPrice: 329 },
          { name: 'Large', price: 479, discountPrice: 429 },
          { name: 'XL', price: 579, discountPrice: 519 },
        ],
        basePrice: 249,
        image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=600&q=80',
        stock: 80, isAvailable: true,
        ratings: { average: 4.6, count: 320 },
        preparationTime: 18,
        addOns: [{ name: 'Extra Feta', price: 35 }, { name: 'Tzatziki Dip', price: 30 }],
        tags: ['vegetarian', 'mediterranean', 'healthy'],
      },
      {
        name: 'Meat Lovers Special',
        slug: 'meat-lovers-special',
        description: 'The ultimate carnivore pizza — loaded with pepperoni, chicken, ham, bacon, and sausage on rich tomato sauce.',
        category: catMap['non-veg'],
        isVeg: false, isSpicy: false, isBestseller: true, isFeatured: true,
        ingredients: ['Pepperoni', 'Grilled Chicken', 'Ham', 'Crispy Bacon', 'Italian Sausage', 'Mozzarella'],
        sizes: [
          { name: 'Small', price: 299, discountPrice: 0 },
          { name: 'Medium', price: 449, discountPrice: 399 },
          { name: 'Large', price: 599, discountPrice: 539 },
          { name: 'XL', price: 749, discountPrice: 679 },
        ],
        basePrice: 299,
        image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&q=80',
        stock: 85, isAvailable: true,
        ratings: { average: 4.8, count: 1320 },
        preparationTime: 25,
        addOns: [{ name: 'Extra Meat', price: 75 }, { name: 'Smoky BBQ Drizzle', price: 20 }],
        tags: ['non-veg', 'meat', 'bestseller'],
      },
      {
        name: 'Pesto Chicken Gourmet',
        slug: 'pesto-chicken-gourmet',
        description: 'Freshly made basil pesto, grilled chicken, cherry tomatoes, pine nuts, and shaved parmesan. Simply elegant.',
        category: catMap['premium'],
        isVeg: false, isSpicy: false, isBestseller: false, isFeatured: false,
        ingredients: ['Basil Pesto', 'Grilled Chicken', 'Cherry Tomatoes', 'Pine Nuts', 'Parmesan', 'Arugula'],
        sizes: [
          { name: 'Small', price: 319, discountPrice: 0 },
          { name: 'Medium', price: 469, discountPrice: 419 },
          { name: 'Large', price: 619, discountPrice: 559 },
          { name: 'XL', price: 769, discountPrice: 699 },
        ],
        basePrice: 319,
        image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=600&q=80',
        stock: 65, isAvailable: true,
        ratings: { average: 4.7, count: 510 },
        preparationTime: 22,
        addOns: [{ name: 'Extra Pesto', price: 30 }, { name: 'Extra Chicken', price: 60 }],
        tags: ['non-veg', 'gourmet', 'premium', 'chicken'],
      },
    ];

    await Pizza.insertMany(pizzas);
    console.log('🍕 Pizzas seeded');

    console.log('\n✅ Database seeded successfully!\n');
    console.log('Demo Credentials:');
    console.log('  Admin:    admin@pizzahub.com / Admin@123');
    console.log('  Customer: customer@pizzahub.com / Customer@123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seed();
