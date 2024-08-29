//Load environment variables
require("dotenv").config();

const express = require("express");
const app = express();
const path = require('node:path');
//Router
const indexRouter = require("./routes/indexRouter");
//Set the url encoder to handle form post request
app.use(express.urlencoded({extended: true}));

//Set the root directory of the templates in views
app.set("views",path.join(__dirname, "views"));
//Enable EJS as view engine
app.set("view engine", "ejs");

//Set the directory for static assets
const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));

//Render the views
//home
app.use("/",indexRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`App listening on port ${PORT}!`));