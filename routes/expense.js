const express = require('express');

const router = express.Router();

const expenseController = require('../contoller/expense');
const userAuthentication = require('../middleware/auth');

router.post('/add-expense', userAuthentication.authenticate, expenseController.addExpense);
router.get('/get-expenses', userAuthentication.authenticate,expenseController.getExpenses);
// router.get('/get-expensesById',expenseController.getExpensesById);

// router.get('/get-expenses-byDate/:date', userAuthentication.authenticate, expenseController.getDailyExpenses);
// router.get('/get-expenses-byMonth/:month', userAuthentication.authenticate, expenseController.getMonthlyExpenses);
router.delete('/delete-expense/:id', userAuthentication.authenticate, expenseController.deleteExpense);

module.exports = router;