module.exports = function (gameServer, split) {
  if (split[1]) var c = split[1].toLowerCase(); else var c = "";
  if (c == "red") {
    console.log("\x1b[31mText is now Red");
    gameServer.red = true;
  } else if (c == "green") {
    console.log("\x1b[32mText is now Green");
    gameServer.green = true;
  } else if (c == "blue") {
    console.log("\x1b[34mText is now Blue");
    gameServer.blue = true;
  } else if (c == "yellow") {
    console.log("\x1b[33mText is now Yellow");
    gameServer.yellow = true;
  } else if (c == "reset") {
    console.log("\x1b[0mText is now Reset");
    gameServer.red = false;
    gameServer.green = false;
    gameServer.blue = false;
    gameServer.yellow = false;
    gameServer.dim = false;
    gameServer.bold = false;
    gameServer.white = false;
  } else if (c == "bold") {
    console.log("\x1b[1mText is now Bold");
    gameServer.bold = true;
  } else if (c == "white") {
    console.log("\x1b[37mText is now White");
    gameServer.white = true;
  } else if (c == "dim") {
    console.log("\x1b[2mText is now Dim");
    gameServer.dim = true;
  } else if (c == "help") {
    console.log("----- Colortext Help -----");
    console.log("Red");
    console.log("Green");
    console.log("Blue");
    console.log("White");
    console.log("Yellow");
    console.log("Dim");
    console.log("Bold");
    console.log("Reset");
  } else {
    console.log("Please specify a valid style or do Colortext help for a list");
  }
};
