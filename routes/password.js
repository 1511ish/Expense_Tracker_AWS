const express = require('express');

const router = express.Router();

const passwordController = require('../contoller/password');

router.post('/forgotpassword', passwordController.postResetPassword);
router.get('/resetPassword/:forgotPassId', passwordController.getResetPassword);
router.post('/updatepassword/:forgotPassId', passwordController.updatePassword)

module.exports = router;