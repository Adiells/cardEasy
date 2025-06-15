const db = require('../src/config/database')
const path = require('path')
const bcrypt = require("bcrypt")
const sharp = require('sharp')
const fs = require('fs')
exports.api = {}

exports.cadastrarPratos = (req, res) => {
    res.render('novosPratos',{ user: req.session.user, rota: req.params.username} )
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
