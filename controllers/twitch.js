require("dotenv").config();

const axios = require("axios");

const getAccessToken = async (req, res) => {
    try {
        const url = process.env.TWITCH_AUTH_URL;
        const data = `client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`
        console.log(url, data);
        
        await axios.post(
            url,
            data,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        )
            .then(response => {
                res.status(200).json(response.data)
            })
            .catch((error) => {
                res.status(500).json({ message: "Error retrieving Access Token", error: error.message })
            })
    } catch (error) {
        res.status(500).json({ message: "Error retrieving Access Token", error: error.message })
    }
}

module.exports = { getAccessToken }