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
        this.load.image('enemy', 'enemy.png');
        this.load.audio("diesfx", "die.wav");
        this.load.audio("scrapsfx", "scrap.wav");
        this.load.audio("music", "music.mp3");
        this.load.audio("beep", "beep.wav");
        this.load.audio("beep2", "beep2.wav");
    }

    create() {
        // Background 
        this.add.image(512, 384, 'background');

        //  Player
        this.player = this.physics.add.sprite(512, 384, 'drone');
        this.player.setScale(0.5); 
        this.player.setCollideWorldBounds(true);
        const hitboxradius = 50;
        this.player.body.setCircle(hitboxradius, (this.player.width / 2 ) - hitboxradius, (this.player.height / 2) - hitboxradius);
        this.player.canShoot = true;
        this.scraps = this.physics.add.group();
        this.enemies = this.physics.add.group();
        this.gameOver = false;
        this.physics.add.collider(this.player, this.enemies, this.handleGameOver, null, this);
        this.score = 0;
        this.trailGroup = this.physics.add.group();
        this.trailTimer = 1;
        this.scoreText = this.add.text(16,16,"Scrap: 0", {
            fontSize: "32px",
            fill: "#00ff00",
            backgroundColor: "#000",
            padding: { x: 10, y: 5 },
            
        });
        this.statusText = this.add.text(512, 50, "SYSTEM: STABLE", {
            fontSize: "24px",
            fill: "#00ff00",
            backgroundColor: "#000",
            padding: { x: 10, y: 5 }
        }).setOrigin(0.5);
        
        this.diesound = this.sound.add("diesfx");
        this.scrapsound = this.sound.add("scrapsfx");
        this.musicsound = this.sound.add("music", {loop: true, volume: 0.9});
        this.beepsound = this.sound.add("beep");
        this.beep2sound = this.sound.add("beep2");
        this.input.once("pointerdown", () => {
            if (!this.musicsound.isPlaying) { this.musicsound.play() }
        });

        this.cursors = this.input.keyboard.createCursorKeys();

        // glitch effect
        this.time.addEvent({
            delay: 4000,
            callback: () => {
                // Difficulty Ramping: Add harder glitches based on score
                let glitches = [0.5, 3, 1.5, 3.5, -0.5, -1.5];
                if (this.score > 10) glitches.push(-2.5, 6);
                if (this.score > 20) glitches.push(-4, 10);

                this.speedMultiplier = Phaser.Utils.Array.GetRandom(glitches);
                
                this.player.setTint(this.speedMultiplier > 2 ? 0xff0000 : 0xffffff);
                console.log("Current Speed Multiplier:", this.speedMultiplier);

                // Pulse Gimmick: Visual expansion when glitching
                this.tweens.add({
                    targets: this.player,
                    scale: this.player.scale * 1.2,
                    duration: 100,
                    yoyo: true
                });

                if (this.speedMultiplier > 2) {
                    this.statusText.setText("SYSTEM: OVERCLOCKED");
                    this.beepsound.play();
                }
                else if (this.speedMultiplier < 0) {
                    this.statusText.setText("SYSTEM: REVERSED");
                    this.beep2sound.play();
                }
                else {
                    this.statusText.setText("SYSTEM: STABLE");
                }
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
        this.enemyTimer = this.time.addEvent({
            delay: 5000,
            callback: () => {
                const x = (this.player.x < 500) ? 800 : 100;
                const enemy = this.enemies.create(x, 100, 'enemy').setScale(0.3);
                
                if (enemy) {
                    // FIX: Use 'enemy' instead of 'this.enemy'
                    enemy.body.setCircle(enemy.width * 0.4); 
                    
                    enemy.setBounce(1);
                    enemy.setCollideWorldBounds(true);
                    // Difficulty Ramping: Increase enemy speed with score
                    const extraSpeed = Math.min(this.score * 5, 300);
                    enemy.setVelocity(Phaser.Math.Between(-200 - extraSpeed, 200 + extraSpeed), Phaser.Math.Between(-200 - extraSpeed, 200 + extraSpeed));
                }
            },
            loop: true,
        });

        this.physics.add.overlap(this.player, this.scraps, (player, scrap) => {
            scrap.destroy();
            this.scrapsound.play();
            player.setScale(player.scale + 0.01);
            console.log("scrap ++");
            this.score += 1;
            this.scoreText.setText("Scrap: " + this.score); 

            // Difficulty Ramping: Faster Spawning every 5 scrap
            if (this.score % 5 === 0 && this.enemyTimer.delay > 1000) {
                this.enemyTimer.delay -= 500;
            }
        }, null, null);
        
        this.physics.add.overlap(this.enemies, this.trailGroup, (enemy, ghost) => {
            enemy.destroy(); 
            
        }, null, this);
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
        this.trailTimer++;
        const isMoving = this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0;
        if (isMoving && this.trailTimer % 5 == 0) {
            this.spawnTrailGhost();
        }
    }
    handleGameOver() {
    if (this.isGameOver) return; 

    this.isGameOver = true;
    this.physics.pause(); 
    this.musicsound.stop();
    this.diesound.play({volume: 1.5});
    const screenCenter = { x: 512, y: 384 };
    this.statusText.setText("SYSTEM: FAILURE");
    this.add.text(screenCenter.x, screenCenter.y - 50, 'SYSTEM FAILURE', {
        fontSize: '64px',
        fill: '#ff0000',
        fontFamily: 'Arial Black'
    }).setOrigin(0.5);
    this.time.removeAllEvents();
    this.player.setTint(0xff0000); 
    this.add.text(screenCenter.x, screenCenter.y + 50, 'Click to Reboot', {
        fontSize: '32px',
        fill: '#ffffff'
    }).setOrigin(0.5);

    // Wait for click to restart
    this.input.once('pointerdown', () => {
        this.scene.restart();
        this.isGameOver = false;
    });
}
    spawnTrailGhost() {
    const ghost = this.trailGroup.create(this.player.x, this.player.y, "drone");
    
    // LAYER FIX: 
    ghost.setDepth(1);
    this.player.setDepth(10); 
    ghost.setScale(this.player.scale);
    ghost.setAlpha(0.5); 
    ghost.setTint(0x00ffff);
    const radius = (ghost.width * 0.2);
    ghost.body.setCircle(radius, (ghost.width / 2) - radius, (ghost.height / 2) - radius);

    this.tweens.add({
        targets: ghost,
        alpha: 0,
        duration: 1000, 
        onComplete: () => {
            ghost.destroy();
        }
    });
}


}
