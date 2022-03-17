# Github Action to send Twitter notifications

[![CI](https://github.com/nearform/github-action-notify-twitter/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/nearform/github-action-notify-twitter/actions/workflows/ci.yml)

GitHub action that can send a custom message to a Twitter account

## Example usage

The example below runs when the release is published and also allows to trigger the action manually.

```yml
name: Notify twitter

on:
  workflow_dispatch:
  release:
    types: [published]

jobs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - uses: nearform/github-action-notify-twitter@master
        with:
          message: |
            ${{ github.event.repository.name }} ${{ github.event.release.tag_name }} has been released. Check out the release notes: ${{ github.event.release.html_url }}
          twitter-app-key: ${{ secrets.TWITTER_APP_KEY }}
          twitter-app-secret: ${{ secrets.TWITTER_APP_SECRET }}
          twitter-access-token: ${{ secrets.TWITTER_ACCESS_TOKEN }}
          twitter-access-token-secret: ${{ secrets.TWITTER_ACCESS_TOKEN_SECRET }}

```

## Usage

Configure this action in your workflows providing the following inputs described below
- you need to specify the message that is going to be sent to Twitter (remember that message is limited to 280 characters!)
- App Key
- App Secret
- Access Token
- Access Token Secret

The Twitter tokens can be obtained from the Twitter Developer Portal under your project.