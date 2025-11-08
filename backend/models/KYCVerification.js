const mongoose = require('mongoose');

const kycVerificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['unverified', 'pending', 'under_review', 'approved', 'rejected'],
    default: 'unverified'
  },
  tier: {
    type: String,
    enum: ['basic', 'advanced', 'premium'],
    default: 'basic'
  },
  documents: {
    governmentId: {
      front: String,
      back: String,
      uploadedAt: Date
    },
    proofOfAddress: {
      url: String,
      uploadedAt: Date
    },
    selfieWithId: {
      url: String,
      uploadedAt: Date
    }
  },
  personalInfo: {
    dateOfBirth: Date,
    nationality: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String
    },
    idNumber: String,
    idType: {
      type: String,
      enum: ['passport', 'drivers_license', 'national_id']
    }
  },
  businessInfo: {
    companyName: String,
    registrationNumber: String,
    taxId: String,
    businessType: String
  },
  verificationNotes: String,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  reviewedAt: Date,
  rejectionReason: String,
  resubmissionAllowed: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('KYCVerification', kycVerificationSchema);
