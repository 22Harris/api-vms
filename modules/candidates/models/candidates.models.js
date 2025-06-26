const { DataTypes } = require('sequelize');
const sequelize = require('../../../configs/sequelize');

const Candidate = sequelize.define('Candidate', {
    ID: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    studentIM: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    studentSector: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    studentLevel: {
        type: DataTypes.STRING,
        allowNull: false, 
    },
    number: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    year: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    numberOfVote: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    }
}, {
    tableName: 'candidates',
    timestamps: true,
});

module.exports= Candidate;