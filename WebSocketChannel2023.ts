import { Session } from "@rubensworks/solid-client-authn-isomorphic";
import { WebSocket } from 'ws';
import { Readable } from "stream";
import { parseLinkHeader, SOLID, parseContentType, NOTIFY, RDF, ContextDocumentLoader } from "@solid/community-server"
import rdfParser from "rdf-parse";
import { storeStream } from "rdf-store-stream"
import { DataFactory, Store, Writer } from "n3";
import { KeysRdfParseJsonLd } from '@comunica/context-entries';

export class WebSocketChannel2023 {
    private session: Session;

    constructor(session: Session) {
        this.session = session;
    }

    /**
     * Looks up the storageDescription URL of a solid pod by looking for the `http://www.w3.org/ns/solid#storageDescription` Link value.
     * 
     * @param url - the URL of the solid pod. (any resource in the pod is fine; all resources MUST advertise this Link header when the solid pod is a Resource Server. See 2.1 Discovery of the spec )
     */
    private async lookupStorageDescription(url: string): Promise<string> {
        // fetch url
        const response = await this.session.fetch(url, { method: 'HEAD' })
        // parse link header and look for rel=`http://www.w3.org/ns/solid#storageDescription`
        const linkHeaders = response.headers.get('Link') ?? "";
        const parsedLinkHeaders = parseLinkHeader(linkHeaders)

        let storageDescription: string | undefined
        for (const { target, parameters } of parsedLinkHeaders) {
            if (parameters.rel === SOLID.storageDescription) {
                storageDescription = target
            }
        }


        // throw error if not found
        if (!storageDescription) {
            throw Error("No storage description found in Link Header")
        }

        // return value if found
        return storageDescription
    }

    /**
     * Fetches the subscription URL of a Resource Server by first fetching the solid:StorageDescription URL and then extracting the WebSocketChannel2023 from the body.
     * @param url - the Url of the solid pod.
     * @returns 
     */
    private async fetchSubscriptionUrl(url: string): Promise<string> {
        const storageDescriptionUrl = await this.lookupStorageDescription(url);
        // fetch storage description resource
        const response = await this.session.fetch(storageDescriptionUrl)
        const store = await parseResponse(response)

        const notificationChannels = store.getObjects(storageDescriptionUrl, NOTIFY.terms.subscription, null)

        let webSocketChannel: string | undefined
        for (const notificationChannel of notificationChannels) {
            if (store.getQuads(notificationChannel, NOTIFY.channelType, NOTIFY.WebSocketChannel2023, null).length === 1) {
                webSocketChannel = store.getQuads(notificationChannel, NOTIFY.channelType, NOTIFY.WebSocketChannel2023, null)[0].subject.value
            }
        }

        // throw error if not found
        if (!webSocketChannel) {
            throw Error("No WebSocketChannel found in the storage description resource.")
        }

        // return value if found
        return webSocketChannel
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
        const subscriptionURL = await this.fetchSubscriptionUrl(topic)

        // create body (see 3.3)
        const body = {
            "@context": [
                "https://www.w3.org/ns/solid/notification/v1"
            ],
            topic,
            "type": NOTIFY.WebSocketChannel2023,
            ...features
        }

        // send POST request using body to subscriptionURL.
        const response = await this.session.fetch(subscriptionURL, {
            method: "POST",
            headers: {
                "content-type": 'application/ld+json',
                'accept':'text/turtle' // note: this doesn't work -> bug in CSS
            },
            body: JSON.stringify(body)
        })

        // Parse resulting response
        const store = await parseResponse(response);
        const receiveFrom = store.getQuads(null, NOTIFY.receiveFrom, null, null)

        if (receiveFrom.length !== 1) throw Error("receiveFrom property not found.")

        return receiveFrom[0].object.value

        // let webSocketUrl = store.getQuads()
        // {
        //     "@context": [
        //       "https://www.w3.org/ns/solid/notification/v1"
        //     ],
        //     "id": "https://channel.example/ac748712",
        //     "type": "WebSocketChannel2023",
        //     "topic": "https://example.org/guinan/profile",
        //     "receiveFrom": "wss://websocket.example/d4cf3f19",
        //     "startAt": "2023-01-01T07:00:00.000Z",
        //     "endAt": "2023-01-01T09:00:00.000Z",
        //     "rate": "PT5M",
        //     "state": "e75-TFJH"
        //   }
    }

    public async notifications(topic: string, stream: Readable): Promise<void> {
        // sets up a websocket connection to the resource and pushes them to the stream

        // TODO: does this make sense what I am doing or is that just too much? -> probably too much here
    }

}


// util function to parse response as store
async function parseResponse(response: Response): Promise<Store> {
    const contentType = parseContentType(response.headers.get("content-type") ?? "").value

    const text = await response.text()
    const textStream = require('streamify-string')(text);

    // doing just like the CSS does https://github.com/CommunitySolidServer/CommunitySolidServer/blob/8978d770ee70b8c6dc17b3d6525b570bfe0ba2d7/src/storage/conversion/RdfToQuadConverter.ts#L40
    const documentLoader = new ContextDocumentLoader({
        'https://www.w3.org/ns/solid/notification/v1': './notification.jsonld'
    })

    const quadStream = rdfParser.parse(textStream, {
        contentType,
        [KeysRdfParseJsonLd.documentLoader.name]: documentLoader
    });
    const store = (await storeStream(quadStream)) as any as Store;
    return store
}



async function main() {
    const test = new WebSocketChannel2023(new Session());
    const webSocketUrl = await test.subscribe('http://localhost:3000/', {
        accept: 'text/turtle',
        // startAt: '1988-03-09T14:48:00.000Z',
        // endAt: '1988-03-09T14:48:00.000Z',
        // state: '', 
        // rate: {
        //     "@value": "PT1S", // https://www.ibm.com/docs/en/i/7.1?topic=types-xsduration
        //     "@type": "http://www.w3.org/2001/XMLSchema#duration"
        // }
    })

    const socket = new WebSocket(webSocketUrl);
    socket.on('message', (something: Buffer) => {
        const data = something.toString()
        console.log(data);

    })

}
main()