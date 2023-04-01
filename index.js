const { App, AwsLambdaReceiver } = require("@slack/bolt");
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Initialize your custom receiver
const awsLambdaReceiver = new AwsLambdaReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

// Initializes your app with your app token and signing secret
const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: awsLambdaReceiver,

  // When using the AwsLambdaReceiver, processBeforeResponse can be omitted.
  // If you use other Receivers, such as ExpressReceiver for OAuth flow support
  // then processBeforeResponse: true is required. This option will defer sending back
  // the acknowledgement until after your handler has run to ensure your handler
  // isn't terminated early by responding to the HTTP request that triggered it.
  // processBeforeResponse: true,
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
  let userMessages;
  if (event.thread_ts != null) {
    const threadMessages = await getThreadMessages(
      client,
      event.channel,
      event.thread_ts
    );
    userMessages = threadMessages.map(toOpenAIFormat);
  } else {
    userMessages = [
      {
        role: "user",
        content: `<@${event.user}>: ` + event.text,
      },
    ];
  }

  // Add a system message at the start of the conversation
  userMessages.unshift({
    role: "system",
    content: process.env.GPT_SYSTEM_PROMPT,
  });

  // console.log(userMessages);

  const completion = await openai.createChatCompletion({
    model: "gpt-4",
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

// Listen for the message.im event to handle direct messages
slackApp.event("message", async ({ event, client, logger }) => {
  if (event.channel_type != "im") {
    return;
  } else if (event.bot_id == process.env.SLACK_BOT_ID) {
    return;
  } else if (event.subtype == "message_deleted") {
    return;
  }
  // Get the conversation history (last 50 messages)
  let userMessages;
  if (event.thread_ts != null) {
    const threadMessages = await getThreadMessages(
      client,
      event.channel,
      event.thread_ts
    );
    userMessages = threadMessages.map(toOpenAIFormat);
  } else {
    userMessages = [
      {
        role: "user",
        content: `<@${event.user}>: ` + event.text,
      },
    ];
  }
  // Add a system message at the start of the conversation
  userMessages.unshift({
    role: "system",
    content: process.env.GPT_SYSTEM_PROMPT,
  });
  // // I insert system prompt again if the conversation is too long
  // if (userMessages.length > 20) {
  //   // inserted at index 14
  //   let index = userMessages.length - 14;
  //   userMessages.splice(index, 0, {
  //     role: "system",
  //     content: process.env.GPT_SYSTEM_PROMPT,
  //   });
  // }

  // console.log(userMessages);

  // get the reply from OpenAI
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: userMessages,
  });
  const reply = completion.data.choices[0].message.content;
  // Send the reply
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

// Handle the Lambda function event
module.exports.handler = async (event, context, callback) => {
  // This to prevent retries from Slack
  if (event.headers["X-Slack-Retry-Num"]) {
    return { statusCode: 200, body: "ok" };
  }

  const handler = await awsLambdaReceiver.start();
  return handler(event, context, callback);
};

// Helper functions

const toOpenAIFormat = (message) => {
  if (message.bot_id == process.env.SLACK_BOT_ID) {
    return {
      role: "assistant",
      content: message.text,
    };
  } else {
    return {
      role: "user",
      content: `<@${message.user}>: ` + message.text,
    };
  }
};
