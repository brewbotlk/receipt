const express = require('express');

const {
    createReceipt,
    getReceipt,
    getReceiptByOrderNo,
} = require('../controllers/receiptController');

const {
    sendReceiptSMS,
} = require('../controllers/smsController');

const router = express.Router();

router.post('/', createReceipt);

// IMPORTANT: Keep this BEFORE /:token
router.get(
    '/order/:orderNo',
    getReceiptByOrderNo,
);

router.get('/:token', getReceipt);

router.post(
    '/send-sms',
    sendReceiptSMS,
);

module.exports = router;const express = require('express');

const {
    createReceipt,
    getReceipt,
    getReceiptByOrderNo,
} = require('../controllers/receiptController');

const {
    sendReceiptSMS,
} = require('../controllers/smsController');

const router = express.Router();

router.post('/', createReceipt);

// IMPORTANT: Keep this BEFORE /:token
router.get(
    '/order/:orderNo',
    getReceiptByOrderNo,
);

router.get('/:token', getReceipt);

router.post(
    '/send-sms',
    sendReceiptSMS,
);

module.exports = router;