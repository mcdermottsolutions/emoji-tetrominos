let block = require("./block.js");

(function(){

  // init vars
  const canvas = document.getElementById("canvas"),
      ctx = canvas.getContext("2d"),
      canWidth = canvas.width,

      // "Pixel" is unit of height/width, 1/10 width of board.
      // Each block is made of 4 pixels.
      pixel = canWidth / 10.0;

      // frame counter (needed for block entrance timing)
    let frame = 0,
      falling,

      // 2d array of board layout for keeping track
      // of all "landed" blocks.
      // Landed blocks are blocks that have hit
      // the floor or hit other blocks collected at bottom.
      //
      // landed array is all 0's to start, since no
      // blocks have hit the floor.  Every coordinate
      // with a landed block will gets a 1.
      landed = [
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0]
      ];

      // init blocks

  // function defs
  // helper functions - draw boxes & text to correct scale
  function strokeRec(x, y, w, h) {
    ctx.strokeRect(x * pixel, y * pixel, w * pixel, h * pixel);
  }
  function fillText(text, x, y) {
    ctx.font="18px Georgia";
    ctx.fillText(text, (x + 0.25) * pixel, (y + 0.75) * pixel);
  }
  function drawPixel(x, y) {
    ctx.fillRect(x * pixel, y * pixel, 1 * pixel, 1 * pixel);
  }
  function drawBlock(coords, numPix) {
    for (let i=0; i<numPix; i++) {
      ctx.fillRect(coords[i][0] * pixel, coords[i][1] * pixel, 1 * pixel, 1 * pixel);
    }
  }

  // add a numbered grid to board.  for debugging
  function makeGrid() {
    for (let i=0; i<10; i++) {
      strokeRec(i, 0, 1, 20);
    }
    for (let i=0; i<20; i++) {
      strokeRec(0, i, 10, 1);
    }
    for (let i=0; i<20; i++) {
      fillText(i, 0, i);
    }
    for (let i=1; i<10; i++) {
      fillText(i, i, 0);
    }
  }

  // move the falling block down
  function moveDown() {

    if (falling) {

      // lower the block
      for (let i=0; i<falling.coords.length; i++) {
        falling['coords'][i][1]++;
      }
      // for (let i=0; i<falling.coords.length; i++) {
      //   falling['coords'][i][1]++;
      // }

      // check if block is touching bottom now
      var touchingFloor = false;
      for (let i=0; i<falling.coords.length && touchingFloor===false; i++) {
        if (falling['coords'][i][1] === 19) {
          touchingFloor = true;
        }
      }

      // if at floor or , add block's pixels to landed array
      if (touchingFloor) {
        for (let coords of falling.coords) {
          const [ x, y ] = coords;
          landed[y][x] = 1;
        }
        falling = null;
      } else {

        // check if touching another block
        // (this approach to collision detection from https://gamedevelopment.tutsplus.com/tutorials/implementing-tetris-collision-detection--gamedev-852 )
        let collision = false;
        for (let coords of falling.coords) {
          const [ x, y ] = coords;
          if (landed[ y + 1 ][ x ] === 1) {
            collision = true;
          }

          if (collision) {
            for (let coords of falling.coords) {
              const [ x, y ] = coords;
              landed[y][x] = 1;
            }
            //falling = new Block['i'](0,0);
            falling = null;
            return;
          }
        }
      }
    }
  }

  function moveSide(direction) {

    if (direction === 'left') {
      // if not at left edge, move left
      let firstPixel = falling['coords'][0];
      if (firstPixel[0] > 0) {
        for (let i=0; i<falling.coords.length; i++) {
          falling['coords'][i][0]--;
        }
      }
    }

    if (direction === 'right') {
      // if not at right edge, move right
      let length = falling.coords.length;
      let lastPixel = falling['coords'][length-1];
      if (lastPixel[0] < 9) {
        for (let i=0; i<falling.coords.length; i++) {
          falling['coords'][i][0]++;
        }
      }
    }

  }

  // rotate block
  function rotate() {
    // todo: add collision detection
    falling.rotate();
  }

  // clear the whole board each frame to redraw all pieces in new pos
  function clearBoard() {
    ctx.clearRect(0,0,10*pixel,20*pixel);
  }

  // draw all pieces that have hit the bottom
  // (this set grows as new pieces hit the bottom)
  function drawLanded() {
    for (let i=0; i<landed.length; i++) {
      for (let j=0; j<landed[i].length; j++) {
        if (landed[i][j] === 1) {
          drawPixel(j,i);
        }
      }
    }
  }

  // spawns new block at top
  // (todo: x-pos will be random & will account for block width
  //        so not over either edge)
  // this falling var couldn't be seen by the other functions
  // (scoping issues), so scrapping for now...
  // function spawnBlock() {
  //   falling = new Block('i', 0, 0);
  // }



  // process all keystrokes
  function processKeystroke(key) {

    if (!falling) {
      return;
    }

    // move block keyboard input
    switch (key) {

      case 38:  // up arrow
        rotate();
        break;
      case 40:  // down arrow
        moveDown();
        break;
      case 39:  // right arrow
        moveSide('right');
        break;
      case 37:  // left arrow
        moveSide('left');
        break;
    }

  }

  // function drawOnEvent(e) {
  //   draw();
  //   e.preventDefault();
  // }

  // main draw loop (calls itself recursively at end)
  function draw() {
    if (frame % 100 === 0) {
      if (!falling) {
        falling = new block('i', 0, 0);
      } else {
        moveDown();
      }
    }
    clearBoard();
    makeGrid();
    drawLanded();
    if (falling) {
      drawBlock(falling['coords'],falling['numPix']);
    }
    frame++;
    requestAnimationFrame(draw);
  }



  // event listeners
  // for testing - "next" button below board
  // (make sure moveDown() in draw() is uncommented)
  // document.getElementById("next").addEventListener("click", drawOnEvent);

  // event listener for all keystrokes
  document.onkeydown = function(e) {
    processKeystroke(e.keyCode);
  };




  falling = new block('i', 0, 0);  // drop first block
  draw();  // call main draw loop



})();
