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
//     password: 'Tomzriderx02',
//     database: 'db-cursed-two',
//     host: 'localhost',
//     dialect: 'postgres',
//     dialecModule: pg,
//   },
//   test: {
//     username: 'postgres',
//     password: 'Tomzriderx02',
//     database: 'db-cursed-two',
//     host: 'localhost',
//     dialect: 'postgres',
//     dialecModule: pg,
//   },
//   production: {
//     username: 'postgres',
//     password: 'Tomzriderx02',
//     database: 'db-cursed-two',
//     host: 'localhost',
//     dialect: 'postgres',
//     dialecModule: pg,
//   },
// }

module.exports = config
