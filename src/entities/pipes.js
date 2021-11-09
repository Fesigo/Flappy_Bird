class Pipes {

    constructor() {
        this.largura = 52;
        this.altura = 408;
        this.ground = {
            spriteX: 0,
            spriteY: 169
        };
        this.sky = {
            spriteX: 52,
            spriteY: 169
        };
        this.spaceBetween = 80;
        this.pairs = [];
        this.pairsAux = [ // predefined array of pipes
            {
                x: null,
                y: -225
            },
            {
                x: null,
                y: -150
            },
            {
                x: null,
                y: -150 * 1.8
            },
            {
                x: null,
                y: -150 * 1.4
            },
            {
                x: null,
                y: -150 * 2
            },
            {
                x: null,
                y: -150 * 1.1
            },
            {
                x: null,
                y: -150 * 1.7
            },
            {
                x: null,
                y: -150 * 1.3
            },
            {
                x: null,
                y: -150 * 1.5
            },
            {
                x: null,
                y: -150
            },
            {
                x: null,
                y: -150 * 1.8
            },
            {
                x: null,
                y: -125
            }
        ]
    }

}

export default Pipes;