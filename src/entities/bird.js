const jumpSound = new Audio();
jumpSound.src = './src/assets/sounds/pulo.wav';
jumpSound.volume = 0.4;

class FlappyBird {

    constructor() {
        this.spriteX = 0;
        this.spriteY = 0;
        this.largura = 34;
        this.altura = 24;
        this.x = 250;
        this.y = 200;
        this.pulo = 4.6;
        this.gravidade = 0.25;
        this.velocidade = 0;
        // array of sprites of the bird in different positions to make the flying animation
        this.movimentos = [
            { spriteX: 0,  spriteY: 0 }, // wings up
            { spriteX: 0,  spriteY: 24 }, // wings in the middle
            { spriteX: 0,  spriteY:48 }, // wings down
            { spriteX: 0,  spriteY: 24 }, // wings in the middle
        ];
        this.currentFrame = 0;
    }

    // function that implements the bird's jump
    jump() {
        jumpSound.play();
        this.velocidade = -this.pulo;
        // client.send(this.velocidade);
    }

    //function to check the collision between the bird and the land
    collide(flappyBird, land) {

        const birdY = flappyBird.y + flappyBird.altura;
        const landY = land.y;

        if (birdY >= landY) {
            return true;
        }

        return false;

    }

}

export default FlappyBird;