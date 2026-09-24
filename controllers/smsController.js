const Receipt = require('../models/Receipt');
const { sendSMS } = require('../services/smsService');

const sendReceiptSMS = async (req, res) => {
    try {
        const { token, phone } = req.body;

        if (!token || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Receipt token and phone number are required.',
            });
        }

        const receipt = await Receipt.findOne({
            receiptToken: token,
        });

        if (!receipt) {
            return res.status(404).json({
                success: false,
                message: 'Receipt not found.',
            });
        }

        // Server-side 72-hour expiry check
        if (new Date() > new Date(receipt.expiresAt)) {
            return res.status(410).json({
                success: false,
                expired: true,
                message: 'This receipt has expired.',
            });
        }

        const baseUrl = (
            process.env.RECEIPT_BASE_URL ||
            `${req.protocol}://${req.get('host')}`
        ).replace(/\/$/, '');

        const receiptUrl = `${baseUrl}/receipt/${receipt.receiptToken}`;

        const message =
            `BREWBOT\n` +
            `Payment Receipt\n\n` +
            `Product: ${receipt.productName}\n` +
            `Amount: LKR ${receipt.amount.toFixed(2)}\n` +
            `Order No: ${receipt.orderNo}\n\n` +
            `Your payment was successful.\n\n` +
            `View Receipt:\n${receiptUrl}\n\n` +
            `Thank you for using BrewBot.`;

        const smsResult = await sendSMS({
            phone,
            message,
        });

        if (!smsResult.success) {
            return res.status(502).json({
                success: false,
                message: smsResult.message || 'Failed to send SMS.',
            });
        }

        receipt.customerPhone = phone;
        receipt.smsSent = true;
        receipt.smsSentAt = new Date();

        await receipt.save();

        return res.status(200).json({
            success: true,
            message: 'Receipt SMS sent successfully.',
            receipt: {
                orderNo: receipt.orderNo,
                phone,
                smsSent: true,
                smsSentAt: receipt.smsSentAt,
            },
        });
    } catch (error) {
        console.error('SEND RECEIPT SMS ERROR:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to send receipt SMS.',
            error: error.message,
        });
    }
};

module.exports = {
    sendReceiptSMS,
};