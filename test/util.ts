import {AppRunner} from "@solid/community-server";
import Path from "path";
const port = 3333
export const baseUrl = `http://localhost:${port}/`


export async function runSolidPublic(): Promise<void> {
    await new AppRunner().run(

        {
            mainModulePath: `${__dirname}/`,
            logLevel: 'info',
            typeChecking: false,
        },
        Path.join(__dirname, '../config/memory-config.json'),
        {
            'urn:solid-server:default:variable:loggingLevel': 'info',
            'urn:solid-server:default:variable:port': port,
            'urn:solid-server:default:variable:baseUrl': baseUrl,
        }
    );
}