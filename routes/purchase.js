const express = require('express');

const purchaseController = require('../contoller/purchase');

const authenticationMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/premiummembership', authenticationMiddleware.authenticate, purchaseController.purchasepremium);

router.post('/updatetransactionstatus', authenticationMiddleware.authenticate, purchaseController.updateTransactionStatus);

router.post('/updatefailedtransactionstatus', authenticationMiddleware.authenticate, purchaseController.updateFailedTransactionStatus);

module.exports = router;