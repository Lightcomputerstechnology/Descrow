const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = ['uploads/kyc', 'uploads/delivery', 'uploads/disputes', 'uploads/chat', 'uploads/escrow'];
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
    } else if (req.baseUrl.includes('/escrow')) {
      uploadPath += 'escrow/';
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
  const allowedTypes = /jpeg|jpg|png|pdf|gif|doc|docx|txt|mp4|mov|avi|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images, PDFs, documents, and video files are allowed'));
  }
};

// Multer upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB max file size
  },
  fileFilter: fileFilter
});

// Upload single file
exports.uploadSingle = (fieldName) => {
  return (req, res, next) => {
    const uploadSingle = upload.single(fieldName);
    
    uploadSingle(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 25MB'
          });
        }
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
        req.fileData = {
          filename: req.file.filename,
          originalname: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          path: req.file.path
        };
      }
      
      next();
    });
  };
};

// Upload multiple files
exports.uploadMultiple = (fieldName, maxCount = 10) => {
  return (req, res, next) => {
    const uploadMultiple = upload.array(fieldName, maxCount);
    
    uploadMultiple(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'One or more files are too large. Maximum size is 25MB per file'
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            message: `Too many files. Maximum ${maxCount} files allowed`
          });
        }
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
        req.filesData = req.files.map(file => ({
          filename: file.filename,
          originalname: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          path: file.path
        }));
      }
      
      next();
    });
  };
};

// Upload for escrow attachments specifically
exports.uploadEscrowAttachments = (req, res, next) => {
  const uploadMultiple = upload.array('attachments', 10);
  
  uploadMultiple(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 25MB per file'
        });
      }
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
    
    // Add file data to request for escrow creation
    if (req.files && req.files.length > 0) {
      req.attachments = req.files.map(file => ({
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        path: file.path,
        url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/${file.path}`
      }));
    }
    
    next();
  });
};

// Middleware to handle file deletion on failed operations
exports.cleanupFiles = (files) => {
  return (req, res, next) => {
    // Store original send function
    const originalSend = res.send;
    
    // Override send function
    res.send = function(data) {
      // If response indicates error, clean up uploaded files
      try {
        const responseData = JSON.parse(data);
        if (!responseData.success && req.files) {
          req.files.forEach(file => {
            try {
              if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
              }
            } catch (cleanupErr) {
              console.error('Error cleaning up file:', cleanupErr);
            }
          });
        }
      } catch (e) {
        // Not JSON response, continue
      }
      
      // Call original send function
      originalSend.call(this, data);
    };
    
    next();
  };
};