module.exports = function (data, char, fieldLength, rTL) {
  var result = data.toString();
  if (rTL === true) {
    for (var i = result.length; i < fieldLength; i++)
      result = char.concat(result);
  } else {
    for (var i = result.length; i < fieldLength; i++)
      result = result.concat(char);
  }
  return result;
};
