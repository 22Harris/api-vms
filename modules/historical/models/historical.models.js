const { DataTypes } = require('sequelize');
const sequelize = require('../../../configs/sequelize');

const Historical = sequelize.define('Historical', {
    ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    electionId: {
        type: DataTypes.INTEGER
    }
})