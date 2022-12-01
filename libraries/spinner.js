const synonyms = require("synonyms");

const WordPOS = require('wordpos'),
    wordpos = new WordPOS();

export async function spin(text, rate) {
    text = text.split(" ");
    for (var i = 0; i < text.length; i++) {
        let word = text[i].replace(/[^a-zA-Z ]/g, "");

        let others = synonyms(word, await POS(word)) || [word];

        let new_word = others[~~(Math.random() * others.length)] || word;
        if (Math.random() > rate) {
            new_word = word;
        }
        text[i] = text[i].replace(word, new_word);
    }
    return text.join(" ");
}

async function isNoun(word) {
    let promise = new Promise((resolve, reject) => {
        wordpos.isNoun(word, (r) => { resolve(r) });
    });
    let result = await promise;

    return result;
}
async function isVerb(word) {
    let promise = new Promise((resolve, reject) => {
        wordpos.isVerb(word, (r) => { resolve(r) });
    });
    let result = await promise;

    return result;
}
async function isAdjective(word) {
    let promise = new Promise((resolve, reject) => {
        wordpos.isAdjective(word, (r) => { resolve(r) });
    });
    let result = await promise;

    return result;
}
async function isAdverb(word) {
    let promise = new Promise((resolve, reject) => {
        wordpos.isAdverb(word, (r) => { resolve(r) });
    });
    let result = await promise;

    return result;
}

async function POS(word) {
    if (await isAdverb(word)) {
        return "r";
    } else
        if (await isAdjective(word)) {
            return "s";
        } else
            if (await isNoun(word)) {
                return "n";
            } else
                if (await isVerb(word)) {
                    return "v";
                }
}