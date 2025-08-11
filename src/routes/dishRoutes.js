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
router.patch('/api/edit-dish', (req, res) => {
    console.log('chegou aque')
    console.log(req.body)
    return res.status(200).json( {message: 'ok'} )
})

module.exports = router;