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
  const mediaFilePath = core.getInput('media', { required: false })
  const mediaAltText = core.getInput('media-alt-text', { required: false })

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

  let tweetOpts = {}

  if (mediaFilePath) {
    try {
      core.info(`Twitter upload media: ${mediaFilePath}`)
      const mediaId = await rwClient.v1.uploadMedia(mediaFilePath)
      core.info(
        `Twitter createMediaMetadata - mediaId: ${mediaId}; alt_text: ${
          mediaAltText || ''
        }`
      )
      tweetOpts.media = { media_ids: [mediaId] }

      if (mediaAltText) {
        try {
          await rwClient.v1.createMediaMetadata(mediaId, {
            alt_text: { text: mediaAltText }
          })
        } catch (err) {
          core.warning(`Twitter createMediaMetadata - Failed`)
        }
      }
    } catch (err) {
      core.setFailed(
        `Action failed with error. ${err} ${err.data ?? ''}`.trim()
      )
      core.info(`
        *** ACTION RUN - END ***
        `)
      return
    }
  }

  try {
    core.info(`Twitter message: ${message}`)
    await rwClient.v2.tweet(message, tweetOpts)
  } catch (err) {
    core.setFailed(`Action failed with error. ${err} ${err.data ?? ''}`.trim())
  } finally {
    core.info(`
      *** ACTION RUN - END ***
      `)
  }
}
