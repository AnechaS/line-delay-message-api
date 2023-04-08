# LINE delay message API

The Line Delayed Message API allows you to send a message to a Line user at a specific time in the future, with the ability to specify a delay time and units of time

## APIs

### Send Delay Message

```bash
curl --location "https://line-delay-message-api.glitch.me/v1/send" \
--header "X-Line-Access-Token: ${CHANNEL_ACCESS_TOKEN}" \
--header "Content-Type: application/json" \
--data '{
    "to": "U4af4980629...",
    "messages": [
        {
            "type": "text",
            "text": "OK"
        }
    ],
    "delay": "5m"
}'
```

Time delay units (s = seconds, m = minutes, h = hours, [etc.](https://www.npmjs.com/package/ms))

### Cancel

```bash
curl --location "https://line-delay-message-api.glitch.me/v1/cancel" \
--header "Content-Type: application/json" \
--data '{
    "messageId": "message id to cancel the sending of messages"
}'
```

## Development

### Installation

```bash
$ npm install
```

### Run

```bash
$ npm start
```

### Testing

```bash
$ npm test
```
