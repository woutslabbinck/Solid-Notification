# Solid Notifications
[![npm](https://img.shields.io/npm/v/solid-notification-client)](https://www.npmjs.com/package/solid-notification-client)

This library implements subscribing to a Notication Channel following the [Solid Notifications Protocol](https://solidproject.org/TR/notifications-protocol).

## Installing

```sh
npm i solid-notification-client
```

## Using the client

First identify a resource you are interested in, i.e. the **topic**.
Next, identify the [features](https://solidproject.org/TR/notifications-protocol#notification-channel) which you want to be present in the notification channel.

Then you can use the following example code to set up the channel.
In this code, a subscription is made for a [WebSocketChannel2023](http://www.w3.org/ns/solid/notifications#WebSocketChannel2023).

```javascript
import { Session } from '@rubensworks/solid-client-authn-isomorphic';
import { WebSocketChannel2023 } from 'solid-notification-client';
import { WebSocket } from 'ws';

async function main() {
    const topic = 'http://localhost:3000/'
    const features = {}
    const channel = new WebSocketChannel2023(new Session());
    const webSocketUrl = await channel.subscribe(topic, {})

    const socket = new WebSocket(webSocketUrl);
    socket.onmessage = (message) => console.log(message.data.toString());
} 
main()
```

### Features

Following features might be supported by the Subscription Server (examples are given for each features).
```json
{
    "accept": "text/turtle", 
    "startAt": "1988-03-09T14:48:00.000Z", // format xsd:dateTime
    "endAt": "1988-03-09T14:48:00.000Z", // format xsd:dateTime
    "state": "", // don't know 
    "rate": "PT1S" // format xsd:duration
}
```

See section 2.3.2 of the specification for more details


### Setting up a solid server which supports the WebSocketChannel2023

Install the CSS that supports the Solid Notification Protocol.
```sh
npm i @solid/community-server https://github.com/CommunitySolidServer/CommunitySolidServer#feat/add-notification
```
Start a server without setup, with memory storage and with both WebSocketChannel2023 and WebHookSubscription2021 channel types for solid notifications:
```sh
wget https://raw.githubusercontent.com/woutslabbinck/Solid-Notification/main/config/memory-config.json
npx @solid/community-server -c memory-config.json 
```

## Feedback and questions

Do not hesitate to [report a bug](https://github.com/woutslabbinck/Solid-Notification/issues).

Further questions can also be asked to [Wout Slabbinck](mailto:wout.slabbinck@ugent.be) (developer and maintainer of this repository).