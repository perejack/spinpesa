// Netlify function to initiate payment
const axios = require('axios');

// PayHero API credentials from environment variables
const API_USERNAME = process.env.API_USERNAME;
const API_PASSWORD = process.env.API_PASSWORD;
const CHANNEL_ID = process.env.CHANNEL_ID;
const BANK_SHORT_CODE = 714777;
const BANK_ACCOUNT_NUMBER = 440200149026;
const BANK_DESCRIPTION = "bank payment";

// Generate Basic Auth Token
const generateBasicAuthToken = () => {
  const credentials = `${API_USERNAME}:${API_PASSWORD}`;
  return 'Basic ' + Buffer.from(credentials).toString('base64');
};

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
  
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }
  
  // Process POST request
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }
  
  try {
    // Debug: Log environment variables (without exposing sensitive data)
    console.log('Environment check:', {
      hasUsername: !!API_USERNAME,
      hasPassword: !!API_PASSWORD,
      hasChannelId: !!CHANNEL_ID,
      channelId: CHANNEL_ID
    });
    
    // Validate environment variables
    if (!API_USERNAME || !API_PASSWORD || !CHANNEL_ID) {
      console.error('Missing environment variables:', {
        API_USERNAME: !!API_USERNAME,
        API_PASSWORD: !!API_PASSWORD,
        CHANNEL_ID: !!CHANNEL_ID
      });
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          success: false, 
          message: 'Server configuration error: Missing API credentials' 
        })
      };
    }
    const requestBody = JSON.parse(event.body);
    const { phoneNumber, userId, amount = 190, description = 'SpinWin Account Top Up' } = requestBody;
    
    if (!phoneNumber) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, message: 'Phone number is required' })
      };
    }
    
    // Generate a unique reference for this payment
    const externalReference = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Define the callback URL - use Netlify function URL
    const callbackUrl = `${process.env.URL || 'https://your-netlify-site.netlify.app'}/.netlify/functions/payment-callback`;
    
    const payload = {
      amount: amount,
      phone_number: phoneNumber,
      channel_type: "bank",
      channel_id: CHANNEL_ID,
      short_code: BANK_SHORT_CODE,
      account_number: BANK_ACCOUNT_NUMBER,
      description: BANK_DESCRIPTION,
      provider: "m-pesa",
      network_code: "63902",
      external_reference: externalReference,
      callback_url: callbackUrl
    };
    
    // Debug: Log payload (without sensitive data)
    console.log('Payment payload:', {
      amount,
      phoneNumber,
      externalReference,
      channelId: CHANNEL_ID
    });
    
    const response = await axios({
      method: 'post',
      url: 'https://backend.payhero.co.ke/api/v2/payments',
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': generateBasicAuthToken()
      }
    });
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Payment initiated successfully',
        data: {
          externalReference,
          checkoutRequestId: response.data.CheckoutRequestID
        }
      })
    };
  } catch (error) {
    console.error('Payment initiation error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText
    });
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Failed to initiate payment',
        error: error.response?.data || error.message,
        details: error.response?.status ? `HTTP ${error.response.status}: ${error.response.statusText}` : 'Network error'
      })
    };
  }
};
