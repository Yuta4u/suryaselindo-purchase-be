const SuccessHandler = (
  res,
  message = 'success',
  data = null,
  statusCode = 200
) => {
  res.status(statusCode).json({
    code: statusCode,
    success: true,
    message,
    data,
  })
}

module.exports = SuccessHandler
