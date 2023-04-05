import { Session } from "@rubensworks/solid-client-authn-isomorphic";
import { NOTIFY, SOLID, parseLinkHeader } from "@solid/community-server";
import { parseResponse } from './Util';

/**
 * Looks up the storageDescription URL of a solid pod by looking for the `http://www.w3.org/ns/solid#storageDescription` Link value.
 * 
 * @param url - the URL of the solid pod. (any resource in the pod is fine; all resources MUST advertise this Link header when the solid pod is a Resource Server. See 2.1 Discovery of the spec )
 */
export async function lookupStorageDescription(url: string, session = new Session()): Promise<string> {
    // fetch url
    const response = await session.fetch(url, { method: 'HEAD' })
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
export async function fetchSubscriptionUrl(url: string, type: string, session = new Session()): Promise<string> {
    const storageDescriptionUrl = await lookupStorageDescription(url, session);
    // fetch storage description resource
    const response = await session.fetch(storageDescriptionUrl)
    const store = await parseResponse(response)

    const notificationChannels = store.getObjects(storageDescriptionUrl, NOTIFY.terms.subscription, null)

    let webSocketChannel: string | undefined
    for (const notificationChannel of notificationChannels) {
        if (store.getQuads(notificationChannel, NOTIFY.channelType, type, null).length === 1) {
            webSocketChannel = store.getQuads(notificationChannel, NOTIFY.channelType, type, null)[0].subject.value
        }
    }

    // throw error if not found
    if (!webSocketChannel) {
        throw Error("No WebSocketChannel found in the storage description resource.")
    }

    // return value if found
    return webSocketChannel
}