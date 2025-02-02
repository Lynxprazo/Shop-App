const express = require("express");
const db = require("../DatabaseConnection/db");
const Tracker = express.Router();

Tracker.get("/FirstTrack", (req, res) => {
    try {
        // Query to fetch current stock from the registerproduct table
        const getStocksql = "SELECT Pname, Stock FROM registerproduct";
        db.query(getStocksql, (err, result) => {
            if (err) {
                return res.status(500).json({ message: "Failed to Fetch data", err });
            }
            if (result.length === 0) {
                return res.status(204).json({ message: "No data available" });
            }

            // Map stock information to an object with product names as keys
            const StockList = result.map((items) => {
                const ProductName = items.Pname;
                const Stock = items.Stock;
                return { ProductName, Stock };
            });

            const Stocklist2 = {};
            StockList.forEach((product) => {
                Stocklist2[product.ProductName] = product.Stock;
            });

            // Query to fetch sales data
            const TrackStocksql = "SELECT ProductName, ProductNumber FROM packagesales";
            db.query(TrackStocksql, (err2, result2) => {
                if (err2) {
                    return res.status(500).json({ message: "Failed to fetch sales data", err2 });
                }

                // Sum ProductNumber for each ProductName
                const productSalesMap = {};
                result2.forEach((item) => {
                    const { ProductName, ProductNumber } = item;
                    if (!productSalesMap[ProductName]) {
                        productSalesMap[ProductName] = 0;
                    }
                    productSalesMap[ProductName] += Number(ProductNumber); // Sum ProductNumber for the same product
                });

                // Now calculate the remaining stock for each product
                const StockAvailable = Object.keys(productSalesMap).map((ProductName) => {
                    const ProductNumber = productSalesMap[ProductName];
                    const StockWasAvailable = Stocklist2[ProductName] || 0; // Default to 0 if not found
                    const StockRemain = Number(StockWasAvailable - ProductNumber);

                    return {
                        ProductName,
                        ProductNumber,
                        StockWasAvailable,
                        StockRemain
                    };
                });

                // Return the results
                return res.status(200).json({
                    message: "Successfully returned data",
                    StockAvailable,
                    StockList
                });
            });
        });
    } catch (err) {
        return res.status(500).json({ message: "Server Error", err });
    }
});

module.exports = Tracker;
