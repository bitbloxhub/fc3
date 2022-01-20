interface wasmrv {
    module: WebAssembly.Module
    instance: WebAssembly.Instance
}

export class Buttons {
    A: boolean
    B: boolean
    X: boolean
    Y: boolean
    up: boolean
    down: boolean
    left: boolean
    right: boolean
    start: boolean
    select: boolean
}

export default class Console {
    buttons: Buttons
    canvas: CanvasRenderingContext2D
    audio: AudioContext
    audiogen: AudioWorkletNode
    wasm: wasmrv
    memory: WebAssembly.Memory
    extradat: ArrayBuffer
    colors: Array<string> = [
        "#000000",
        "#555555",
        "#AAAAAA",
        "#FFFFFF",
        "#0000AA",
        "#5555FF",
        "#00AA00",
        "#55FF55",
        "#00AAAA",
        "#55FFFF",
        "#AA0000",
        "#FF5555",
        "#AA00AA",
        "#FF55FF",
        "#AA5500",
        "#FFFF55"
    ]
    serialBuffer: Array<number> = []
    onSerialByte: (byte: number) => null

    getByte(pointer: number) {
        return new Uint8Array(this.memory.buffer)[pointer]
    }

    setByte(pointer: number, value: number) {
        new Uint8Array(this.memory.buffer)[pointer] = value
    }

    sendSerial(value: number) {
        this.serialBuffer.push(value)
    }

    WASM_sendSerial(pointer: number) {
        this.onSerialByte(this.getByte(pointer))
    }

    WASM_getSerial(pointer: number) {
        this.setByte(pointer, this.serialBuffer.shift())
    }

    WASM_draw(xp: number, yp: number, cp: number) {
        let x = this.getByte(xp)
        let y = this.getByte(yp)
        this.canvas.fillStyle = this.colors[this.getByte(cp)]
        this.canvas.fillRect(1, 1, x, y)
    }

    WASM_getButton(buttonp: number, retp: number) {
        this.setByte(retp, (this.buttons[{
            0: "A",
            1: "B",
            2: "X",
            3: "Y",
            4: "up",
            5: "down",
            6: "left",
            7: "right",
            8: "start",
            9: "select",
        }[this.getByte(buttonp)]] ? 1 : 0))
    }

    WASM_setSound (sound) {
        this.audiogen.parameters.get("value").setValueAtTime(((this.getByte(sound) << 8)+this.getByte(sound+1))*0.5, this.audio.currentTime)
    }

    async init (canvas: HTMLCanvasElement, wasm: ArrayBuffer, extradat: ArrayBuffer) {
        this.buttons = new Buttons()
        this.canvas = canvas.getContext("2d")
        this.audio = new AudioContext()
        await this.audio.audioWorklet.addModule("./audiogen.min.js")
        this.audiogen = new AudioWorkletNode(this.audio, "audio-generator")
        this.audiogen.connect(this.audio.destination)
        this.memory = new WebAssembly.Memory({initial: 10, maximum: 10})
        this.wasm = await WebAssembly.instantiate(wasm, {"env": {
            "serial_send": this.WASM_sendSerial,
            "serial_get": this.WASM_getSerial,
            "draw": this.WASM_draw,
            "button_get": this.WASM_getButton,

        }})
        this.extradat = extradat
        setInterval(() => {
            const tick = this.wasm.instance.exports.tick as CallableFunction
            tick()
        }, 1000/30)
    }
}