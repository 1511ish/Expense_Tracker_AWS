const Sib = require('sib-api-v3-sdk')
require('dotenv').config();
const uuid = require('uuid')
const bcrypt = require('bcrypt')
const sequelize = require('../util/database')
const User = require('../models/User')
const ForgotPasswordRequest = require('../models/ForgotPasswordRequests');

const client = Sib.ApiClient.instance
const apiKey = client.authentications['api-key']
apiKey.apiKey = process.env.API_KEY;

const tranEmailApi = new Sib.TransactionalEmailsApi();

const sender = {
    email: 'mrishantsre1511ish@gmail.com'
}
// const receiver = [{
//     email: 'aakashsre6398@gmail.com'
// }]


exports.postResetPassword = async (req, res, next) => {
    try {
        const email = req.body.email
        console.log(email);
        const receiver = [{ email: email }]
        const user = await User.findOne({ where: { email_Id: email } })
        if (user) {
            const randomUUID = uuid.v4()
            await user.createForgotPasswordRequest({ id: randomUUID, isActive: true })
            await tranEmailApi.sendTransacEmail({
                sender,
                to: receiver,
                subject: 'Password reset',
                htmlContent: `<p>Hello ${user.name}<br>
                            You are receiving this mail as per your request to change your password for your expense tracker pro account.
                            You can change your password from here:<br>
                            <a href='${process.env.WEBSITE}/password/resetPassword/${randomUUID}'>reset pasword</a></p>`
            })
            return res.status(202).json({ message: 'Link to reset password sent to your mail ', sucess: true })
        } else {
            throw new Error("Incorrect email Id!!");
        }

    } catch (err) {
        console.log(err)
        return res.status(403).json({ message: 'Error sending email!' })
    }
}



exports.getResetPassword = async (req, res, next) => {
    try {
        const forgetpassId = req.params.forgotPassId;
        const forgetReq = await ForgotPasswordRequest.findOne({ where: { id: forgetpassId } })

        if (forgetReq && forgetReq.isactive) {
            res.status(200).send(`<html>
                <form action="/password/updatepassword/${forgetpassId}" method="POST">
                   <label for="newpassword">Enter New password</label>
                   <input name="newpassword" type="password" required></input>
                   <button>reset password</button>
                </form>
            </html>`
            )

        } else {
            return new Error('Invalid link to reset password!');
        }
    } catch (err) {
        console.log(err);
        return res.status(403).json({ message: 'Error in resetting the password!' });
    }
}



exports.updatePassword = async (req, res, next) => {
    const t = await sequelize.transaction()
    try {
        const forgotPassId = req.params.forgotPassId;
        const newPassword = req.body.newpassword;

        const forgotReq = await ForgotPasswordRequest.findOne({ where: { id: forgotPassId } })
        const user = await User.findOne({ where: { id: forgotReq.userId } })
        if (user) {
            const hashedPassword = bcrypt.hashSync(newPassword, 10);
            const promise1 = user.update({ password: hashedPassword }, { transaction: t })
            const promise2 = ForgotPasswordRequest.update({ isactive: false }, { where: { userId: user.id } }, { transaction: t })
            Promise.all([promise1, promise2])
                .then(async () => {
                    await t.commit()
                    return res.status(201).json({ message: 'Successfuly update the new password' })
                })
                .catch(async (err) => {
                    console.log(err)
                    await t.rollback()
                    throw new Error('Could not change the user password!')
                })
        } else {
            await t.rollback();
            throw new Error("User doesn't exist!")
        }
    } catch (err) {
        console.log(err)
        res.status(403).json({ message: err })
    }

}