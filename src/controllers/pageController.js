const db = require('../config/database.js')

exports.renderHomePage = (req, res) => {
    res.render('home')
}

exports.renderRestaurantsPage = (req, res) => {
    try{
        let stmt = db.prepare('SELECT nome, username FROM users')
        let result = stmt.all()
        res.render('restaurantes', { result })
    }catch(err){
        console.error('Erro ao buscar restaurantes: ', err)
        res.status(500).json({message: 'Erro ao carregar a lista de restaurantes.'})
    }
}