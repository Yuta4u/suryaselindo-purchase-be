const express = require('express')
const compression = require('compression')
const serverless = require('serverless-http')
const dotenv = require('dotenv')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const { errorHandler } = require('./app/middleware/errorHandler')
const { logger } = require('./app/utils/logger')
const bodyParser = require('body-parser')

dotenv.config()
const app = express()

// Security middlewares
app.use(helmet())
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.options('*', cors())

// app.use((req, res, next) => {
//   const userAgent = req.headers['user-agent']
//   if (userAgent.includes('Postman')) {
//     return res
//       .status(403)
//       .json({ message: 'Access from Postman is not allowed' })
//   }
//   next()
// })
// app.set("trust proxy", true)

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 350,
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)

// Performance middlewares
app.use(compression())

// Body parsing middlewares
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true, limit: '1mb' }))

// Simple route
app.get('/', (req, res) => {
  res.json({ message: "Surya Selindo API Purchase, let's go!" })
})

// // Route to handle single image upload

require('./app/routes/supplier.v1.routes')(app)
require('./app/routes/product.v1.routes')(app)
require('./app/routes/product-barcode.v1.routes')(app)
require('./app/routes/list-po-item.v1.routes')(app)
require('./app/routes/list-po.v1.routes')(app)
require('./app/routes/user.v1.routes')(app)
require('./app/routes/product-purchase.v1.routes')(app)

// report
require('./app/routes/report.v1.routes')(app)

// additional product
require('./app/routes/product-group.v1.routes')(app)
require('./app/routes/product-type.v1.routes')(app)
require('./app/routes/product-brand.v1.routes')(app)
require('./app/routes/product-variant.v1.routes')(app)
require('./app/routes/product-grade.v1.routes')(app)
require('./app/routes/product-uom.v1.routes')(app)

// Error handling middleware
app.use(errorHandler)

// Start server
const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  logger.info(`Server berjalan pada port ${PORT}.`)
})

module.exports = app
module.exports.handler = serverless(app)
