const { DataTypes } = require('sequelize');
const sequelize = require('../../../configs/sequelize');

const Historical = sequelize.define('Historical', {
    ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    electionId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    profile: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    closedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    totalVote: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    blankVote: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    invalidVote: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    candidatesResults: {
        type: DataTypes.JSON,
        allowNull: false
    }
}, {
    tableName: 'historical',
    timestamps: true
});

module.exports = Historical;
