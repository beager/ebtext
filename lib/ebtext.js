$(document).ready(function() {
  $('#tabs a').click(function (e) {
    e.preventDefault()
    $(this).tab('show')
  })
  var canvas = document.getElementById('bitmap');
  var context = canvas.getContext('2d');

  var textbox = {};

  var textplain = new Image(); textplain.src = 'assets/textplain.png';
  var textflavored = new Image(); textflavored.src = 'assets/textflavored.png';

  var flavors = ['plain','mint','strawberry','banana','peanut'];

  var flavor_assets = {};

  var current_flavor = null;

  for (var i in flavors) {
    flavor_assets[flavors[i]] = {
      arrowsm: new Image(),
      arrowbig: new Image(),
      dialog: new Image(),
    };

    flavor_assets[flavors[i]].arrowsm.src = 'assets/flavors/' + flavors[i] + '/arrowsm.png';
    flavor_assets[flavors[i]].arrowbig.src = 'assets/flavors/' + flavors[i] + '/arrowbig.png';
    flavor_assets[flavors[i]].dialog.src = 'assets/flavors/' + flavors[i] + '/dialog.png';

    if (flavors[i] == 'plain') {
      flavor_assets[flavors[i]].glyphs = textplain;
    } else {
      flavor_assets[flavors[i]].glyphs = textflavored;
    }
  }

  console.log(flavor_assets);

  textbox.vanilla = new Image();
  textbox.glyphs = new Image();
  textbox.arrow_sm = new Image();
  textbox.arrow_lg = new Image();
  textbox.vanilla.src = 'assets/flavors/mint/dialog.png';
  textbox.glyphs.src = 'assets/textflavored.png';
  textbox.arrow_sm.src = 'assets/flavors/mint/arrowsm.png';
  textbox.arrow_lg.src = 'assets/flavors/mint/arrowbig.png';

  var orig_width = 152;
  var orig_height = 64;

  var scale = 1;

  var blog_width = 456;

  var coeff = 4;

  var c_width = Math.ceil(orig_width * coeff);
  var c_height = Math.ceil(orig_height * coeff);

  var diX = 960;
  var diY = 256;
  var text_print_delay = 30;

  var encoder;

  var end_delay = 1500;
  var print_delay = 30;

  var selected_flavor = 'plain';

  $('#generate').click(function() {
    $('.loader').addClass('loading');
    document.getElementById('image').src = '';

    print_delay = $('input:radio[name=speed]:checked').val();

    selected_flavor = $('input:radio[name=flavor]:checked').val();

    encoder = new GIF({
      workers: 8,
      quality: 10,
      height: c_height,
      width: c_width,
      workerScript: '../gif.js/dist/gif.worker.js',
      background: '#000',
      transparent: 0x00FF00
    });
    canvas.width = c_width;
    canvas.height = c_height;

    context.mozImageSmoothingEnabled = false;
    context.webkitImageSmoothingEnabled = false;

    encoder.on('finished', function(blob) {
      document.getElementById('image').src = URL.createObjectURL(blob);
      $('.loader').removeClass('loading');
    });
    processText();
    encoder.render();

    return false;   
  });

  var glyph_separator = { x: 16, y: 24 };
  var glyph_height = 16;
  var glyph_width = 16;
  var glyph_image_start = {x: 24, y: 28};

  function processText() {
    var lastCmd = '';
    var textState = {
      lines: [[]],
      delay: 50
    };
    var text = $('#text').val();

    var should_draw = false;
    for (var i = 0; i < text.length; i++) {
      should_draw = true;
      switch(text[i]) {
        case '[':
          var cmd = '';
          while (text[++i] != ']') {
            cmd += text[i];
          }
          var args = cmd.split(' ');
          switch(args[0]) {
            case 'LINE':
              addLine(textState);
              should_draw = false;
              lastCmd = 'LINE';
              break;
            case 'DELAY':
              addDelay(textState, args[1]);
              lastCmd = 'DELAY';
              break;
            case 'PAUSE':
              addPause(textState);
              lastCmd = 'PAUSE';
              break;
            default:
              should_draw = false;
          }
          break;
        default:
          textState.delay = print_delay; 
          var lineNumber = textState.lines.length - 1;
          textState.lines[lineNumber].push(text[i]);
      }
      if (should_draw) drawScene(textState);
    }
    if (lastCmd == 'PAUSE') {
      addPause(textState);
    } else {
      textState.delay = end_delay;
      drawScene(textState);
    }
  }

  function drawScene(textState, pause) {
    pause = pause || false;
    context.fillStyle = "rgba(0,255,0,1)";  
    context.fillRect(0,0,canvas.width, canvas.height);

    var lines = textState.lines.slice(-3);

    // draw the text box
    context.drawImage(flavor_assets[selected_flavor].dialog, 0, 0, c_width - 32, c_height - 32, 0, 0, c_width - 32, c_height - 32);
    context.drawImage(flavor_assets[selected_flavor].dialog, 0, diY - 32, c_width - 32, 32, 0, c_height - 32, c_width - 32, 32);
    context.drawImage(flavor_assets[selected_flavor].dialog, diX - 32, 0, 32, c_height - 32, c_width - 32, 0, 32, c_height - 32);
    context.drawImage(flavor_assets[selected_flavor].dialog, diX - 32, diY - 32, 32, 32, c_width - 32, c_height - 32, 32, 32);

    for (var idx = 0; idx < lines.length; idx++) {
      drawLine(lines[idx], idx);
    }

    if (pause) {
      if (pause % 2 == 1) {

        context.drawImage(flavor_assets[selected_flavor].arrowbig, c_width - 64, c_height - 32, 64, 32);
      } else {
        context.drawImage(flavor_assets[selected_flavor].arrowsm, c_width - 64, c_height - 32, 64, 32);
      }
    }

    encoder.addFrame(context, {copy: true, delay: textState.delay});
  }

  function addLine(textState) {
    textState.lines.push([]);
  }

  function addDelay(textState, length) {
    textState.delay = parseInt('0x' + length, 16) * print_delay;
  }

  function addPause(textState) {
    var old_delay = textState.delay;
    textState.delay = 200;
    for (var i = 1; i < 5; i++) {
      drawScene(textState, i);
    }
    textState.delay = old_delay;
  }

  function drawLine(line, row) {
    var cur_x = 14;
    if (line[0] == '@') cur_x = 8;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      cur_x += drawGlyph(ch, cur_x, 10 + (16 * row));
    }

  }

  function drawGlyph(name, posx, posy) {
    if (name === ' ') return 3;
    var position = get_glyph_loc(name);
    if (!position) return 0;
    context.drawImage(
      flavor_assets[selected_flavor].glyphs,
      glyph_image_start.x + (glyph_width * position.x),
      glyph_image_start.y + (glyph_separator.y * position.y),
      position.w,
      glyph_height,
      posx * coeff,
      posy * coeff,
      position.w * coeff,
      glyph_height * coeff
    );
    return position.w; // returns the space it took up.
  }

  function get_glyph_loc(name) {
    if (!name in glyph_locations) return false;

    var array = glyph_locations[name];
    return { x: array[0], y: array[1], w: array[2] }
  }

  function get_glyph_len(name) {
    var combo = false;
    if (combo = get_glyph_loc(name)) return combo.w;
    return false;
  }

  var glyph_locations = {
    'A': [32, 0 , 7],
    'B': [33, 0 , 6],
    'C': [34, 0 , 6],
    'D': [35, 0 , 6],
    'E': [36, 0 , 5],
    'F': [0,  1 , 5],
    'G': [1,  1 , 6],
    'H': [2,  1 , 6],
    'I': [3,  1 , 2],
    'J': [4,  1 , 5],
    'K': [5,  1 , 6],
    'L': [6,  1 , 5],
    'M': [7,  1 , 8],
    'N': [8,  1 , 6],
    'O': [9,  1 , 6],
    'P': [10, 1 , 6],
    'Q': [11, 1 , 6],
    'R': [12, 1 , 6],
    'S': [13, 1 , 6],
    'T': [14, 1 , 6],
    'U': [15, 1 , 6],
    'V': [16, 1 , 7],
    'W': [17, 1 , 8],
    'X': [18, 1 , 6],
    'Y': [19, 1 , 6],
    'Z': [20, 1 , 5],
    'a': [26, 1 , 5],
    'b': [27, 1 , 5],
    'c': [28, 1 , 5],
    'd': [29, 1 , 5],
    'e': [30, 1 , 5],
    'f': [31, 1 , 4],
    'g': [32, 1 , 5],
    'h': [33, 1 , 5],
    'i': [34, 1 , 2],
    'j': [35, 1 , 3],
    'k': [36, 1 , 5],
    'l': [0,  2 , 2],
    'm': [1,  2 , 8],
    'n': [2,  2 , 5],
    'o': [3,  2 , 5],
    'p': [4,  2 , 5],
    'q': [5,  2 , 5],
    'r': [6,  2 , 4],
    's': [7,  2 , 5],
    't': [8,  2 , 4],
    'u': [9,  2 , 5],
    'v': [10, 2 , 6],
    'w': [11, 2 , 8],
    'x': [12, 2 , 5],
    'y': [13, 2 , 5],
    'z': [14, 2 , 5],
    '@': [31, 0 , 6],
    '!': [0,  0 , 3],
    '"': [1,  0 , 4],
    '$': [3,  0 , 6],
    '%': [4,  0 , 10],
    '(': [7,  0 , 4],
    ')': [8,  0 , 4],
    '*': [9,  0 , 4],
    '+': [10, 0 , 5],
    ',': [11, 0 , 3],
    '-': [12, 0 , 3],
    '#': [12, 0 , 3],
    '.': [13, 0 , 3],
    '/': [14, 0 , 5],
    '0': [15, 0 , 5],
    '1': [16, 0 , 4],
    '2': [17, 0 , 5],
    '3': [18, 0 , 6],
    '4': [19, 0 , 5],
    '5': [20, 0 , 5],
    '6': [21, 0 , 5],
    '7': [22, 0 , 5],
    '8': [23, 0 , 5],
    '9': [24, 0 , 6],
    ':': [25, 0 , 2],
    ';': [26, 0 , 4],
    '=': [28, 0 , 6],
    '?': [30, 0 , 5],
    '<': [27, 0 , 5],
    '>': [29, 0 , 5],
    "'": [6,  0 , 3]

  }

});
