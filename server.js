require("dotenv").config();

const express = require("express");
const app = express();
const port = process.env.PORT;
app.use(express.json());

const { getStreams } = require("./controllers/mcsr");

app.get("/getstreams", getStreams);
app.get("/", (req, res) => { res.status(200).send("Server running!"); });

app.listen(port, () => {
    console.log(`Express server running on port ${port}`)
});