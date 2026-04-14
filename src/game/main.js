import { Game } from './scenes/Game';
import * as Phaser from 'phaser';

const StartGame = (parent) => {
    return new Phaser.Game({
        type: Phaser.AUTO,
        width: 1024,
        height: 768,
        parent: parent,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: true
            }
        },
        scene: [Game]
    });
}

export default StartGame;
