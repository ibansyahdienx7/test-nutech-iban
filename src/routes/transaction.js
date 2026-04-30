const express      = require('express');
const authenticate = require('../middleware/auth');
const {
  getBalance, topUp, transaction, transactionHistory
} = require('../controllers/transactionController');

const router = express.Router();

router.get('/balance',             authenticate, getBalance);
router.post('/topup',              authenticate, topUp);
router.post('/transaction',        authenticate, transaction);
router.get('/transaction/history', authenticate, transactionHistory);

module.exports = router;
