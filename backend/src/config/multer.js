const multer = require('multer');
const path = require('path');

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const memoryStorage = multer.memoryStorage();

const hybridStorage = {
  _handleFile: (req, file, cb) => {
    if (file.fieldname === 'logo') {
      memoryStorage._handleFile(req, file, cb);
    } else {
      diskStorage._handleFile(req, file, cb);
    }
  },
  _removeFile: (req, file, cb) => {
    if (file.fieldname === 'logo') {
      memoryStorage._removeFile(req, file, cb);
    } else {
      diskStorage._removeFile(req, file, cb);
    }
  }
};

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'logo') {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, GIF, and WEBP images are allowed for logo'), false);
    }
  } else {
    const allowedMimes = ['application/pdf', 'text/plain'];
    if (allowedMimes.includes(file.mimetype) || file.originalname.endsWith('.txt') || file.originalname.endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and TXT files are allowed'), false);
    }
  }
};

const upload = multer({
  storage: hybridStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

module.exports = upload;