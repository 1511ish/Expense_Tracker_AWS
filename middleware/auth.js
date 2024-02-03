const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.authenticate = (req, res, next) => {
    try {
        const token = req.header('Authorization');
        // console.log(token);
        const obj = jwt.verify(token, 'secretkey');
       /// console.log(obj);
        User.findByPk(obj.userId).then(user => {
            req.user = user;
            // console.log(user);
            req.userId = user.id;
            next();
        }).catch(err => { throw new Error(err) });
    } catch (err) {
        console.log(err);
        return res.status(401).json({ success: false });
    }
}