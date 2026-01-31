require("dotenv").config();

const axios = require("axios");

const getStreams = async (req, res) => {
    try {
        axios.get(process.env.MCSR_API_URL)
            .then(response => {
                const data = response.data;
                const apiLiveMatches = data.data.liveMatches;
                const liveMatches = [];

                apiLiveMatches.forEach(element => {
                    const player = element.players[0];
                    const uuid = player.uuid;
                    const twitchUsername = element.data[uuid].liveUrl.replace("https://twitch.tv/", "");

                    liveMatches.push({
                        uuid: uuid,
                        nickname: player.nickname,
                        elo: player.eloRate,
                        contry: player.country,
                        url: element.data[uuid].liveUrl
                    });
                });

                res.status(200).send(liveMatches);
            })
            .catch(error => {
                res.status(500).json({ message: "Error retrieving streams", error: error.message })
            })
    } catch (error) {
        res.status(500).json({ message: "Error retrieving streams", error: error.message })
    }
}

module.exports = { getStreams };