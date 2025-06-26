const StudentModel = require('../models/students.models');
const VoteModel = require('../../votes/models/votes.models');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { Op } = require('sequelize');

const TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';
const CODE_EXPIRATION_MINUTES = 15;

const generateAuthTokens = (studentId) => {
  const token = jwt.sign(
    { ID: studentId },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES_IN }
  );
  
  const refreshToken = jwt.sign(
    { ID: studentId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );

  return { token, refreshToken };
};

const generateVerificationCode = () => {
  return crypto.randomInt(1000, 9999).toString();
};

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendMailToStudentEmail = async (studentEmail, verificationCode) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USERNAME,
      to: studentEmail,
      subject: 'Code de vérification pour le vote',
      text: `Votre code de vérification est : ${verificationCode}\nCe code expirera dans ${CODE_EXPIRATION_MINUTES} minutes.`,
      html: `<p>Votre code de vérification est : <strong>${verificationCode}</strong></p><p>Ce code expirera dans ${CODE_EXPIRATION_MINUTES} minutes.</p>`
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Erreur lors de l\'envoi du mail:', error);
    throw new Error('Erreur lors de l\'envoi du mail');
  }
};

exports.initialLoginStudent = async (req, res) => {
  const { year } = req.params;
  const { email, IM } = req.body;
  
    if (!email || !IM) {
      return res.status(400).json({
        success: false,
        message: 'Email et IM sont requis',
      });
    }
  
    try {
        const student = await StudentModel.findOne({ where: { email, IM } });
        if (!student) {
            return res.status(401).json({
            success: false,
            message: 'Identifiants incorrects',
        });
      }

      const studentAlreadyVoted = await VoteModel.findOne({ where: { studentId: student.ID, year }});
      if(studentAlreadyVoted){
        return res.status(409).json({
          success: false,
          message: 'Cet étudiant a déjà voté pour cette année',
        });
      }
  
      const verificationCode = generateVerificationCode();
      const codeExpiration = new Date(Date.now() + CODE_EXPIRATION_MINUTES * 60 * 1000);
  
      await student.update({
        verificationCode,
        codeExpiration
      });

      sendMailToStudentEmail(student.email, verificationCode)
        .catch(error => console.error('Erreur d\'envoi d\'email:', error));
  
      return res.status(200).json({
        success: true,
        message: 'Un code de vérification a été envoyé à votre adresse email',
        data: {
          student: {
            IM: student.IM,
            email: student.email
          }
        }
      });
  
    } catch (error) {
      console.error('Erreur initialLoginStudent:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la connexion ',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };

  exports.finalLoginStudent = async (req, res) => {
    const { IM, code } = req.body;
  
    if (!IM || !code) {
      return res.status(400).json({
        success: false,
        message: 'IM et code sont requis',
      });
    }
  
    try {
      const student = await StudentModel.findOne({ where: { IM } });
      
      if (!student) {
        return res.status(401).json({
          success: false,
          message: 'Étudiant non trouvé',
        });
      }
  
      if (student.verificationCode !== code || new Date() > student.codeExpiration) {
        return res.status(401).json({
          success: false,
          message: 'Code invalide ou expiré',
        });
      }

      const { token, refreshToken } = generateAuthTokens(student.ID);

      await student.update({
        verificationCode: null,
        codeExpiration: null
      });
  
      return res.status(200).json({
        success: true,
        message: 'Connexion réussie',
        data: {
          token,
          refreshToken,
          student: {
            IM: student.IM,
            fullName: student.fullName,
            email: student.email
          }
        }
      });
  
    } catch (error) {
      console.error('Erreur finalLoginStudent:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la vérification du code',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };

exports.createStudent = async (req, res) => {
  const { fullName, email, IM, sector, level } = req.body;

  if (!fullName || !email || !IM || !sector || !level) {
    return res.status(400).json({
      success: false,
      message: 'Tous les champs sont requis',
    });
  }

  try {

    const studentExisting = await StudentModel.findOne({ 
      where: { 
        [Op.or]: [{ email }, { IM }] 
      } 
    });
    
    if (studentExisting) {
      return res.status(409).json({
        success: false,
        message: 'Un étudiant avec cet email ou IM existe déjà',
      });
    }

    const newStudent = await StudentModel.create({
      fullName,
      email,
      IM,
      sector,
      level,
    });

    return res.status(201).json({
      success: true,
      message: 'Étudiant créé avec succès',
      data: {
        student: {
          IM: newStudent.IM,
          email: newStudent.email,
          fullName: newStudent.fullName
        }
      }
    });

  } catch (error) {
    console.error('Erreur createStudent:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'étudiant',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};