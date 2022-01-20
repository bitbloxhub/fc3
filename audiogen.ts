// types due to https://github.com/microsoft/TypeScript/issues/28308
interface AudioParamDescriptor {
    name: string
    automationRate?: "a-rate" | "k-rate"
    minValue?: number
    maxValue?: number
    defaultValue?: number
}

interface AudioWorkletProcessor {
    readonly port: MessagePort
    process(
        inputs: Float32Array[][],
        outputs: Float32Array[][],
        parameters: Record<string, Float32Array>
    ): boolean
}
declare var AudioWorkletProcessor: {
    prototype: AudioWorkletProcessor
        new (options?: AudioWorkletNodeOptions): AudioWorkletProcessor
    }

    declare function registerProcessor(
        name: string,
        processorCtor: (new (
        options?: AudioWorkletNodeOptions
    ) => AudioWorkletProcessor) & {
        parameterDescriptors?: AudioParamDescriptor[]
    }
)

class AudioGenerator extends AudioWorkletProcessor {
    static get parameterDescriptors(): Array<AudioParamDescriptor> {
        return [{
            name: "value",
            automationRate: 'a-rate'
        }]
    }

    process (inputs, outputs, parameters) {
        const output = outputs[0]
        output.forEach(channel => {
            for (let i = 0; i < channel.length; i++) {
                channel[i] = parameters["value"][i]
            }
        })

        return true
    }
}

registerProcessor("audio-generator", AudioGenerator)