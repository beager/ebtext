var EarthboundText = {

    // Encoder configuration
    encoder:            null,
    encoder_workers:    10,
    encoder_quality:    10,
    encoder_background: '#000',
    encoder_transparent: 0x00FF00,

    // Flavor information
    flavors:         ['plain','mint','strawberry','banana','peanut'],
    flavor_assets:   {},
    selected_flavor: 'plain',

    // Measurements
    scale:               4,   // 4x magnification
    dialog_width:        608, // 608px, fix this
    dialog_height:       256, // fix
    dialog_asset_width:  960, // fix
    dialog_asset_height: 256, // fix

    // Text box mechanics
    print_delay: 30, // default
    end_delay:   1500,

    // Glyph information
    glyph_separator:   { x: 16, y: 24 },
    glyph_height:      16,
    glyph_width:       16,
    glyph_image_start: {x: 24, y: 28},
    glyph_locations: {
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
    },

    // Other things
    input_text:      '',
    text_state:      null,
    canvas:          false,
    context:         false,
    render_callback: null,

    initialize: function(opts) {
      this.context = false; // So we re-fetch the context and keep smoothing disabled
      this.print_delay = opts.speed || this.print_delay;
      this.input_text = opts.text || this.input_text;
      this.selected_flavor = opts.flavor || this.selected_flavor;
      this.render_callback = opts.on_render || this.render_callback;
      this.canvas = opts.canvas || this.canvas;
      this.canvas.width = this.dialog_width;
      this.canvas.height = this.dialog_height;
      this.text_state = {
        lines: [[]],
        delay: this.print_delay
      };
      this.create_encoder();
      this.encoder.on('finished', this.render_callback);
    },

    create_encoder: function() {
      this.encoder = new GIF({
        workers: this.encoder_workers,
        quality: this.encoder_quality,
        height: this.dialog_height,
        width: this.dialog_width,
        workerScript: 'scripts/3rdparty/gif.js/dist/gif.worker.js',
        background: this.encoder_background,
        transparent: this.encoder_transparent
      });  
    },

    get_context: function() {
      if (!this.context) {
        this.context = this.canvas.getContext('2d');
        this.context.mozImageSmoothingEnabled = false;
        this.context.webkitImageSmoothingEnabled = false;
      }
      return this.context;
    },

    render: function(opts) {
      this.initialize(opts);
      this.preprocess_text();
      this.render_dialog();
      this.encoder.render();
    },

    preprocess_text: function() {
      var text = this.input_text;
      var out_text = '';
      var posx = 0;
      var current_word = '';
      var xlimit = 120;
      var word_boundary = false;
      var to_insert = '';

      for (var i = 0; i < text.length; i++) {
        to_insert = '';
        switch(text[i]) {
          case '[':
            var cmd = '';
            while (text[++i] != ']') {
              cmd += text[i];
            }
            var args = cmd.split(' ');
            if (args[0] == 'LINE') {
              posx = 0;
            }
            to_insert += '[' + cmd + ']';
            word_boundary = true;
            break;
          case ' ':
            posx += 2;
            word_boundary = true;
            to_insert += ' ';
            break;
          case "\n":
            to_insert += '[LINE]';
            word_boundary = true;
            break;
          case '@':
            posx -= 6; // neat little terrible hack
          default:
            current_word += text[i];
        }
        if (word_boundary) {
            next_length = this.calc_word_length(current_word);
            if (posx + next_length > xlimit) {
              out_text += '[LINE]';
              posx = 0;
            }
            posx += next_length;
            out_text += current_word;
            current_word = '';
            word_boundary = false;
        }
        out_text += to_insert;
      }
      if (current_word != '') {
        out_text += current_word;
      }
      this.input_text = out_text;
    },

    calc_word_length: function(word) {
      width = 0;
      for (var i = 0; i < word.length; i++) {
        width += this.get_glyph_len(word[i]);
      }
      return width;
    },

    render_dialog: function() {
      var last_command = '';

      this.draw_frame(); // first frame is empty box

      var should_draw = false;
      for (var i = 0; i < this.input_text.length; i++) {
        should_draw = true;
        switch(this.input_text[i]) {
          case '[':
            var cmd = '';
            while (this.input_text[++i] != ']') {
              cmd += this.input_text[i];
            }
            var args = cmd.split(' ');
            switch(args[0]) {
              case 'LINE':
                this.add_line();
                should_draw = false;
                last_command = 'LINE';
                break;
              case 'DELAY':
                this.add_delay(args[1]);
                last_command = 'DELAY';
                break;
              case 'PAUSE':
                this.add_pause();
                last_command = 'PAUSE';
                should_draw = false;
                break;
              default:
                should_draw = false;
            }
            break;
          default:
            this.text_state.delay = this.print_delay; 
            this.text_state.lines[this.text_state.lines.length - 1].push(this.input_text[i]);
        }
        if (should_draw) this.draw_frame();
      }
      if (last_command == 'PAUSE') {
        this.add_pause();
      } else {
        this.text_state.delay = this.end_delay;
        this.draw_frame();
      }
    },

    draw_frame: function(pause) {
      pause = pause || false;
      this.get_context().fillStyle = "rgba(0,255,0,1)";  
      this.get_context().fillRect(0,0,this.canvas.width, this.canvas.height);

      // Get the last three lines of the text state, that's all we're going to draw in this frame
      var lines = this.text_state.lines.slice(-3);

      // Draw the text box
      this.get_context().drawImage(
        this.asset('dialog'),
        0, 0, this.dialog_width - 32, this.dialog_height - 32,
        0, 0, this.dialog_width - 32, this.dialog_height - 32
      );
      this.get_context().drawImage(
        this.asset('dialog'),
        0, this.dialog_asset_height - 32, this.dialog_width - 32, 32,
        0, this.dialog_height - 32, this.dialog_width - 32, 32
      );
      this.get_context().drawImage(
        this.asset('dialog'),
        this.dialog_asset_width - 32, 0, 32, this.dialog_height - 32,
        this.dialog_width - 32, 0, 32, this.dialog_height - 32
      );
      this.get_context().drawImage(
        this.asset('dialog'),
        this.dialog_asset_width - 32, this.dialog_asset_height - 32, 32, 32,
        this.dialog_width - 32, this.dialog_height - 32, 32, 32
      );

      for (var idx = 0; idx < lines.length; idx++) {
        this.draw_line(lines[idx], idx);
      }

      // If we're in a pause, we want to draw the pause arrow too.
      if (pause) {
        if (pause % 2 == 1) {
          this.get_context().drawImage(this.asset('arrowbig'), this.dialog_width - 64, this.dialog_height - 32, 64, 32);
        } else {
          this.get_context().drawImage(this.asset('arrowsm'), this.dialog_width - 64, this.dialog_height - 32, 64, 32);
        }
      }

      // Add the frame to the encoder
      this.encoder.addFrame(this.get_context(), {copy: true, delay: this.text_state.delay});
    },

    add_line: function() {
      this.text_state.lines.push([]);
    },

    add_delay: function(length) {
      this.text_state.delay = parseInt('0x' + length, 16) * this.print_delay;
    },

    add_pause: function() {
      var old_delay = this.text_state.delay;
      this.text_state.delay = 200;
      for (var i = 1; i < 5; i++) {
        this.draw_frame(i);
      }
      this.text_state.delay = old_delay;
    },

    draw_line: function(line, row) {
      var cur_x = 14;
      if (line[0] == '@') cur_x = 8;
      for (var i = 0; i < line.length; i++) {
        var ch = line[i];
        cur_x += this.draw_glyph(ch, cur_x, 10 + (16 * row));
      }
    },

    draw_glyph: function(name, posx, posy) {
      if (name === ' ') {
        return 3;
      }

      var position = this.get_glyph_location(name);
      if (!position) {
        return 0;
      }

      // Draw the glyph in the proper place.
      this.get_context().drawImage(
        this.asset('glyphs'),
        this.glyph_image_start.x + (this.glyph_width * position.x),
        this.glyph_image_start.y + (this.glyph_separator.y * position.y),
        position.w,
        this.glyph_height,
        posx * this.scale,
        posy * this.scale,
        position.w * this.scale,
        this.glyph_height * this.scale
      );

      // Return the width of the glyph so we can track how far along in the line we are.
      return position.w;
    },

    get_glyph_location: function(name) {
      if (!name in this.glyph_locations) {
        return false;
      }
      var array = this.glyph_locations[name];
      return { x: array[0], y: array[1], w: array[2] };
    },

    asset: function(which) {
      return this.flavor_assets[this.selected_flavor][which];
    },

    get_glyph_len: function(name) {
      var combo = false;
      if (combo = this.get_glyph_location(name)) {
        return combo.w;
      }
      return 0;
    },

    preload_image: function(url) {
      var image = new Image();
      image.src = url;
      return image;
    },

    preload_assets: function() {
      for (var i in this.flavors) {
        this.flavor_assets[this.flavors[i]] = {
          arrowsm:  this.preload_image('assets/flavors/' + this.flavors[i] + '/arrowsm.png'),
          arrowbig: this.preload_image('assets/flavors/' + this.flavors[i] + '/arrowbig.png'),
          dialog:   this.preload_image('assets/flavors/' + this.flavors[i] + '/dialog.png'),
        };

        this.flavor_assets[this.flavors[i]].glyphs = (this.flavors[i] == 'plain') ? this.preload_image('assets/text/plain.png') : this.preload_image('assets/text/flavored.png');
      }
    },
};
