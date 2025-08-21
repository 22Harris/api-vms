const VoteModel = require('../models/votes.models');
const StudentModel = require('../../students/models/students.models');
const CandidateModel = require('../../candidates/models/candidates.models');
const ElectionModel = require('../../elections/models/elections.models');
const sequelize = require('../../../configs/sequelize');


exports.createVote = async(req, res) => {
    const { studentId, iDs, electionId } = req.body;

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
                message: 'Cet étudiant a déjà voté pour cette élection',
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
                election.invalidVote += 1;
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

exports.searchVoteByTerm = async(req, res) => {

    const { term } = req.query;
    try{
        const searchTerm = term?.trim().toLowerCase();

        let votes = await VoteModel.findAll({
            include: [
                {
                    model: StudentModel,
                    as: 'student',
                    attributes: ['fullName', 'IM', 'email', 'sector', 'level']
                },
                {
                    model: ElectionModel,
                    as: 'election',
                    attributes: ['profile']
                }
            ]
        });
        if(!searchTerm){
            return res.status(200).json({
                success: true,
                message: 'Votes récupérées',
                data: votes
            });
        }

        votes = votes.filter(v => {
            const student = votes.student;
            const election = votes.election;
            return (
                student?.fullName?.toLowerCase().includes(searchTerm) ||
                student?.IM?.toLowerCase().includes(searchTerm) ||
                student?.email?.toLowerCase().includes(searchTerm) ||
                student?.sector?.toLowerCase().includes(searchTerm) ||
                student?.level?.toLowerCase().includes(searchTerm) ||
                election?.profile?.toLowerCase().includes(searchTerm) ||
                v.votedAt?.toISOString().toLowerCase().includes(searchTerm)
            );
        });

        return res.status(200).json({
            success: true,
            message: 'Résultat de la recherche',
            data: votes
        });

    }catch(error){
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du candidat',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.getVoteDetails = async(req, res) => {
    const { id } = req.params;

    try{
        const vote = await VoteModel.findByPk(id, {
        include: [
            {
                model: StudentModel,
                as: 'student',
                attributes: ['fullName', 'email', 'IM', 'sector', 'level']
            },
            {
                model: ElectionModel,
                as: 'election',
                attributes: ['profile']
            }
        ]
    });
    if(!vote){
        return res.status(404).json({
            success: false,
            message: 'vote non-trouvé',
        });
    }

    return res.status(200).json({
        success: true,
        message: 'vote trouvé',
        data: vote
    });

    }catch(error){
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du vote',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};