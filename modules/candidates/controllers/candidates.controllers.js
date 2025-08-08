const CandidateModel = require('../models/candidates.models');
const StudentModel = require('../../students/models/students.models');
const ElectionModel = require('../../elections/models/elections.models');

exports.createCandidate = async(req, res) => {
    const { electionId, studentId } = req.params;
    const { number, slogan, description } = req.body;

    if (!number) {
        return res.status(400).json({
            success: false,
            message: 'Le numéro et l\'année sont obligatoires',
        });
    }

    try {

        const election = await ElectionModel.findByPk(electionId);
        if(!election){
            return res.status(404).json({
                success: false,
                message: 'Election non trouvé',
            });
        }
        if(!election.isOpen){
            return res.status(500).json({
                success: false,
                message: 'Election fermée',
            });
        }
        
        const student = await StudentModel.findByPk(studentId);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Étudiant non trouvé',
            });
        }

        const existingCandidate = await CandidateModel.findOne({
            where: {
                studentId,
                electionId
            }
        });

        if (existingCandidate) {
            return res.status(409).json({
                success: false,
                message: 'Cet étudiant est déjà candidat pour cette année',
            });
        }

        const numberUsed = await CandidateModel.findOne({
            where: {
                number,
                electionId
            }
        });
        if (numberUsed) {
            return res.status(409).json({
                success: false,
                message: 'Ce numéro est déjà utilisé pour cette année',
            });
        }

        const newCandidate = await CandidateModel.create({
            number,
            electionId,
            slogan: slogan || null,
            description: description || null,
            studentId,
            numberOfVote: 0
        });

        return res.status(201).json({
            success: true,
            message: 'Candidat créé avec succès',
            data: {
                candidate: {
                    id: newCandidate.id,
                    number: newCandidate.number,
                    student: {
                        id: student.ID,
                        fullName: student.fullName,
                        IM: student.IM
                    }
                }
            }
        });

    } catch (error) {
        console.error('Erreur createCandidate:', error);
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la création du candidat',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

exports.getCandidateById = async(req, res) => { 
    const { id } = req.params;

    try{
        
        let candidate = await CandidateModel.findByPk(id, {
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
        if(!candidate){
            return res.status(404).json({
                success: false,
                message: 'Candidat non-trouvé'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Candidat trouvé',
            data: candidate
        });
        
    }catch(error){
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du candidat',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.getCandidatesByTerm = async(req, res) => {

    const { term } = req.query;

    try{

        const searchTerm = term?.trim().toLowerCase();

        let candidates = await CandidateModel.findAll({
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
                message: 'Candidats trouvés',
                data: candidates
            });
        }

        candidates = candidates.filter(c => {
            const student = candidates.student;
            const election = candidates.election;

            return(
                student?.fullName?.toLowerCase().includes(searchTerm) ||
                student?.IM?.toLowerCase().includes(searchTerm) ||
                student?.email?.toLowerCase().includes(searchTerm) ||
                student?.sector?.toLowerCase().includes(searchTerm) ||
                student?.level?.toLowerCase().includes(searchTerm) ||
                election?.profile?.toLowerCase().includes(searchTerm) ||
                c?.number.includes(searchTerm) ||
                c?.slogan?.toLowerCase().includes(searchTerm) ||
                c?.description.toLowerCase().includes(searchTerm) ||
                c?.numberOfVote.includes(searchTerm)
            );
        });

        return res.status(200).json({
            success: true,
            message: 'Candidats récupérés',
            data: candidates
        });


    }catch(error){
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des candidats',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.getCandidatesByElectionId = async(req, res) => {
    const { id } = req.params;

    try{
        const electionExists = await ElectionModel.findByPk(id);
        if(!electionExists){
            return res.status(404).json({
                success: false,
                message: 'Election non-trouvée',
            });
        }

        let candidates = await CandidateModel.findAll({
            where: { electionId: id },
            include : [
                {
                    model: StudentModel,
                    as: 'student',
                    attributes: ['fullName', 'sector', 'level']
                }
            ]
        });

        candidates = candidates.map((c) => {
            return {
                profile: electionExists.profile,
                ID: c.ID,
                number: c.number,
                slogan: c.slogan,
                description: c.description,
                student: c.student
            }
        });

        return res.status(200).json({
            success: true,
            message: 'Liste des candidats récupérée avec succès',
            data: candidates
        });
    }catch(error){
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de la liste des candidats',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};