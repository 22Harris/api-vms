const ElectionModel = require('../models/elections.models');
const HistoricalModel = require('../../historical/models/historical.models');
const CandidateModel = require('../../candidates/models/candidates.models');
const StudentModel = require('../../students/models/students.models');
const VoteModel = require('../../votes/models/votes.models');

exports.createElection = async(req, res) => {
    const { profile } = req.body;

    if(!profile){
        return res.status(400).json({
            success: false,
            message: 'Champ requis',
        });
    }

    try{

        const newElection = await ElectionModel.create({
            profile,
            totalVote: 0,
            blankVote: 0,
            deadVote: 0,
            isOpen: true,
            isAvailable: false,
        });

        return res.status(200).json({
            success: true,
            message: 'Election créée avec succès',
            data: {
                election: {
                    id: newElection.id,
                    profile: newElection.profile,
                }
            }
        });


    }catch(error){
        console.error('Erreur createElection : ', error);
        return res.status(5000).json({
            success: false,
            message: 'Erreur lors de la création de l"éléction',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });

    }
}

exports.openElection = async(req, res) => {
    const { id } = req.params;
    try{

        const election = await ElectionModel.findByPk(id);
        if(!election){
            return res.status(404).json({
                success: false,
                message: 'Election non-trouvée'
            });
        }

        election.isOpen = true;
        await election.save();

    return res.status(200).json({
        success: true,
        message: 'Election ouverte'
    });

    }catch(error){
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la fermeture de l"election',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        })
    }
}

exports.closeElection = async (req, res) => {
    const { id } = req.params;

    try {
        const election = await ElectionModel.findByPk(id);
        if (!election) {
            return res.status(404).json({
                success: false,
                message: 'Election non-trouvée',
            });
        }

        const candidates = await CandidateModel.findAll({ 
            where: { electionId: election.ID },
            include: [{
                model: StudentModel,
                as: 'student',
                attributes: ['fullName', 'IM', 'sector', 'level']
            }]
        });

        const candidatesResults = candidates.map(c => ({
            candidateId: c.ID,
            number: c.number,
            numberOfVote: c.numberOfVote,
            student: {
                fullName: c.student?.fullName,
                IM: c.student?.IM,
                sector: c.student?.sector,
                level: c.student?.level
            }
        }));

        const historic = await HistoricalModel.create({
            electionId: election.ID,
            profile: election.profile,
            closedAt: new Date(),
            totalVote: election.totalVote,
            blankVote: election.blankVote,
            deadVote: election.deadVote,
            candidatesResults
        });

        election.isOpen = false;
        await election.save();

        return res.status(200).json({
            success: true,
            message: 'Election fermée',
            data: historic,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la fermeture de l’élection',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
}

exports.getElectionDetailsById = async (req, res) => {
    const { id } = req.params;

    try {
        const election = await ElectionModel.findByPk(id, {
            include: [
                {
                    model: CandidateModel,
                    as: 'candidates',
                    include: [
                        {
                            model: StudentModel,
                            as: 'student',
                            attributes: ['ID', 'fullName', 'email', 'IM', 'sector', 'level']
                        }
                    ],
                    attributes: ['ID', 'number', 'numberOfVote', 'slogan', 'description']
                },
                {
                    model: VoteModel,
                    as: 'votes',
                    attributes: ['ID', 'studentId', 'votedAt'],
                    include: [
                        {
                            model: StudentModel,
                            as: 'student',
                            attributes: ['ID', 'fullName', 'IM']
                        }
                    ]
                }
            ]
        });

        if (!election) {
            return res.status(404).json({
                success: false,
                message: 'Élection non trouvée'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Détails de l’élection récupérés',
            data: election
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l’élection',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

exports.getElectionsToVote = async (req, res) => {
    try {
        // const elections = await ElectionModel.findAll({
        //     where: { isAvailable: true },
        //     include: [
        //         {
        //             model: CandidateModel,
        //             as: 'candidates',
        //             attributes: ['ID', 'number', 'numberOfVote', 'slogan', 'description'],
        //             include: [
        //                 {
        //                     model: StudentModel,
        //                     as: 'student',
        //                     attributes: ['ID', 'fullName', 'IM', 'sector', 'level']
        //                 }
        //             ]
        //         }
        //     ]
        // });

        let elections = await ElectionModel.findAll({
            where: { isAvailable : true }
        });

        elections = elections.map( (e) => {
            return { 
                ID: e.ID,
                profile : e.profile 
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Liste des élections ouvertes récupérée',
            data: elections
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de la liste',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};
