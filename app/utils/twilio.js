require('dotenv').config()
const twilio = require('twilio')

const fromNumber = process.env.TWILIO_FROM_NUMBER
const token = process.env.TWILIO_AUTH_TOKEN
const id = process.env.TWILIO_ACCOUNT_ID
const toNumber = 'whatsapp:+62817774332'

const client = twilio(id, token)

const sendWhatsappNotification = async (pt, prepared_by) => {
  try {
    if (!toNumber) {
      throw new Error('To number is required')
    }

    const message = await client.messages.create({
      contentSid: process.env.TWILLIO_CONTENT_SID,
      messagingServiceSidprocess: process.env.TWILLIO_MESSAGING_SERVICE,
      from: `whatsapp:${fromNumber}`,
      to: toNumber,
      contentVariables: JSON.stringify({ 1: 'SS', 2: pt, 3: prepared_by }),
    })

    console.log('Message sent successfully:', message.sid)
  } catch (error) {
    console.error(
      'Error sending message:',
      error.message,
      error.details || error
    )
  }
}

module.exports = { sendWhatsappNotification }
