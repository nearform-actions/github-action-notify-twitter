'use strict'
const core = require('@actions/core')
const { TwitterApi } = require('twitter-api-v2')

export async function run() {
  core.info(`
  *** ACTION RUN - START ***
  `)
  const MAX_MESSAGE_LENGTH = 280
  const message = core.getInput('message')
  const appKey = core.getInput('twitter-app-key')
  const appSecret = core.getInput('twitter-app-secret')
  const accessToken = core.getInput('twitter-access-token')
  const accessSecret = core.getInput('twitter-access-token-secret')

  if (!message || !appKey || !appSecret || !accessToken || !accessSecret) {
    core.setFailed(
      'Missing inputs parameters. Please provide all of the following inputs: "message", "twitter-app-key", "twitter-app-secret", "twitter-access-token", and "twitter-access-token-secret"'
    )
    core.info(`
    *** ACTION RUN - END ***
    `)
    return
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    core.setFailed(
      'The message is too long. The message may contain up to 280 characters.'
    )
    core.info(`
    *** ACTION RUN - END ***
    `)
    return
  }

  const client = new TwitterApi({
    appKey,
    appSecret,
    accessToken,
    accessSecret
  })

  const rwClient = client.readWrite

  try {
    core.info(`Twitter message: ${message}`)
    await rwClient.v2.tweet(message)
  } catch (err) {
    core.setFailed(`Action failed with error. ${err}`)
  } finally {
    core.info(`
      *** ACTION RUN - END ***
      `)
  }
}
