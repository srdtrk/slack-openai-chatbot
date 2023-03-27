// Depreciated function
// Fetch conversation history using the ID and a TS from the last example
async function getImMessages(client, channel, ts, limit) {
  try {
    // Call the conversations.history method using the built-in WebClient
    const result = await client.conversations.history({
      // The token you used to initialize your app
      token: process.env.SLACK_BOT_TOKEN,
      channel,
      // In a more realistic app, you may store ts data in a db
      latest: ts,
      // Limit results
      inclusive: true,
      limit,
    });

    // There should only be one result (stored in the zeroth index)
    return result.messages || [];
  } catch (error) {
    console.error(error);
  }
}
