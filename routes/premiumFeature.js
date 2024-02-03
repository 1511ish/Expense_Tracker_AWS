const express = require('express');

const premiumFeatureController = require('../contoller/premiumFeature');

const userAuthentication = require('../middleware/auth');

const router = express.Router();

router.get('/showLeaderBoard', userAuthentication.authenticate, premiumFeatureController.getLeaderBoard);

router.get('/report', premiumFeatureController.getReportPage);
router.get('/leaderboard', premiumFeatureController.getLeaderboardPage);
router.get('/dailyReport/:date', userAuthentication.authenticate, premiumFeatureController.getDailyExpenses);
router.get('/monthlyReport/:month', userAuthentication.authenticate, premiumFeatureController.getMonthlyExpenses);
router.get('/get-downlodedFileUrls',userAuthentication.authenticate,premiumFeatureController.getDownlodedFileUrls);
router.get('/download/:date',userAuthentication.authenticate,premiumFeatureController.downloadExpense);

module.exports = router;