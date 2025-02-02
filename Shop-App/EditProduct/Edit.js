const express = require("express");
const Edit = express.Router();
const db = require("../DatabaseConnection/db");

Edit.post("/Register", (req, res) => {
  const { Pname } = req.body;

  console.log("Request body:", req.body);  

  
  if (!Pname || Pname.trim() === "") {
    return res.status(400).json({ message: "Pname is required" });
  }

  const DeleteQuery = "DELETE FROM registerproduct WHERE Pname = ?";
 
  db.query(DeleteQuery, [Pname], (error, result) => {
    if (error) {
      console.error("Database error:", error);  
      return res.status(500).json({ message: "Failed to delete row", error: error.sqlMessage });
    }

    if (result.affectedRows === 0) {  
      return res.status(404).json({ message: "No Product Found" });
    } else {
      return res.json({ message: "Successfully removed the row", result });
    }
  });
});

module.exports = Edit;
