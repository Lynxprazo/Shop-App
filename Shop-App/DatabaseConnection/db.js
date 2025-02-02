const mysql = require("mysql");
require("dotenv").config()

const db = mysql.createConnection({
    host:process.env.DB_HOST||"localhost",
    user:process.env.DB_USER||"root",
    password:process.env.DB_PASS||"",
    database:process.env.DB_NAME||"db-shopapp"
});
db.connect((err)=>{
    if(err){
        
        console.error({message:"database fail to connect ", err});
        return;

    }
    console.log("Database connected successfully ")
});
module.exports = db;