require('dotenv').config()
const express = require('express')
const session = require('express-session')
const expressHandlebars = require('express-handlebars')
const BetterSqlite3Store = require('better-sqlite3-session-store')(session)
const multiparty = require('multiparty')
const path = require('path')
const db = require('./src/config/database')
const compression = require('compression')

const handlers = require('./lib/handlers')
const { isAuthenticated } = require('./src/middlewares/isAutenticated')

const authRoutes = require('./src/routes/authRoutes')
const userRoutes = require('./src/routes/userRoutes')
const pageRoutes = require('./src/routes/pageRoutes')
const dishRoutes = require('./src/routes/dishRoutes')
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
        },
        ifEq: function(arg1, arg2, options) {
            return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
        }
    }
});
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.use(compression())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(__dirname + '/public'))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    store: new BetterSqlite3Store({
        client: db,
        expired: {
            clear: true,
            interval: 900000
        }
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1000*60*60
    }
}))
app.use((req, res, next) => {
    if(req.session && req.session.user){
        res.locals.user = req.session.user
    }else{
        res.locals.user = null
    }
    next()
})

app.use(authRoutes)
app.use(userRoutes)
app.use(pageRoutes)
app.use(dishRoutes)


app.use((req, res) => {
  res.status(404).render('404', { titulo: 'Página não encontrada' });
});


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
