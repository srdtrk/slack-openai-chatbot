# open-ai slack bot

This is a simple slack bot that uses the open-ai api to generate ChatGPT like responses. This bot is very simple, and currently only responds to the public messages that is is tagged in. It will always respond in the same thread as the message it was tagged in, and it will read all the previous messages in the said thread when writing its answer.

## Run the bot locally

1. To run this bot you need to create a slack app, add the bot user to it, give it correct permissions, and subscribe to the relevant events. You also need to create an open-ai api key.
2. Create a `.env` file in the root of the project from `.env.example` and fill in the relevant values.
3. run `npm install`
4. run `node index.js`

## Other branches

This repo also contains other branches that are used to run this bot on different platforms. The `aws-lambda` branch is used to run the bot on aws as a lambda function.
