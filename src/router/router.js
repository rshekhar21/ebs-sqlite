const express = require('express');
const router = express.Router();
const ctrl = require('../controller/ctrl');
const mw = require('./mw');
const log = console.log;

// MW
router.use('/', mw.authenticateToken);

// GET
router.get('/', (req, res) => {
    if (req.user) return res.redirect('/auth/home');
    res.render('index')
});
// router.get('/home', (req, res)=> res.render('home'));
router.get('/auth/*', mw.isLoggedIn);
router.get('/auth/home', (req, res) => res.render('home'))
router.get('/auth/:url', (req, res) => { res.locals.script = req.params.url, res.render(`page`) });
router.get('/auth/is-admin', mw.isAdmin);

router.get('/logout', mw.logout);


// POST
router.post('/login', mw.authorizeUser);
router.post('/auth/user-restriction', ctrl.userResctictions);
router.post('/auth/advancequery', ctrl.advanceQuery);
router.post('/auth/crud/create/:table/:multi?', mw.sanatizeData, ctrl.createRecord);
router.post('/auth/crud/update/:table', mw.sanatizeData, ctrl.updateRecord);

module.exports = router;

