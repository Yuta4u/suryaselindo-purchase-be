require('dotenv').config()
const twilio = require('twilio')

const fromNumber = process.env.TWILIO_FROM_NUMBER
const token = process.env.TWILIO_AUTH_TOKEN
const id = process.env.TWILIO_ACCOUNT_ID
const toNumber = 'whatsapp:+62817774332'

const client = twilio(id, token)

const updatePriceNotification = async ({
  supplier,
  barcode,
  variant,
  name,
  formattedPrice,
}) => {
  try {
    if (!toNumber) {
      throw new Error('To number is required')
    }

    const message = await client.messages.create({
      contentSid: process.env.TWILLIO_PRICE_CHANGE_SID,
      messagingServiceSidprocess: process.env.TWILLIO_MESSAGING_SERVICE,
      from: `whatsapp:${fromNumber}`,
      to: toNumber,
      contentVariables: JSON.stringify({
        1: supplier,
        2: barcode,
        3: variant,
        4: name,
        5: formattedPrice,
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

module.exports = { updatePriceNotification }
