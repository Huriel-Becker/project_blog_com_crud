const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const connection = require("./database/database");

const categoriesConstroller = require("./categories/CategoriesController");
const articlesConstroller = require("./articles/ArticlesController");
const userController = require("./users/UserController");

const Article = require("./articles/Article");
const Category = require("./categories/Category");

// View engine
app.set('view engine', 'ejs');

// Redis

// Sessions
app.use(session({
    secret: "secret",
    cookie: {
        maxAge: 900000
    },
    resave: true,
    saveUninitialized: true
}));

// Static
app.use(express.static('public'));

// Body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Database
connection
    .authenticate()
    .then(() => {
        console.log("Conexão feita com sucesso!");
    }).catch((err) => {
        console.log(err);
    })


app.use("/", categoriesConstroller);
app.use("/", articlesConstroller);
app.use("/", userController);

app.get("/session", (req, res) => {
    req.session.treinamento = "Formação Node.js"
    req.session.ano = 2023
    req.session.email = "uri@udemy.com"
    req.session.user = {
        username: "uri",
        email: "email@email.com",
        id: 10
    }
    res.send("Sessão gerada!");
});

app.get("/leitura", (req, res) => {
    res.json({
        treinamento: req.session.treinamento,
        ano: req.session.ano,
        email: req.session.email,
        user: req.session.user
    })
});

app.get("/", (req, res) => {
    Article.findAll({
        order:[
            ['id', 'DESC']
        ],
        limit: 4
    }).then(articles => {
        Category.findAll().then(categories => {
            res.render("index", { articles: articles, categories: categories });
        });
    });
})

app.get("/:slug", (req, res) => {
    const slug = req.params.slug;
    Article.findOne({ 
        where: { 
            slug: slug 
        } 
    }).then(article => {
        if (article != undefined) {
            Category.findAll().then(categories => {
                res.render("article", { article: article, categories: categories });
            });
        } else {
            res.redirect("/");
        }
    }).catch( err => {
        res.redirect("/");
    });

})

app.get("/category/:slug", (req,res) => {
    const slug = req.params.slug;
    Category.findOne({
        where: {
            slug: slug
        },
        include: [{model: Article}]
    }).then(category => {
        if (category != undefined) {
            Category.findAll().then(categories => {
                res.render("index", { articles: category.articles, categories: categories });
            });
        } else {
            res.redirect("/");
        }
    }).catch(err => {
        res.redirect("/");
    });
})

app.listen(8080, () => {
    console.log("O servidor está rodando!");
});