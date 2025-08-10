const express = require('express');
const router = express.Router();
const dishController = require('../controllers/dishController');
const { isAuthenticated } = require('../middlewares/isAutenticated');

// Rota para a página do cardápio de um restaurante
router.get('/restaurantes/:name', dishController.renderMenuPage);

// Rotas para cadastrar pratos (precisam de autenticação)
router.get('/:username/cadastro-pratos', isAuthenticated, dishController.renderNewDishPage);
router.post('/api/cadastro-pratos', isAuthenticated, dishController.processNewDish);

router.delete('/deletar-pratos', dishController.processDeleteDish)

module.exports = router;