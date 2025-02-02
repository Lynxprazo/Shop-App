const express = require("express");
const db = require("../DatabaseConnection/db");
const Sales = express.Router();

Sales.get("/getProductName", (req, res) => {
  try {
    const getSqlPname =
      "SELECT  Pname , No , sellingPrice FROM registerproduct ORDER BY Pname ASC";
    db.query(getSqlPname, (error, result) => {
      if (error) {
        return res.status(500).json(error);
      }
      return res.json(result);
    });
  } catch (error) {
    return res.status(500).json(error);
  }
});
Sales.get("/Prepackage", (req, res) => {
  try {
    SqlPrePname =
      "SELECT Pname , No , ValueInKg, sellingPrice FROM registerproduct WHERE ValueInKg != '' ORDER BY Pname ASC ";
    db.query(SqlPrePname, (error, result) => {
      if (error) {
        return res.status(500).json(error);
      }
      res.json(result);
    });
  } catch (error) {
    return res.status(500).json(error);
  }
});
Sales.post("/SendPreForm", (req, res) => {
  try {

    const Daterequired = new Date().toISOString().slice(0,10);
    const SqlPreForm = "SELECT * FROM  bulkSales  WHERE ProductName = ? AND DATE(Day_Sold) = ? ";
    const { ProductName, ValueInKg, Amount, AmountKg } = req.body;
    db.query(SqlPreForm, [ProductName,Daterequired], (error, result) => {
      if (error) {
        return res.status(500).json(error);
      }
      if (result.length > 0) {
        result.forEach((product) => {
          console.log(result)
          const ExistingKG = product.AmountKg;

          const UpdateKG = Number(ExistingKG) + Number(AmountKg);

          const AmountPerKg = Number(ValueInKg) * Number(UpdateKG);
          const UpdateSql =
            "UPDATE bulksales SET ValueInKg =? , AmountKg = ? , TotalAmount = ? WHERE ProductName = ?";
          db.query(
            UpdateSql,
            [ValueInKg, UpdateKG, AmountPerKg, ProductName],
            (error, result) => {
              if (error) {
                return res
                  .status(500)
                  .json({ message: "Faild to Update Table", error });
              }
              return res.json(result);
            }
          );
        });
      } else {
        console.log(result)
        const insertSql =
          "INSERT INTO bulksales (`ProductName` , `ValueInKg`, `AmountKg`, `TotalAmount`, `sellingPrice`) VALUE(?,?,?,?,?)";
        const UpdateTotalAmount = Number(AmountKg) * Number(ValueInKg);
        db.query(
          insertSql,
          [ProductName, ValueInKg, AmountKg, UpdateTotalAmount, Amount],
          (error, result) => {
            if (error) {
              return res
                .status(500)
                .json({ message: "Faild to Insert Data  into Table" });
            } else {
              return res.json(result);
            }
          }
        );
      }
    });
  } catch (error) {
    console.error(error);
  }
});
Sales.get("/getPreForm", (req, res) => {
  try {
    const Daysold = new Date().toISOString().slice(0, 10);
    const getSql = "SELECT * FROM bulksales WHERE DATE(Day_sold) = ? ";
    db.query(getSql, [Daysold], (error, result) => {
      if (error) {
        return res
          .status(500)
          .json({ message: "Failed to Fetch data from database", error });
      }
      return res.json(result);
    });
  } catch (error) {
    console.error(error);
  }
});
Sales.post("/SalesBulk", (req, res) => {
  try {
    const SqlPackageSL = "SELECT * FROM packagesales WHERE ProductName = ? AND DATE(Day_Sold) =?";
  
    const { ProductName, ProductNumber, sellingPrice } = req.body;
    const DayToday = new Date().toISOString().slice(0,10)
    db.query(SqlPackageSL,[ProductName,DayToday],(error,result) => {
      if (error) {
        return res.status(500).json({message:"Failed to  select data", error });
      }
      if (result.length > 0) {
        result.forEach((product) => {
          console.log(result)
          const existingAmount = product.sellingPrice;
          const existingProductNo = product.ProductNumber;

          const UpdateAmount = Number(existingAmount) + Number(sellingPrice);
          const UpdataProductNo =
            Number(existingProductNo) + Number(ProductNumber);

          const UpdateRowSL =
            "UPDATE packagesales  SET ProductNumber = ? , sellingPrice = ? WHERE ProductName = ? AND DATE(Day_Sold) = ? ";
          db.query(
            UpdateRowSL,
            [UpdataProductNo, UpdateAmount, ProductName,DayToday],
            (error, UpdateResult) => {
              if (error) {
                console.error("failed to Update", error);
                return res
                  .status(500)
                  .json({ message: "Faild to Update the column", error });
              }
              return res.json(UpdateResult);
            }
          );
        });
      } else {
        console.log(result)
        const BulkSql =
          "INSERT INTO packagesales (`ProductName`, `sellingPrice`, `ProductNumber`) VALUE (?,?,?)";
        db.query(
          BulkSql,
          [ProductName, sellingPrice, ProductNumber],
          (error, result) => {
            if (error) {
              console.log(error);
              return res
                .status(500)
                .json({ message: "Failed to insert", error });
            }
            return res.json(result);
          }
        );
      }
    });
  } catch (error) {
    console.error(error);
  }
});

