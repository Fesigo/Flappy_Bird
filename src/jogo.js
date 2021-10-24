let frames = 0;

const hitSound = new Audio();
hitSound.src = './src/assets/sounds/hit.wav';
hitSound.volume = 0.4;

const jumpSound = new Audio();
jumpSound.src = './src/assets/sounds/pulo.wav';
jumpSound.volume = 0.4;

const sprites = new Image();
sprites.src = './src/assets/imgs/sprites.png';
const bird = new Image();
bird.src = './src/assets/imgs/bird.png'

const canvas = document.querySelector('canvas');
const contexto = canvas.getContext('2d');

canvas.width = 1366;
canvas.height = 657;

const client = new WebSocket('ws://localhost:3003');
client.onopen = function() {
    console.log('WebSocket working');
}

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
            jumpSound.play();
            flappyBird.velocidade = -flappyBird.pulo;
            client.send(flappyBird.velocidade);
        },
        gravidade: 0.25,
        velocidade: 0,
        atualiza() {
            if (collide(flappyBird, globais.land)) {

                hitSound.play();

                setTimeout(() => {
                    changeToScreen(screens.inicio);
                    client.send('died');
                }, 500);
                // changeToScreen(screens.gameOver);

                return;
            }

            flappyBird.velocidade += flappyBird.gravidade;
            flappyBird.y += flappyBird.velocidade;
        },
        movimentos: [
            { spriteX: 0,  spriteY: 0 }, // asa para cima
            { spriteX: 0,  spriteY: 24 }, // asa no meio
            { spriteX: 0,  spriteY:48 }, // asa para baixo
            { spriteX: 0,  spriteY: 24 }, // asa no meio
        ],
        currentFrame: 0,
        updateCurrentFrame() {

            const framesInterval = 10;

            if (frames % framesInterval === 0) {
                const incrementBase = 1;
                const increment = incrementBase + flappyBird.currentFrame;
                const repeatBase = flappyBird.movimentos.length;
                flappyBird.currentFrame = increment % repeatBase;
            }


        },
        desenha() {
            flappyBird.updateCurrentFrame();
            const { spriteX, spriteY } = this.movimentos[flappyBird.currentFrame];
            contexto.drawImage(
                bird,
                spriteX, spriteY, // Sprite X, Sprite Y
                flappyBird.largura, flappyBird.altura,  // Tamanho do recorte na sprite
                flappyBird.x, flappyBird.y,             // posição do pássaro no canvas
                flappyBird.largura, flappyBird.altura   // tamanho do pássaro no canvas
            );
        }
    }

    return flappyBird;

}

