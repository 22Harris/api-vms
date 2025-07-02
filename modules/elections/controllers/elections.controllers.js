const ElectionModel = require('../models/elections.models');

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
            isOpen: false,
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

exports.closeElection = async(req, res) => {
    const { id } = req.params;

    try{

        const election = await ElectionModel.findByPk(id);
        if(!election){
            return res.status(404).json({
                success: false,
                message: 'Election non-trouvée',
            });
        }

        election.isOpen = false;
        await election.save();

        return res.status(200).json({
            success: true,
            message: 'Election fermée',
        })

    }catch(error){
        return res.status(500).json({
            success: false,
            message: 'Erreur lors de la fermeture de l"election',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        })
    }
}