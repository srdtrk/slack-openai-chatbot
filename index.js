require("dotenv").config();
const { App } = require("@slack/bolt");
const { WebClient } = require("@slack/web-api");
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Initializes your app in socket mode with your app token and signing secret
const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true, // add this
  appToken: process.env.SLACK_APP_TOKEN, // add this
});

async function getThreadMessages(client, channel, ts) {
  try {
    const result = await client.conversations.replies({
      token: process.env.SLACK_BOT_TOKEN,
      channel: channel,
      ts: ts,
    });

    return result.messages || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

slackApp.event("app_mention", async ({ event, client, logger }) => {
  const threadMessages = await getThreadMessages(
    client,
    event.channel,
    event.thread_ts
  );
  //console.log(threadMessages);
  const userMessages = threadMessages.map((message) => {
    if (message.bot_id != null) {
      return {
        role: "assistant",
        content: message.text,
      };
    } else {
      return {
        role: "user",
        content: `${message.user}: ` + message.text,
      };
    }
  });

  // Add a system message at the start of the conversation
  userMessages.unshift({
    role: "system",
    content: "Your custom system message here.",
  });

  // console.log(userMessages);

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: userMessages,
  });

  const reply = completion.data.choices[0].message.content;

  try {
    await client.chat.postMessage({
      channel: event.channel,
      text: reply,
      thread_ts: event.ts, // Add this line to reply in the same thread
    });
  } catch (error) {
    console.error(error);
  }
});

(async () => {
  // Start your app
  await slackApp.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
})();
