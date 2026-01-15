
    const crypto = require("crypto");

    function verifyPassword(password, stored) {
      if (!stored || !stored.includes(":")) return false;
      const [salt, hash] = stored.split(":");
      const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
      return hash === verifyHash;
    }

    const storedPassword = "43c0099eccdc9c6336d4e05e3ad23446:feec1e04b259f71db2a3d6690aa7265a6db51921e19a70847447064d9bb7a2fe759bbb3ac62e5525a742a5532b6ff2ef741d93b9c836d2287fa171b296615d41";

    console.log(verifyPassword('Zawadi@123', storedPassword));
    