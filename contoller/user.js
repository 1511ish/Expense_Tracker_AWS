const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.usergethomePage = (request, response, next) => {
    response.sendFile('test.html', { root: 'views' });
}

function isStringInvalid(string) {
    if (string == undefined || string.length === 0)
        return true;
    else
        return false;
}

exports.signUp = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (isStringInvalid(name) || isStringInvalid(password) || isStringInvalid(password)) {
            return res.status(400).json({ err: 'Bad parameters, Something is missing' })
        }

        bcrypt.hash(password, 10, async (err, hash) => {
            if (err) {
                console.log(err);
                res.status(500).json({ err: err });
            }
            await User.create({ name: name, email_Id: email, password: hash });
            res.status(201).json({ message: 'Successfully created new user' });
            console.log('SUCCESSFULLY ADDED');
        })
    }
    catch (err) {
        res.status(500).json(err);
    }
}


function generateAccessToken(id, ispremiumuser) {
    return jwt.sign({ userId: id, isPremium: ispremiumuser}, 'secretkey');
}

exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (isStringInvalid(email) || isStringInvalid(password)) {
        return res.status(400).json({ message: 'email or password is missing', success: false })
    }
    try {
        const user = await User.findAll({ where: { email_Id: email } })
        if (user.length > 0) {
            bcrypt.compare(password, user[0].dataValues.password, (err, result) => {
                if (err) {
                    throw new Error('Something went wrong');
                }
                if (result === true) {
                    res.status(200).json({ success: true, message: "User logged in successfully", token: generateAccessToken(user[0].dataValues.id, user[0].dataValues.ispremiumuser), isPrimium: user[0].dataValues.ispremiumuser });
                    //jo uper line mein last wala argument pass krahu y strategy mein use krra tha and its very useful.. ab iska koi use nahi hai.
                } else {
                    return res.status(400).json({ success: false, message: 'Password is incorrect' });
                }
            })
        }
        else {
            return res.status(404).json({ success: false, message: "User Doesnot exist." });
        }
    } catch (err) {
        res.status(500).json({ message: err, success: false });
    }

}

