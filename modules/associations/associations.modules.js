const StudentModel = require('../students/models/students.models');
const CandidateModel = require('../candidates/models/candidates.models');
const VoteModel = require('../votes/models/votes.models');

StudentModel.hasMany(CandidateModel, {
    foreignKey: 'studentId',
    as: 'candidates',
});

CandidateModel.belongsTo(StudentModel, {
    foreignKey: 'studentId',
    as: 'student',
});