const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  // 1. Vérification du header Authorization
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ 
      message: 'Authentification requise - Aucun token fourni' 
    });
  }

  // 2. Extraction du token
  const tokenParts = authHeader.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(401).json({ 
      message: 'Format de token invalide - Utilisez "Bearer <token>"' 
    });
  }

  const token = tokenParts[1];

  // 3. Vérification de la présence de la clé secrète
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET non configuré');
    return res.status(500).json({ 
      message: 'Erreur de configuration serveur' 
    });
  }

  // 4. Vérification du token
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ajout des informations utilisateur à la requête
    req.user = {
      id: verified.ID,       // Correspond à ce que vous mettez dans le token
      role: verified.role    // Si vous ajoutez des rôles plus tard
    };
    
    next();
  } catch (err) {
    // Gestion différenciée des erreurs
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Session expirée - Veuillez vous reconnecter',
        code: 'TOKEN_EXPIRED' 
      });
    }
    
    return res.status(401).json({ 
      message: 'Token invalide - Authentification échouée',
      code: 'INVALID_TOKEN' 
    });
  }
};

module.exports = auth;