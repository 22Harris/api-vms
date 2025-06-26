const { DataTypes } = require('sequelize');
const sequelize = require('../../../configs/sequelize');

const Student = sequelize.define('Student', {
    ID: {
        type: DataTypes.INTEGER,
        autoIncrement : true,
        primaryKey: true,
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
        isEmail: true,
        notEmpty: true,
        len: [5, 255]
        }
    },
    IM: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    verificationCode: {
        type: DataTypes.STRING,
    },
    codeExpiration: {
        type: DataTypes.DATE,
    },
    sector: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    level: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    tableName: 'students',
    timestamps: true,
});
module.exports = Student;