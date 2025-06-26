const VoteModel = require('../models/votes.models');
const StudentModel = require('../../students/models/students.models');
const CandidateModel = require('../../candidates/models/candidates.models');
const sequelize = require('../../../configs/sequelize');


exports.createVote = async(req, res) => {
    const { year, candidateId, studentId } = req.params;
    
    if (!year || !candidateId || !studentId) {
        return res.status(400).json({
            success: false,
            message: 'Tous les paramètres (year, candidateId, studentId) sont requis',
        });
    }

    let transaction;
    try {
        const student = await StudentModel.findByPk(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Étudiant non trouvé',
            });
        }

        const existingVote = await VoteModel.findOne({
            where: {
                year,
                studentId
            }
        });
        
        if (existingVote) {
            return res.status(409).json({
                success: false,
                message: 'Cet étudiant a déjà voté pour cette année',
            });
        }

        const candidate = await CandidateModel.findByPk(candidateId);
        if (!candidate) {
            return res.status(404).json({
                success: false,
                message: 'Candidat non trouvé',
            });
        }

        if (candidate.year !== year) {
            return res.status(400).json({
                success: false,
                message: 'Le candidat ne se présente pas cette année',
            });
        }

        transaction = await sequelize.transaction();

        await CandidateModel.increment('numberOfVote', {
            by: 1,
            where: { id: candidateId },
            transaction
        });

        await VoteModel.create({
            year,
            candidateId,
            studentId,
            votedAt: new Date()
        }, { transaction });

        await transaction.commit();

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