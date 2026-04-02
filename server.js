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

const { getMCSRStreams, getStats } = require("./controllers/mcsr");

app.get("/getstreams", getMCSRStreams);
app.get("/getStats", (req, res) => {
    const user = req.query.user;
    if (user) {
        getStats(user, res);
    } else {
        res.status(422).send({"error": "Missing 'user' parameter"});
    }
})
app.get("/", (req, res) => { res.status(200).send("Server running!"); });

app.listen(port, () => {
    console.log(`Express server running on port ${port}`)
});