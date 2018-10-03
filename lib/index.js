const mustache = require("mustache");

function reconstruct(parts, count) {
  var mapped = parts.slice(0, count).map(part => {
    if (part[0] === "text") {
      return part[1];
    } else {
      return `{{${part[1]}}}`;
    }
  });

  return mapped.join("");
}

function split(message, values, maxLength, ellipses) {
  const parts = mustache.parse(message).slice();
  const customEllipses = ellipses === undefined ? " ..." : ellipses || "";
  maxLength = maxLength - customEllipses.length;

  // 'parts' is an array of arrays.  Each array specifies 4 items
  // 0: The type, either 'text' for simple text, or 'name' for a token
  // 1: The text value
  // 2: The start index (including the "{{" or "}}") if applicable
  // 3: The end index (including the "{{" or "}}") if applicable

  const strings = [];

  // Iterate through the parts from the end, each time constructing a new
  // string to be processed by mustache.  Once the string is under the maxLength
  // value, store it as a single message, discard the parts that created it and
  // move on
  while (parts.length > 0) {
    for (let i = parts.length; i > 0; i--) {
      const template = reconstruct(parts, i);
      let result = mustache.render(template, values);

      if (result.length <= maxLength) {
        strings.push(result);
        parts.splice(0, i);
        break;
      } else if (parts.length === 1) {
        // We made a best effort to not break a token, but the value of this
        // token is greater than the max length allowed for a string, so we have
        // to break it.
        let resultParts = result.split(" ");

        // Check how much space is left on the most previously stored string.
        // Since we have to break up the token, let's fit some on the previous
        // message to save on overall number of messages
        if (strings.length > 0) {
          let lastString = strings[strings.length - 1];
          let lastStringRoom = maxLength - lastString.length;

          while (resultParts.length > 0) {
            if (lastStringRoom >= resultParts[0].length) {
              lastString = lastString + " " + resultParts.shift();
            } else {
              break;
            }
          }

          const MIN_LAST_ROOM = 0;

          if (lastString === strings[strings.length - 1]) {
            // If nothing changed, the current string may be longer than the
            // entire maxLength, in which case we need to split it anyway, not
            // just on spaces.
            if (lastStringRoom > MIN_LAST_ROOM && result.length > MIN_LAST_ROOM * 2) {
              strings[strings.length - 1] = lastString + result.substring(0, lastStringRoom);
              result = result.substring(lastStringRoom);
              resultParts = result.split(" ");
            }
          } else {
            strings[strings.length - 1] = lastString;
          }
        }

        // In case any one part is longer than maxLength, break it
        for (let i = 0; i < resultParts.length; i++) {
          if (resultParts[i].length > maxLength) {
            const remainder = resultParts[i].substring(maxLength);
            resultParts[i] = resultParts[i].substring(0, maxLength);
            resultParts.splice(i + 1, 0, remainder);
          }
        }

        // If there are space separated strings remaining that have been split
        // from a single item, add them as strings.
        while (resultParts.length > 0) {
          let str = "";

          while (resultParts.length > 0 && str.length + resultParts[0].length <= maxLength) {
            str += " " + resultParts.shift();
          }

          if (str.length > 0) {
            strings.push(str.trim());
          }
          result = result.substring(maxLength);
        }
        parts.splice(0, i);
        break;
      }
    }
  }

  // Cover the edge case where an empty string was passed in
  if (strings.length === 0) {
    strings.push("");
  }

  return strings.map((str, idx) => {
    if (idx < strings.length - 1) {
      return str.trim() + customEllipses;
    }
    return str.trim();
  });
}

module.exports = { split };