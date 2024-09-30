//Database
import * as db from '../db/indexQueries.js';

//Create index views

async function getHome(req, res){
    res.render("index",{title: "Home", events: events});
};

const indexController = {
    getHome,
};

export default indexController;