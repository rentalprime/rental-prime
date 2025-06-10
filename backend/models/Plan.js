const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a plan name'],
    trim: true,
    maxlength: [100, 'Plan name cannot be more than 100 characters'],
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Please add a plan description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative']
  },
  interval: {
    type: String,
    required: [true, 'Please add a billing interval'],
    enum: {
      values: ['monthly', 'yearly', 'weekly', 'daily'],
      message: 'Interval must be monthly, yearly, weekly, or daily'
    },
    default: 'monthly'
  },
  features: {
    type: [String],
    required: [true, 'Please add plan features'],
    validate: {
      validator: function(features) {
        return features && features.length > 0;
      },
      message: 'Plan must have at least one feature'
    }
  },
  status: {
    type: String,
    enum: {
      values: ['active', 'inactive', 'draft'],
      message: 'Status must be active, inactive, or draft'
    },
    default: 'active'
  },
  subscribers: {
    type: Number,
    default: 0,
    min: [0, 'Subscribers count cannot be negative']
  },
  maxListings: {
    type: Number,
    default: null, // null means unlimited
    min: [0, 'Max listings cannot be negative']
  },
  maxFeaturedListings: {
    type: Number,
    default: 0,
    min: [0, 'Max featured listings cannot be negative']
  },
  supportLevel: {
    type: String,
    enum: {
      values: ['basic', 'priority', '24/7', 'dedicated'],
      message: 'Support level must be basic, priority, 24/7, or dedicated'
    },
    default: 'basic'
  },
  analyticsAccess: {
    type: Boolean,
    default: false
  },
  apiAccess: {
    type: Boolean,
    default: false
  },
  customBranding: {
    type: Boolean,
    default: false
  },
  priority: {
    type: Number,
    default: 0,
    min: [0, 'Priority cannot be negative']
  },
  trialDays: {
    type: Number,
    default: 0,
    min: [0, 'Trial days cannot be negative']
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create indexes
PlanSchema.index({ status: 1, priority: -1 });
PlanSchema.index({ price: 1 });
PlanSchema.index({ name: 1 });

// Virtual for formatted price
PlanSchema.virtual('formattedPrice').get(function() {
  return `$${this.price.toFixed(2)}`;
});

// Virtual for price per month (for yearly plans)
PlanSchema.virtual('monthlyEquivalent').get(function() {
  if (this.interval === 'yearly') {
    return (this.price / 12).toFixed(2);
  }
  return this.price.toFixed(2);
});

// Static method to get active plans
PlanSchema.statics.getActivePlans = function() {
  return this.find({ status: 'active' }).sort({ priority: -1, price: 1 });
};

// Static method to get plan statistics
PlanSchema.statics.getPlanStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalSubscribers: { $sum: '$subscribers' },
        avgPrice: { $avg: '$price' }
      }
    }
  ]);
};

// Instance method to increment subscribers
PlanSchema.methods.incrementSubscribers = function() {
  this.subscribers += 1;
  return this.save();
};

// Instance method to decrement subscribers
PlanSchema.methods.decrementSubscribers = function() {
  if (this.subscribers > 0) {
    this.subscribers -= 1;
  }
  return this.save();
};

// Pre-save middleware to handle slug generation if needed
PlanSchema.pre('save', function(next) {
  // Convert name to lowercase for case-insensitive uniqueness check
  if (this.isModified('name')) {
    this.name = this.name.trim();
  }
  next();
});

module.exports = mongoose.model('Plan', PlanSchema);