Sales.get("/SalesReturn", (req, res) => {
  try {
    const DayToday = new Date().toISOString().slice(0,10);
    const SqlReturnSL =
      "SELECT  ProductName,sellingPrice,ProductNumber FROM packagesales WHERE DATE(Day_Sold) = ?";
    db.query(SqlReturnSL,[DayToday] ,(error, result) => {
      if (error) {
        return res.status(500).json({ message: "Failed to Fetch data", error });
      }
      return res.json(result);
    });
  } catch (error) {
    console.error(error);
  }
});
Sales.post("/measured", (req, res) => {
  try {
    const { total } = req.body;

    if (!total) {
      return res.status(400).json({ message: "Total is missing" });
    }
   const SQLmeasured =  "SELECT * FROM dailymeasured  WHERE DATE(Day_at) = ?";
   const Dateday = new Date().toISOString().slice(0,10);
   db.query(SQLmeasured,[Dateday], (err, result) =>{
    if(err){
      res.status(500).json({message:"Server Error", err})
    }
    if(result.length > 0){
        const SqlUpdate =  "UPDATE dailymeasured SET DaySales = ?  WHERE DATE(day_at) = ?" 
        db.query(SqlUpdate, [total, Dateday], (err, result) =>{
          if(err){
         
            return res.status(500).json({message:"Faild to Update the data"})
          }
          if (result){
            return  res.json({message: " Successfuly   Update the data"})
          }
        })

  
    }else{
      const SntSql = "INSERT INTO dailymeasured  (`DaySales`) VALUES (?)";
      db.query(SntSql, [total], (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Error Found", err });
        }
        return res.json({ message: "Successfully inserted into table",result });
      });
    }
   })
   
  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ message: "Server Error", error });
  }
});
/*
Sales.post("/package",(req,res) =>{
  try{
    const DayToday = new Date().toISOString().slice(0,10)
    const {ProductName,ProductNumber,sellingPrice} = req.body
    const checkSQL = "SELECT ProductName,ProductNumber,sellingPrice FROM packagesales WHERE ProductName = ? AND DATE(Day_Sold) = ?"
    db.query(checkSQL,[ProductName,DayToday],(err,result) =>{
      if(err){
        return res.status(500).json({message:"Failed to Request",err});
      }
      if(result.length > 0){
        result.forEach((product) =>{
          const ProductName = product.ProductName;
          const ProductNumber = product.ProductNumber;
          
          const UpdateSql = "UPDATE packagesales SET ProductNumber = ? WHERE ProductName = ?"
          db.query(UpdateSql,[ProductName,ProductNumber],(err,result)=>{
            if(err){
              return res.status(500).json({message:"Failed to Update", err})
            }
            return res.json({message:"succefuly Updated", result})
          })
        })
      }
      else{
        const InsertSql = "INSERT INTO  packagesales (ProductName,sellingPrice, ProductNumber) Values(?,?,?)"
        db.query(InsertSql,[ProductName,sellingPrice,ProductNumber],(err,result)=>{
          if(err){
            return res.status(500).json({message:"Failed to insert data",err})
          }
          return res.status(200).json({message:"Successfuly insert data"},result)
        });
      }
    })
  }catch(err){
    console.error({message:"Server Error"})
  }
})
  */
Sales.get("/dailymeasured", (req, res) => {
  try {
    const getQsl = "SELECT * FROM dailymeasured  WHERE DATE (day_at) = ?";
    const Today = new Date().toISOString().slice(0, 10);
    db.query(getQsl, [Today], (ERR, SUCC) => {
      if (ERR) {
        return res.status(500).json({ message: "Failed to Fetch data", ERR });
      }
      if (SUCC) {
        return res.status(500).json({ message: "Successful", SUCC });
      }
    });
  } catch (Err) {
    console.error({ message: "Server Error", Err });
    return res.status(500).json({ message: "Server Error" });
  }
});
module.exports = Sales;
