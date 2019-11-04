const lib = require('./lib');

async function main () {
    return lib.consumeWav('./assets/visualizer_120bpm2s.wav');
}

main();
