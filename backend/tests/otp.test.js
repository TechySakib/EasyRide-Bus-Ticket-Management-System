const { sendOTP, verifyOTP } = require('../utils/otpUtils');
const axios = require('axios');

// Mock axios to prevent actual API calls
jest.mock('axios');

describe('OTP Utility Functions', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        // Reset the otpStore (though it's internal to the module, we can rely on verifyOTP behavior)
    });

    describe('validatePhoneNumber (via sendOTP)', () => {
        it('should throw an error for an invalid phone number', async () => {
            const invalidPhone = '12345';
            await expect(sendOTP(invalidPhone)).rejects.toThrow('Number is not valid');
        });

        it('should accept a valid phone number', async () => {
            const validPhone = '01712345678';
            // Mock axios.get to resolve successfully
            axios.get.mockResolvedValue({ data: 'success' });

            const otp = await sendOTP(validPhone);
            expect(otp).toBeDefined();
            expect(otp.length).toBe(6);
        });
    });

    describe('sendOTP', () => {
        it('should generate a 6-digit OTP and send it via SMS API', async () => {
            const phone = '01712345678';
            axios.get.mockResolvedValue({ data: 'success' });

            const otp = await sendOTP(phone);

            expect(otp).toMatch(/^\d{6}$/); // Check if it's a 6-digit number string
            expect(axios.get).toHaveBeenCalledTimes(1);
            expect(axios.get).toHaveBeenCalledWith(expect.stringContaining(phone));
            expect(axios.get).toHaveBeenCalledWith(expect.stringContaining(otp));
        });

        it('should handle API errors gracefully', async () => {
            const phone = '01712345678';
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            axios.get.mockRejectedValue(new Error('API Error'));

            const otp = await sendOTP(phone);

            expect(otp).toBeDefined(); // OTP should still be generated and returned
            expect(consoleSpy).toHaveBeenCalledWith('Error sending SMS:', expect.any(Error));
            consoleSpy.mockRestore();
        });
    });

    describe('verifyOTP', () => {
        it('should return true for a valid and correct OTP', async () => {
            const phone = '01712345678';
            axios.get.mockResolvedValue({ data: 'success' });
            const otp = await sendOTP(phone);

            const isValid = verifyOTP(phone, otp);
            expect(isValid).toBe(true);
        });

        it('should return false for an incorrect OTP', async () => {
            const phone = '01712345678';
            axios.get.mockResolvedValue({ data: 'success' });
            await sendOTP(phone);

            const isValid = verifyOTP(phone, '000000');
            expect(isValid).toBe(false);
        });

        it('should return false if no OTP was sent for the number', () => {
            const isValid = verifyOTP('01987654321', '123456');
            expect(isValid).toBe(false);
        });

        it('should return false for an expired OTP', async () => {
            jest.useFakeTimers();
            const phone = '01712345678';
            axios.get.mockResolvedValue({ data: 'success' });
            const otp = await sendOTP(phone);

            // Fast-forward time by 6 minutes (expiration is 5 minutes)
            jest.advanceTimersByTime(6 * 60 * 1000);

            const isValid = verifyOTP(phone, otp);
            expect(isValid).toBe(false);

            jest.useRealTimers();
        });

        it('should invalidate OTP after successful verification (one-time use)', async () => {
            const phone = '01712345678';
            axios.get.mockResolvedValue({ data: 'success' });
            const otp = await sendOTP(phone);

            // First verification should succeed
            expect(verifyOTP(phone, otp)).toBe(true);

            // Second verification should fail
            expect(verifyOTP(phone, otp)).toBe(false);
        });
    });
});
