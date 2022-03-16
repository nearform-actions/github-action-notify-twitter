'use strict'
const core = require('@actions/core')
const { TwitterApi } = require('twitter-api-v2')
const { run } = require('./action')

const ACTION_INPUTS = {
  message: 'Hello twitter',
  'twitter-app-key': 'app-key',
  'twitter-app-secret': 'app-secret',
  'twitter-access-token': 'access-token',
  'twitter-access-token-secret': 'access-token-secret'
}

jest.mock('@actions/core', () => ({
  getInput: jest.fn().mockImplementation(inputName => ACTION_INPUTS[inputName]),
  setFailed: jest.fn().mockImplementation(message => {
    console.log(message)
  }),
  info: jest.fn().mockImplementation(message => {
    console.log(message)
  })
}))
jest.mock('twitter-api-v2')

describe('action', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('tweet was sent successfully', async () => {
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

    expect(core.setFailed).not.toHaveBeenCalled()
  })

  it('sending tweet failed', async () => {
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

    expect(core.setFailed).toHaveBeenCalledWith(
      'Action failed with error. Error: Something went wrong'
    )
  })
})
