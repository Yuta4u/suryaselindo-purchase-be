const { ErrorAppHandler } = require('./error-handler')

//
const findOrCreateEntry = async (model, value, transaction) => {
  if (!value) {
    throw ErrorAppHandler(`Missing value for ${model.name}`, 400)
  }

  if (value.includes('|')) {
    const [entry_id, entry_name] = value.split('|')
    return {
      id: entry_id,
      name: entry_name,
    }
  }

  const [entry] = await model.findOrCreate({
    where: { name: value },
    defaults: { name: value },
    transaction,
  })

  return {
    id: entry.id,
    name: entry.name,
  }
}

module.exports = { findOrCreateEntry }
