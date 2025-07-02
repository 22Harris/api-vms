require('dotenv').config();
const express = require('express');
const sequelize = require('./configs/sequelize');
const cors = require('cors');

const studentsRoutes = require('./modules/students/routes/students.routes');
const candidatesRoutes = require('./modules/candidates/routes/candidates.routes');
const votesRoutes = require('./modules/votes/routes/votes.routes');
const electionsRoutes = require('./modules/elections/routes/elections.routes');
const historicalRoutes = require('./modules/historical/routes/historical.routes');

require('./modules/associations/associations.modules');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/students', studentsRoutes);
app.use('/api/candidates', candidatesRoutes);
app.use('/api/votes', votesRoutes);
app.use('/api/elections', electionsRoutes)
app.use('/api/historical', historicalRoutes);

app.use((req, res) => {
    res.status(404).json({
        message: 'Route non trouvé'
    });
});

app.use((err, req, res, next) => {
    console.error('Erreur serveur:', err.stack);
    res.status(500).json({ 
      message: 'Erreur interne du serveur',
      ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
});

const PORT = process.env.PORT;
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion DB réussie');

    await sequelize.sync({
      alter: process.env.NODE_ENV === 'development',
      force: false
    });
    console.log('🔄 Modèles synchronisés');


    app.listen(PORT, () => {
      console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
      console.log(`⚙️ Environnement: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    console.error('❌ Erreur de démarrage:', error.message);
    process.exit(1);
  }
})();

process.on('SIGTERM', () => {
    console.log('🛑 Fermeture propre du serveur');
    sequelize.close().then(() => process.exit(0));
  });