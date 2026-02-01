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
        params += `broadcaster_id=${id}&`
    });

    try {
        const response = await axios.get(
            `${process.env.TWITCH_API_URL}/channels?${params}`,
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
            users[user.broadcaster_login] = {
                language: user.broadcaster_language,
                tags: user.tags
            }
        });

        return users;
    } catch (error) {
        console.log(error.message);
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
                viewers: user.view_count,
                viewers: user.view_count,
                pfpURL: user.profile_image_url,
                language: extraInfo[user.login].broadcaster_language,
                tags: extraInfo[user.login].tags
            }
        });

        return users;
    } catch (error) {
        console.log(error.message);
    }
}

getAccessToken();

module.exports = { getUserInfo };