function today() {
  const date = new Date()
  return `${date.getDate()}/${
    date.getMonth() < 10 ? "0" : ""
  }${date.getMonth()}/${date.getFullYear().toString().substring(2, 4)}`
}

module.exports = today
