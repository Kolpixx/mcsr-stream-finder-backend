require("dotenv").config();

const axios = require("axios");
const twitch = require("./twitch");

const divisionsMap = {
    "coal": [0, 600],
    "iron": [600, 900],
    "gold": [900, 1200],
    "emerald": [1200, 1500],
    "diamond": [1500, 2000],
    "netherite": [2000, Infinity]
}

const getMCSRStreams = async (req, res) => {
    try {
        const response = await axios.get(process.env.MCSR_API_URL);
        if (response.status == 401) {
            getAccessToken();
        }
        
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
            let playerDivision;

            Object.keys(divisionsMap).forEach((division) => {
                if (player.eloRate > divisionsMap[division][0] && player.eloRate < divisionsMap[division][1]) {
                    playerDivision = division;
                }
            })

            liveMatches.push({
                uuid: uuid,
                nickname: player.nickname,
                elo: player.eloRate,
                division: playerDivision,
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