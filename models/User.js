const Sequelize = require('sequelize');

const sequelize = require('../util/database');

module.exports = sequelize.define('user', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email_Id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },

    ispremiumuser: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    },
    totalExpense: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
})