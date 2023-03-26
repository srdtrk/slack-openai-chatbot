# open-ai slack bot (WIP)

This is a simple slack bot that uses the open-ai api to generate text.

## Run the bot locally

This version of the bot is designed to run on aws, but you can run it locally if you want. For this, you need the following things:

- Serverless framework - can be installed globally from npm
- serverless-offline - `serverless plugin install -n serverless-offline`
- ngrok - can be installed from snap

1. To run this bot you need to create a slack app, add the bot user to it, give it correct permissions, and subscribe to the relevant events. You also need to create an open-ai api key.
2. Create a `.env` file in the root of the project from `.env.example` and fill in the relevant values.
3. Export `SLACK_SIGNING_SECRET` and `SLACK_BOT_TOKEN` as environment variables.
4. Follow the steps in the [bolt documentation](https://slack.dev/bolt-js/deployments/aws-lambda).
