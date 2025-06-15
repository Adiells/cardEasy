const db = require('../src/config/database')
const path = require('path')
const bcrypt = require("bcrypt")
const sharp = require('sharp')
const fs = require('fs')
exports.api = {}


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


