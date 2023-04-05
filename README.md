# Solid Notifications
[![npm](https://img.shields.io/npm/v/solid-notification-client)](https://www.npmjs.com/package/solid-notification-client)

This library implements subscribing to a Notication Channel following the [Solid Notifications Protocol](https://solidproject.org/TR/notifications-protocol).

## Installing

```sh
npm i solid-notification-client
```

## Using


Features -> TODO: describe scenario without and with features.

accept: 'text/turtle',
startAt: '1988-03-09T14:48:00.000Z',
endAt: '1988-03-09T14:48:00.000Z',
state: '', 
rate: {
    "@value": "PT1S", // https://www.ibm.com/docs/en/i/7.1?topic=types-xsduration
    "@type": "http://www.w3.org/2001/XMLSchema#duration"
}

async function main() {
    const test = new WebSocketChannel2023(new Session());
    const webSocketUrl = await test.subscribe('http://localhost:3000/', {
        accept: 'text/turtle',
        startAt: '1988-03-09T14:48:00.000Z',
        endAt: '1988-03-09T14:48:00.000Z',
        state: '', 
        rate: {
            "@value": "PT1S", // https://www.ibm.com/docs/en/i/7.1?topic=types-xsduration
            "@type": "http://www.w3.org/2001/XMLSchema#duration"
        }
    })

    const socket = new WebSocket(webSocketUrl);
    socket.on('message', (something: Buffer) => {
        const data = something.toString()
        console.log(data);

    })

    // curl -X POST -H 'context-type/text/plain' -d 'lol' http://localhost:3000/

    // response 
    // <> a <https://www.w3.org/ns/activitystreams#Add>;
    // <https://www.w3.org/ns/activitystreams#object> <http://localhost:3000/5087a35d-2559-452d-ae82-9473b86492f4>;
    // <https://www.w3.org/ns/activitystreams#target> <http://localhost:3000/>;
    // <http://www.w3.org/ns/solid/notifications#state> "\"1680685787000\"";
    // <https://www.w3.org/ns/activitystreams#published> "2023-04-05T09:09:47.290Z"^^<http://www.w3.org/2001/XMLSchema#dateTime>.

}

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