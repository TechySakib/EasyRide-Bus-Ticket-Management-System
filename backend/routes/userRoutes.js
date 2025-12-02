const express = require('express');
const { requireAdmin } = require('../middleware/roleMiddleware');
const UserController = require('../controllers/userController');

const router = express.Router();


router.post('/signup', UserController.signup);
router.post('/send-otp', UserController.sendOtp);

router.post('/create', requireAdmin, UserController.createUser);


router.get('/list', requireAdmin, UserController.listUsers);


router.post('/update-password', UserController.updatePassword);


router.post('/update-role', requireAdmin, UserController.updateRole);

module.exports = router;

