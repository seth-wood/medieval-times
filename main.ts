import { AtpAgent } from "npm:@atproto/api";
import * as dotenv from "npm:dotenv";
import { CronJob } from "npm:cron";
import { OpenAI } from "npm:openai";
import RSS from "npm:rss-to-json";

dotenv.config();

const rssFeedURL = "https://news.google.com/rss";
const user = Deno.env.get("BLUESKY_USERNAME");
const pass = Deno.env.get("BLUESKY_PASSWORD");
const openaiKey = Deno.env.get("OPENAI_KEY");

const defaultPrompt =
  "You are a medieval town crier. You will take the modern text provided by the input and rewrite it with a max of 280 characters in a medieval tone. Ignore the news source citation on the input. No need to provide an introduction or opening like 'Here ye!' or 'Hark', you can jump right into the news.";

const openai = new OpenAI({ apiKey: openaiKey });
const agent = new AtpAgent({ service: "https://bsky.social" });

const headlines: NewsHeadline[] = [];
const tidings: MedievalTidings[] = [];

let isLoggedIn = false;

interface NewsHeadline {
  title: string;
  link: string;
}

interface MedievalTidings {
  text: string;
  uri: string;
  cid: string;
}

interface BlueskyPost extends Record<string, unknown> {
  $type: string;
  text: string;
  createdAt: string;
  reply?: {
    root: { uri: string; cid: string };
    parent: { uri: string; cid: string };
  };
}

async function loginToBlueSky() {
  if (!isLoggedIn) {
    if (!user || !pass) {
      throw new Error("Missing BlueSky credentials");
    }
    try {
      await agent.login({
        identifier: user,
        password: pass,
      });
      isLoggedIn = true;
    } catch (error) {
      isLoggedIn = false;
      throw new Error(`Bluesky login failed: ${error}`);
    }
  }
}

async function postToBlueSky(
  text: string,
  parentURI?: string,
  parentCID?: string,
  rootURI?: string,
  rootCID?: string
) {
  try {
    await loginToBlueSky();

    //TODO: Refactor this logic to be more readable and consistent with the rest of the code
    const thread: BlueskyPost = {
      $type: "app.bsky.feed.post",
      text,
      createdAt: new Date().toISOString(),
    };

    if (rootURI && rootCID && parentURI && parentCID) {
      thread.reply = {
        root: { uri: rootURI, cid: rootCID },
        parent: { uri: parentURI, cid: parentCID },
      };
    }

    const response = await agent.post(thread);
    return {
      postURI: response.uri,
      postCID: response.cid,
    };
  } catch (error) {
    console.error("Error posting to BlueSky:", error);
    throw error;
  }
}

async function getNewsHeadlines() {
  try {
    const rss = await RSS.parse(rssFeedURL);
    if (rss.items.length >= 3) {
      for (let i = 0; i < 3; i++) {
        headlines.push({ title: rss.items[i].title, link: rss.items[i].link });
      }
    } else {
      console.error("Not enough items in the RSS feed");
    }
  } catch (error) {
    console.error("Error parsing Google RSS:", error);
  }
  console.log(headlines);
}

async function getGPTResponse(text: string, newPrompt?: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: newPrompt || defaultPrompt,
        },
        { role: "user", content: text },
      ],
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    throw error;
  }
}

async function main(): Promise<void> {
  try {
    await getNewsHeadlines();
    const intro = await getGPTResponse(
      "Let the people know you are about to announce the top news of the day."
    );

    // TODO: Add date in medieval format

    if (!intro) throw new Error("Failed to get crier intro from GPT");

    const hearYe = await postToBlueSky(intro);
    tidings.push({
      text: intro,
      uri: hearYe.postURI,
      cid: hearYe.postCID,
    });

    for (let i = 0; i < headlines.length; i++) {
      const rootURI = tidings[0].uri;
      const rootCID = tidings[0].cid;

      const parentURI = i === 0 ? rootURI : tidings[i].uri;
      const parentCID = i === 0 ? rootCID : tidings[i].cid;

      //TODO: Add google news links to the post

      const gptResponse = await getGPTResponse(headlines[i].title);
      if (gptResponse) {
        const bskyPost = await postToBlueSky(
          gptResponse,
          parentURI,
          parentCID,
          tidings[0].uri,
          tidings[0].cid
        );

        tidings.push({
          text: gptResponse,
          uri: bskyPost.postURI,
          cid: bskyPost.postCID,
        });
      }
    }

    headlines.length = 0; // Clear headlines array
    tidings.length = 0; // Clear tidings array
    isLoggedIn = false; // Reset login status
  } catch (error) {
    console.error("Error in main function:", error);
  }
}

// * Run the main function (with promise handling)
main().catch((error) => console.error(error));

// const scheduleExpressionMinute = "* * * * *"; // Run once every minute for testing
const scheduleExpression = "30 12 * * *"; // Run @ 7:30AM (EST) Every Day
const job = new CronJob(scheduleExpression, main); // change to scheduleExpressionMinute for testing
job.start();
