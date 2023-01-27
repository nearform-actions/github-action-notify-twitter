'use strict'
const core = require('@actions/core')
const { TwitterApi } = require('twitter-api-v2')
const toolkit = require('actions-toolkit')

export async function run() {
  toolkit.logActionRefWarning()
  toolkit.logRepoWarning()

  core.info(`
  *** ACTION RUN - START ***
  `)
  const MAX_MESSAGE_LENGTH = 280
  const message = core.getInput('message', { required: true })
  const appKey = core.getInput('twitter-app-key', { required: true })
  const appSecret = core.getInput('twitter-app-secret', { required: true })
  const accessToken = core.getInput('twitter-access-token', { required: true })
  const accessSecret = core.getInput('twitter-access-token-secret', {
    required: true
  })

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
