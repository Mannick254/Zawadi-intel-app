function decrypt(cipher) {
  try {
    const key = getKey();
    return CryptoJS.AES.decrypt(cipher, key).toString(CryptoJS.enc.Utf8);
  } catch {
    return "[Decryption Failed]";
  }
}

function getKey() {
  // Generate a session-based key or obfuscate this logic
  return "ZawadiLegacyKey2025"; // ⚠️ Still exposed unless obfuscated
}
