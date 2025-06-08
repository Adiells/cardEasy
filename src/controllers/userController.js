const db = require('../../database/database')
const path = require('path')
const fs = require('fs')
const sharp = require('sharp')
const multiparty = require('multiparty')
const validation = require('../utils/validation')
const limpar = str => str.trimStart().length === 0 ? "" : str.trimStart();

// Inicio da renderização das páginas
exports.renderProfilePage = (req, res) => {
    let userId = req.session?.user?.id || null
    if(!userId) return res.redirect('/login')
    try{
        let userStmt = db.prepare('SELECT description, nome, username, image_url FROM users WHERE id = ?')
        let userData = userStmt.get(userId)
        let countStmt = db.prepare('SELECT COUNT(*) AS total FROM pratos WHERE restaurante_id = ?');
        let dishCount = countStmt.get(userId);
        res.render('perfil', { data: userData, count: dishCount })
    }catch(err){
        console.log('houve um erro ao tentar carregar os dados do banco de dados', err)
        res.status(500).json({Err: 'Erro ao carregar perfil'})
    } 
}
exports.renderEditProfilePage = (req, res) => {
    let userId = req.session?.user?.id || null
    try{
        let stmt = db.prepare('SELECT description, nome, username FROM users WHERE id = ?')
        let data = stmt.get(userId)
        res.render('edit-perfil', { data })
    }catch(err){
        console.log('Houve um erro ao tentar acessar o banco de dados', err)
        res.status(500).json({Err: 'Erro ao carregar edição de perfil'})
    }
}
// Fim da renderização das páginas

// Inicio da lócica de processamento
exports.updateProfileDetails = (req, res) => {
    const name = limpar(req.body.name)
    const bio = limpar(req.body.bio)
    const username = limpar(req.body.username)
    let userId = req.session?.user?.id || null

    if(name.length > 40) return res.status(500).json({err: 'seu nome é muito grande'})
    if(bio.length > 130) return res.status(500).json({err: 'biografia muito grande'})
    if(!validation.isUsernameValid(username)) return res.status(500).json({err: 'seu username não é um username valido'})
    try{
        let userStmt = db.prepare('SELECT nome, description, username FROM users WHERE id = ?')
        let currentValue = userStmt.get(userId)
        if(name.length != 0 && name != currentValue.nome){
            let stmt = db.prepare('UPDATE users SET nome = ? WHERE id = ?')
            stmt.run(name, userId)
        }
        if(bio.length != 0 && bio != currentValue.description){
            let stmt = db.prepare('UPDATE users SET description = ? WHERE id = ?')
            stmt.run(bio, userId)
        }
        if(username.length != 0 && username != currentValue.username){
            let stmt = db.prepare('UPDATE users SET username = ? WHERE id = ?')
            stmt.run(username, userId)
        }
        return res.status(200).json({message: 'ok'})
    }catch(err){
        console.log('Houve um erro interno ao tentar editar os dados no banco de dados')
        res.status(500).json({err: 'Nome de usuário ja existente'})
    }
}
exports.updateProfilePhoto = (req, res) => {
    const userId = req.session?.user?.id;
    const form = new multiparty.Form();

    form.parse(req, (err, fields, files) => {
        if (err) return res.status(500).json({ err: 'Erro ao processar o formulário: ' + err.message });
        if (!files.foto || !files.foto[0]) return res.status(400).json({ err: 'Nenhuma foto enviada.' });

        const tempPath = files.foto[0].path;
        const newFilename = `perfil${userId}${path.extname(files.foto[0].originalFilename)}`;
        const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'profilePhoto');
        const finalPath = path.join(uploadDir, newFilename);
        fs.mkdirSync(uploadDir, { recursive: true });

        sharp(tempPath)
            .resize(700, 700, { fit: 'cover' })
            .toFile(finalPath)
            .then(() => {
                db.prepare('UPDATE users SET image_url = ? WHERE id = ?').run(newFilename, userId);

                // Deleta o arquivo temporário
                fs.unlink(tempPath, (unlinkErr) => {
                    if (unlinkErr) console.error("Erro ao deletar imagem temporária:", unlinkErr);
                });

                res.status(200).json({ message: 'Foto atualizada com sucesso!', newImageUrl: newFilename });
            })
            .catch(sharpErr => {
                console.error("Erro ao processar a imagem com Sharp:", sharpErr);
                res.status(500).json({ err: 'Erro no processamento da imagem' });
            });
    });
};
exports.checkUsernameAvailability  = (req, res) => {
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
// Fim da lógica de processamento