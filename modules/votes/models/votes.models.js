const { DataTypes } = require('sequelize');
const sequelize = require('../../../configs/sequelize');

const Vote = sequelize.define('Vote', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    electionId : {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    votedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: 'votes',
    timestamps: false,
});

module.exports = Vote;