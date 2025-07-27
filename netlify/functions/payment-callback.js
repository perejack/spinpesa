// Netlify function to handle payment callback from PayHero
const { supabase } = require('./supabase');

// Helper: Calculate spins based on amount
function getSpinsForAmount(amount) {
  if (amount === 10) return 1; // TESTING: 10 KSH = 1 spin
  if (amount === 50) return 3;
  if (amount === 100) return 10;
  if (amount === 200) return 25;
  if (amount === 500) return 75;
  if (amount === 1000) return 200;
  return 0;
}

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ status: 'error', message: 'Method not allowed' })
    };
  }
  try {
    const callbackData = JSON.parse(event.body);
    console.log('Payment callback received:', JSON.stringify(callbackData, null, 2));

    const response = callbackData.response || {};

    function formatPhone(phone) {
      let p = (phone || '').trim();
      if (p.startsWith('0') && p.length === 10) return '254' + p.slice(1);
      if (p.startsWith('7') && p.length === 9) return '254' + p;
      if (p.startsWith('+254')) return p.slice(1);
      if (p.startsWith('254') && p.length === 12) return p;
      return p;
    }

    const phone = formatPhone(response.Phone || '');
    const amount = parseInt(response.Amount) || 0;
    const status = response.Status || 'Failed';
    const mpesa_receipt = response.MpesaReceiptNumber || '';
    const checkout_request_id = response.CheckoutRequestID || '';
    const result_code = response.ResultCode || 1;
    const result_desc = response.ResultDesc || '';

    // Store transaction in Supabase
    await supabase.from('transactions').insert([
      {
        phone,
        amount,
        status,
        mpesa_receipt,
        checkout_request_id,
        result_code,
        result_desc
      }
    ]);

    // If payment successful, credit spins
    if (status === 'Success' && result_code === 0) {
      const spins = getSpinsForAmount(amount);
      if (spins > 0 && phone) {
        // Upsert user row if not exists
        await supabase.from('users').upsert([{ phone, spins: 0 }], { onConflict: ['phone'] });
        // Credit spins
        await supabase.rpc('credit_user_spins', { user_phone: phone, spins_to_add: spins });
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'success', message: 'Callback received and processed' })
    };
  } catch (error) {
    console.error('Callback processing error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ status: 'error', message: 'Failed to process callback' })
    };
  }
};

