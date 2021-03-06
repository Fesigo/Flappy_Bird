import Background from './entities/background.js';
import FlappyBird from './entities/bird.js';
import Land from './entities/land.js';
import Pipes from './entities/pipes.js';
import Score from './entities/score.js';

let frames = 0; // frame counter

const hitSound = new Audio();
hitSound.src = './src/assets/sounds/hit.wav';
hitSound.volume = 0.4;

const sprites = new Image();
sprites.src = './src/assets/imgs/sprites.png';
const bird = new Image();
bird.src = './src/assets/imgs/bird.png'

const canvas = document.querySelector('canvas');
const contexto = canvas.getContext('2d');

canvas.width = 1366;
canvas.height = 657;

// client connected
const client = new WebSocket('ws://localhost:3003');
client.onopen = function() {
    console.log('WebSocket working');
}

// function to create a flappybird object
function createFlappyBird() {

    // Bird
    const flappyBird = new FlappyBird();

    // function to update the bird's Y
    flappyBird.atualiza = () => {

        // checking collision
        if (flappyBird.collide(flappyBird, globais.land)) {

            if (window.location.pathname !== '/screenright') {
                hitSound.play();
                setTimeout(() => {
                    changeToScreen(screens.inicio);
                    client.send('died');
                }, 500);
                // changeToScreen(screens.gameOver);
            }


            return;
        }

        flappyBird.velocidade += flappyBird.gravidade;
        flappyBird.y += flappyBird.velocidade;
    }

    // changing the bird's sprite according to the frames
    flappyBird.updateCurrentFrame = () => {

        const framesInterval = 10;

        if (frames % framesInterval === 0) {
            const incrementBase = 1;
            const increment = incrementBase + flappyBird.currentFrame;
            const repeatBase = flappyBird.movimentos.length;
            flappyBird.currentFrame = increment % repeatBase;
        }

    }

    // function to draw the bird in the canvas
    flappyBird.desenha = () => {
        flappyBird.updateCurrentFrame();
        const { spriteX, spriteY } = flappyBird.movimentos[flappyBird.currentFrame];
        contexto.drawImage(
            bird,
            spriteX, spriteY,
            flappyBird.largura, flappyBird.altura,
            flappyBird.x, flappyBird.y,
            flappyBird.largura, flappyBird.altura
        );
    }

    return flappyBird;
}

