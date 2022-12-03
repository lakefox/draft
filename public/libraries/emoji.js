
function emojify(text) {
    return text
        .split(/\n/g)
        .map((line) => emojifyLine(line))
        .join("\n");
}

// 1 to 1 translation of emojifier.EDB.emojify
function emojifyLine(text, len_probabilities = [1, 1, 1, 1, 2, 2]) {
    let emojified = "";
    let prob = 3;
    for (let word of text.split(/ /g)) {
        if (edb[stripWord(word)]) {
            let emoji_string = "";
            for (let i = 0; i < sample(len_probabilities); i++) {
                emoji_string += sample(edb[stripWord(word)]);
            }
            if (parseInt(Math.random() * prob) == 1) {
                emojified += word + emoji_string + " ";
            } else {
                emojified += word + " ";
            }
        } else {
            emojified += word + " ";
        }
    }

    return emojified;
}

function stripWord(word) {
    let validChars =
        "abcdefghijklmnopqrstuvwxyz1234567890_-ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return word
        .split("")
        .filter((c) => validChars.includes(c))
        .join("")
        .toLowerCase();
}

function sample(arr) {
    return arr[~~(Math.random() * arr.length)];
}