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

ElectionModel.hasMany(CandidateModel, {
    foreignKey: 'electionId',
    as: 'candidates',
});
CandidateModel.belongsTo(ElectionModel, {
    foreignKey: 'electionId',
    as: 'election',
});

ElectionModel.hasMany(VoteModel, {
    foreignKey: 'electionId',
    as: 'votes',
});
VoteModel.belongsTo(ElectionModel, {
    foreignKey: 'electionId',
    as: 'election',
});

StudentModel.hasMany(VoteModel, {
    foreignKey: 'studentId',
    as: 'votes',
});
VoteModel.belongsTo(StudentModel, {
    foreignKey: 'studentId',
    as: 'student',
});

ElectionModel.hasOne(HistoricalModel, {
    foreignKey: 'electionId',
    as: 'historical',
});
HistoricalModel.belongsTo(ElectionModel, {
    foreignKey: 'electionId',
    as: 'election',
});