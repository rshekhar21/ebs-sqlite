const jwt = require('jsonwebtoken');
const secret = 'iloveindia';
const maxAge = 1000 * 60 * 60 * 24 * 1
const modal = require('../modal/modal');
const log = console.log;


const createToken = (user) => {
    if (user) {
        return jwt.sign(user, secret, { expiresIn: '1d' })
    } else return null;
}

async function authorizeUser(req, res) {
    try {
        let rsp = await modal.loginUser(req);
        if (rsp.status) {
            let user = rsp.result[0];
            const accessToken = createToken(user)
            if (accessToken) {
                res.clearCookie('EBSLToken');
                res.cookie('EBSLToken', accessToken, { httpOnly: true, maxAge, sameSite: 'Strict' });
                return res.json(true)
            } else {
                throw error
            }
        } else {
            res.json(false)
        }
    } catch (error) {
        res.json(error)
    }
}

function authenticateToken(req, res, next) {
    const token = req.cookies.EBSLToken;
    if (!token) { return next(); }
    jwt.verify(token, secret, (err, decoded) => {
        if (err) { return next(); }
        req.user = decoded;
        res.cookie('user_id', decoded.id, { maxAge, sameSite: 'lax' });
        next();
    });
}

function isLoggedIn(req, res, next) {
    if (!req.user) return res.redirect('/');
    next();
}

function isAdmin(req, res, next) {
    if (!req.user) return res.redirect('/');
    if (!req.user_role === 'admin') return res.json(false)
    return res.json(true);
}

function authenticate(req, res, next) {
    try {
        if (req.user) {
            // if (!req.cookies.username) { return res.redirect('/login') }
            // if (app_name) res.locals.trade = app_name;
            return res.redirect('/home');
            // next();
        } else return res.redirect('/');
    } catch (error) {
        log(error);
    }
}

function logout(req, res) {
    res.clearCookie('EBSLToken');
    res.clearCookie('user_id');
    res.redirect('/');
}

async function sanatizeData(req, res, next) {
    const url = req.path;
    try {
        if (url === '/auth/crud/create/stock') {
            req.body.data.sku = Date.now().toString();
            if (!req.body.data.product) throw 'Column product cannot be blank'
            if (req.body.data.pcode) req.body.data.pcode = req.body.data.pcode.toUpperCase();
            if (req.body.data.size) req.body.data.size = req.body.data.size.toUpperCase();
            if (req.body.data.unit) req.body.data.unit = req.body.data.unit.toUpperCase();
            if (req.body.data.upc) req.body.data.upc = req.body.data.upc.toUpperCase();
            if (req.body.data.color) req.body.data.color = req.body.data.color.toUpperCase();
        };

        if (url === '/auth/crud/update/stock') {
            if (!req.body.data.product) throw 'Column product cannot be blank'
            if (req.body.data.upc) req.body.data.upc = req.body.data.upc.toUpperCase();
            if (req.body.data.size) req.body.data.size = req.body.data.size.toUpperCase();
            if (req.body.data.unit) req.body.data.unit = req.body.data.unit.toUpperCase();
            if (req.body.data.color) req.body.data.color = req.body.data.color.toUpperCase();
            if (req.body.data.pcode) req.body.data.pcode = req.body.data.pcode.toUpperCase();
        };

        next();
    } catch (error) {
        log(error);
        res.end(error);
    }
}


module.exports = {
    authorizeUser,
    authenticateToken,
    isLoggedIn,
    logout,
    isAdmin,
    sanatizeData
}