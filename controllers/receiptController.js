const crypto = require('crypto');
const Receipt = require('../models/Receipt');

const RECEIPT_VALIDITY_HOURS = 72;

/**
 * Create a new digital receipt
 * POST /api/receipts
 */
const createReceipt = async (req, res) => {
    try {
        const {
            orderNo,
            transactionId,
            productName,
            amount,
            status,
        } = req.body;

        // Validate required fields
        if (
            !orderNo ||
            !transactionId ||
            !productName ||
            amount === undefined ||
            amount === null
        ) {
            return res.status(400).json({
                success: false,
                message:
                    'orderNo, transactionId, productName and amount are required.',
            });
        }

        // Only create receipts for successful payments
        if (status && status !== 'SUCCESS') {
            return res.status(400).json({
                success: false,
                message:
                    'Receipt can only be created for a successful payment.',
            });
        }

        // Generate secure random token
        const receiptToken =
            crypto.randomBytes(32).toString('hex');

        // Receipt expires after 72 hours
        const expiresAt = new Date(
            Date.now() +
            RECEIPT_VALIDITY_HOURS *
            60 *
            60 *
            1000,
        );

        const receipt = await Receipt.create({
            orderNo: String(orderNo),
            transactionId: String(transactionId),
            productName: String(productName),
            amount: Number(amount),
            status: 'SUCCESS',
            receiptToken,
            expiresAt,
        });

        const baseUrl = (
            process.env.RECEIPT_BASE_URL ||
            `${req.protocol}://${req.get('host')}`
        ).replace(/\/$/, '');

        const receiptUrl =
            `${baseUrl}/receipt/${receiptToken}`;

        return res.status(201).json({
            success: true,
            message:
                'Receipt created successfully.',
            receipt: {
                id: receipt._id,
                orderNo: receipt.orderNo,
                transactionId: receipt.transactionId,
                productName: receipt.productName,
                amount: receipt.amount,
                status: receipt.status,
                receiptToken:
                receipt.receiptToken,
                receiptUrl,
                expiresAt:
                receipt.expiresAt,
            },
        });
    } catch (error) {
        console.error(
            'CREATE RECEIPT ERROR:',
            error,
        );

        return res.status(500).json({
            success: false,
            message:
                'Failed to create receipt.',
            error: error.message,
        });
    }
};

/**
 * Get receipt using receipt token
 * GET /api/receipts/:token
 */
const getReceipt = async (req, res) => {
    try {
        const {token} = req.params;

        if (!token) {
            return res.status(400).json({
                success: false,
                message:
                    'Receipt token is required.',
            });
        }

        const receipt =
            await Receipt.findOne({
                receiptToken: token,
            }).lean();

        if (!receipt) {
            return res.status(404).json({
                success: false,
                message:
                    'Receipt not found.',
            });
        }

        // Check 72-hour expiry
        if (
            new Date() >
            new Date(receipt.expiresAt)
        ) {
            return res.status(410).json({
                success: false,
                expired: true,
                message:
                    'This receipt has expired.',
                expiresAt:
                receipt.expiresAt,
            });
        }

        return res.status(200).json({
            success: true,
            receipt: {
                orderNo:
                receipt.orderNo,
                transactionId:
                receipt.transactionId,
                productName:
                receipt.productName,
                amount:
                receipt.amount,
                status:
                receipt.status,
                expiresAt:
                receipt.expiresAt,
                createdAt:
                receipt.createdAt,
            },
        });
    } catch (error) {
        console.error(
            'GET RECEIPT ERROR:',
            error,
        );

        return res.status(500).json({
            success: false,
            message:
                'Failed to retrieve receipt.',
            error: error.message,
        });
    }
};

/**
 * Get receipt using order number
 *
 * This is used by the new Receipt Web.
 *
 * GET /api/receipts/order/:orderNo
 */
const getReceiptByOrderNo = async (
    req,
    res,
) => {
    try {
        const {orderNo} = req.params;

        if (!orderNo) {
            return res.status(400).json({
                success: false,
                message:
                    'Order number is required.',
            });
        }

        const receipt =
            await Receipt.findOne({
                orderNo: String(orderNo).trim(),
            }).lean();

        if (!receipt) {
            return res.status(404).json({
                success: false,
                message:
                    'Receipt not found. It may still be preparing.',
            });
        }

        // Check 72-hour expiry
        if (
            new Date() >
            new Date(receipt.expiresAt)
        ) {
            return res.status(410).json({
                success: false,
                expired: true,
                message:
                    'This receipt has expired.',
                expiresAt:
                receipt.expiresAt,
            });
        }

        return res.status(200).json({
            success: true,
            receipt: {
                orderNo:
                receipt.orderNo,

                transactionId:
                receipt.transactionId,

                productName:
                receipt.productName,

                amount:
                receipt.amount,

                status:
                receipt.status,

                expiresAt:
                receipt.expiresAt,

                createdAt:
                receipt.createdAt,
            },
        });
    } catch (error) {
        console.error(
            'GET RECEIPT BY ORDER NO ERROR:',
            error,
        );

        return res.status(500).json({
            success: false,
            message:
                'Failed to retrieve receipt.',
            error: error.message,
        });
    }
};

module.exports = {
    createReceipt,
    getReceipt,
    getReceiptByOrderNo,
};