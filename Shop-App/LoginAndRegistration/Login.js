const express = require("express");
const db = require("../DatabaseConnection/db");
const bycrpt = require("bcrypt")
const Login = express.Router();

Login.post("/Register",async(req,res)=>{
    try{
        const LogSql = "INSERT INTO registerworkers(`name`,`password`) VALUE (?,?)";
        const {username, password} = req.body;
        const hashedpassword = await bycrpt.hash(password,10);
        
        db.query(LogSql, [username,hashedpassword], (result,error)=>{
          if(error){
            return res.json(error)
          }
          return res.json(result)
        })
    }catch(error){
        return res.status(500).json({message:"Fail to sent Data", error})
    }
    
});
module.exports = Login;
