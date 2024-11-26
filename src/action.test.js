'use strict'
const { getInput, setFailed, info, warning } = require('@actions/core')
const { TwitterApi } = require('twitter-api-v2')
const { run } = require('./action')

const ACTION_INPUTS = {
  message: 'Hello twitter',
  'twitter-app-key': 'app-key',
  'twitter-app-secret': 'app-secret',
  'twitter-access-token': 'access-token',
  'twitter-access-token-secret': 'access-token-secret'
}

jest.mock('@actions/core')
jest.mock('twitter-api-v2')
jest.mock('actions-toolkit')

describe('action', () => {
  beforeEach(() => {
    setFailed.mockImplementation(message => message)
    info.mockImplementation(message => message)
    warning.mockImplementation(message => message)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('tweet was sent successfully', async () => {
    getInput.mockImplementation(inputName => ACTION_INPUTS[inputName] ?? '')
    TwitterApi.mockImplementation(() => {
      return {
        readWrite: {
          v2: {
            tweet: async message => message || null
          }
        }
      }
    })

    await run()

    expect(setFailed).not.toHaveBeenCalled()
  })

  it('sending tweet failed', async () => {
    getInput.mockImplementation(inputName => ACTION_INPUTS[inputName] ?? '')
    TwitterApi.mockImplementation(() => {
      return {
        readWrite: {
          v2: {
            tweet: async () => {
              throw Error('Something went wrong')
            }
          }
        }
      }
    })

    await run()

    expect(setFailed).toHaveBeenCalledWith(
      'Action failed with error. Error: Something went wrong'
    )
  })

  it('fail the action when message is more than 280 characters long', async () => {
    const MESSAGE_TOO_LONG_ACTION_INPUTS = {
      message:
        'Donec quis ipsum a mi tempor venenatis tincidunt feugiat nisi. Donec ac arcu dictum, efficitur nisl vehicula, fringilla sem. Fusce sed interdum sapien, id placerat felis. Sed vel velit urna. Proin pretium mauris at mi fermentum tincidunt. Praesent laoreet mi lectus, nec fringilla velit blandit ut.',
      'twitter-app-key': 'app-key',
      'twitter-app-secret': 'app-secret',
      'twitter-access-token': 'access-token',
      'twitter-access-token-secret': 'access-token-secret'
    }
    getInput.mockImplementation(
      inputName => MESSAGE_TOO_LONG_ACTION_INPUTS[inputName] ?? ''
    )
    TwitterApi.mockImplementation(() => {
      return {
        readWrite: {
          v2: {
            tweet: async message => message || null
          }
        }
      }
    })

    await run()

    expect(setFailed).toHaveBeenCalledWith(
      'The message is too long. The message may contain up to 280 characters.'
    )
  })

  it('tweet with media and alt text was sent successfully', async () => {
    const MEDIA_ACTION_INPUTS = {
      ...ACTION_INPUTS,
      media: `./image.png,
        ./image.png`,
      'media-alt-text': `alt text1
        alt text2`
    }
    getInput.mockImplementation(
      inputName => MEDIA_ACTION_INPUTS[inputName] ?? ''
    )
    TwitterApi.mockImplementation(() => {
      return {
        readWrite: {
          v2: {
            tweet: async message => message || null
          },
          v1: {
            uploadMedia: async () => 'id1',
            createMediaMetadata: async () => null
          }
        }
      }
    })
    await run()

    expect(setFailed).not.toHaveBeenCalled()
  })

  it('tweet with media (without alt text) was sent successfully', async () => {
    const MEDIA_ACTION_INPUTS = {
      ...ACTION_INPUTS,
      media: './image.png'
    }
    getInput.mockImplementation(
      inputName => MEDIA_ACTION_INPUTS[inputName] ?? ''
    )
    TwitterApi.mockImplementation(() => {
      return {
        readWrite: {
          v2: {
            tweet: async message => message || null
          },
          v1: {
            uploadMedia: async () => 'id1',
            createMediaMetadata: async () => null
          }
        }
      }
    })

    await run()

    expect(setFailed).not.toHaveBeenCalled()
  })

  it('tweet with media and error on createMediaMetadata was sent successfully', async () => {
    const MEDIA_ACTION_INPUTS = {
      ...ACTION_INPUTS,
      media: './image.png',
      'media-alt-text': 'alt text'
    }
    getInput.mockImplementation(
      inputName => MEDIA_ACTION_INPUTS[inputName] ?? ''
    )
    TwitterApi.mockImplementation(() => {
      return {
        readWrite: {
          v2: {
            tweet: async message => message || null
          },
          v1: {
            uploadMedia: async () => 'id1',
            createMediaMetadata: async () => {
              throw Error('Something went wrong, upload fail')
            }
          }
        }
      }
    })

    await run()

    expect(setFailed).not.toHaveBeenCalled()
    expect(warning).toHaveBeenCalled()
  })

  it('sending tweet with media failed', async () => {
    const MEDIA_ACTION_INPUTS = {
      ...ACTION_INPUTS,
      media: './image.png',
      'media-alt-text': 'alt text'
    }
    getInput.mockImplementation(
      inputName => MEDIA_ACTION_INPUTS[inputName] ?? ''
    )
    TwitterApi.mockImplementation(() => {
      return {
        readWrite: {
          v2: {
            tweet: async () => {
              throw Error('Something went wrong')
            }
          },
          v1: {
            uploadMedia: async () => {
              throw Error('Something went wrong, upload fail')
            },
            createMediaMetadata: async () => null
          }
        }
      }
    })

    await run()

    expect(setFailed).toHaveBeenCalledWith(
      'Action failed with error. Error: Something went wrong, upload fail'
    )
  })

  it('fail the action when media are more then 4 elements', async () => {
    const MEDIA_ACTION_INPUTS = {
      ...ACTION_INPUTS,
      media: `./image.png,
        ./image.png,
        ./image.png,
        ./image.png,
        ./image.png`
    }
    getInput.mockImplementation(
      inputName => MEDIA_ACTION_INPUTS[inputName] ?? ''
    )
    await run()

    expect(setFailed).toHaveBeenCalledWith(
      'Too many media elements. The maximum number is 4.'
    )
  })

  it('tweet with multiple media and multiple alt text was sent successfully (different number of element)', async () => {
    const MEDIA_ACTION_INPUTS = {
      ...ACTION_INPUTS,
      media: `./image.png,
        ./image.png`,
      'media-alt-text': `alt text`
    }
    getInput.mockImplementation(
      inputName => MEDIA_ACTION_INPUTS[inputName] ?? ''
    )
    TwitterApi.mockImplementation(() => {
      return {
        readWrite: {
          v2: {
            tweet: async message => message || null
          },
          v1: {
            uploadMedia: jest.fn(async () => 'id1'),
            createMediaMetadata: async () => null
          }
        }
      }
    })
    await run()

    expect(setFailed).not.toHaveBeenCalled()
  })
})
