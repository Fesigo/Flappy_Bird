const hitSound = new Audio();
hitSound.src = './assets/sounds/hit.wav';

const sprites = new Image();
sprites.src = './assets/imgs/sprites.png';
const bird = new Image();
bird.src = './assets/imgs/bird.png'

const canvas = document.querySelector('canvas');
const contexto = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function collide(flappyBird, land) {

    const birdY = flappyBird.y + flappyBird.altura;
    const landY = land.y;

    if (birdY >= landY) {
        return true;
    }

    return false;

}

function createFlappyBird() {

    // Bird
    const flappyBird = {
        spriteX: 0,
        spriteY: 0,
        largura: 34,
        altura: 24,
        x: 250,
        y: 200,
        pulo: 4.6,
        jump() {
            flappyBird.velocidade = -flappyBird.pulo;
        },
        gravidade: 0.25,
        velocidade: 0,
        atualiza() {
            if (collide(flappyBird, land)) {

                hitSound.play();

                setTimeout(() => {
                    changeToScreen(screens.inicio);
                }, 500);

                return;
            }

            flappyBird.velocidade += flappyBird.gravidade;
            flappyBird.y += flappyBird.velocidade;
        },
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

    return flappyBird;

}

// Land
const chao = new Image();
chao.src = './assets/imgs/land.png'
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
sky.src = './assets/imgs/sky.png'
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

// Initial screen
const getReady = new Image();
getReady.src = './assets/imgs/splash.png'
const getReadyScreen = {
    sX: 0,
    sY: 0,
    w: 188,
    h: 170,
    x: (canvas.width / 2) - 188 / 2,
    y: 100,
    desenha() {
        contexto.drawImage(
            getReady,
            getReadyScreen.sX, getReadyScreen.sY, 
            getReadyScreen.w, getReadyScreen.h,
            getReadyScreen.x, getReadyScreen.y,
            getReadyScreen.w, getReadyScreen.h
        )
    }
}

/**
 * Telas
*/

const globais = {};
let activeScreen = {};
function changeToScreen(newScreen) {
    activeScreen = newScreen;

    if (activeScreen.inicializa) {
        activeScreen.inicializa();
    }
}

const screens = {
    
    inicio: {
        inicializa() {
            globais.flappyBird = createFlappyBird();
        },
        desenha() {
            background.desenha();
            land.desenha();
            globais.flappyBird.desenha();
            getReadyScreen.desenha();
        },
        click() {
            changeToScreen(screens.jogo);
        },
        atualiza() {

        }
    },
    jogo: {
        desenha() {
            background.desenha();
            land.desenha();
            globais.flappyBird.desenha();
        },
        click() {
            globais.flappyBird.jump();
        },
        atualiza() {
            globais.flappyBird.atualiza();
        }
    },
}

function loop() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    activeScreen.desenha();
    activeScreen.atualiza();
    
    requestAnimationFrame(loop);
}

window.addEventListener('click', () => {
    if (activeScreen.click()) {
        activeScreen.click();
    }
});

changeToScreen(screens.inicio);

console.log(activeScreen);
loop();