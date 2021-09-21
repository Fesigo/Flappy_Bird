const sprites = new Image();
sprites.src = './imgs/sprites.png';
const bird = new Image();
bird.src = './imgs/bird.png'

const canvas = document.querySelector('canvas');
const contexto = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Bird
const flappyBird = {
    spriteX: 0,
    spriteY: 0,
    largura: 34,
    altura: 24,
    x: 250,
    y: 200,
    desenha() {
        contexto.drawImage(
            bird,
            flappyBird.spriteX, flappyBird.spriteY, // Sprite X, Sprite Y
            flappyBird.largura, flappyBird.altura,  // Tamanho do recorte na sprite
            flappyBird.x, flappyBird.y,             // posição do pássaro no canvas
            flappyBird.largura, flappyBird.altura   // tamanho do pássaro no canvas
        );
    }
}

// Land
const chao = new Image();
chao.src = './imgs/land.png'
const land = {
    spriteX: 0,
    spriteY: 0,
    largura: 336,
    altura: 112,
    x: 0,
    y: canvas.height -112,
    // x: 250,
    // y: 200,
    desenha() {
        for(let i = 0; i * land.largura <= canvas.width; i++) {
            contexto.drawImage(
                chao,
                land.spriteX, land.spriteY, 
                land.largura, land.altura,
                land.x + (i * land.largura), land.y,
                land.largura, land.altura
            )
        }
    }
}

// Background
const sky = new Image();
sky.src = './imgs/sky.png'
const background = {
    spriteX: 0,
    spriteY: 0,
    largura: 276,
    altura: 109,
    x: 0,
    y: canvas.height - 221,
    desenha() {

        contexto.fillStyle = '#4ec0ca';
        contexto.fillRect(0,0, canvas.width, canvas.height);

        for(let i = 0; i * background.largura <= canvas.width; i++) {
            contexto.drawImage(
                sky,
                background.spriteX, background.spriteY,
                background.largura, background.altura,
                background.x + i * background.largura, background.y,
                background.largura, background.altura
            );
        }
    }
}

function loop() {


    background.desenha();
    land.desenha();
    flappyBird.desenha();
    
    requestAnimationFrame(loop);
}

loop();