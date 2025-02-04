const { logger } = require('../utils/logger')

const errorHandler = (err, req, res, next) => {
  // Log error dengan lebih detail (termasuk stack trace jika ada)
  logger.error(err.stack)

  // Tentukan status code dari error, jika tidak ada gunakan default 500
  const statusCode = err.statusCode || 500
  const status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'

  // Kirimkan respons dengan status dan pesan yang sesuai
  res.status(statusCode).send({
    status: status,
    message: err.message || 'Terjadi kesalahan internal server!',
    // Stack trace hanya dikirim di lingkungan pengembangan
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  })
}

module.exports = { errorHandler }
