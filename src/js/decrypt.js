// Unified decryption logic for all app pages
function decrypt(cipher) {
  try {
    return CryptoJS.AES.decrypt(cipher, "2025Zawadi").toString(CryptoJS.enc.Utf8);
  } catch {
    return "[Decryption Failed]";
  }
}
