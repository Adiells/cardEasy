const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const { isAuthenticated } = require('../middlewares/isAutenticated')

// rotas que exigem autenticacao
router.get('/perfil', isAuthenticated, userController.renderProfilePage)
router.get('/perfil/editar', isAuthenticated, userController.renderEditProfilePage)

router.post('/api/perfil/editar', isAuthenticated, userController.updateProfileDetails)
router.post('/api/perfil/foto', isAuthenticated, userController.updateProfilePhoto)

// rotas publicas 
router.get('/api/usuarios/verificar', userController.checkUsernameAvailability)
router.get('/perfil/:username', userController.renderPublicProfilePage)

module.exports = router