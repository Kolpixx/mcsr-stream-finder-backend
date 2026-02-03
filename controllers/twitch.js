require("dotenv").config();

const axios = require("axios");

let accessToken;

const getAccessToken = async () => {
    const url = process.env.TWITCH_AUTH_URL;
    const data = `client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`
    
    try {
        const response = await axios.post(url, data, { headers: { "Content-Type": "application/x-www-form-urlencoded" } } );
        accessToken = response.data.access_token;
        console.log("Successfully set new accessToken");
    } catch (error) {
        console.error("Error while trying to get access_token:", error.message);
    }
}

const getMoreInfo = async (ids) => {
    let params = "";
    ids.forEach((id) => {
        params += `user_id=${id}&`
    });

    try {
        const response = await axios.get(
            `${process.env.TWITCH_API_URL}/streams?${params}`,
            {
                headers: {
                    "Client-Id": process.env.TWITCH_CLIENT_ID,
                    "Authorization": `Bearer ${accessToken}`
                }
            }
        );
        if (response.status == 401) {
            getAccessToken();
        }

        const data = response.data.data;
        const users = [];

        data.forEach((user) => {
            const thumbnailURL = user.thumbnail_url.replace("{width}", process.env.WIDTH).replace("{height}", process.env.HEIGHT);

            users[user.user_login] = {
                twitch_name: user.user_login,
                language: user.language || undefined,
                tags: user.tags,
                viewers: user.viewer_count,
                startTimestamp: user.started_at,
                thumbnail_url: thumbnailURL
            }
        });

        return users;
    } catch (error) {
        console.log("Failed at getMoreInfo:", error.message);
    }
}

const getUserInfo = async (names) => {
    let params = "";
    names.forEach((name) => {
        params +=`login=${name}&`;
    });

    try {
        const response = await axios.get(
            `${process.env.TWITCH_API_URL}/users?${params}`,
            {
                headers: {
                    "Client-Id": process.env.TWITCH_CLIENT_ID,
                    "Authorization": `Bearer ${accessToken}`
                }
            }
        );
        if (response.status == 401) {
            getAccessToken();
        }
        
        const data = response.data.data;

        const ids = [];
        data.forEach((user) => {
            ids.push(user.id);
        });

        const extraInfo = await getMoreInfo(ids, accessToken);

        const users = [];

        data.forEach((user) => {
            users[user.login] = {
                display_name: user.display_name,
                twitch_name: user.login,
                viewers: user.view_count,
                viewers: user.view_count,
                pfpURL: user.profile_image_url,
                language: extraInfo[user.login].language,
                tags: extraInfo[user.login].tags,
                viewers: extraInfo[user.login].viewers,
                startTimestamp: extraInfo[user.login].startTimestamp,
                thumbnail_url: extraInfo[user.login].thumbnail_url
            }
        });

        return users;
    } catch (error) {
        console.log("Failed at getUserInfo:", error.message);
    }
}

getAccessToken();

module.exports = { getUserInfo };