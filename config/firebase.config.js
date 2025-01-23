const { initializeApp } = require("firebase/app")
const { getAuth } = require("firebase/auth")

const firebaseConfig = {
  apiKey: "AIzaSyBwb2P7NJOibedoDitFUlrTqRCGUAyFjSU",
  authDomain: "fir-upload-b7a9b.firebaseapp.com",
  projectId: "fir-upload-b7a9b",
  storageBucket: "fir-upload-b7a9b.appspot.com",
  messagingSenderId: "543292830498",
  appId: "1:543292830498:web:d45914653fe750922b6b7b",
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

module.exports = {
  auth,
}
