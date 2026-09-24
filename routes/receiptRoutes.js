const express = require('express');

const {
    createReceipt,
    getReceipt,
} = require('../controllers/receiptController');

const {
    sendReceiptSMS,
} = require('../controllers/smsController');

const router = express.Router();

router.post('/', createReceipt);

router.get('/:token', getReceipt);

router.post('/send-sms', sendReceiptSMS);

module.exports = router;