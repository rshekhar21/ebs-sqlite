const log = console.log;
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const app = express();
const ejs = require('ejs');
const cors = require('cors');
const path = require('path');
const sqlite = require('../sqlite/sqlite');
const router = require('./router/router');
sqlite.initializeDatabase();
app.use(cors());


ejs.delimiter = '?';

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(expressLayouts);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
// app.use('/order', require('./router/shared'));
app.use('/', router);

process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing SQLite database');
    await sqlite.closeDatabase();
    process.exit(0);
});

module.exports = app;