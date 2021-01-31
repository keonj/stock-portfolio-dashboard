const secretModule = require('./secrets.js');
const apiKey = secretModule.apikey;
const mongoUser = secretModule.mongoUser;
const mongoPw = secretModule.mongoPw;

// fetch data
const fetch = require("node-fetch");
var stockData;
fetch('https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=TSLA&apikey='+apiKey)
    .then(data=>{
        return data.json();
        })
    .then(res=>{
        console.log(res);
        stockData = res;
        }) // res is the JSON response
    .catch(error=>console.log(error))

// async
// setTimeout(() => {  console.log(JSON.stringify(stockData["Time Series (Daily)"])); }, 2000);
// setTimeout(() => {  console.log(JSON.stringify(stockData["Time Series (Daily)"]["2021-01-06"])); }, 2000);
// make the time series format stockData[ticker][day][closing_price]
class StockTimeSeries {
    constructor(ticker, day, closing_price) {
        this.ticker = ticker;
        this.day = day;
        this.closing_price = closing_price;
    }
};

setTimeout(() => {}, 2000);

// mongo import test
const { MongoClient } = require("mongodb");
 
// Replace the following with your Atlas connection string                                                                                                                                        
const url = "mongodb+srv://" + mongoUser + ":" + mongoPw + "@stocktimeseries.jjmnn.mongodb.net/stock_test?retryWrites=true&w=majority&useNewUrlParser=true&useUnifiedTopology=true";
const client = new MongoClient(url);
 
 // The database to use
 const dbName = "stock_test";
                      
 async function run() {
    try {
         await client.connect();
         console.log("Connected correctly to server");
         const db = client.db(dbName);
         // Use the collection "people"
         const col = db.collection("IBM_test");

         // Create stock data object
         for (const day in stockData["Time Series (Daily)"]) {
            // ticker and price trim
            var ticker = JSON.stringify(stockData["Meta Data"]["2. Symbol"]);
            ticker = ticker.substring(1,ticker.length-1);
            var closing_price = JSON.stringify(stockData["Time Series (Daily)"][day]["4. close"]);
            closing_price = closing_price.substring(1,closing_price.length-1);
    
            var stock_time_series = new StockTimeSeries(
                ticker,
                day,
                closing_price
            )

            // insert document and wait for promise
            const p = await col.insertOne(stock_time_series);
            // find document
            const myDoc = await col.findOne();
            // print to the console
            console.log(myDoc);
        }

        } catch (err) {
         console.log(err.stack);
     }
 
     finally {
        await client.close();
    }
}
run().catch(console.dir);