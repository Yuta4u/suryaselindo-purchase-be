const {
  getStorage,
  ref,
  uploadBytesResumable,
  deleteObject,
} = require("firebase/storage")
const { signInWithEmailAndPassword } = require("firebase/auth")
const { auth } = require("../../config/firebase.config")

/**
 * Upload a file to Firebase Storage.
 * @param {Object} file - The file object to upload.
 * @returns {string} - The uploaded file path.
 * @throws Will throw an error if the upload fails.
 */
async function uploadImageToFirebase(file) {
  if (!file || !file.originalname || !file.mimetype || !file.buffer) {
    throw new Error("Invalid file object provided.")
  }

  try {
    const storage = getStorage()
    const dateTime = Date.now()
    const fileName = `images/${dateTime}-${file.originalname}`
    const storageRef = ref(storage, fileName)
    const metadata = {
      contentType: file.mimetype,
    }

    await uploadBytesResumable(storageRef, file.buffer, metadata)

    return fileName
  } catch (error) {
    console.error("Error uploading file to Firebase:", error)
    throw new Error("Failed to upload file to Firebase.")
  }
}

/**
 * Sign in to Firebase and upload an image.
 * @param {Object} file - The file object to upload.
 * @returns {string} - The formatted file name (Firebase path).
 * @throws Will throw an error if the process fails.
 */
const storeImage = async (file) => {
  try {
    if (!process.env.FIREBASE_USER || !process.env.FIREBASE_AUTH) {
      throw new Error("Firebase credentials are not set.")
    }

    // Sign in to Firebase
    await signInWithEmailAndPassword(
      auth,
      process.env.FIREBASE_USER,
      process.env.FIREBASE_AUTH
    )

    // Upload the image
    const fileName = await uploadImageToFirebase(file)

    // Format the file name for Firebase path
    return fileName.replace("/", "%2F")
  } catch (error) {
    console.error("Error in storeImage:", error)
    throw new Error("Failed to store image.")
  }
}

/**
 * Delete a file from Firebase Storage.
 * @param {string} fileName - The encoded file path in Firebase.
 * @returns {boolean} - `true` if deletion succeeds, `false` otherwise.
 */
const deleteImageFromFirebase = async (fileName) => {
  if (!fileName) {
    console.error("No file name provided for deletion.")
    return false
  }

  try {
    const storage = getStorage()
    const decodedFileName = fileName.replace("%2F", "/")
    const storageRef = ref(storage, decodedFileName)

    // Delete the file
    await deleteObject(storageRef)

    return true
  } catch (error) {
    console.error("Error deleting image from Firebase:", error)
    return false
  }
}

module.exports = { uploadImageToFirebase, storeImage, deleteImageFromFirebase }
