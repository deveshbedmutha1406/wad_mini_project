const express = require("express");
const dotenv = require("dotenv");

const app = express();

const connectDB = require("./db/connect");
const tasks = require("./routes/tasks");
require("dotenv").config();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/dailyWage", tasks);

const port = 3000
const start = async() => {
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(port, console.log(`Server is listening on port ${port}`));
    } catch (err) {
        console.log(err);
    }
}

start();
// app.listen(port);
// console.log("started");