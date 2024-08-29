const pool = require("./pool");

async function getAllEvents() {
    const { rows } = await pool.query("SELECT * FROM events");
    return rows;
};

module.exports = {
    getAllEvents
};