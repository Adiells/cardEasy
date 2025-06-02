const db = require('../database/database')
const path = require('path')
const bcrypt = require("bcrypt")
const sharp = require('sharp')
const fs = require('fs')
exports.api = {}

exports.home = (req, res) => {
    res.render('home')
}
exports.cadastro = (req, res) => {
    res.render('cadastro')
}

exports.cadastrarPratos = (req, res) => {
    res.render('novosPratos',{ user: req.session.user.username, rota: req.params.username} )
}
exports.login = (req, res) => {
    res.render('login')
}
exports.api.login = async(req, res) => {
    console.log(req.body)
    let username = req.body.username
    let password = req.body.password
    try{
        console.log('chegou aquii dentro do try')
        let stmt = db.prepare('SELECT * FROM users WHERE username = ?')
        const user = stmt.get(username)
        console.log(user)
        if(!user){
            console.log('aqui')
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
exports.perfil = (req, res) => {
    res.render('perfil', { layout: 'perfil_layout' })
}
exports.restaurantes = (req, res) => {
    const stmt = db.prepare(`
        SELECT nome, username
        FROM users`)
    let result = stmt.all()
    res.render('restaurantes', { result })
}
exports.api.cadastro = async(req, res) => {
    const username = req.body.username
    const pass = req.body.password
    const name = req.body.name
    const row = db.prepare('SELECT 1 FROM users WHERE username = ?').get(username)
        if(row){
            res.status(500).json({err: 'nome ja existente'})
        }
    const hash = await bcrypt.hash(pass, 10)
    try{
        const stmt = db.prepare(`
            INSERT INTO users (nome, username, senha) VALUES(?, ?, ?)`)
        stmt.run(name, username, hash)
        console.log('usuario salvo no banco de dados')
    }catch(err){
        console.log('Erro ao salvar no banco:', err)
        res.status(500).json({error: 'Erro interno no servidor'})
    }
    res.status(200).json({message: 'ok'})
}
exports.api.usersVerify = (req, res) => {
    const username = req.query.username
    try{
        const row = db.prepare('SELECT 1 FROM users WHERE username = ?').get(username)
        if(row){
            console.log(row)
            res.json({disponivel: false})
        }else{
            console.log(row)
            res.json({disponivel: true})
        }
    }catch(err){
        res.status(500).json({err: 'server error'})
    }
}

exports.api.cadastrarPratos = (req, res, fields, files) => {
    let now = `_${Date.now()}`
    const idRestaurante = req.session.user.id
    const titulo = fields.nome?.[0]
    const preco = parseFloat(fields.preco?.[0])
    const descricao = fields.descricao?.[0]

    files.foto[0].originalFilename = String(titulo.toLowerCase().split(/\s+/g).join('_')) + now + String(path.extname(files.foto?.[0]?.originalFilename))

    const imagem = files.foto?.[0]?.originalFilename || null

    try {
        const stmt = db.prepare(`
            INSERT INTO pratos (restaurante_id, titulo, descricao, preco, imagem)
            VALUES (?, ?, ?, ?, ?)`)
        stmt.run(idRestaurante, titulo, descricao, preco, imagem)
        let caminho = path.join(__dirname, '..', 'uploads', ('Restaurante' + String(idRestaurante)))
        if(!fs.existsSync(caminho)) fs.mkdirSync(caminho, {recursive: true})
        sharp(files.foto[0].path)
         .resize(500, 500, { fit: 'cover' })
         .toFile(path.join(caminho, imagem))
         .then(() => {
            fs.unlink(files.foto[0].path, err => {
                if(err){
                    console.log('Erro ao deletar imagem temporaria')
                    return
                } else {
                    console.log('Sucesso ao tratar imagem!')
                    res.json({ result: 'success' })
                }
            })
         })
         .catch(err => {
            console.log('Erro ao redimensionar imagem', err)
            res.status(500).json({error: 'Erro no processamento da imagem'})
         })
    }catch(err){
        console.log('Erro ao salvar no banco:', err)
        res.status(500).json({error: 'Erro interno no servidor'})
    }
}

exports.cardapio = (req, res) => {
    const username = req.params.name
    const stmt = db.prepare(`
        SELECT pratos.restaurante_id, pratos.titulo, pratos.preco, pratos.descricao, pratos.imagem, users.username, users.nome
        FROM pratos
        JOIN users ON pratos.restaurante_id = users.id
        WHERE users.username = ?
    `)

    let result = stmt.all(username)
    if(result.length === 0){
        return res.render('404')
    }
    res.render('cardapio', { result })
}
