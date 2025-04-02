import axios from "axios";
import * as cheerio from "cheerio";

export async function scrapeBgJargon(word) {
  try {
    const response = await axios.get(
      `https://www.bgjargon.com/word/meaning/${encodeURIComponent(word)}`
    );
    const $ = cheerio.load(response.data);


    const noWordElement = $(".no_word");
    if (noWordElement.length > 0) {
      return null;
    }

    const definitions = [];
    $("article").each((i, articleEl) => {
      const meaning = $(articleEl).find(".meaning p").text().trim();
      const example = $(articleEl).find(".example p").text().trim();
      const votesYes = $(articleEl).find(".vote_yes").text().trim();
      const votesNo = $(articleEl).find(".vote_no").text().trim();

      if (meaning) {
        definitions.push({
          meaning,
          example: example || null,
          votesYes: votesYes || "0",
          votesNo: votesNo || "0",
        });
      }
    });

    if (definitions.length === 0) {
      return null;
    }

    return {
      word: $("article h2").first().text().trim(),
      definitions: definitions,
    };
  } catch (error) {
    console.error("Error scraping BGJargon:", error);
    return null;
  }
}
