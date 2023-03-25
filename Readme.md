# Test open-ai slack bot

This is a simple slack bot that uses the open-ai api to generate text.

## Run the bot locally

1. To run this bot you need to create a slack app, add the bot user to it, give it correct permissions, and subscribe to the relevant events. You also need to create an open-ai api key.
2. Create a `.env` file in the root of the project from `.env.example` and fill in the relevant values.
3. run `npm install`
4. run `node index.js`
