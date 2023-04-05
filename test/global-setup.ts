import { runSolidPublic } from "./util";

async function start(): Promise<void> {
    // start server without setup (and public ACL) and wait till it is running
    // await runSolidPublic();
}


module.exports = async (): Promise<void> => {
    try {
        await start();
    } catch (e) {
        console.log('Setting up test environment has failed.');
        console.log(e);
    }
};