// Land
function createLand() {
    const chao = new Image();
    chao.src = './src/assets/imgs/land.png'
    const land = {
        spriteX: 0,
        spriteY: 0,
        largura: 336,
        altura: 112,
        x: 0,
        y: canvas.height -112,
        atualiza() {
            const landMovement = 1;

            const repeat = land.largura / 2;

            const movement = land.x - landMovement;

            land.x = movement % repeat;
        },
        desenha() {
            for(let i = 0; i * land.largura <= canvas.width * 2; i++) {
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

    return land;
}

function createPipes() {
    const pipes = {
        largura: 52,
        altura: 408,
        ground: {
            spriteX: 0,
            spriteY: 169
        },
        sky: {
            spriteX: 52,
            spriteY: 169
        },
        spaceBetween: 80,
        desenha() {
            
            pipes.pairs.forEach(pair => {
                const yRandom = pair.y;
                const spacementBetweenPipes = 140;

                const skyPipeX = pair.x;
                const skyPipeY = yRandom;

                // Cano de cima
                contexto.drawImage(
                    sprites,
                    pipes.sky.spriteX, pipes.sky.spriteY,
                    pipes.largura, pipes.altura,
                    skyPipeX, skyPipeY,
                    pipes.largura, pipes.altura
                )
    
                const groundPipeX = pair.x;
                const groundPipeY = pipes.altura + spacementBetweenPipes + yRandom;
    
                // Cano de baixo
                contexto.drawImage(
                    sprites,
                    pipes.ground.spriteX, pipes.ground.spriteY,
                    pipes.largura, pipes.altura,
                    groundPipeX, groundPipeY,
                    pipes.largura, pipes.altura
                )

                pair.skyPipe = {
                    x: skyPipeX,
                    y: pipes.altura + skyPipeY
                }
                pair.groundPipe = {
                    x: groundPipeX,
                    y: groundPipeY
                }
            })
        },

        hasCollisionWithBird(pair) {

            const flappyHead = globais.flappyBird.y;
            const flappyFoot = globais.flappyBird.y + globais.flappyBird.altura;

            if(globais.flappyBird.x + globais.flappyBird.largura >= pair.x && globais.flappyBird.x <= pair.x + pipes.largura) {

                if(flappyHead <= pair.skyPipe.y) {
                    return true;
                }

                if(flappyFoot >= pair.groundPipe.y) {
                    return true;
                }
            }

            return false;
        },

        pairs: [],
        atualiza() {
            const passed100Frames= frames % 100 == 0;
            if (passed100Frames) {
                pipes.pairs.push({
                    x:  window.location.pathname === '/screenright' ? canvas.width : canvas.width * 2 + 100,
                    // x: canvas.width,
                    // y: -150 * (Math.random() + 1),
                    y: -150 * 1.5,
                })
            }

            pipes.pairs.forEach(pair => {
                pair.x -= 2;

                if (pipes.hasCollisionWithBird(pair)) {
                    hitSound.play();
                    setTimeout(() => {
                        changeToScreen(screens.inicio);
                        client.send('died');
                    }, 500);
                    // changeToScreen(screens.gameOver);
                }

                if(pair.x + pipes.largura <= 0) {
                    pipes.pairs.shift();
                }
            })

        }

    }

    return pipes;
}

function createScore() {

    const score = {
        points: 0,

        desenha() {
            contexto.font = '60px "VT323"';
            contexto.textAlign = 'right'
            contexto.fillStyle = 'white'
            // contexto.fillText(`${score.points}`, 50, 70);
            contexto.fillText(`${score.points}`, canvas.width - 50, 70);
        },

        atualiza() {
            const framesInterval = 85;

            if (frames % framesInterval === 0) {
                score.points += 1;
            }
        }

    }

    return score;
}

// Background
const sky = new Image();
sky.src = './src/assets/imgs/sky.png'
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
getReady.src = './src/assets/imgs/splash.png'
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

// Game over screen
const gameOverMessage = {
    sX: 134,
    sY: 153,
    w: 226,
    h: 200,
    x: (canvas.width / 2) - 226 / 2,
    y: 100,
    desenha() {
        contexto.drawImage(
            sprites,
            gameOverMessage.sX, gameOverMessage.sY, 
            gameOverMessage.w, gameOverMessage.h,
            gameOverMessage.x, gameOverMessage.y,
            gameOverMessage.w, gameOverMessage.h
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
            globais.land = createLand();
            globais.pipes = createPipes();
            if(window.location.pathname === '/screenright') {
                globais.flappyBird.x -= canvas.width;
            } else {
                globais.pipes.x = canvas.width * 2
            }
        },
        desenha() {
            background.desenha();
            globais.flappyBird.desenha();
            globais.land.desenha();
            getReadyScreen.desenha();

            if(window.location.pathname === '/screenright') {
                getReadyScreen.x = ((canvas.width / 2) - 188 / 2) - canvas.width / 2;
            }
            else {
                getReadyScreen.x = ((canvas.width) - 188 / 2);
            }

            // if(window.location.pathname === '/screenright') {
            //     globais.flappyBird.x -= canvas.width
            // }
        },
        click() {
            changeToScreen(screens.jogo);
        },
        atualiza() {
            globais.land.atualiza();
        },
        initialScreen: true
    },

    jogo: {
        inicializa() {
            globais.score = createScore();
        },
        desenha() {
            background.desenha();
            globais.pipes.desenha();
            globais.land.desenha();
            globais.flappyBird.desenha();
            
            if(window.location.pathname === '/screenright') {
                globais.score.desenha();
                globais.flappyBird.x -= canvas.width
            }
        },
        click() {
            globais.flappyBird.jump();
        },
        atualiza() {
            globais.pipes.atualiza();
            globais.land.atualiza();
            globais.flappyBird.atualiza();
            globais.score.atualiza();
        }
    },

    gameOver: {
        desenha() {
            gameOverMessage.desenha();
        },
        atualiza() {

        },
        click() {
            changeToScreen(screens.inicio);
        }
    }
}

function loop() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    activeScreen.desenha();
    activeScreen.atualiza();
    
    frames++;
    requestAnimationFrame(loop);
}

function sendMessage() {
    client.send(globais.flappyBird.velocidade);
}

window.addEventListener('click', () => {
    if (activeScreen.click()) {
        activeScreen.click();
    }
    sendMessage();
});

changeToScreen(screens.inicio);

loop();

client.onmessage = event => {
    // console.log(event.data);
    if (activeScreen.initialScreen) changeToScreen(screens.jogo);
    if (event.data == 'died') changeToScreen(screens.inicio);
    globais.flappyBird.velocidade = -globais.flappyBird.pulo;
}