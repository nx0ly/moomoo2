import { Player } from "./assets/player";
import { Application, Assets, Container, Sprite } from 'pixi.js';
import init, { 
    decode_bytes, 
    encode_into_bytes, 
    HandshakeState,
    SessionCrypto 
} from "../parser/pkg/parser";

export class Game {
    private players: Array<Player> = [];

    private app: Application = new Application();
    private wt: WebTransport | null = null;
    private stream: WebTransportBidirectionalStream | null = null;
    private sender: WritableStreamDefaultWriter<Uint8Array> | null = null;
    private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
    
    private crypto: SessionCrypto | null = null;

    async init() {
        await init();
        
        this.wt = new WebTransport("https://127.0.0.1:6767");
        await this.wt.ready;
        console.log("wt connected");
        
        this.stream = await this.wt.createBidirectionalStream();
        this.sender = this.stream.writable.getWriter();
        this.reader = this.stream.readable.getReader();

        console.log("starting handshake");
        
        const handshake = HandshakeState.create_client_hello();
        const clientHelloBytes = handshake.message();
        
        await this.sender.write(clientHelloBytes);
        console.log("sent ClientHello");
        
        // Step 3: Receive ServerHello from server
        const { value: serverHelloBytes, done } = await this.reader.read();
        if (done || !serverHelloBytes) {
            throw new Error("connection closed during handshake");
        }
        console.log("received ServerHello");
        
        // Step 4: Complete handshake and derive session key
        this.crypto = handshake.complete_handshake(serverHelloBytes);
        console.log("handshake finished");
        console.log(`send nonce: ${this.crypto.get_send_nonce()}`);
        console.log(`receive nonce: ${this.crypto.get_recv_nonce()}`);

        await this.app.init({
            background: "#000",
            resizeTo: window,
            resolution: 2,
        });

        document.body.appendChild(this.app.canvas);

        let container = new Container();
        this.app.stage.addChild(container);
        
        const spawnData = {
            name: "why god javedpension?",
        };
        
        await this.sendEncrypted(spawnData, 1);
        console.log("spawn msg sent");

        this.read();
    }

    async sendEncrypted(data: any, opcode: number) {
        if (!this.crypto || !this.sender) {
            throw new Error("cannot send - encryption not initialized");
        }

        try {
            const plaintext = encode_into_bytes(data, opcode);
            const ciphertext = this.crypto.encrypt(plaintext);
            
            await this.sender.write(ciphertext);
        } catch (e) {
            console.error("failed to send encrypted message:", e);
            throw e;
        }
    }

    async read() {
        if (!this.reader || !this.crypto) {
            throw new Error("cannot read - stream or encryption not initialized");
        }

        try {
            while (true) {
                const { value, done } = await this.reader.read();
                if (done) {
                    console.log("stream closed by server");
                    break;
                }

                if (!value) continue;

                try {
                    const plaintext = this.crypto.decrypt(value);
                    
                    const packet = decode_bytes(plaintext);
                    
                    console.log("OP:", packet);
                    
                    this.handlePacket(packet);
                } catch (decryptError) {
                    console.error("failed to decrypt/decode packet:", decryptError);
                }
            }
        } catch (e) {
            console.error("stream closed:", e);
        } finally {
            this.cleanup();
        }
    }

    private handlePacket(packet: any) {
        switch (packet.code) {
            case 1:
                console.log("player spawned:", packet.data);
                // TODO: Add player to game
                break;
            
            case 2:
                console.log("player moved:", packet.data);
                // TODO: Update player position
                break;
            
            default:
                console.warn("unknown packet type:", packet.code);
        }
    }

    async sendMove(direction: number) {
        const moveData = { dir: direction };
        await this.sendEncrypted(moveData, 2);
    }

    private cleanup() {
        console.log("cleaning up stuff");
        
        if (this.sender) {
            this.sender.releaseLock();
            this.sender = null;
        }
        
        if (this.reader) {
            this.reader.releaseLock();
            this.reader = null;
        }
        
        if (this.wt) {
            this.wt.close();
            this.wt = null;
        }
        
        this.crypto = null;
    }

    isConnected(): boolean {
        return this.crypto !== null && this.sender !== null;
    }

    getDebugInfo() {
        if (!this.crypto) return null;
        
        return {
            sendNonce: this.crypto.get_send_nonce(),
            recvNonce: this.crypto.get_recv_nonce(),
            connected: this.isConnected()
        };
    }
}