Attempt to use the webnotifications

## attempt 1
sources:

- https://github.com/solid/notifications/issues/141#issuecomment-1376889639
l
- Solid Webhook Client: https://github.com/o-development/solid-webhook-client
  - only does webhook implementation, not websockets (also only 2021)
- Inrupt library: https://docs.inrupt.com/ess/latest/services/service-websocket/
  - based on earlier versions of the solid notifications protocol + custom
- Dokieli library:
  - https://github.com/linkeddata/dokieli/blob/main/src/dokieli.js#L4329-4421
  - note: ugly code and not as a package
    

## attempt 2

Checkout tests of Joachim:
- https://github.com/CommunitySolidServer/CommunitySolidServer/blob/versions/6.0.0/test/integration/WebSocketSubscription2021.test.ts
- https://github.com/CommunitySolidServer/CommunitySolidServer/blob/versions/6.0.0/test/util/NotificationUtil.ts

Then next, try to actually subscribe to something useful -> e.g. a resource http://localhost:3000/state and update it

## Understanding the spec together with the CSS

set up a server
```sh
npx @solid/community-server -c memory-config.json 
```
spec says something about solid:storageDescription

> Resource Servers that want to enable Subscription Clients to discover subscription services and notification channels available to a storage in which a given resource is in MUST advertise the associated resources describing the subscription services and notification channels by responding to an HTTP request including a Link header with the rel value of http://www.w3.org/ns/solid#storageDescription [SOLID-PROTOCOL] and the Description Resource as link target [RFC8288].

```sh
curl http://localhost:3000/
```
Result: 
> Link: <http://localhost:3000/.well-known/solid>; rel="http://www.w3.org/ns/solid/terms#storageDescription"
```sh
curl http://localhost:3000/.well-known/solid
```
important triple:
```turtle
<http://localhost:3000/.well-known/solid#websocketNotification> <http://www.w3.org/ns/solid/notifications#subscription> <http://localhost:3000/.notifications/WebSocketSubscription2021/>.
```

`http://localhost:3000/.well-known/solid#websocketNotification` is of type WebSocketSubscription2021 with a bunch of features:
* accept
* expiration
* rate
* state

TODO: ask Joachim:
* should state not be the last state of the resource? In 2021 I get a timestamp string
* TODO: download and use the branch https://github.com/CommunitySolidServer/CommunitySolidServer/tree/feat/add-notification instead of 6.0.0 alpha
* hebt gij weet van een client? of moet ik er zelf een schrijven
  * maak een en zet op npm -> announce to Ruben D 
