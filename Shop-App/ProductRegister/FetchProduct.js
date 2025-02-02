const express = require("express");
const db = require("../DatabaseConnection/db");
const FetchProduct = express.Router();

//Create  funtions  that  mybe able to do some Calculation
const TrackingProgress = (req, res, callback) => {
  const getQuery1 = "SELECT  Pname,Stock  FROM registerproduct";
  db.query(getQuery1, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Failed to select data" });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "No data found yet" });
    }
    const RemainProp = {};
    result.forEach((product) => {
      RemainProp[product.Pname] = product.Stock;
    });
    const getQuery2 = "SELECT ProductName , ProductNumber FROM packagesales";
    db.query(getQuery2, (err2, result2) => {
      if (err2) {
        return res
          .status(500)
          .json({ message: "Failed to select data ", err2 });
      }
      if (result2.length === 0) {
        return res.status(404).json({ message: "The data are  Not Available" });
      }
      const PercentProdRemain = result2.reduce((acc, items) => {
        const ProductName = items.ProductName;
        const ProductNumber = items.ProductNumber;
        const RemainProd = RemainProp[ProductName] || 0;
        if (RemainProd > 0) {
          const ProductRemaning = Number(
            ((RemainProd - ProductNumber) * 100) / RemainProd
          );
          const PerRemain = ProductRemaning.toFixed(2);
          acc[ProductName] = PerRemain;
        } else {
          acc[ProductName] = 0;
        }
        return acc;
      }, {}); /*
      const ReturnMessage = {}
      for (const [productname, percentage] of Object.entries( PercentProdRemain)){
        const Parcentage = parseFloat(percentage)
        if(Parcentage === 50.00 ){
          return ReturnMessage[productname] = `Your ${productname} it about ${Parcentage}%  Over the Stock`
        }else if(Parcentage < 5){
          return ReturnMessage[productname] = `Your ${productname}  it about ${Parcentage}% Over the Stock`
        }else{
          return ReturnMessage[productname] = `Your ${productname} it about ${Parcentage}`
        }

      }*/
      const NumbProductRemain = result2.reduce((acc, items) => {
        const ProductName = items.ProductName;
        const ProductNumber = items.ProductNumber;
        const RemainProd = RemainProp[ProductName] || 0;
        if (RemainProd > 0) {
          const NoproductRemain = Number(RemainProd - ProductNumber);
          acc[ProductName] = NoproductRemain;
        } else {
          acc[ProductName] = 0;
        }
        return acc;
      }, {});
      callback(PercentProdRemain, NumbProductRemain);
    });
  });
};
FetchProduct.get("/ReturnMessage", (req, res) => {
  TrackingProgress(req, res, (ReturnMessage) => {
    return res.json({ message: "Status of Your Product is", ReturnMessage });
  });
});
FetchProduct.get("/progressCircle", (req, res) => {
  TrackingProgress(req, res, (PercentProdRemain, NumbProductRemain) => {
    return res
      .status(200)
      .json({
        message:
          "Here is Amount of Product remaining with and percentage remaing",
        PercentProdRemain,
        NumbProductRemain,
      });
  });
});

FetchProduct.get("/service", async (req, res) => {
  const getProSql =
    "SELECT No,Pname, sellingPrice , BoughtPrice, stock, Datecome  FROM registerproduct";
  db.query(getProSql, (error, result) => {
    if (error) {
      return res.status(500).json({ error });
    }
    return res.json(result);
  });
});

FetchProduct.get("/Networth", (req, res) => {
  try {
    const NetworthSql = "SELECT sellingPrice , stock FROM registerproduct";
    db.query(NetworthSql, (err, result) => {
      if (err) {
        res.status(500).json({ message: "Server Failed to select data", err });
      }
      if (result.length > 0) {
        let TotalNetworth = 0;
        let InEach = 0;

        result.forEach((product) => {
          InEach = Number(product.sellingPrice) * Number(product.stock);
          TotalNetworth += Number(InEach);
        });
        return res.json({ message: "successfuly calculated ", TotalNetworth });
      }
    });
  } catch (err) {
    return res.status(500).json({ message: "Server Error ", err });
  }
});

