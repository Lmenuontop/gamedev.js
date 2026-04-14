import { Scene } from 'phaser';
import * as Phaser from 'phaser';

export class Game extends Scene {
    constructor() {
        super('Game');
        this.speedMultiplier = 1; 
    }

    preload() {
        
        this.load.setPath('assets');
        this.load.image('background', 'bg.png');
        this.load.image('drone', 'logo.png'); 
        this.load.image('scrap', 'scrap.jpeg');
        this.load.image('enemy', 'enemy.jpeg');
    }

    create() {
        // 1. Background (Fixed the floating text)
        this.add.image(512, 384, 'background');

        // 2. Player
        this.player = this.physics.add.sprite(512, 384, 'drone');
        this.player.setScale(0.5); 
        this.player.setCollideWorldBounds(true);
        this.player.canShoot = true;
        this.scraps = this.physics.add.group();
        this.enemies = this.physics.add.group();

        this.cursors = this.input.keyboard.createCursorKeys();

        // 4. Glitch Loop
        this.time.addEvent({
            delay: 4000,
            callback: () => {
                const glitches = [0.5, 3, 1.5, 8];
                this.speedMultiplier = Phaser.Utils.Array.GetRandom(glitches);
                
                
                this.player.setTint(this.speedMultiplier > 2 ? 0xff0000 : 0xffffff);
                console.log("Current Speed Multiplier:", this.speedMultiplier);
            },
            loop: true
        });
        this.time.addEvent({
            delay: 2000,
            callback: () => {
                const x = Phaser.Math.Between(50, 974);
                const y = Phaser.Math.Between(50, 718);
                const scrap = this.scraps.create(x,y, "scrap").setScale(0.2);
                scrap.setTint(0xffff00);
            },
            loop: true
        }),
        this.time.addEvent({
            delay: 5000,
            callback: () => {
                const x = (this.player.x < 500) ? 800 : 100;
                const enemy = this.enemies.create(x, 100, 'enemy').setScale(0.4);
                enemy.setTint(0xff0000); //red
                enemy.setBounce(1);
                enemy.setCollideWorldBounds(true);
                enemy.setVelocity(Phaser.Math.Between(-200, 200), Phaser.Math.Between(-200, 200));
            },
            loop: true,
        });
        this.physics.add.collider(this.player, this.enemies, (player, enemy) => {
            this.scene.restart();
            this.speedMultiplier = 1;
        }, null, null);
        this.physics.add.overlap(this.player, this.scraps, (player, scrap) => {
            scrap.destroy();
            player.setScale(player.scale + 0.01);
            console.log("scrap ++");
        }, null, null);
    }

    update() {
        const baseSpeed = 300;
        
        // Reset velocity every frame
        this.player.setVelocity(0);

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-baseSpeed * this.speedMultiplier);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(baseSpeed * this.speedMultiplier);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-baseSpeed * this.speedMultiplier);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(baseSpeed * this.speedMultiplier);
        }
    }
}
