class AudioGenerator extends AudioWorkletProcessor {
    static get parameterDescriptors() {
        return [{
                name: "value",
                automationRate: 'a-rate'
            }];
    }
    process(inputs, outputs, parameters) {
        const output = outputs[0];
        output.forEach(channel => {
            for (let i = 0; i < channel.length; i++) {
                channel[i] = parameters["value"][i];
            }
        });
        return true;
    }
}
registerProcessor("audio-generator", AudioGenerator);
