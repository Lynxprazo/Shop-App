const express = require("express");
const db = require("../DatabaseConnection/db");
const SendProduct = express.Router();

SendProduct.post("/service", (req, res) => {
  try {
    const ProSql =
      "INSERT INTO registerproduct(`Pname`, `sellingPrice`, `BoughtPrice`,  `ValueInKg`, `AmountInPackage`,`Stock`,`WEIGHT`) VALUE(?,?,?,?,?,?,?)";
    const { Pname, sellingPrice, BoughtPrice, ValueInKg, AmountInPackage, stock, WEIGHT } =
      req.body;
    db.query(
      ProSql,
      [Pname, sellingPrice, BoughtPrice, ValueInKg,AmountInPackage,stock, WEIGHT],
      (error, result) => {
        if (error) {
          return res.status(500).json(error);
        }
        return res.json(result);
      }
    );
  } catch (error) {
    console.error("Server error in /service route:", error);
    return res.status(500).json({ message: "Error in Data ", error });
  }
});

module.exports = SendProduct;
