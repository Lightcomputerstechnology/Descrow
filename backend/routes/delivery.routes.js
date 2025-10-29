const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const deliveryController = require('../controllers/delivery.controller');
const { protect } = require('../middleware/auth.middleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/delivery-proof/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'delivery-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed'));
    }
  }
});

// Upload delivery proof
router.post('/:escrowId/proof',
  protect,
  upload.array('photos', 5), // Max 5 photos
  deliveryController.uploadDeliveryProof
);

// Get delivery tracking info
router.get('/:escrowId/tracking', protect, deliveryController.getDeliveryTracking);

// Update GPS location (for personal delivery)
router.post('/:escrowId/gps', protect, deliveryController.updateGPSLocation);

module.exports = router;
