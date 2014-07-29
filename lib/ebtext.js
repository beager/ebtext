// Encoder configuration
var encoder,
    encoder_workers     = 10,
    encoder_quality     = 10,
    encoder_background  = '#000',
    encoder_transparent = 0x00FF00;

// Flavor information
var flavors         = ['plain','mint','strawberry','banana','peanut'],
    flavor_assets   = {},
    selected_flavor = 'plain';

// Measurements
var scale               = 4,   // 4x magnification
    dialog_width        = 608, // 608px, fix this
    dialog_height       = 256, // fix
    dialog_asset_width  = 960, // fix
    dialog_asset_height = 256; // fix

// Text box mechanics
var print_delay = 30, // default
    end_delay = 1500;

// Text glyph information
var glyph_separator = { x: 16, y: 24 },
    glyph_height = 16,
    glyph_width = 16,
    glyph_image_start = {x: 24, y: 28},
    glyph_locations = {
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
    };

function preloadImage(url) {
  var image = new Image();
  image.src = url;
  return image;
}

function preloadAssets() {
  for (var i in flavors) {
    flavor_assets[flavors[i]] = {
      arrowsm:  preloadImage('assets/flavors/' + flavors[i] + '/arrowsm.png'),
      arrowbig: preloadImage('assets/flavors/' + flavors[i] + '/arrowbig.png'),
      dialog:   preloadImage('assets/flavors/' + flavors[i] + '/dialog.png'),
    };

    flavor_assets[flavors[i]].glyphs = (flavors[i] == 'plain') ? preloadImage('assets/textplain.png') : preloadImage('assets/textflavored.png');
  }
}

$(document).ready(function() {
  var canvas = document.getElementById('bitmap');
  canvas.width = dialog_width;
  canvas.height = dialog_height;
  var context = canvas.getContext('2d');
  context.mozImageSmoothingEnabled = false;
  context.webkitImageSmoothingEnabled = false;

  preloadAssets();

  $('#tabs a').click(function (e) {
    e.preventDefault()
    $(this).tab('show')
  })

  $('#generate').click(function() {
    $('.loader').addClass('loading');
    document.getElementById('image').src = '';
    print_delay = $('input:radio[name=speed]:checked').val();
    selected_flavor = $('input:radio[name=flavor]:checked').val();

    encoder = new GIF({
      workers: encoder_workers,
      quality: encoder_quality,
      height: dialog_height,
      width: dialog_width,
      workerScript: 'gif.js/dist/gif.worker.js',
      background: encoder_background,
      transparent: encoder_transparent
    });

    encoder.on('finished', function(blob) {
      $('#image').attr('src', URL.createObjectURL(blob));
      $('.loader').removeClass('loading');
    });

    process_text();

    encoder.render();

    return false;   
  });

  function process_text() {
    var last_command = '';
    var text_state = {
      lines: [[]],
      delay: print_delay
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
              add_line(text_state);
              should_draw = false;
              last_command = 'LINE';
              break;
            case 'DELAY':
              add_delay(text_state, args[1]);
              last_command = 'DELAY';
              break;
            case 'PAUSE':
              add_pause(text_state);
              last_command = 'PAUSE';
              break;
            default:
              should_draw = false;
          }
          break;
        default:
          text_state.delay = print_delay; 
          var line_number = text_state.lines.length - 1;
          text_state.lines[line_number].push(text[i]);
      }
      if (should_draw) draw_scene(text_state);
    }
    if (last_command == 'PAUSE') {
      add_pause(text_state);
    } else {
      text_state.delay = end_delay;
      draw_scene(text_state);
    }
  }

  function draw_scene(text_state, pause) {
    pause = pause || false;
    context.fillStyle = "rgba(0,255,0,1)";  
    context.fillRect(0,0,canvas.width, canvas.height);

    // Get the last three lines of the text state, that's all we're going to draw in this frame
    var lines = text_state.lines.slice(-3);

    // Draw the text box
    context.drawImage(flavor_assets[selected_flavor].dialog, 0, 0, dialog_width - 32, dialog_height - 32, 0, 0, dialog_width - 32, dialog_height - 32);
    context.drawImage(flavor_assets[selected_flavor].dialog, 0, dialog_asset_height - 32, dialog_width - 32, 32, 0, dialog_height - 32, dialog_width - 32, 32);
    context.drawImage(flavor_assets[selected_flavor].dialog, dialog_asset_width - 32, 0, 32, dialog_height - 32, dialog_width - 32, 0, 32, dialog_height - 32);
    context.drawImage(flavor_assets[selected_flavor].dialog, dialog_asset_width - 32, dialog_asset_height - 32, 32, 32, dialog_width - 32, dialog_height - 32, 32, 32);

    for (var idx = 0; idx < lines.length; idx++) {
      draw_line(lines[idx], idx);
    }

    // If we're in a pause, we want to draw the pause arrow too.
    if (pause) {
      if (pause % 2 == 1) {
        context.drawImage(flavor_assets[selected_flavor].arrowbig, dialog_width - 64, dialog_height - 32, 64, 32);
      } else {
        context.drawImage(flavor_assets[selected_flavor].arrowsm, dialog_width - 64, dialog_height - 32, 64, 32);
      }
    }

    // Add the frame
    encoder.addFrame(context, {copy: true, delay: text_state.delay});
  }

  function add_line(text_state) {
    text_state.lines.push([]);
  }

  function add_delay(text_state, length) {
    text_state.delay = parseInt('0x' + length, 16) * print_delay;
  }

  function add_pause(text_state) {
    var old_delay = text_state.delay;
    text_state.delay = 200;
    for (var i = 1; i < 5; i++) {
      draw_scene(text_state, i);
    }
    text_state.delay = old_delay;
  }

  function draw_line(line, row) {
    var cur_x = 14;
    if (line[0] == '@') cur_x = 8;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      cur_x += draw_glyph(ch, cur_x, 10 + (16 * row));
    }
  }

  function draw_glyph(name, posx, posy) {
    if (name === ' ') {
      return 3;
    }

    var position = get_glyph_location(name);
    if (!position) {
      return 0;
    }

    // Draw the glyph in the proper place.
    context.drawImage(
      flavor_assets[selected_flavor].glyphs,
      glyph_image_start.x + (glyph_width * position.x),
      glyph_image_start.y + (glyph_separator.y * position.y),
      position.w,
      glyph_height,
      posx * scale,
      posy * scale,
      position.w * scale,
      glyph_height * scale
    );

    // Return the width of the glyph so we can track how far along in the line we are.
    return position.w;
  }

  function get_glyph_location(name) {
    if (!name in glyph_locations) {
      return false;
    }
    var array = glyph_locations[name];
    return { x: array[0], y: array[1], w: array[2] };
  }

  function get_glyph_len(name) {
    var combo = false;
    if (combo = get_glyph_location(name)) {
      return combo.w;
    }
    return false;
  }

});
