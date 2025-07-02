const { DataTypes } = require('sequelize');
const sequelize = require('../../../configs/sequelize');

const Candidate = sequelize.define('Candidate', {
    ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    electionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    number: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    numberOfVote: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    slogan: {
        type: DataTypes.STRING,
    },
    description: {
        type: DataTypes.STRING,
    }
}, {
    tableName: 'candidates',
    timestamps: true,
});

module.exports= Candidate;