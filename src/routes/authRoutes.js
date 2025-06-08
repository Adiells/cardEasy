const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')

router.get('/login', authController.renderLoginPage)
router.get('/cadastro', authController.renderRegisterPage)
router.get('/logout', authController.logout)

router.post('/api/login', authController.processLogin)
router.post('/api/cadastro', authController.processRegister)

module.exports = router