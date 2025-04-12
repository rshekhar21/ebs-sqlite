const log = console.log;
const md5 = require("md5");
const config = require('./config');
const { create, update, views } = require('./config');
const restrictions = require('./restrictions'); //log(restrictions);
const queries = require('./queries');
const schema = require("./schema");

log(Date.now().toString());

async function advanceQuery(req) {
    try {
        let { data, read = true } = req.body; //log(req);
        if (!data) throw 'no information found!'
        const key = data?.key;
        if (!key) throw 'no table found!';
        let sql = queries[key] || config.readQuery(key) || null;
        if (!sql) throw 'no information found!';
        const values = data.values || [];
        if (data?.type == 'search') {
            search = data.searchfor; //log(search);
            if (!search) throw 'no search string found'
            sql = sql.replace(/search/gi, '%' + search + '%');
        }
        if (data?.limit) { sql = sql.slice(0, -1) + ` LIMIT ${data.limit};` }

        const entity = data?.eid ?? null;
        if (entity) { values.push('1') }
        const bulk = data?.bulk ?? null;
        if (bulk) { sql = `${sql} ${data.bulkstr};` }
        let res = await config.runSql(sql, values, read);
        return res;
    } catch (error) {
        log('modal@103', error);
        return false;
    }
}

async function loginUser(req) {
    try {
        const { username, password } = req.body;
        if (!username || !password) throw 'invalid/missing username/password';
        let sql = 'select id, name, username, user_role from users where username = ? and password = ?;';
        let res = await config.runSql(sql, [username, md5(password)]);
        if (!res.length) throw 'invalid username/password';
        return { status: true, result: res };
    } catch (error) {
        log(error);
        return { status: false, result: error };
    }
}

async function userResctictions(req) {
    try {
        let { user, rc } = req.body;
        let username = req.cookies.username;
        if (!rc) throw 'Unauthorized request';
        if (!username) throw 'Username Required';
        if (user !== username) throw 'Invalid Access'
        let restiction = restrictions[rc];
        let sql = `select ${restiction} from restrictions r join users u on u.id = r.userid where u.username = ?;`;
        let [res] = await config.runSql(sql, [username]);
        return res[restiction];
    } catch (error) {
        log(error);
        return 0;
    }
}

async function createRecord(req) {
    try {
        return await insertRecord(req, 'c')
    } catch (error) {
        return false
    }
}

async function updateRecord(req) {
    try {
        return await insertRecord(req, 'u')
    } catch (error) {
        return false
    }
}

async function insertRecord(req, type, read = false) {
    try {
        let { data } = req.body;
        const { table } = req.params;
        const kvp = config.trimValues(data);
        if (!table) throw Error('Tablename not found');
        if (kvp[0]?.id) kvp[0].id = parseInt(kvp[0].id);
        let values = [];
        const tbl = schema[table] || table;
        if (!tbl) throw 'Table not found!';
        const fieldsArr = type === 'c' ? create[tbl] : update[tbl];
        fieldsArr.forEach(f => values.push(kvp[0][f] || null));
        sql = config.createSqlStmt(tbl, type);
        let res = await config.runSql(sql, values, read);
        return res;
    } catch (error) {
        log(error);
        return false;
    }
}

async function setSku(req) {
    try {
        const data = req.body;
        const id = data.id;
        if (!id) throw 'Invalid/Missing ID !';
        const sku = Date.now();
        const sql = "UPDATE `stock` s LEFT JOIN `sold` l on l.`sku` = s.`sku` SET s.`sku` = ? WHERE s.`id` = ? AND l.`sku` IS NULL;";
        const res = await config.runSql(sql, [sku, id]);
        return res;
    } catch (error) {
        return false;
    }
}


module.exports = {
    loginUser,
    userResctictions,
    advanceQuery,
    createRecord,
    updateRecord,
    setSku,
}