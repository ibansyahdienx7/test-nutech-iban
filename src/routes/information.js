const express      = require('express');
const authenticate = require('../middleware/auth');
const {
  getBanners, storeBanner, updateBanner, deleteBanner,
  getServices, storeService, updateService, deleteService
} = require('../controllers/informationController');

const router = express.Router();

router.get('/banner',                    getBanners);
router.post('/banner',                   authenticate, storeBanner);
router.put('/banner/:id',                authenticate, updateBanner);
router.delete('/banner/:id',             authenticate, deleteBanner);

router.get('/services',                  authenticate, getServices);
router.post('/services',                 authenticate, storeService);
router.put('/services/:id',              authenticate, updateService);
router.delete('/services/:id',           authenticate, deleteService);

module.exports = router;
