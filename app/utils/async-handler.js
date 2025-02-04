const db = require('../../models')

/**
 * Middleware untuk menangani async error tanpa transaksi.
 */
const AsyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next)
  } catch (err) {
    const statusCode = err.statusCode || 500
    const message = err.message || 'Internal server error'
    const status = err.status || (statusCode === 404 ? 'failed' : 'error')

    res.status(statusCode).json({
      status,
      message,
    })
  }
}

/**
 * Middleware untuk menangani async error dengan transaksi.
 */
const TransactionHandler = (fn) => async (req, res, next) => {
  const transaction = await db.sequelize.transaction()
  try {
    await fn(req, res, next, transaction)
    await transaction.commit() // ✅ Commit hanya jika tidak ada error
  } catch (err) {
    await transaction.rollback() // 🔴 Pastikan rollback terjadi jika ada error
    const statusCode = err.statusCode || 500
    const message = err.message || 'Internal server error'
    const status = err.status || (statusCode === 404 ? 'failed' : 'error')

    res.status(statusCode).json({
      status,
      message,
    })
  }
}

module.exports = { AsyncHandler, TransactionHandler }
