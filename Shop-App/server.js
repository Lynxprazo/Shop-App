const express = require("express");
const cors = require("cors");
const Login = require("./LoginAndRegistration/login");
const  SendProduct = require("./ProductRegister/SendProduct");
const FetchProduct = require("./ProductRegister/FetchProduct");
const Sales = require("./SalesRecord/Sales");
const Edit = require("./EditProduct/Edit");
const Tracker = require("./StockTracker/StockTracker");


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use("/Auth", Login)
app.use("/RegProduct",SendProduct)
app.use("/FetchProduct",FetchProduct);
app.use("/SalesWeight", Sales);
app.use("/Edit", Edit)
app.use("/ProductTrack",Tracker)
app.listen("8081", () => {
  console.log("listeaning here...");
});
