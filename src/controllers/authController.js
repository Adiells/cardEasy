const db = require('../config/database')
const bcrypt = require('bcrypt')
const validation = require('../utils/validation')
const limpar = str => str.trimStart().length === 0 ? "" : str.trimStart();

// Início da renderização das páginas
exports.renderRegisterPage = (req, res) => {
    if(req.session.user){
        res.redirect('/')
    }else{
        res.render('cadastro')
    }
}
exports.renderLoginPage = (req, res) => {
    if(req.session.user){
        res.redirect('/')
    }else{
        res.render('login')
    }
}
// Fim da renderização das páginas

// Início da lógica de processamento
exports.processRegister = async(req, res) => {
    const username = req.body.username
    const pass = req.body.password
    const name = req.body.name   

    if(!validation.isPasswordValid(pass)) return res.status(500).json({err: 'sua senha não é usa senha válida'})
    if(!validation.isUsernameValid(username)) return res.status(500).json({err: 'seu username não é um username valido'})
    console.log(req.body)
    if(limpar(name).length == 0 || name.length > 40) return res.status(500).json({err: 'seu nome é muito grande'})
    try{
        const row = db.prepare('SELECT 1 FROM users WHERE username = ?').get(username)
        if(row){
            res.status(500).json({err: 'nome ja existente'})
        }
        const image = 'default.png' 
        const hash = await bcrypt.hash(pass, 10)
        const stmt = db.prepare(`
            INSERT INTO users (nome, username, senha, image_url) VALUES(?, ?, ?, ?)`)
        stmt.run(name, username, hash, image)
        res.status(201).json({message: 'Cadastro realizado com sucesso!', redirect: '/login'})
    }catch(err){
        console.log('Erro ao salvar no banco:', err)
        res.status(500).json({error: 'Erro interno no servidor'})
    }
}

exports.processLogin = async(req, res) => {
    let username = req.body.username
    let password = req.body.password
    if(limpar(username).length == 0 || username.length > 30){
        return res.status(500).json({err: 'seu nome é muito grande ou vazio'})
    }else if(limpar(password).length <= 3 || limpar(password).length > 30){
        return res.status(500).json({err: 'seu nome é muito grande ou vazio'})
    }
    try{
        let stmt = db.prepare('SELECT * FROM users WHERE username = ?')
        const user = stmt.get(username)
        if(!user){
            return res.status(401).json({err: 'Username ou senha errada'})
        }
        const match = await bcrypt.compare(password, user.senha)
        if(!match){
            return res.status(401).json({err: 'Username ou senha errada'})
        }
        req.session.user = {
            id: user.id, 
            username: username
        };
        return res.status(201).json({ redirect: '/', mensagem: 'Deu certo' })
    }catch(err){
        console.log('err')
        return res.status(500).json({err: 'Erro interno no servidor'})
    }
}
// Fim da lógica de processamento
exports.logout = (req, res) => {
     req.session.destroy(err => {
        if (err) {
            console.error('Erro ao destruir a sessão:', err);
            return res.redirect('/'); 
        }
        res.redirect('/'); 
    });
}