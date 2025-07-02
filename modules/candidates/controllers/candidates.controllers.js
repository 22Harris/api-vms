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