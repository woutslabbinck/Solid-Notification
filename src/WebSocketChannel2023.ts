import { Session } from "@rubensworks/solid-client-authn-isomorphic";
import { NOTIFY } from "@solid/community-server";
import { WebSocket } from 'ws';
import { fetchSubscriptionUrl } from './NotificationUtil';
import { parseResponse } from './Util';

export class WebSocketChannel2023 {
    private session: Session;

    constructor(session?: Session) {
        this.session = session ?? new Session();
    }


    /**
     * Retrieves the Websocket URL by following the {@link https://solidproject.org/TR/notifications-protocol|notification protocol v0.2.0.}
     * 
     * Discovers from the topic resource the storage description resource.
     * Using the contents of the storage description resource, a search is executed to find the WebSocketChannel2023 channel URL.
     * Finally, a POST request is send to the WebSocketChannel with as content the topic and features.
     * @param topic - The resource in the solid pod that you want to subscribe to.
     * @param features - Which features should be in the message of the notification channel.
     * @returns The websocket URL of the Solid pod for this resource.
     */
    public async subscribe(topic: string, features: Record<string, unknown>): Promise<string> {
        const subscriptionURL = await fetchSubscriptionUrl(topic, NOTIFY.WebSocketChannel2023, this.session)

        // create body (see 3.3)
        const body = {
            "@context": [
                "https://www.w3.org/ns/solid/notification/v1"
            ],
            topic,
            type: NOTIFY.WebSocketChannel2023,
            ...features
        }

        // send POST request using body to subscriptionURL.
        const response = await this.session.fetch(subscriptionURL, {
            method: "POST",
            headers: {
                "content-type": 'application/ld+json',
                'accept': 'text/turtle'
            },
            body: JSON.stringify(body)
        })

        // Parse resulting response
        const store = await parseResponse(response);

        const receiveFrom = store.getQuads(null, NOTIFY.receiveFrom, null, null)

        if (receiveFrom.length !== 1) throw Error("receiveFrom property not found.")

        return receiveFrom[0].object.value
    }

    public async webSocket(topic: string, features: Record<string, unknown>): Promise<WebSocket> {
        const webSocketUrl = await this.subscribe(topic, features);
        const websocket = new WebSocket(webSocketUrl)
        return websocket
    }
}

