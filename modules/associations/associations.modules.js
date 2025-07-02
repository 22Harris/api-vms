const StudentModel = require('../students/models/students.models');
const CandidateModel = require('../candidates/models/candidates.models');
const VoteModel = require('../votes/models/votes.models');
const ElectionModel = require('../elections/models/elections.models');
const HistoricalModel = require('../historical/models/historical.models');

StudentModel.hasMany(CandidateModel, {
    foreignKey: 'studentId',
    as: 'candidates',
});

CandidateModel.belongsTo(StudentModel, {
    foreignKey: 'studentId',
    as: 'student',
});

CandidateModel.hasMany(ElectionModel, {
    foreignKey: 'electionId',
    as: 'elections'
});
