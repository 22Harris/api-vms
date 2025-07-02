const VoteModel = require('../models/votes.models');
const StudentModel = require('../../students/models/students.models');
const CandidateModel = require('../../candidates/models/candidates.models');
const ElectionModel = require('../../elections/models/elections.models');
const sequelize = require('../../../configs/sequelize');


exports.createVote = async(req, res) => {
    const { electionId, studentId } = req.params;
    const { candidateId, voteStatus } = req.body;

    let transaction;
    try {

        const election = await ElectionModel.findByPk(electionId);
        if(!election){
            return res.status(404).json({
                success: false,
                message: 'Election non-trouvée',
            });
        }
        
        const student = await StudentModel.findByPk(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Étudiant non trouvé',
            });
        }

        const existingVote = await VoteModel.findOne({
            where: {
                electionId,
                studentId
            }
        });        
        if (existingVote) {
            return res.status(409).json({
                success: false,
                message: 'Cet étudiant a déjà voté pour cette année',
            });
        }

        if(candidateId){

            const candidate = await CandidateModel.findByPk(candidateId);
            if (!candidate) {
                return res.status(404).json({
                    success: false,
                    message: 'Candidat non trouvé',
                });
            }

            transaction = await sequelize.transaction();
    
            await CandidateModel.increment('numberOfVote', {
                by: 1,
                where: { id: candidateId },
                transaction
            });
    
            await VoteModel.create({
                electionId,
                studentId,
                votedAt: new Date()
            }, { transaction });

            await transaction.commit();

        }else{

            await VoteModel.create({
                electionId,
                studentId,
                votedAt: new Date(),
            });

            if(voteStatus === 'BLANK'){
                election.blankVote += 1;
            }
            if(voteStatus === 'DEAD'){
                election.deadVote += 1;
            }

            await election.save();

        }

        election.totalVote += 1;

        await election.save();

        return res.status(201).json({
            success: true,
            message: 'Vote enregistré avec succès',
        });

    } catch (error) {
        if (transaction) await transaction.rollback();
        
        console.error('Erreur createVote:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors du traitement du vote',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};