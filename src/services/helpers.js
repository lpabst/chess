function randomString(length = 8) {
  let characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  let str = "";
  while (str.length < length) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    const randomCharacter = characters[randomIndex];
    str += randomCharacter;
  }

  return str;
}

function copyJsObj(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function opponentsTurn(whoseTurn) {
  return whoseTurn === "w" ? "b" : "w";
}

export { randomString, copyJsObj, opponentsTurn };
