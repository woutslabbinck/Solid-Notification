import { Session } from "@rubensworks/solid-client-authn-isomorphic";
import "jest-rdf";
import { WebSocketChannel2023 } from "../src/WebSocketChannel2023";
import { baseUrl, runSolidPublic } from "./util";
import { WebSocket } from 'ws';
import { Store } from "n3";
import rdfParser from "rdf-parse";
import { storeStream } from "rdf-store-stream";
import { AS, RDF } from "@solid/community-server";

describe('A WebSocketChannel2023', () => {
    let webSocketUrl: string;
    let channel: WebSocketChannel2023;
    let topic: string;
    let features: Record<string, unknown>;

    beforeAll(async () => {
        await runSolidPublic();
        topic = baseUrl
        features = { accept: 'text/turtle' }
        channel = new WebSocketChannel2023(new Session());
        webSocketUrl = await channel.subscribe(baseUrl, features)
    });

    it('fetches the websocket URL.', async () => {
        const channel = new WebSocketChannel2023(new Session());
        expect(channel.subscribe(baseUrl, {})).resolves.toBeDefined()
    })

    it('can be used to setup a websocket.', async () => {
        const websocket = new WebSocket(webSocketUrl);

        const notificationPromise = new Promise<Buffer>((resolve): any => websocket.on('message', resolve));
        await new Promise<void>((resolve): any => websocket.on('open', resolve));

        const response = await fetch(topic, {
            method: 'POST',
            headers: { 'content-type': 'text/plain' },
            body: 'abc',
        });
        expect(response.status).toBe(201);

        const notification = (await notificationPromise).toString()
        const notificationStore = await util(notification)
        websocket.close();

        expect(notificationStore.getQuads(null, RDF.type, AS.Add, null).length).toBe(1)
        expect(notificationStore.getQuads(null, AS.object, null, null).length).toBe(1)
        expect(notificationStore.getQuads(null, AS.object, null, null)[0].object.value).toBe(response.headers.get('Location'))
        expect(notificationStore.getQuads(null, AS.namespace + 'target', null, null).length).toBe(1)
        expect(notificationStore.getQuads(null, AS.namespace + 'target', null, null)[0].object.value).toBe(baseUrl)        
    })
})

async function util(text: string, contentType="text/turtle"): Promise<Store> {
    const textStream = require('streamify-string')(text);

    const quadStream = rdfParser.parse(textStream, {
        contentType,
    });
    const store = (await storeStream(quadStream)) as any as Store;
    return store
}