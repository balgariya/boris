import axios from "axios";
import * as cheerio from "cheerio";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function solveCaptcha(url, siteKey) {
  const apiKey = process.env.CAPTCHA_KEY;

  try {
    const createTaskResponse = await axios.post(
      "https://api.2captcha.com/createTask",
      {
        clientKey: apiKey,
        task: {
          type: "RecaptchaV2TaskProxyless",
          websiteURL: url,
          websiteKey: siteKey,
          isInvisible: false,
        },
      }
    );

    if (
      createTaskResponse.data.errorId !== 0 ||
      !createTaskResponse.data.taskId
    ) {
      console.error("Failed to create captcha task:", createTaskResponse.data);
      return null;
    }

    const taskId = createTaskResponse.data.taskId;

    let attempts = 0;
    const maxAttempts = 25;

    while (attempts < maxAttempts) {
      await sleep(5000);

      const resultResponse = await axios.post(
        "https://api.2captcha.com/getTaskResult",
        {
          clientKey: apiKey,
          taskId,
        }
      );

      const result = resultResponse.data;

      if (
        result.status === "ready" &&
        result.solution &&
        result.solution.gRecaptchaResponse
      ) {
        console.log("CAPTCHA solution received successfully");
        return result.solution.gRecaptchaResponse;
      } else if (result.status === "processing") {
        attempts++;
        continue;
      } else {
        console.error("Captcha solving failed:", result);
        return null;
      }
    }

    console.error("Captcha solving timed out");
    return null;
  } catch (error) {
    console.error("Error solving captcha:", error);
    return null;
  }
}

export async function scrapeBasDictionary(word, progressCallback = null) {
  const url = `https://ibl.bas.bg/rbe/lang/bg/${encodeURIComponent(word)}`;

  try {
    if (progressCallback) {
      await progressCallback(`Connecting to ${url}...`);
    }

    const cookieResponse = await axios.get(url);
    const cookies = cookieResponse.headers["set-cookie"] || [];
    const cookieString = cookies.join("; ");

    const axiosInstance = axios.create({
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        Referer: url,
        Origin: "https://ibl.bas.bg",
        Cookie: cookieString,
      },
    });

    const response = await axiosInstance.get(url);
    const $ = cheerio.load(response.data);

    const notFoundMessage = $("h3").text();
    if (notFoundMessage.includes("не е намерена")) {
      return null;
    }

    const captchaDiv = $(".g-recaptcha");

    if (captchaDiv.length > 0) {
      const siteKey =
        captchaDiv.attr("data-sitekey") ||
        "6Lf_RHsUAAAAAI8mrDSxviI6FrGH3sJTlYxgJ1Ug";

      if (!siteKey) {
        console.error("Cannot find reCAPTCHA site key");
        return { captchaRequired: true, url };
      }

      if (progressCallback) {
        await progressCallback("Solving CAPTCHA...");
      }

      const captchaToken = await solveCaptcha(url, siteKey);

      if (!captchaToken) {
        return { captchaRequired: true, url };
      }


      if (progressCallback) {
        await progressCallback("Submitting CAPTCHA solution...");
      }

      const formAction = $("form").attr("action") || url;
      const formData = new URLSearchParams();
      formData.append("g-recaptcha-response", captchaToken);

      formData.append("word", word);

      $("form input[type='hidden']").each((_, el) => {
        const name = $(el).attr("name");
        const value = $(el).attr("value");
        if (name && value) {
          formData.append(name, value);
        }
      });

      const formResponse = await axiosInstance.post(
        formAction,
        formData.toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Cookie: cookieString,
          },
          maxRedirects: 5,
          validateStatus: (status) => status < 400, 
        }
      );

      console.log(`Form submission status: ${formResponse.status}`);

      if (progressCallback) {
        await progressCallback("Extracting definition data...");
      }

      const formHtml = cheerio.load(formResponse.data);

      if (formHtml(".g-recaptcha").length > 0) {
        console.error("CAPTCHA still present after submission");
        return { captchaRequired: true, url };
      }

      const definitionResult = extractDefinition(formHtml, word, url);
      if (definitionResult) {
        return definitionResult;
      } else {
        console.error("No definition found after CAPTCHA submission");
        return { captchaRequired: true, url };
      }
    }

    if (progressCallback) {
      await progressCallback("Extracting definition data...");
    }

    return extractDefinition($, word, url);
  } catch (error) {
    console.error(
      `Error scraping dictionary for word "${word}":`,
      error.message
    );
    console.error("Full error:", error);
    throw error;
  }
}

function extractDefinition($, word, url) {
  const container = $(".col-md-7.col-md-offset-2");

  if (container.length === 0) {
    console.log("Definition container not found");
    return null;
  }

  const paragraphs = container.find("p");

  if (paragraphs.length === 0) {
    console.log("No paragraphs found in definition container");
    return null;
  }

  let definitionText = "";

  paragraphs.each((_, paragraph) => {
    const $p = $(paragraph).clone();

    $p.find("style").remove();

    const paragraphText = $p.text().trim();
    if (paragraphText) {
      definitionText += paragraphText + "\n\n";
    }
  });

  if (!definitionText.trim()) {
    console.log("Extracted definition is empty");
    return null;
  }

  console.log(`Successfully extracted definition for "${word}"`);
  return {
    word,
    definition: definitionText.trim(),
    url,
  };
}
