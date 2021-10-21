const express = require('express');

const app = express();
app.use(express.json());

// const flappyBird = require('./jogo');
// app.use('/flappy', jogo);

const port = 3003;

app.listen(port, () => console.log(`Server started on port ${port}`));