FetchProduct.get("/ProfitGenerated", (req, res) => {
  try {
    const sqlprofitIneach =
      "SELECT Pname, sellingPrice, BoughtPrice FROM registerproduct";
    db.query(sqlprofitIneach, (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Failed to return Response" });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "No products to calculate" });
      }

      const ProfitMade = result.map((productname) => {
        const sellingPrice = productname.sellingPrice;
        const BoughtPrice = productname.BoughtPrice;
        const ProfitGenerated = Number(sellingPrice) - Number(BoughtPrice);

        return {
          Pname: productname.Pname,
          sellingPrice: sellingPrice,
          BoughtPrice: BoughtPrice,
          ProfitGenerated: ProfitGenerated,
        };
      });

      const ProfitMap = {};
      ProfitMade.forEach((product) => {
        ProfitMap[product.Pname] = product.ProfitGenerated;
      });

      const DayToday = new Date().toISOString().slice(0, 10);
      const daySqlProfit =
        "SELECT ProductName, ProductNumber FROM packagesales WHERE DATE(Day_Sold) = ?";

      db.query(daySqlProfit, [DayToday], (err2, result2) => {
        if (err2) {
          return res.status(500).json({ message: "Failed to select the data" });
        }

        const TotalProfitTd = result2.reduce((acc, pass) => {
          const ProductNumber = pass.ProductNumber;
          const ProductName = pass.ProductName;
          const ProfitG = ProfitMap[ProductName] || 0;

          return acc + Number(ProductNumber) * ProfitG;
        }, 0);

        // send  a single response to avoid  return of more than one  response  in single  request
        return res.json({
          message: "Successfully returned the Profit In Day",
          TotalProfitTd,
          ProfitMade,
        });
      });
    });
  } catch (err) {
    console.error({ message: "SERVER ERROR", err });
    return res.status(500).json({ message: "Server Error", err });
  }
});
FetchProduct.get("/profitBulksale", (req, res) => {
  try {
    const fetchsql =
      " SELECT Pname,BoughtPrice,ValueInKg, sellingPrice,WEIGHT FROM  registerproduct WHERE WEIGHT != ''";
    db.query(fetchsql, (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Failed to Fetch data From Backend", err });
      }
      if (result.length === 0) {
        return res.status(404).json({ message: "No Product to calculate" });
      }
      const ProfitBulksales = result.map((product) => {
        const BoughtPrice = product.BoughtPrice;
        const ValueInKg = product.ValueInKg;
        const WEIGHT = product.WEIGHT;
        const Pname = product.Pname;
        const PofitInEach = Number(ValueInKg - BoughtPrice / WEIGHT);
        return {
          Pname: Pname,
          BoughtPrice: BoughtPrice,
          sellingPrice: product.sellingPrice,
          WEIGHT: WEIGHT,
          ValueInKg: ValueInKg,
          PofitInEach: PofitInEach,
        };
      });
      const TkProfitInEach = {};
      ProfitBulksales.forEach((product) => {
        TkProfitInEach[product.Pname] = product.PofitInEach;
      });
      const DayToday = new Date().toISOString().slice(0, 10);

      const calcSql =
        "SELECT ProductName, Amountkg, TotalAMount  FROM bulksales WHERE DATE(Day_sold) = ? ";
      db.query(calcSql, [DayToday], (err2, result2) => {
        if (err2) {
          res.status(500).json({ message: "Failed to Fetch data", err2 });
        }
        const TotalProfit = result2.reduce((acc, item) => {
          const ProductName = item.ProductName;
          const Amountkg = item.Amountkg;
          const TotalAMount = item.TotalAMount;
          const PTtotal = TkProfitInEach[ProductName] || 0;
          return acc + Number(PTtotal * Amountkg);
        }, 0);
        return res.json({
          message: "Successfuly calculate ",
          TotalProfit,
          ProfitBulksales,
        });
      });
    });
  } catch (err) {
    console.error({ message: "Server Error", err });
    return res.status(500).json({ message: "Server Error", err });
  }
});
FetchProduct.get("/getProductSold", (req, res) => {
  try {
    const DayToday = new Date().toISOString().slice(0, 10);
    const PproductSold =
      "SELECT ProductNumber FROM packagesales WHERE DATE(Day_Sold) = ? ";
    db.query(PproductSold, [DayToday], (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Failed to Select that data", err });
      }
      const TotalProductExported = result.reduce((acc, product) => {
        const ProductNumber = product.ProductNumber;

        return acc + Number(ProductNumber);
      }, 0);

      return res
        .status(200)
        .json({ message: "Successfuly Calculated", TotalProductExported });
    });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
});
FetchProduct.get("/Graph", (req, res) => {
  try {
    const DayToday = new Date().toISOString().slice(0, 10);
    const SqlWeekSales = `SELECT ProductName, ProductNumber, sellingPrice 
                          FROM packagesales 
                          WHERE DATE(Day_Sold) BETWEEN DATE_SUB(?, INTERVAL 6 DAY) AND ?`;

    db.query(SqlWeekSales, [DayToday, DayToday], (ERR, result) => {
      if (ERR) {
        console.error("Error querying database:", ERR);
        return res
          .status(500)
          .json({ message: "Failed to select data", error: ERR });
      }

      if (!result || result.length === 0) {
        console.warn("No data found for the given date range.");
        return res
          .status(200)
          .json({ message: "No data available", AmountG: [] });
      }

      const AmountG = result.map((product) => {
        const { ProductName, ProductNumber, sellingPrice } = product;
        const AmountGenerate = Number(sellingPrice) * Number(ProductNumber);
        return { ProductName, AmountGenerate };
      });

      console.log("AmountG data:", AmountG);
      return res.status(200).json({ AmountG });
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ message: "Unexpected Error", error: err });
  }
});

module.exports = FetchProduct;
