const axios = require('axios');

const sendSMS = async ({phone, message}) => {
    try {
        if (!phone) {
            throw new Error('Phone number is required.');
        }

        if (!message) {
            throw new Error('SMS message is required.');
        }

        const userId = process.env.NOTIFY_USER_ID;
        const apiKey = process.env.NOTIFY_API_KEY;
        const senderId = process.env.NOTIFY_SENDER_ID;

        if (!userId) {
            throw new Error('NOTIFY_USER_ID is not configured.');
        }

        if (!apiKey) {
            throw new Error('NOTIFY_API_KEY is not configured.');
        }

        if (!senderId) {
            throw new Error('NOTIFY_SENDER_ID is not configured.');
        }

        // Convert Sri Lankan local number to Notify format.
        let formattedPhone = String(phone).replace(/\s+/g, '');

        if (formattedPhone.startsWith('+94')) {
            formattedPhone = formattedPhone.substring(1);
        } else if (formattedPhone.startsWith('0')) {
            formattedPhone = `94${formattedPhone.substring(1)}`;
        }

        const response = await axios.post(
            'https://app.notify.lk/api/v1/send',
            null,
            {
                params: {
                    user_id: userId,
                    api_key: apiKey,
                    sender_id: senderId,
                    to: formattedPhone,
                    message,
                },
                timeout: 15000,
            },
        );

        console.log('Notify SMS response:', response.data);

        if (response.data?.status !== 'success') {
            return {
                success: false,
                message:
                    response.data?.data ||
                    'Notify SMS failed.',
                data: response.data,
            };
        }

        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        console.error(
            'SMS SERVICE ERROR:',
            error.response?.data || error.message,
        );

        return {
            success: false,
            message:
                error.response?.data?.message ||
                error.response?.data?.data ||
                error.message ||
                'Failed to send SMS.',
        };
    }
};

module.exports = {
    sendSMS,
};