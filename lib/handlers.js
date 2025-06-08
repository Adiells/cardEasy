const db = require('../database/database')
const path = require('path')
const bcrypt = require("bcrypt")
const sharp = require('sharp')
const fs = require('fs')
exports.api = {}

exports.home = (req, res) => {
    res.render('home')
}

exports.cadastrarPratos = (req, res) => {
    res.render('novosPratos',{ user: req.session.user, rota: req.params.username} )
}
exports.perfil = (req, res) => {
    let id = req.session?.user?.id || null
    let data
    let count
    try{
        let stmt = db.prepare('SELECT description, nome, username, image_url FROM users WHERE id = ?')
        data = stmt.get(id)
        let stmt1 = db.prepare('SELECT COUNT(*) AS total FROM pratos WHERE restaurante_id = ?');
        count = stmt1.get(id);
        console.log(count)
    }catch(err){
        console.log('houve um erro ao tentar carregar os dados do banco de dados', err)
    } 
    res.render('perfil', { data, count })
}
exports.perfilEditar = (req, res) => {
    let data
    let id = req.session?.user?.id || null
    try{
        let stmt = db.prepare('SELECT description, nome, username FROM users WHERE id = ?')
        data = stmt.get(id)
    }catch(err){
        console.log('Houve um erro ao tentar acessar o banco de dados', err)
    }
    res.render('edit-perfil', { data })
}
exports.api.perfilEditar = (req, res) => {
    const limpar = str => str.trimStart().length === 0 ? "" : str.trimStart();
    const cadastro = require('../lib/cadastro')
    const name = limpar(req.body.name)
    const bio = limpar(req.body.bio)
    const username = limpar(req.body.username)
    let id = req.session?.user?.id || null

    if(name.length > 40) return res.status(500).json({err: 'seu nome é muito grande'})
    if(bio.length > 130) return res.status(500).json({err: 'biografia muito grande'})
    if(!cadastro.isUsernameValid(username)) return res.status(500).json({err: 'seu username não é um username valido'})
    try{
        let stmt = db.prepare('SELECT nome, description, username FROM users WHERE id = ?')
        let valoresAtuais = stmt.get(id)
        if(name.length != 0 && name != valoresAtuais.nome){
            let stmt = db.prepare('UPDATE users SET nome = ? WHERE id = ?')
            stmt.run(name, id)
        }
        if(bio.length != 0 && bio != valoresAtuais.description){
            let stmt = db.prepare('UPDATE users SET description = ? WHERE id = ?')
            stmt.run(bio, id)
        }
        if(username.length != 0 && username != valoresAtuais.username){
            let stmt = db.prepare('UPDATE users SET username = ? WHERE id = ?')
            stmt.run(username, id)
        }
    }catch(err){
        console.log('Houve um erro interno ao tentar editar os dados no banco de dados')
        res.status(500).json({err: 'Nome de usuário ja existente'})
    }
    return res.status(200).json({message: 'ok'})
}
exports.api.perfilFoto = (req, res, fields, files) => {
    let id = req.session?.user?.id || null
    console.log(files)
    files.foto[0].originalFilename = `perfil${id}${path.extname(files.foto?.[0]?.originalFilename)}`
    console.log(files)
    const imagem = files.foto?.[0]?.originalFilename || 'default.png'
    console.log(imagem)
    try{
        const stmt = db.prepare('UPDATE users SET image_url = ? WHERE id = ?')
        stmt.run(imagem, id)
        let caminho = path.join(__dirname, '..', 'uploads', ('profilePhoto'))
        if(!fs.existsSync(caminho)) fs.mkdirSync(caminho, {recursive: true})
        sharp(files.foto[0].path)
         .resize(700, 700, {fit: 'cover'})
         .toFile(path.join(caminho, imagem))
         .then(() => {
            fs.unlink(files.foto[0].path, err => {
                if(err){
                    console.log('Erro ao deletar imagem temporaria')
                    return res.status(500).json({err:'erro interno no servidor'})
                }else{
                    res.status(200).json({result: 'sucess'})
                }
            })
         })
    }catch(err){
        console.log('Erro ao tentar salvar informações')
        res.status(500).json({'err': 'Erro interno no servidor', err})
    }
}
exports.restaurantes = (req, res) => {
    let stmt = db.prepare(`
        SELECT nome, username
        FROM users`)
    let result = stmt.all()
    res.render('restaurantes', { result })
}
exports.api.usersVerify = (req, res) => {
    const username = req.query.username
    try{
        const row = db.prepare('SELECT username FROM users WHERE username = ?').get(username)
        if(row){
            if(req.session.user && req.session.user.username == row.username){
                res.json({disponivel: true})
            }else{
                res.json({disponivel: false})
            }
        }else{
            res.json({disponivel: true})
        }
    }catch(err){
        res.status(500).json({err: 'server error'})
    }
}
exports.api.cadastrarPratos = (req, res, fields, files) => {
    let now = `_${Date.now()}`
    const idRestaurante = req.session?.user?.id || null
    const titulo = fields.nome?.[0]
    const preco = parseFloat(fields.preco?.[0])
    const descricao = fields.descricao?.[0]
    const categoria = fields.categoria?.[0]

    files.foto[0].originalFilename = String(titulo.toLowerCase().split(/\s+/g).join('_')) + now + String(path.extname(files.foto?.[0]?.originalFilename))

    const imagem = files.foto?.[0]?.originalFilename || null

    try {
        const stmt = db.prepare(`
            INSERT INTO pratos (restaurante_id, titulo, descricao, preco, categoria, imagem)
            VALUES (?, ?, ?, ?, ?, ?)`)
        stmt.run(idRestaurante, titulo, descricao, preco, categoria, imagem)
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
                    res.json({ result: 'success' })
                }
            })
         })
         .catch(err => {
            console.log('Erro ao redimensionar imagem', err)
            try{
                let stmt = db.prepare('DELETE FROM pratos WHERE imagem = ?')
                stmt.run(imagem)
            }catch{
                console.log('Erro ao tentar apagar dado do banco de dados')
            }
            res.status(500).json({error: 'Erro no processamento da imagem'})
         })
    }catch(err){
        console.log('Erro ao salvar no banco:', err)
        res.status(500).json({'err': 'Erro interno no servidor', err})
    }
}

exports.cardapio = (req, res) => {
    const username = req.params.name
    const stmt = db.prepare(`
        SELECT pratos.restaurante_id, pratos.titulo, pratos.preco, pratos.descricao, pratos.imagem, pratos.categoria, users.username, users.nome, users.description, users.image_url
        FROM pratos
        JOIN users ON pratos.restaurante_id = users.id
        WHERE users.username = ?
    `)

    let result = stmt.all(username)
    if(result.length === 0){
        return res.render('404')
    }
    const restauranteInfo = {
        nome: result[0].nome,
        description: result[0].description,
        image_url: result[0].image_url
    }
    const produtos = result.map(item => {
        return {
            titulo: item.titulo,
            preco: item.preco,
            descricao: item.descricao,
            imagem: `${item.restaurante_id}/${item.imagem}`,
            categoria: item.categoria
        }
    })
    const categoriasU = [...new Set(result.map(item => item.categoria))]
    const categorias = categoriasU.reduce((newArray, currentValue) => {
        if(currentValue) newArray.push({categoria: currentValue})
        return newArray
    }, [])
    const isOwner = (username === req.session?.user?.username)
    const context = {
        restaurante: restauranteInfo,
        produtos,
        categorias,
        isOwner
    }
    res.render('cardapio', context)
}
