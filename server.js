require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT;
app.use(express.json());

const allowedHosts = process.env.ALLOWED_HOSTS.split(",");
const corsOptions = {
    origin: [allowedHosts],
    methods: "GET,POST"
}

app.use(cors(corsOptions));

const { getMCSRStreams } = require("./controllers/mcsr");

app.get("/getstreams", getMCSRStreams);
app.get("/", (req, res) => { res.status(200).send("Server running!"); });

app.listen(port, () => {
    console.log(`Express server running on port ${port}`)
});