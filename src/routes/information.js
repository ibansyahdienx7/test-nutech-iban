const express      = require('express');
const authenticate = require('../middleware/auth');
const { getBanners, getServices } = require('../controllers/informationController');

const router = express.Router();

router.get('/banner', getBanners);
router.get('/services', authenticate, getServices);

module.exports = router;
