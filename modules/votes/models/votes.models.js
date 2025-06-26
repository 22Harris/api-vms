const { DataTypes } = require('sequelize');
const sequelize = require('../../../configs/sequelize');

const Vote = sequelize.define('Vote', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    year: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    votedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'students',
            key: 'ID'
        }
    },
    candidateId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'candidates',
            key: 'id'
        }
    }
}, {
    tableName: 'votes',
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['year', 'studentId']
        }
    ]
});

module.exports = Vote;