/**
 * See ?? 
 * Can't find 'crypto' in npm
 */

var cryptoLib = require("crypto");
var crypto = {};

const bufToStr = (b) => "0x" + b.toString("hex");
const sha256 = (x) => cryptoLib.createHash("sha256").update(x).digest();
const random32 = () => cryptoLib.randomBytes(32);

crypto.newSecretHashPair = () => {
  const secret = random32();
  const hash = sha256(secret);
  return {
    secret: bufToStr(secret),
    hash: bufToStr(hash),
  };
};

module.exports = crypto;
