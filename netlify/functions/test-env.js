// Test function to check environment variables
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };
  
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  
  try {
    const envCheck = {
      hasUsername: !!process.env.API_USERNAME,
      hasPassword: !!process.env.API_PASSWORD,
      hasChannelId: !!process.env.CHANNEL_ID,
      channelId: process.env.CHANNEL_ID,
      usernameLength: process.env.API_USERNAME ? process.env.API_USERNAME.length : 0,
      passwordLength: process.env.API_PASSWORD ? process.env.API_PASSWORD.length : 0
    };
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Environment check',
        data: envCheck
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Test failed',
        error: error.message
      })
    };
  }
};
