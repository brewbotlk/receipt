const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema(
    {
        orderNo: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        transactionId: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        productName: {
            type: String,
            required: true,
            trim: true,
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        status: {
            type: String,
            enum: ['SUCCESS'],
            default: 'SUCCESS',
        },

        receiptToken: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        expiresAt: {
            type: Date,
            required: true,
            index: true,
        },

        customerPhone: {
            type: String,
            default: null,
            trim: true,
        },

        smsSent: {
            type: Boolean,
            default: false,
        },

        smsSentAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

const Receipt = mongoose.model('Receipt', receiptSchema);

module.exports = Receipt;