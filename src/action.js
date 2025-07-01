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
  const media = core
    .getInput('media', { required: false })
    .split('\n')
    .map(input => input.trim())
    .filter(Boolean)
  const mediaAltText = core
    .getInput('media-alt-text', {
      required: false,
      trimWhitespace: false
    })
    .split('\n')
    .map(input => input.trim())

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
  const tweetOpts = {}

  try {
    if (media.length) {
      const media_ids = await uploadMedia(rwClient, media, mediaAltText)
      tweetOpts.media = { media_ids }
    }
  } catch (err) {
    core.setFailed(
      `Action failed with error. ${err} ${
        JSON.stringify(err.data) ?? ''
      }`.trim()
    )
    core.info(`
      *** ACTION RUN - END ***
      `)
    return
  }

  try {
    core.info(`Twitter message: ${message}`)
    await rwClient.v2.tweet(message, tweetOpts)
  } catch (err) {
    core.setFailed(
      `Action failed with error. ${err} ${
        JSON.stringify(err.data) ?? ''
      }`.trim()
    )
  } finally {
    core.info(`
      *** ACTION RUN - END ***
      `)
  }
}

export async function uploadMedia(client, media, mediaAltText) {
  core.info(`Twitter upload media: ${media.join('; ')}`)

  const mediaIds = await Promise.all(
    media.map(media => client.v1.uploadMedia(media))
  )
  core.info(`Twitter upload completed - mediaIds: ${mediaIds.join('; ')}`)

  if (mediaAltText?.length) {
    try {
      await Promise.all(
        mediaIds.map((mediaId, index) => {
          core.info(
            `Twitter createMediaMetadata - mediaId: 
            ${mediaId} ; alt-text: ${mediaAltText[index]}`
          )
          if (!mediaAltText?.[index]?.trim()) return Promise.resolve()
          return client.v1.createMediaMetadata(mediaId, {
            alt_text: { text: mediaAltText[index] }
          })
        })
      )
    } catch (err) {
      core.warning(
        `Twitter createMediaMetadata - Failed. ${err} ${
          JSON.stringify(err.data) ?? ''
        }`.trim()
      )
    }
  }
  return mediaIds
}
