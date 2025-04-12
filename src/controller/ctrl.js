const modal = require('../modal/modal');
const log = console.log;

async function action(req, res, modal) {
    try {
        let rsp = await modal(req);
        res.json(rsp)
    } catch (error) {
        res.json(error)
    }
}

function userResctictions(req, res) { action(req, res, modal.userResctictions) }
function advanceQuery(req, res) { action(req, res, modal.advanceQuery) }
function createRecord(req, res) { action(req, res, modal.createRecord) }
function updateRecord(req, res) { action(req, res, modal.updateRecord) }

module.exports = {
    userResctictions,
    advanceQuery,
    createRecord,
    updateRecord
}
