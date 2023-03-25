require("dotenv").config();
const { App } = require("@slack/bolt");
const { WebClient } = require("@slack/web-api");
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const webClient = new WebClient(process.env.SLACK_BOT_TOKEN);

slackApp.event("app_mention", async ({ event, context }) => {
  const prompt = `${event.text}`;

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });

  const reply = completion.data.choices[0].message;

  try {
    await webClient.chat.postMessage({
      channel: event.channel,
      text: reply,
    });
  } catch (error) {
    console.error(error);
  }
});

(async () => {
  await slackApp.start();
  console.log("Bot is running!");
})();
