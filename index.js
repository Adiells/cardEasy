const express = require('express')
const expressHandlebars = require('express-handlebars')
const multiparty = require('multiparty')

const handlers = require('./lib/handlers')
const { parse } = require('path')
const port = 3000

const app = express()
const hbs = expressHandlebars.create({
    defaultLayout: 'main',
    helpers: {
        section: function(name, options){
            if(!this._sections)this._sections={}
            this._sections[name] = options.fn(this)
            return null
        }
    }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + '/public'))

app.get('/', handlers.home)

app.get('/admin/cadastro-pratos', handlers.cadastrarPratos)
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

if(require.main === module){
    app.listen(port, () => {
        console.log(`Express started on http://localhost:${port}` + '; press Ctrl-C to terminate')
    })
}else{
    module.export = app
}