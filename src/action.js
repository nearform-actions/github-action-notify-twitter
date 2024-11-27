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

  let tweetOpts = {}

  try {
    const media_ids = await uploadMedia(rwClient, media, mediaAltText)
    if (media_ids?.length) {
      tweetOpts.media = { media_ids }
    }
  } catch (err) {
    core.setFailed(`Action failed with error. ${err} ${err.data ?? ''}`.trim())
    core.info(`
      *** ACTION RUN - END ***
      `)
    return
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

async function uploadMedia(client, media, mediaAltText) {
  if (media?.length) {
    core.info(`Twitter upload media: ${media.join('; ')}`)

    const mediaIds = await Promise.all(
      media.map(media => client.v1.uploadMedia(media))
    )
    core.info(`Twitter upload completed - mediaId: ${mediaIds.join('; ')}`)

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
            err.data ?? ''
          }`.trim()
        )
      }
    }
    return mediaIds
  } else {
    core.info(`Twitter no media to upload`)
    return null
  }
}
