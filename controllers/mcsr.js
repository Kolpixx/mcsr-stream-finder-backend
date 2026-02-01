require("dotenv").config();

const axios = require("axios");
const twitch = require("./twitch");

const getMCSRStreams = async (req, res) => {
    try {
        const response = await axios.get(process.env.MCSR_API_URL);
        const data = response.data;
        const apiLiveMatches = data.data.liveMatches;
        const liveMatches = [];
        const twitchUsernames = [];

        apiLiveMatches.forEach(element => {
            const player = element.players[0];
            const uuid = player.uuid;
            twitchUsernames.push(element.data[uuid].liveUrl.replace("https://twitch.tv/", ""));
        });

        const twitchStats = await twitch.getUserInfo(twitchUsernames);

        apiLiveMatches.forEach((element, index) => {
            const player = element.players[0];
            const uuid = player.uuid;
            const twitchURL = element.data[uuid].liveUrl;

            liveMatches.push({
                uuid: uuid,
                nickname: player.nickname,
                elo: player.eloRate,
                contry: player.country,
                url: twitchURL,
                twitch: twitchStats[twitchURL.replace("https://twitch.tv/", "")]
            });
        });
        res.status(200).send(liveMatches);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving streams", error: error.message })
    }
}

module.exports = { getMCSRStreams };