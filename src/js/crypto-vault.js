// Note: Ensure CryptoJS library is included in your HTML

function getVaultKey() {
  return "2025Zawadi"; // Unified encryption key
}

function encrypt(text) {
  return CryptoJS.AES.encrypt(text, getVaultKey()).toString();
}

function decrypt(cipher) {
  try {
    return CryptoJS.AES.decrypt(cipher, getVaultKey()).toString(CryptoJS.enc.Utf8);
  } catch {
    return "[Decryption Failed]";
  }
}