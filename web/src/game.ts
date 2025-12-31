import {Player} from "./assets/player";
import { Application, Assets, Container, Sprite } from 'pixi.js';
import init, {decode_bytes, encode_into_bytes} from "../parser/pkg/parser";

export class Game {
    private players: Array<Player> = [];

    private app: Application = new Application();
    private wt: WebTransport | null = null;
    private stream: WebTransportBidirectionalStream | null = null;
    private sender: WritableStreamDefaultWriter<Uint8Array> | null = null;

    async init() {
        await init();
        
        this.wt = new WebTransport("https://127.0.0.1:6767");
        await this.wt.ready;
        this.stream = await this.wt.createBidirectionalStream();
        this.sender = this.stream.writable.getWriter();

        await this.app.init({
            background: "#000",
            resizeTo: window,
            resolution: 2,
        });

        document.body.appendChild(this.app.canvas);

        let container = new Container();
        this.app.stage.addChild(container);

        let aja = {
            name: "why god javedpension?"
        };
        let bytes = encode_into_bytes(aja, 1);
        console.log(bytes)
        this.sender.write(bytes);
    }

    async read(reader: ReadableStreamDefaultReader<Uint8Array>) {
        try {
            while (true) {
                const {value, done} = await reader.read();
                if (done) break;
                
                let data = decode_bytes(value);
                console.log(data);
            }
        } catch (e) {
            console.error('stream closed ', e);
        }
    }
}