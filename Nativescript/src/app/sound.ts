import * as fs from 'tns-core-modules/file-system';
import { TNSPlayer } from 'nativescript-audio';

export default class Sound {
    static create(path: string, loop = false) {
        if (path.indexOf("~/") === 0) {
            path = fs.path.join(fs.knownFolders.currentApp().path, path.replace("~/", ""));
        }

        if (!fs.File.exists(path)) {
            throw new Error(`Sound not initialized; file not found: ${path}`);
        }

        return new Sound(path, loop);
    }

    private player: TNSPlayer;

    private constructor(private path: string, loop: boolean) {
        this.player = new TNSPlayer();
        this.player.initFromFile({
            audioFile: path,
            loop,
        });
    }

    async play() {
        return this.player.play();
    }

    async stop() {
        return this.player.pause();
    }
}
