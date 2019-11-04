const fs = require('fs');
const { promisify } = require('util');
const wav = require('node-wav');

const readFile = promisify(fs.readFile);

/**
 * Sums 2 arrays of equal length N into 1 array.
 * Not sure if this is the fastest way to do it, so don't rely on for intense performance just yet.
 * @param stereo - array of size 2, each entity of which contain an array of samples with equal length N
 * @returns {Array} - mono array of size equal to the stereo input's sample length N if input is good, otherwise []
 */
function mixStereoToMono (stereo) {
    // Validation upfront
    const inputDoesNotHaveTwoChannels = stereo.length !== 2 && stereo[0].length && stereo[1].length;
    if (inputDoesNotHaveTwoChannels) {
        return [];
    }
    const inputDoesNotHaveEqualSampleLength = stereo[0].length !== stereo[1].length;
    if (inputDoesNotHaveEqualSampleLength) {
        return [];
    }
    // Mixdown
    const scaleDownFactor = 1; //0.5; // TODO continue research on whether or not this is important
    return stereo[0].map((val, i) => {
        const sum = (val + stereo[1][i]) * scaleDownFactor;
        if (sum > 1) {
            console.log('CLIPPING WARNING', sum);
        }
        return sum > 1 ? 1 : sum;
    })
}

async function consumeWav (file) {
    const buffer = await readFile(file);

    // decode into array of Float32Arrays
    const result = wav.decode(buffer);
    console.log('Sample rate:', result.sampleRate);
    for (let i = 0; i < result.channelData.length; i++) {
        console.log(result.channelData[i].length);
    }

    let monoMix = [];
    if (result.channelData.length === 2) {
        // Stereo!
        monoMix = mixStereoToMono(result.channelData);
    } else if (result.channelData.length === 1) {
        // Already mono!
        monoMix = result.channelData[0];
    } else {
        console.log(`${result.channelData.length} channels`);
    }

    console.log('Mono sample length:', monoMix.length);
    return monoMix;
}

module.exports = consumeWav;
