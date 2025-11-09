const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth.middleware');
const deliveryController = require('../controllers/delivery.controller');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/delivery-proof/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'delivery-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) cb(null, true);
    else cb(new Error('Only images and PDF files are allowed'));
  }
});

// Protect all routes
router.use(protect);

// Upload delivery proof
router.post('/:escrowId/proof', upload.array('photos', 5), deliveryController.uploadDeliveryProof);

// Get delivery details
router.get('/:escrowId/tracking', deliveryController.getDeliveryDetails);

// Update tracking/GPS
router.post('/:escrowId/gps', deliveryController.updateTracking);

module.exports = router;