
const batchManager = {
    batches: {
        length: 0,
    },
    date: new Date(),

    init(channels) {
        for (let i=0; i<24; i++) {
            const batch = new Batch(i);
            batch.addChannels(channels[i]);
            this.batches[i] = batch;
            this.batches.length++;
        }
    },
}

class Batch {
    constructor(num) {
        this.name = `Batch-${num}`;
        this.channels = {};
        for (let i=0; i<60; i++) {
            this.channels[i] = [];
        }
    }

    addChannels(channels) {
        Object.entries(channels).forEach(channel => {
            this.channels[channel[0]].push(channel[1]);
        });
    }
}
