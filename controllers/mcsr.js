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
        const streamers = [];
        const twitchUsernames = [];

        apiLiveMatches.forEach(match => {
            Object.keys(match.data).forEach((uuid) => {
                if (match.data[uuid].liveUrl !== null) {
                    const mcsrDataObject = match.players.find(user => user.uuid === uuid);

                    streamers.push({
                        uuid: uuid,
                        twitchUrl: match.data[uuid].liveUrl,
                        twitchName: match.data[uuid].liveUrl.replace("https://twitch.tv/", ""),
                        nickname: mcsrDataObject.nickname,
                        roleType: mcsrDataObject.roleType,
                        eloRate: mcsrDataObject.eloRate,
                        eloRank: mcsrDataObject.eloRank
                    });

                    twitchUsernames.push(match.data[uuid].liveUrl.replace("https://twitch.tv/", ""));
                }
            });
        });

        const twitchStats = await twitch.getUserInfo(twitchUsernames);

        streamers.forEach((streamer) => {
            let playerDivision;

            Object.keys(divisionsMap).forEach((division) => {
                if (streamer.eloRate > divisionsMap[division][0] && streamer.eloRate < divisionsMap[division][1]) {
                    playerDivision = division;
                }
            })

            if (twitchStats[streamer.twitchName] !== undefined) {
                liveMatches.push({
                    uuid: streamer.uuid,
                    nickname: streamer.nickname,
                    elo: streamer.eloRate,
                    division: playerDivision,
                    contry: streamer.country,
                    url: streamer.twichUrl,
                    twitch: twitchStats[streamer.twitchName]
                });
            }
        });
        res.status(200).send(liveMatches);
    } catch (error) {
        console.error({ message: "Error retrieving streams", error: error });
        res.status(500).json({ message: "Error retrieving streams", error: error.message })
    }
}

module.exports = { getMCSRStreams };