(function(){

  // init vars
  var canvas = document.getElementById("canvas"),
      ctx = canvas.getContext("2d"),
      canWidth = canvas.width,
      pixel = canWidth / 10.0, // unit for width, 1/10 width of board
      frame = 0,
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
      ],

      // init blocks
      // using letter names for blocks, see http://i.imgur.com/9Z0oJXe.png
      Block = {
        i: function(x,y){
          this.form = [
            [1,1,1,1]
          ];
          this.height = 1;
          this.width = 3;
          this.num = 4;
          this.initPos = [x,y];
          this.coords = [
            [x,y],[x+1,y],[x+2,y],[x+3,y]
          ];
          this.positions = [
            [ [x,y],[x+1,y],[x+2,y],[x+3,y] ],
            [ [x+1,y-1],[x+1,y],[x+1,y+1],[x+1,y+2] ],
            [ [x,y],[x,y],[x,y],[x,y] ]
          ];
          this.position = 0;
        }
      };

  // helper functions - draw boxes & text to correct scale
  function strokeRec(x,y,w,h) {
    ctx.strokeRect(x*pixel,y*pixel,w*pixel,h*pixel);
  }
  function fillText(text,x,y) {
    ctx.font="18px Georgia";
    ctx.fillText(text,(x+0.25)*pixel,(y+0.75)*pixel);
  }
  function drawPixel(x,y) {
    ctx.fillRect(x*pixel,y*pixel,1*pixel,1*pixel);
  }
  function drawBlock(coords,num) {
    for (var i=0; i<num; i++) {
      ctx.fillRect(coords[i][0]*pixel,coords[i][1]*pixel,1*pixel,1*pixel);
    }
  }

  // add a numbered grid to board.  for debugging
  function makeGrid() {
    for (var i=0; i<10; i++) {
      strokeRec(i,0,1,20);
    }
    for (var i=0; i<20; i++) {
      strokeRec(0,i,10,1);
    }
    for (var i=0; i<20; i++) {
      fillText(i,0,i);
    }
    for (var i=1; i<10; i++) {
      fillText(i,i,0);
    }
  }

  // move the falling block down
  function moveDown() {

    if (falling) {

      // lower the block
      for (var i=0; i<falling['coords'].length; i++) {
        falling['coords'][i][1]++;
      }

      // check if block is touching bottom now
      var touchingFloor = false;
      for (var i=0; i<falling['coords'].length && touchingFloor===false; i++) {
        if (falling['coords'][i][1] === 19) {
          touchingFloor = true;
        }
      }

      // if at floor or , add block's pixels to landed array
      if (touchingFloor) {
        for (var i=0; i<falling['coords'].length; i++) {
          var x = falling['coords'][i][0];
          var y = falling['coords'][i][1];
          landed[y][x] = 1;
        }
        //falling = new Block['i'](0,0);
        falling = null;
      } else {

        // check if touching another block
        var collision = false;
        for (var i=0; i<falling['coords'].length; i++) {
          var x = falling['coords'][i][0];
          var y = falling['coords'][i][1] + 1;
          if (landed[y][x] === 1) {
            collision = true;
          }

          if (collision) {
            for (var i=0; i<falling['coords'].length; i++) {
              var x = falling['coords'][i][0];
              var y = falling['coords'][i][1];
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
      var firstPixel = falling['coords'][0];
      if (firstPixel[0] > 0) {
        for (var i=0; i<falling['coords'].length; i++) {
          falling['coords'][i][0]--;
        }
      }
    }

    if (direction === 'right') {
      // if not at right edge, move right
      var length = falling['coords'].length;
      var lastPixel = falling['coords'][length-1];
      if (lastPixel[0] < 9) {
        for (var i=0; i<falling['coords'].length; i++) {
          falling['coords'][i][0]++;
        }
      }
    }

  }

  // clear the whole board each frame to redraw all pieces in new pos
  function clearBoard() {
    ctx.clearRect(0,0,10*pixel,20*pixel);
  }

  function drawLanded() {
    for (var i=0; i<landed.length; i++) {
      for (var j=0; j<landed[i].length; j++) {
        if (landed[i][j] === 1) {
          drawPixel(j,i);
        }
      }
    }
  }

  function spawnBlock() {
    falling = new Block['i'](0,0);
  }

  function rotate(x,y) {
    falling.position++;
    console.log(falling.position);
    var position = falling.position;
    for (var i=0; i<falling.num; i++) {
      var newX = falling['positions'][position][i][0];
      var newY = falling['positions'][position][i][1];
      falling['coords'][i][0] = newX;
      falling['coords'][i][1] = newY;
    }
  }

  function processKeystroke(key){

    console.log(key);

    // move block keyboard input
    if (falling) {
      switch (key) {
        case 38:
          rotate(falling['coords'][0][0],falling['coords'][0][1]);
        case 40:
          moveDown();
          break;
        case 39:
          moveSide('right');
          break;
        case 37:
          moveSide('left');
          break;
      }
    }

  }

  var falling = new Block['i'](0,0);

  function draw() {
    if (frame % 100 === 0) {
      if (!falling) {
        spawnBlock();
      } else {
        moveDown();
      }
    }
    clearBoard();
    makeGrid();
    drawLanded();
    if (falling) {
      drawBlock(falling['coords'],falling['num']);
    }
    frame++;
    requestAnimationFrame(draw);
  }

  draw();

  function drawOnEvent(e) {
    draw();
    e.preventDefault();
  }

  document.getElementById("next").addEventListener("click", drawOnEvent);

  document.onkeydown = function(e) {
    processKeystroke(e.keyCode);
  };

})();
