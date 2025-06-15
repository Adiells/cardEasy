const db = require('../config/database')
const path = require('path')
const fs = require('fs')
const sharp = require('sharp')
const multiparty = require('multiparty')

// Inicio da renderização das páginas
exports.renderNewDishPage = (req, res) => {
    res.render('novosPratos',{ user: req.session.user, rota: req.params.username} )
}

exports.renderMenuPage = (req, res) => {
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
// Fim da renderização das páginas

// Inicio da lócica de processamento
exports.processNewDish = async (req, res) => {
    const restaurantId = req.session?.user?.id;
    if (!restaurantId) {
        return res.status(401).json({ err: 'Usuário não autenticado.' });
    }

    try {
        const parseForm = () => new Promise((resolve, reject) => {
            const form = new multiparty.Form();
            form.parse(req, (err, fields, files) => {
                if (err) return reject(err);
                resolve({ fields, files });
            });
        });

        const { fields, files } = await parseForm();
        
        // Validação dos campos
        const titulo = fields.nome?.[0];
        const preco = parseFloat(fields.preco?.[0]);
        const descricao = fields.descricao?.[0];
        const categoria = fields.categoria?.[0];
        const foto = files.foto?.[0];

        if (!titulo || !descricao || isNaN(preco) || !foto) {
            return res.status(400).json({ error: 'Todos os campos são obrigatórios e o preço deve ser um número.' });
        }

        // Preparar nomes e caminhos
        const fileExt = path.extname(foto.originalFilename);
        const newFilename = `${titulo.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}${fileExt}`;
        const uploadDir = path.join(__dirname, '..', '..', 'uploads', `Restaurante${restaurantId}`);
        const finalPath = path.join(uploadDir, newFilename);

        await fs.promises.mkdir(uploadDir, { recursive: true });

        // Salvar arquivo no disco
        await sharp(foto.path).resize(500, 500, { fit: 'cover' }).toFile(finalPath);
        
        // Salvar no banco de dados
        const stmt = db.prepare(`
            INSERT INTO pratos (restaurante_id, titulo, descricao, preco, categoria, imagem)
            VALUES (?, ?, ?, ?, ?, ?)`);
        stmt.run(restaurantId, titulo, descricao, preco, categoria, newFilename);

        // Limpar arquivo temporário
        await fs.promises.unlink(foto.path);

        res.status(201).json({ message: 'Prato cadastrado com sucesso!' });

    } catch (err) {
        console.error("Erro ao cadastrar prato:", err);
        res.status(500).json({ error: 'Erro interno ao processar o cadastro do prato.' });
    }
};
// Fim da lógica de processamento