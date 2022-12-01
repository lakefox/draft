import { JSDOM } from 'jsdom';
import { chunks } from "./utilities/chunk";
import { cache } from "./cache";

/**
 * It fetches the HTML of the DuckDuckGo search page, parses it, and returns the results
 * @param query - The query to search for
 * @returns An array of objects with the following properties:
 *     title: The title of the result
 *     description: The description of the result
 *     url: The url of the result
 */
export async function search(query) {
    const html = await cache(`https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`, "text");
    let doc = new JSDOM(html);
    let document = doc.window.document;
    let sponsored = [...document.querySelectorAll("tr[class='result-sponsored']")].pop();
    let trs = [...document.querySelectorAll("tr")];
    let rawRes = [...chunks(trs.slice(trs.indexOf(sponsored) + 1), 4)]

    let results = [];
    for (let i = 0; i < rawRes.length; i++) {
        const group = rawRes[i];
        if (group.length == 4) {
            results.push({
                title: group[1].querySelector("a").textContent,
                description: group[2].querySelector("td[class='result-snippet']").textContent,
                url: "http://" + group[3].querySelector("span[class='link-text']").textContent
            });
        }
    }
    return results;
}