import { KeysRdfParseJsonLd } from '@comunica/context-entries';
import { ContextDocumentLoader, parseContentType } from "@solid/community-server";
import { Store } from "n3";
import * as path from 'path';
import rdfParser from "rdf-parse";
import { storeStream } from "rdf-store-stream";

// util function to parse response as store
export async function parseResponse(response: Response): Promise<Store> {
    const contentType = parseContentType(response.headers.get("content-type") ?? "").value

    const text = await response.text()
    const textStream = require('streamify-string')(text);

    // doing just like the CSS does https://github.com/CommunitySolidServer/CommunitySolidServer/blob/8978d770ee70b8c6dc17b3d6525b570bfe0ba2d7/src/storage/conversion/RdfToQuadConverter.ts#L40
    const documentLoader = new ContextDocumentLoader({
        'https://www.w3.org/ns/solid/notification/v1': path.join(__dirname, '../config/contexts/notification.jsonld')
    })

    const quadStream = rdfParser.parse(textStream, {
        contentType,
        [KeysRdfParseJsonLd.documentLoader.name]: documentLoader
    });
    const store = (await storeStream(quadStream)) as any as Store;
    return store
}

