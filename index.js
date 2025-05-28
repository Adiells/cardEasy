const express = require('express')
const expressHandlebars = require('express-handlebars')
const multiparty = require('multiparty')
const path = require('path')
const db = require('./database/database')

const handlers = require('./lib/handlers')
const cadastro = require('./lib/cadastro')
const port = 3000

const app = express()
const hbs = expressHandlebars.create({
    defaultLayout: 'main',
    helpers: {
        section: function(name, options){
            if(!this._sections)this._sections={}
            this._sections[name] = options.fn(this)
            return null
        },
        lowerReplace: function(name){
            return name.toLowerCase().replace(/\s+/g, "")
        }
    }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(__dirname + '/public'))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', handlers.home)

app.get('/cadastro', handlers.cadastro)
app.post('/api/cadastro', (req, res) => {
    const password = req.body.password
    const name = req.body.name
    const username = req.body.username
    

    if(!cadastro.isPasswordValid(password)) return res.status(500).json({err: 'sua senha não é usa senha válida'})
    if(!cadastro.isUsernameValid(username)) return res.status(500).json({err: 'seu username não é um username valido'})
    console.log(req.body)
    if(name.length == 0 || name.length > 15) return res.status(500).json({err: 'seu nome é muito grande'})
    handlers.api.cadastro(req, res)
})
app.get('/api/usuarios/verificar', handlers.api.usersVerify)

app.get('/restaurante/cadastro-pratos', handlers.cadastrarPratos)
app.get('/admin/deluser', (req, res) => {
    const stmt = db.prepare('SELECT * FROM users');
    let user = stmt.all()
    res.render('admin/deluser', { user })
})
app.post('/api/admin/deluser', (req, res) => {
    console.log(req.body)
    try{
        let stmt = db.prepare('DELETE FROM users WHERE id = ?')
        stmt.run(req.body.userId)
        console.log('Usuario deletado')
    }catch(err){
        console.log(`Houve um erro ao tentar deletar o usuario do banco de dados`)
    }
    res.status(201).json({teste: 'sim'})
})
app.post('/api/cadastro-pratos', (req, res) => {
    const form = new multiparty.Form()
    form.parse(req, (err, fields, files) => {
        if(err) return res.status(500).send({error: err.message})
        let erros = []
        
        let preco = parseFloat(fields.preco && fields.preco[0])
        if(isNaN(preco) || preco < 0) erros.push('Preço inválido')

        let nome = fields.nome && fields.nome[0]
        if(nome.trim() == '' || !nome) erros.push('Nome do prato é obrigatório')

        let descricao = fields.descricao && fields.descricao[0]
        if(descricao.trim() == '' || !descricao) erros.push('Descrição do prato é obrigatória')
        if(erros.length > 0){
            return res.status(400).json({ erros })
        }
        handlers.api.cadastrarPratos(req, res, fields, files)
    })
})
app.get('/restaurantes', handlers.restaurantes)

app.get('/restaurantes/:name', handlers.cardapio)

if(require.main === module){
    app.listen(port, () => {
        console.log(`Express started on http://localhost:${port}` + '; press Ctrl-C to terminate')
    })
}else{
    module.export = app
}
process.on('SIGINT', () => {
    console.log('\nEncerrando o servidor...');
    db.close();
    console.log('Conexão com o banco fechada.');
    process.exit();
});

process.on('exit', () => {
    db.close();
});
