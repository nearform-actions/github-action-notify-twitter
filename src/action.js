'use strict'
const core = require('@actions/core')
const { TwitterApi } = require('twitter-api-v2')

export async function run() {
  core.info(`
  *** ACTION RUN - START ***
  `)

  const client = new TwitterApi({
    appKey: core.getInput('twitter-app-key'),
    appSecret: core.getInput('twitter-app-secret'),
    accessToken: core.getInput('twitter-access-token'),
    accessSecret: core.getInput('twitter-access-token-secret')
  })

  const rwClient = client.readWrite

  try {
    const twitterResponse = await rwClient.v2.tweet(core.getInput('message'))
    core.info(`Twitter output: ${twitterResponse}`)
  } catch (err) {
    core.setFailed(`Action failed with error ${err}`)
  } finally {
    core.info(`
    *** ACTION RUN - END ***
    `)
  }
}
