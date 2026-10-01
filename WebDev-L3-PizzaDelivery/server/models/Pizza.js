const mongoose = require('mongoose');

const pizzaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Pizza name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    isVeg: {
      type: Boolean,
      default: true,
    },
    isSpicy: {
      type: Boolean,
      default: false,
    },
    isBestseller: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    ingredients: [String],
    sizes: [
      {
        name: {
          type: String,
          enum: ['Small', 'Medium', 'Large', 'XL'],
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        discountPrice: {
          type: Number,
          default: 0,
        },
      },
    ],
    basePrice: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      default: '',
    },
    images: [String],
    stock: {
      type: Number,
      default: 100,
      min: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    preparationTime: {
      type: Number, // in minutes
      default: 20,
    },
    addOns: [
      {
        name: String,
        price: Number,
      },
    ],
    tags: [String],
  },
  { timestamps: true }
);


module.exports = mongoose.model('Pizza', pizzaSchema);
