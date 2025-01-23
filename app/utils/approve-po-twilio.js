require('dotenv').config()
const twilio = require('twilio')

const fromNumber = process.env.TWILIO_FROM_NUMBER
const token = process.env.TWILIO_AUTH_TOKEN
const id = process.env.TWILIO_ACCOUNT_ID

const client = twilio(id, token)

const approveNotification = async ({ no_po }) => {
  try {

    const message = await client.messages.create({
      contentSid: process.env.TWILLIO_APPROVED_MESSAGE,
      messagingServiceSidprocess: process.env.TWILLIO_MESSAGING_SERVICE,
      from: `whatsapp:${fromNumber}`,
      to: process.env.TWILLIO_PURCHASE_NUMBER,
      contentVariables: JSON.stringify({
        1: no_po,
      }),
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

module.exports = { approveNotification }
