const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.scale(20,20);

function arenaSweep() {
  let rowCounter = 1;
  outer: for (let y = arena.length - 1; y > 0; --y){
    for (let x = 0; x < arena[y].length; ++x){
       if(arena[y][x] === 0){
         continue outer;
       }
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;

    player.score += rowCounter * 10;
    rowCounter *= 2;
  }
}

function collides(player, arena) {
  const [m,o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; ++y){
    for (let x = 0; x < m[y].length; ++x){
      if (m[y][x] !== 0 &&
          (arena[y + o.y] &&
          arena[y + o.y][x + o.x]) !== 0 ){
          return true;
      }
    }
  }
  return false;
}

const colors = [
    null,
    'red',
    'blue',
    'green',
    'purple',
    'yellow',
    'pink',
    'orange'
];

function createMatrix(w,h) {
  const matrix = [];
  while (h--){
    matrix.push(new Array(w).fill(0))
  }
  return matrix;
}

function createPiece(type) {
  switch (type){
    case 'O':
      return [
        [2, 2],
        [2, 2],
      ];
    case 'I':
      return [
        [0, 3, 0 ,0],
        [0, 3, 0, 0],
        [0, 3, 0, 0],
        [0, 3, 0, 0],
      ];
    case 'S':
      return [
        [0, 4, 4],
        [4, 4, 0],
        [0, 0, 0],
      ];
    case 'Z':
      return [
        [5, 5, 0],
        [0, 5, 5],
        [0, 0, 0],
      ];
    case 'L':
      return [
        [0, 6, 0],
        [0, 6, 0],
        [0, 6, 6],
      ];
    case 'J':
      return [
        [0, 7, 0],
        [0, 7, 0],
        [7, 7, 0],
      ];
    case 'T':
      return [
        [0, 0, 0],
        [1 , 1, 1],
        [0, 1, 0],
      ];
  }
}

function draw(){
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawMatrix(arena, {x: 0, y: 0});
  drawMatrix(player.matrix, player.pos);
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0){
        //let color = colors[Math.floor(Math.random()*colors.length)]; //epileptic color change
        context.fillStyle = colors[value];
        context.fillRect(x + offset.x,
                         y + offset.y, 1, 1,);
      }
    });
  });
}

function merge(player,arena) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    })
  })
}

function playerDrop() {
  player.pos.y++;
  if(collides(player, arena)){
    player.pos.y--;
    merge(player,arena);
    playerReset();
    arenaSweep();
    updateScore();
  }
  dropCounter = 0;
}

function playerMove(dir) {
  player.pos.x += dir;
  if(collides(player,arena)){
    player.pos.x -= dir;
  }
}

function playerReset() {
  const pieces = 'OISZLJT';
  player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0)-
                  (player.matrix[0].length / 2 | 0);
  if (collides(player,arena)){
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
  }
}

function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while (collides(player ,arena)){
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if(offset > player.matrix[0].length){
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y){
    for (let x = 0; x < y; ++x){
      [
          matrix[x][y],
          matrix[y][x],
      ] = [
          matrix[y][x],
          matrix[x][y],
      ]
    }
  }
  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

function updateScore() {
  document.getElementById('score').innerText = player.score;
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;
function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;
  if(dropCounter > dropInterval){
    playerDrop();
  }

  draw();
  requestAnimationFrame(update);
}

const arena = createMatrix(12,20);

const player = {
      pos: {x: 0, y: 0},
      matrix:  createPiece(null),
      score: 0,
};


document.addEventListener('keydown', event => {
  switch (event.keyCode){
    case 37:
      playerMove(-1);
      break;
    case 39:
      playerMove(1);
      break;
    case 40:
      playerDrop();
      break;
    case 81:
      playerRotate(-1);
      break;
    case 87:
      playerRotate( 1);
      break;
  }
});


playerReset();
updateScore();
update();

