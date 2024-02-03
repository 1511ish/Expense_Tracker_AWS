const Sequelize = require('sequelize');
const sequelize = require('../util/database');
const Download = sequelize.define('download', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    fileUrl: {
        type: Sequelize.STRING,
        unique: true,
        validate: { isUrl: true },
        allowNull: false,
    }
})
module.exports = Download;