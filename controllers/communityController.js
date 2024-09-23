//Data base
const db = require('../db/queries');

//EJS engine
const ejs = require('ejs');

//Render initial page
async function showDashboard(req,res){
    //Handle queries
    const username = req.query.username;
    const country = req.query.country;
    const style =  req.query.style;
    res.render("community", {title: "Community", script: "community.js", username: username, country: country, style: style});
}

module.exports = {
    showDashboard,
};