const pg = require('pg')

const config = {
  development: {
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    host: process.env.HOST,
    dialect: 'postgres',
    dialecModule: pg,
  },
  test: {
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    host: process.env.HOST,
    dialect: 'postgres',
    dialecModule: pg,
  },
  production: {
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    host: process.env.HOST,
    dialect: 'postgres',
    dialecModule: pg,
  },
}

// DEVELOPMENT
// const config = {
//   development: {
//     username: 'postgres',
//     password: 'p@ssw0rd',
//     database: 'cursed-db-two',
//     host: '192.168.60.240',
//     dialect: 'postgres',
//     dialecModule: pg,
//   },
//   test: {
//     username: 'postgres',
//     password: 'p@ssw0rd',
//     database: 'cursed-db-two',
//     host: '192.168.60.240',
//     dialect: 'postgres',
//     dialecModule: pg,
//   },
//   production: {
//     username: 'postgres',
//     password: 'p@ssw0rd',
//     database: 'cursed-db-two',
//     host: '192.168.60.240',
//     dialect: 'postgres',
//     dialecModule: pg,
//   },
// }

module.exports = config
