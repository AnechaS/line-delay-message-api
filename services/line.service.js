const axios = require('axios');

exports.sendMessage = async function ({ accessToken, data }) {
  const response = await axios.post(
    'https://api.line.me/v2/bot/message/push',
    data,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
};
