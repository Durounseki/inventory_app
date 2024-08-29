//Create index views

async function getHome(req, res){
    res.render("index",{title: "Home"});
};

module.exports = {
    getHome,
}