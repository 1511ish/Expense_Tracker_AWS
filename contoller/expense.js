// const { default: products } = require('razorpay/dist/types/products');
const Expense = require('../models/Expense');
const sequelize = require('../util/database');
// const Awsservice = require('../services/awsservices');
require('dotenv').config();

let userId;


exports.addExpense = async (req, res, next) => {
    try {
        const user = req.user;
        const amount = req.body.amount;
        const description = req.body.description;
        const category = req.body.category;
        const t = await sequelize.transaction();

        const promise1 = user.createExpense({ expense_amount: amount, description: description, category: category, userId: userId }, { transaction: t });
        const promise2 = user.update({ totalExpense: parseInt(user.totalExpense) + parseInt(amount) }, { transaction: t })

        Promise.all([promise1, promise2])
            .then(async ([res1, res2]) => {
                await t.commit();
                res.status(201).json({ newExpenseDetail: res1 });
                console.log('SUCCESSFULLY ADDED');
            })
            .catch(async (err) => {
                await t.rollback();
                console.log(err);
                throw new Error(err);
            })
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: err })
    }
}


exports.getExpenses = (req, res, next) => {
    const page = parseInt(req.query.page);
    let ITEMS_PER_PAGE = parseInt(req.query.pageSize);

    let totalItems;

    Expense.count({ where: { userId: req.userId } })
        .then((total) => {
            totalItems = total;
            return Expense.findAll({
                where: { userId: req.userId },
                limit: ITEMS_PER_PAGE,
                offset: (page - 1) * ITEMS_PER_PAGE,
                attributes: [
                    'id',
                    'expense_amount',
                    'description',
                    'category',
                    [sequelize.literal("DATE_FORMAT(updatedAt, '%d-%m-%Y')"), 'date']
                ]
            })
        })
        .then((expenses) => {
            res.status(200).json({
                allExpenses: expenses,
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                nextPage: page + 1,
                hasPreviousPage: page > 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
            })
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: err });
        })
}


exports.deleteExpense = async (req, res, next) => {
    try {
        const user = req.user;
        const expenseId = req.params.id;
        const expense = await Expense.findByPk(expenseId);
        const amount = expense.expense_amount;
        const t = await sequelize.transaction();

        const promise1 = user.update({ totalExpense: parseInt(user.totalExpense) - parseInt(amount) }, { transaction: t });
        const promise2 = Expense.destroy({ where: { id: expenseId } }, { transaction: t });
        Promise.all([promise1, promise2])
            .then(async ([res1, res2]) => {
                // res.status(201).json({ newExpenseDetail: res1 });
                await t.commit();
                console.log('SUCCESSFULLY DELETED');
            })
            .catch(async (err) => {
                await t.rollback();
                console.log(err);
                throw new Error(err);
            })
        res.sendStatus(200);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
}


