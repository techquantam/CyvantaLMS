const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`);
  },
});

const resourceFileFilter = (req, file, cb) => {
  // Allow PDFs, Word Docs, Powerpoint, Text and basic images
  const filetypes = /pdf|doc|docx|ppt|pptx|xls|xlsx|txt|png|jpg|jpeg/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname || mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only standard resource documents (PDF, DOCX, etc.) are allowed!'));
  }
};

const imageFileFilter = (req, file, cb) => {
  // Allow PNG, JPG, JPEG, WEBP, GIF
  const filetypes = /png|jpg|jpeg|webp|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname || mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (PNG, JPG, JPEG, WEBP, GIF) are allowed!'));
  }
};

const uploadResource = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: resourceFileFilter,
});

const uploadImage = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for images
  fileFilter: imageFileFilter,
});

// Backward compatibility: export uploadResource directly and attach uploadImage as property
module.exports = Object.assign(uploadResource, {
  uploadResource,
  uploadImage
});
