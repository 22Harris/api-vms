const { Op } = require('sequelize');
const HistoricalModel = require('../models/historical.models');

exports.getHistoricalByTerm = async (req, res) => {
    const { term } = req.query;

    try {
        const searchTerm = term?.trim().toLowerCase();

        let historical = await HistoricalModel.findAll();

        if (!searchTerm) {
            return res.status(200).json({
                success: true,
                data: historical
            });
        }

        historical = historical.filter(h => {
            const matchInMainFields = [
                h.electionId?.toString(),
                h.profile?.toString(),
                h.totalVote?.toString(),
                h.blankVote?.toString(),
                h.deadVote?.toString(),
                h.closedAt?.toISOString()
            ].some(field =>
                field?.toLowerCase().includes(searchTerm)
            );

            let matchInCandidates = false;
            try {
                const candidatesArray = JSON.parse(h.candidatesResults);
                matchInCandidates = candidatesArray.some(c => {
                    const student = c.student || {};
                    return [
                        student.fullName,
                        student.IM,
                        student.sector,
                        student.level
                    ].some(field =>
                        field?.toLowerCase().includes(searchTerm)
                    );
                });
            } catch (e) {
                matchInCandidates = false;
            }

            return matchInMainFields || matchInCandidates;
        });

        return res.status(200).json({
            success: true,
            data: historical
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la recherche',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


exports.getHistoricalById = async(req, res) => {
    const { id } = req.params;

    try{
        const historical = await HistoricalModel.findByPk(id);
        if(!historical){
            return res.status(404).json({
                success: false,
                message: 'Historique non-trouvé',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Historique trouvé',
            data: historical,
        });

    }catch(error){
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de l"historique',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};