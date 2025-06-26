const CandidateModel = require('../models/candidates.models');
const StudentModel = require('../../students/models/students.models');

exports.createCandidate = async(req, res) => {
    const { studentId } = req.params;
    const { number, year, slogan, description } = req.body;

    if (!number || !year) {
        return res.status(400).json({
            success: false,
            message: 'Le numéro et l\'année sont obligatoires',
        });
    }

    try {

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
                year
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
                year
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
            year,
            slogan: slogan || null,
            description: description || null,
            studentId,
            studentIM: student.IM,
            studentSector: student.sector,
            studentLevel: student.level,
            numberOfVote: 0
        });

        return res.status(201).json({
            success: true,
            message: 'Candidat créé avec succès',
            data: {
                candidate: {
                    id: newCandidate.id,
                    number: newCandidate.number,
                    year: newCandidate.year,
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