// function to create a land object
function createLand() {
    // Land
    const chao = new Image();
    chao.src = './src/assets/imgs/land.png'
    const land = new Land(canvas.height);

    // function to draw the land in the canvas
    land.desenha = () => {
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

    return land;
}

// function to create pipes objects
function createPipes() {
    const pipes = new Pipes();

    // function to draw the pairs of pipes in the canvas
    pipes.desenha = () => {
        
        pipes.pairs.forEach(pair => {
            const yRandom = pair.y;
            const spacementBetweenPipes = 100;

            const skyPipeX = pair.x;
            const skyPipeY = yRandom;

            // top pipe
            contexto.drawImage(
                sprites,
                pipes.sky.spriteX, pipes.sky.spriteY,
                pipes.largura, pipes.altura,
                skyPipeX, skyPipeY,
                pipes.largura, pipes.altura
            )

            const groundPipeX = pair.x;
            const groundPipeY = pipes.altura + spacementBetweenPipes + yRandom;

            // bottom pipe
            contexto.drawImage(
                sprites,
                pipes.ground.spriteX, pipes.ground.spriteY,
                pipes.largura, pipes.altura,
                groundPipeX, groundPipeY,
                pipes.largura, pipes.altura
            )

            // adjusting the height of the pipes according to the ground and the sky
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

    // function to check the collision between the bird and the pipes
    pipes.hasCollisionWithBird = (pair) => {

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
    }

    // function to update the position of the pipes
    pipes.atualiza = () => {
        const passed100Frames= frames % 100 == 0;
        if (passed100Frames) { // drawing nem pair of pipes every 100 frames

            let pipeAux = pipes.pairsAux.shift(); // removing the first pipe of the predefined array
            pipeAux.x = window.location.pathname === '/screenright' ? canvas.width : canvas.width * 2 + 100 // setting its X position according to the screen that is being used
            pipes.pairs.push(pipeAux); // pushing the pair of pipe into the pairs array, that will be used to draw the pipes
            pipes.pairsAux.push({ // pushing the removed pair back at the end of the predefined array
                x: null,
                y: pipeAux.y
            });
        }

        // changing the pairs X position / animating the pipes
        pipes.pairs.forEach(pair => {
            pair.x -= 2;

            // checking collision between the bird and the pipe
            if (pipes.hasCollisionWithBird(pair)) {
                if (window.location.pathname !== '/screenright') {
                    hitSound.play();
                    setTimeout(() => {
                        changeToScreen(screens.inicio);
                        client.send('died');
                    }, 500);
                    // changeToScreen(screens.gameOver);
                }
            }

            // if(pair.x + pipes.largura <= 0) {
            //     pipes.pairs.shift();
            // }
        })

    }

    return pipes;
}

// function to create the score object
function createScore() {

    const score = new Score();

    // function to draw the score in the canvas
    score.desenha = () => {
        contexto.font = '60px "VT323"';
        contexto.textAlign = 'right'
        contexto.fillStyle = 'white'
        // contexto.fillText(`${score.points}`, 50, 70);
        contexto.fillText(`${score.points}`, canvas.width - 50, 70);
    },

    // function to update the score value
    score.atualiza = () => {
        // const framesInterval = 85;

        // if (frames % framesInterval === 0) {
        //     score.points += 1;
        // }

        globais.pipes.pairs.forEach(pair => {
    
            if(globais.flappyBird.x + globais.flappyBird.largura == pair.x + globais.pipes.largura) {
    
                // console.log(score.points);
                score.points += 1;
                client.send(globais.score.points);
            }
        })
    }

    return score;
}

// Background
const sky = new Image();
sky.src = './src/assets/imgs/sky.png'
const background = new Background(canvas.height);

// drawing the background in the canvas
background.desenha = () => {

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

    // drawing the initial screen in the canvas
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

// Game over screen (WIP)
const gameOverMessage = {
    sX: 134,
    sY: 153,
    w: 226,
    h: 200,
    x: (canvas.width / 2) - 226 / 2,
    y: 100,

    // drawing the game over message in the canvas
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

const globais = {}; // object the keeps all the other objects created
let activeScreen = {}; // object that defines the active screen in the game

// function to change between the screens
function changeToScreen(newScreen) {
    activeScreen = newScreen;

    if (activeScreen.inicializa) {
        activeScreen.inicializa();
    }
}

// screens of the game
const screens = {
    
    // initial screen
    inicio: {
        // function to the objects it needs in the begging
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

        // function to draw the objects created
        desenha() {
            background.desenha();
            globais.flappyBird.desenha();
            globais.land.desenha();
            getReadyScreen.desenha();

            // positioning the getReadyScreen according to the browser's window
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

        // function to change from the initial screen to the game's screen when clicked
        click() {
            changeToScreen(screens.jogo);
        },

        // updating the ground X position
        atualiza() {
            globais.land.atualiza();
        },
        initialScreen: true
    },

    // game screen
    jogo: {
        // creating the score
        inicializa() {
            globais.score = createScore();
        },

        // drawing the games objects
        desenha() {
            background.desenha();
            globais.pipes.desenha();
            globais.land.desenha();
            globais.flappyBird.desenha();
            
            // positioning the bird and the score according to the browser's window
            if(window.location.pathname === '/screenright') {
                globais.score.desenha();
                globais.flappyBird.x -= canvas.width
            }
        },
        // function to make the bird jump when clicked
        click() {
            globais.flappyBird.jump();
        },

        // updating the game's objects
        atualiza() {
            globais.pipes.atualiza();
            globais.land.atualiza();
            globais.flappyBird.atualiza();
            globais.score.atualiza();
        }
    },

    // game over screen (WIP)
    gameOver: {
        // drawing the game over screen
        desenha() {
            gameOverMessage.desenha();
        },
        atualiza() {

        },
        // changing to the initial screen when clicked
        click() {
            changeToScreen(screens.inicio);
        }
    }
}

// game loop
function loop() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // executing the function that draws the objects needed in the active screen
    activeScreen.desenha();
    // executing the function that updates the objects in the active screen
    activeScreen.atualiza();
    
    frames++; // incrementing frame counter
    requestAnimationFrame(loop);
}

// // sending flappyBird.velocidade through websocket connection
// function sendMessage() {
//     client.send('jump');
//     // client.send(globais.score.points);
// }


// window.addEventListener('click', () => {
//     // checks if the current screen has a click function and the executes it
//     if (activeScreen.click()) {
//         activeScreen.click();
//     }
//     sendMessage();
// });

changeToScreen(screens.inicio); // beggining with the initial screen

loop(); // starting the loop

// receiving messages from the server
client.onmessage = event => {
    // console.log(event.data);
    if (activeScreen.initialScreen) changeToScreen(screens.jogo); // changing from the initial screen to the game screen in all clients connected
    if (event.data == 'died') changeToScreen(screens.inicio); // changing from the game screen to the initial screen in all clients connected, when the bird dies
    if (event.data == 'jump') {
        if (activeScreen.click()) {
            activeScreen.click();
        }
        globais.flappyBird.velocidade = -globais.flappyBird.pulo; // updating the bird's Y position in all clients connected
    }
    if (!isNaN(event.data)) globais.score.points = Number(event.data);
}