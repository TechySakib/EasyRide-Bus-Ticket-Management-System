const axios = require('axios');

/**
 * In-memory storage for OTPs.
 * Key: Phone number
 * Value: { otp: string, expires: number }
 * @type {Map<string, {otp: string, expires: number}>}
 */
const otpStore = new Map();

/**
 * Generates a random 6-digit OTP.
 * @returns {string} The generated OTP.
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Validates a Bangladeshi phone number.
 * Supports formats: 01xxxxxxxxx, 8801xxxxxxxxx, +8801xxxxxxxxx.
 * 
 * @param {string} phone - The phone number to validate.
 * @returns {boolean} True if the phone number is valid, false otherwise.
 */
const validatePhoneNumber = (phone) => {
    const regex = /^(?:\+88|88)?(01[3-9]\d{8})$/;
    return regex.test(phone);
};

/**
 * Sends an OTP to the specified phone number using BulkSMSBD API.
 * Validates the phone number before sending.
 * 
 * @param {string} phone - The phone number to send the OTP to.
 * @returns {Promise<string>} The generated OTP.
 * @throws {Error} If the phone number is invalid (throws "Number is not valid").
 */
const sendOTP = async (phone) => {
    if (!validatePhoneNumber(phone)) {
        throw new Error('Number is not valid');
    }

    const otp = generateOTP();
    const expires = Date.now() + 5 * 60 * 1000;
    otpStore.set(phone, { otp, expires });

    const apiKey = 'Np0orDyjggiuSfGnsCLd';
    const senderId = '8809617613507';
    const message = `Your EasyRide OTP is ${otp}`;
    const url = `http://bulksmsbd.net/api/smsapi?api_key=${apiKey}&type=text&number=${phone}&senderid=${senderId}&message=${encodeURIComponent(message)}`;

    try {
        await axios.get(url);
    } catch (error) {
        console.error('Error sending SMS:', error);
    }

    return otp;
};

/**
 * Verifies the OTP for a given phone number.
 * 
 * @param {string} phone - The phone number to verify.
 * @param {string} otp - The OTP to check.
 * @returns {boolean} True if the OTP is valid and not expired, false otherwise.
 */
const verifyOTP = (phone, otp) => {
    const record = otpStore.get(phone);

    if (!record) {
        return false;
    }

    if (Date.now() > record.expires) {
        otpStore.delete(phone);
        return false;
    }

    if (record.otp === otp) {
        otpStore.delete(phone);
        return true;
    }

    return false;
};

module.exports = {
    sendOTP,
    verifyOTP
};
