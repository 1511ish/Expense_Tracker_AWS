const User = require('../models/User');
const Expense = require('../models/Expense');
const sequelize = require('../util/database');
const Sequelize = require('sequelize');
const DownloadedUrl = require('../models/DownloadedUrl');
const Awsservice = require('../services/awsservices');
// const AWS = require('aws-sdk');
// require('dotenv').config();



exports.getLeaderBoard = async (req, res, next) => {
    try {
        const leaderBoardUsers = await User.findAll({
            //attributes: ['id', 'name', [sequelize.fn('sum', sequelize.col('expenses.expense_amount')), 'total_cost']],
            // include: [
            //     {
            //         model: Expense,
            //         attributes: []
            //     }
            // ],
            // group: ['user.id'],

            //it is a optimise way..
            attributes: ['id', 'name','totalExpense'],
            order: [['totalExpense','DESC']]

        })
        res.status(200).json(leaderBoardUsers);
    } catch (err) {
        console.log(err)
        res.status(403).json({ message: 'Error fetching leader board!' })
    }
}
// exports.getLeaderBoard = async (req, res, next) => {
//     try {
//         const users = await User.findAll();
//         const expenses = await Expense.findAll();
//         const userAggregatedExpenses = {};
//         console.log(expenses);
//         expenses.forEach(expense => {
//             if(userAggregatedExpenses[expense.userId]){
//                 userAggregatedExpenses[expense.userId] += expense.expense_amount;
//             }else{
//                 userAggregatedExpenses[expense.userId] = expense.expense_amount;
//             }

//         });

//         const userLeaderBoardDetails = [];
//         users.forEach((user) => {
//             userLeaderBoardDetails.push({name: user.name, total_cost: userAggregatedExpenses[user.id]||0} )
//         })
//         userLeaderBoardDetails.sort((a,b) => b.total_cost - a.total_cost);
//         console.log(userLeaderBoardDetails);
//         res.status(200).json(userLeaderBoardDetails);

//     } catch (err) {
//         console.log(err)
//         res.status(403).json({ message: 'Error fetching leader board!' })
//     }
// }

exports.getReportPage = (req,res,next) => {
    res.sendFile('report.html',{root:'views'});
}

exports.getLeaderboardPage = (req,res,next) => {
    res.sendFile('leaderboard.html',{root:'views'});
}

exports.getDailyExpenses = async (req, res, next) => {
    const desiredDate = (req.params.date);
    try {
        const expenses = await req.user.getExpenses({
            //i want to know can we write below line with two condtion.
            where: Sequelize.literal(`DATE(updatedAt) = '${desiredDate}'`),
            attributes: [
                'expense_amount',
                'description',
                'category',
                [sequelize.literal("DATE_FORMAT(updatedAt, '%d-%m-%Y')"), 'date']
            ]
        })
        let total = 0;
        expenses.forEach(expenses => {
            total += expenses.expense_amount;
        });
        res.status(200).json({
            allExpenses: expenses,
            total: total
        })
    } catch (err) {
        console.log("Err:", err);
        console.log(desiredDate);
    }

}

exports.getMonthlyExpenses = async (req, res, next) => {
    const desiredDate = (req.params.month);
    console.log(desiredDate);
    try {
        const expenses = await req.user.getExpenses({
            where: Sequelize.literal(`DATE_FORMAT(updatedAt, '%Y-%m') = '${desiredDate}'`),
            attributes: [
                'expense_amount',
                'description',
                'category',
                [sequelize.literal("DATE_FORMAT(updatedAt, '%d-%m-%Y')"), 'date']
            ]
        })
        let total = 0;
        expenses.forEach(expenses => {
            total += expenses.expense_amount;
        });
        res.status(200).json({
            allExpenses: expenses,
            total: total
        })
    } catch (err) {
        console.log("Err:", err);
        console.log(desiredDate);
    }

}

exports.getDownlodedFileUrls = async (req,res) => {
    const userId = req.userId;
    //i dont know why nicje wali line kaam ni krri hai..
    // const downlodedFileUrls = await user.getDownloadedFiles();
    const downlodedFileUrls = await DownloadedUrl.findAll({where:{userId: userId}, order: [['id', 'DESC']],limit: 10});
    res.status(200).json({ fileURL: downlodedFileUrls, success: true});
}

// function uploadToS3(data, filename) {
//     const BUCKET_NAME = 'expenstracker';
//     const IAM_USER_KEY = 'AKIAXNDL7V4OL5CLVS5A';
//     const IAM_USER_SECRET = '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';

//     let s3bucket = new AWS.S3({
//         accessKeyId: IAM_USER_KEY,
//         secretAccessKey: IAM_USER_SECRET
//     })

//     var params = {
//         Bucket: BUCKET_NAME,
//         Key: filename,
//         Body: data,
//         ACL: 'public-read'
//     }

//     return new Promise((resolve, reject) => {
//         s3bucket.upload(params, (err, s3response) => {
//             if (err) {
//                 console.log('Something went wrong', err);
//                 reject(err);
//             } else {
//                 console.log('success');
//                 resolve(s3response.Location);
//             }
//         })
//     })

// }

exports.downloadExpense = async (req, res) => {
    const desiredDate = (req.params.date);
    try {
        let expenses;
        if (desiredDate.length == 10) {
            expenses = await req.user.getExpenses({
                where: Sequelize.literal(`DATE(updatedAt) = '${desiredDate}'`),
                attributes: [
                    'expense_amount',
                    'description',
                    'category',
                    [sequelize.literal("DATE_FORMAT(updatedAt, '%d-%m-%Y')"), 'date']
                ]
            });
        } 
        else {
            expenses = await req.user.getExpenses({
                where: Sequelize.literal(`DATE_FORMAT(updatedAt, '%Y-%m') = '${desiredDate}'`),
                attributes: [
                    'expense_amount',
                    'description',
                    'category',
                    [sequelize.literal("DATE_FORMAT(updatedAt, '%d-%m-%Y')"), 'date']
                ]
            })
        }

        const stringifiedExpenses = JSON.stringify(expenses);
        const filename = `Expense${req.userId}/${new Date()}.txt`;
        const fileURL = await Awsservice.uploadToS3(stringifiedExpenses, filename);
        const response = await req.user.createDownload({ fileUrl: fileURL })
        res.status(200).json({ id: response.id, fileUrl: fileURL, success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ fileURL: '', success: false, err: err });
    }
}


