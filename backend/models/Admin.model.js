const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false
  },
  role: {
    type: String,
    enum: ['master', 'sub_admin'],
    required: true
  },
  permissions: {
    viewTransactions: {
      type: Boolean,
      default: false
    },
    manageDisputes: {
      type: Boolean,
      default: false
    },
    verifyUsers: {
      type: Boolean,
      default: false
    },
    viewAnalytics: {
      type: Boolean,
      default: false
    },
    managePayments: {
      type: Boolean,
      default: false
    },
    manageAPI: {
      type: Boolean,
      default: false
    },
    manageAdmins: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active'
  },
  actionsCount: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Master admin gets all permissions
adminSchema.pre('save', function(next) {
  if (this.role === 'master') {
    this.permissions = {
      viewTransactions: true,
      manageDisputes: true,
      verifyUsers: true,
      viewAnalytics: true,
      managePayments: true,
      manageAPI: true,
      manageAdmins: true
    };
  }
  next();
});

module.exports = mongoose.model('Admin', adminSchema);
