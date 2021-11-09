class Land {

    constructor(canvasHeight) {
        this.spriteX = 0;
        this.spriteY = 0;
        this.largura = 336;
        this.altura = 112;
        this.x = 0;
        // this.y = canvas.height -112;
        // this.y = 657 -112;
        this.y = canvasHeight -112;
    }

    // function to update the land's X, making the animation
    atualiza() {
        const landMovement = 1;

        const repeat = this.largura / 2;

        const movement = this.x - landMovement;

        this.x = movement % repeat;
    }

}

export default Land;