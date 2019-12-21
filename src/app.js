require('dotenv').config();
const {NODE_ENV} = require('./config');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const knex = require('knex');
const ArticlesService = require('./articleservice');
const app = express();
const knexInstance = knex({
    client: 'pg',
    connection: process.env.DB_URL,
});
const morganOption = (NODE_ENV === 'production')
    ? 'tiny'
    : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.use(function errorHandler(error, req, res, next) {
    let response;
    if (NODE_ENV === 'production') {
        response = {error: {message: 'server error'}}
    } else {
        console.error(error);
        response = {message: error.message, error}
    }
    res.status(500).json(response)
});

app.get('/articles', (req, res, next) => {
    const knexInstance = req.app.get('db');
    ArticlesService.getAllArticles(knexInstance)
        .then(articles => {
            res.json(articles)
        })
        .catch(next)
});
app.get('/articles/:id', (req, res, next) => {
    const knexInstance = req.app.get('db');
    const {id} = req.params;
    ArticlesService.getById(knexInstance, id)
        .then(article => {
            res.json(article)
        })
        .catch(next)
});


module.exports = app;