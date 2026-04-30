const express    = require('express');
const path       = require('path');
const multer     = require('multer');
const authenticate = require('../middleware/auth');
const {
  register, login, getProfile, updateProfile, uploadProfileImage
} = require('../controllers/membershipController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const suffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, suffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'file'));
  }
};

const upload = multer({ storage, fileFilter });

router.post('/registration', register);
router.post('/login', login);
router.get('/profile', authenticate, getProfile);
router.put('/profile/update', authenticate, updateProfile);

router.put('/profile/image', authenticate, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        status: 102,
        message: 'Format Image tidak sesuai',
        data: null
      });
    }
    next();
  });
}, uploadProfileImage);

module.exports = router;
