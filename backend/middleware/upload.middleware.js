const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = ['uploads/kyc', 'uploads/delivery', 'uploads/disputes', 'uploads/chat'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/';
    
    if (req.baseUrl.includes('/delivery')) {
      uploadPath += 'delivery/';
    } else if (req.baseUrl.includes('/users') && req.path.includes('/kyc')) {
      uploadPath += 'kyc/';
    } else if (req.baseUrl.includes('/disputes')) {
      uploadPath += 'disputes/';
    } else if (req.baseUrl.includes('/chat')) {
      uploadPath += 'chat/';
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images and PDF files are allowed'));
  }
};

// Multer upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  },
  fileFilter: fileFilter
});

// Upload single file
exports.uploadSingle = (fieldName) => {
  return (req, res, next) => {
    const uploadSingle = upload.single(fieldName);
    
    uploadSingle(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message: 'File upload error',
          error: err.message
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      // Add file URL to request
      if (req.file) {
        req.fileUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/${req.file.path}`;
      }
      
      next();
    });
  };
};

// Upload multiple files
exports.uploadMultiple = (fieldName, maxCount = 5) => {
  return (req, res, next) => {
    const uploadMultiple = upload.array(fieldName, maxCount);
    
    uploadMultiple(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message: 'File upload error',
          error: err.message
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      // Add file URLs to request
      if (req.files && req.files.length > 0) {
        req.fileUrls = req.files.map(file => 
          `${process.env.BACKEND_URL || 'http://localhost:5000'}/${file.path}`
        );
      }
      
      next();
    });
  };
};
