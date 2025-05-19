const db = require('../database/database')
const path = require('path')
const fs = require('fs')
exports.api = {}

exports.home = (req, res) => {
    res.render('home')
}

exports.cadastrarPratos = (req, res) => {
    res.render('novosPratos')
}
exports.api.cadastrarPratos = (req, res, fields, files) => {
    let now = `_${Date.now()}`
    const idRestaurante = parseInt(1)
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
        fs.copyFile(files.foto[0].path, path.join(caminho, imagem), err => {
            if(err){
                console.log('Erro ao salvar imagem', err)
                return
            }else{
                fs.unlink(files.foto[0].path, err => {
                    if(err){
                        console.log('Erro ao deletar imagem temporaria')
                        return
                    }else{
                        console.log('Sucesso ao tratar imagem!')
                        res.json({ result: 'success' })
                    }
                })
            }
    
        })
    }catch(err){
        console.log('Erro ao salvar no banco:', err)
        res.status(500).json({error: 'Erro interno no servidor'})
    }
}