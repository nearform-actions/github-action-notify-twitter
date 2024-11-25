# Github Action to send Twitter notifications

[![CI](https://github.com/nearform-actions/github-action-notify-twitter/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/nearform-actions/github-action-notify-twitter/actions/workflows/ci.yml)

GitHub action that can send a custom message to a Twitter account.

## Usage

Configure this action in your workflows providing the following inputs described below. The Twitter tokens can be obtained from the Twitter Developer Portal under your project.

## Inputs

| input                         | required | description |
|-------------------------------|----------|-------------|
| `message`                     | yes      | Message to post to Twitter. |
| `twitter-app-key`             | yes      | Consumer API key, available in the "Keys and tokens" section of your application in the Twitter Developer site. |
| `twitter-app-secret`          | yes      | Consumer API secret key, available in the "Keys and tokens" section of your application in the Twitter Developer site. |
| `twitter-access-token`        | yes      | Application access token, available in the "Keys and tokens" section of your application in the Twitter Developer site. |
| `twitter-access-token-secret` | yes      | Application access token secret, available in the "Keys and tokens" section of your application in the Twitter Developer site. |
| `media` | no      | A list of paths for media objects (image, video or animated GIF) to use in the post|
| `media-alt-text` | no      | A list of image alternative text (alt text) that describe the meaning and the context of the image  |


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
      - uses: nearform-actions/github-action-notify-twitter@master
        with:
          message: |
            ${{ github.event.repository.name }} ${{ github.event.release.tag_name }} has been released. Check out the release notes: ${{ github.event.release.html_url }}
          twitter-app-key: ${{ secrets.TWITTER_APP_KEY }}
          twitter-app-secret: ${{ secrets.TWITTER_APP_SECRET }}
          twitter-access-token: ${{ secrets.TWITTER_ACCESS_TOKEN }}
          twitter-access-token-secret: ${{ secrets.TWITTER_ACCESS_TOKEN_SECRET }}

```

You can add media (image, GIF or video) to your post using the `media` parameter. This refers to the path of an image within the repository.
The maximum number of media that can be added to a post is 4.
For images and GIFs, you can also add an alt text using the `media-alt-text` parameter. This parameter is also a list and maintains the structure of the `media` parameter. So if you want to add an alt text only to the second content you have to write it in the second position of the list leaving the previous ones empty.

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
      - uses: nearform-actions/github-action-notify-twitter@master
        with:
          message: |
            ${{ github.event.repository.name }} ${{ github.event.release.tag_name }} has been released. Check out the release notes: ${{ github.event.release.html_url }}
          twitter-app-key: ${{ secrets.TWITTER_APP_KEY }}
          twitter-app-secret: ${{ secrets.TWITTER_APP_SECRET }}
          twitter-access-token: ${{ secrets.TWITTER_ACCESS_TOKEN }}
          twitter-access-token-secret: ${{ secrets.TWITTER_ACCESS_TOKEN_SECRET }}
          media: |
            ./video.mp4
            ./twitter-x.png
            ./twitter-x.png
          media-alt-text: |
            
            alt icon 1
            alt icon 2
```


