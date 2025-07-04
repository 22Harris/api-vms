const { DataTypes } = require('sequelize');
const sequelize = require('../../../configs/sequelize');

const Election = sequelize.define('Election', {
    ID :{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    profile : {
        type: DataTypes.STRING,
        allowNull: false
    },
    totalVote: {
        type: DataTypes.INTEGER,
    },
    blankVote: {
        type: DataTypes.INTEGER,
    },
    deadVote: {
        type: DataTypes.INTEGER,
    },
    isOpen: {
        type: DataTypes.BOOLEAN,
    }
}, {
    tableName: 'elections',
    timestamps: true
});

module.exports = Election;