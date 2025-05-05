const express = require("express");
const bodyParser = require("body-parser");
var path = require('path');

var appRoutes = require("./routes/app");
var messageRoutes = require("./routes/messages"); // Adicionado
var userRoutes = require("./routes/users"); // Adicionado

const app = express();

// NOVO
const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/MyMongoDB')
  .then(() => {
    console.log('Conexão com o MongoDB estabelecida com sucesso.');
  })
  .catch((error) => {
    console.error('Erro na conexão com o MongoDB:', error);
  });
// NOVO

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/images", express.static(path.join(__dirname, "images"))); // Servir imagens estaticamente

app.use(express.static(path.join(__dirname, "public")));

// Configuração do CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS"); // PUT adicionado
  next();
});

app.use("/api/messages", messageRoutes); // Rota de mensagens adicionada
app.use("/api/users", userRoutes); // Rota de usuários adicionada
app.use("/", appRoutes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  return res.render('index');
});

module.exports = app;
 