var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class Buttons {
}
export default class Console {
    constructor() {
        this.colors = [
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
        ];
        this.serialBuffer = [];
    }
    getByte(pointer) {
        return new Uint8Array(this.memory.buffer)[pointer];
    }
    setByte(pointer, value) {
        new Uint8Array(this.memory.buffer)[pointer] = value;
    }
    sendSerial(value) {
        this.serialBuffer.push(value);
    }
    WASM_sendSerial(pointer) {
        this.onSerialByte(this.getByte(pointer));
    }
    WASM_getSerial(pointer) {
        this.setByte(pointer, this.serialBuffer.shift());
    }
    WASM_draw(xp, yp, cp) {
        let x = this.getByte(xp);
        let y = this.getByte(yp);
        this.canvas.fillStyle = this.colors[this.getByte(cp)];
        this.canvas.fillRect(1, 1, x, y);
    }
    WASM_getButton(buttonp, retp) {
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
        }[this.getByte(buttonp)]] ? 1 : 0));
    }
    WASM_setSound(sound) {
        this.audiogen.parameters.get("value").setValueAtTime(((this.getByte(sound) << 8) + this.getByte(sound + 1)) * 0.5, this.audio.currentTime);
    }
    init(canvas, wasm, extradat) {
        return __awaiter(this, void 0, void 0, function* () {
            this.buttons = new Buttons();
            this.canvas = canvas.getContext("2d");
            this.audio = new AudioContext();
            yield this.audio.audioWorklet.addModule("./audiogen.min.js");
            this.audiogen = new AudioWorkletNode(this.audio, "audio-generator");
            this.audiogen.connect(this.audio.destination);
            this.memory = new WebAssembly.Memory({ initial: 10, maximum: 10 });
            this.wasm = yield WebAssembly.instantiate(wasm, { "env": {
                    "serial_send": this.WASM_sendSerial,
                    "serial_get": this.WASM_getSerial,
                    "draw": this.WASM_draw,
                    "button_get": this.WASM_getButton,
                } });
            this.extradat = extradat;
            setInterval(() => {
                const tick = this.wasm.instance.exports.tick;
                tick();
            }, 1000 / 30);
        });
    }
}
