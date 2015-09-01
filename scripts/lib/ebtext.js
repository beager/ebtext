var Glyphs = require('./glyphs');
var Encoder = require('./encoder');

var EarthboundText = {
    /**
     * Flavor information
     */
    flavors: ['plain','mint','strawberry','banana','peanut'],
    flavorAssets: {},
    selectedFlavor: 'plain',

    /**
     * Measurements
     */
    scale: 4,   // 4x magnification
    dialogWidth: 608, // 608px, fix this
    dialogHeight: 256, // fix
    dialogAssetWidth: 960, // fix
    dialogAssetHeight: 256, // fix

    /**
     * Text box mechanics
     */
    printDelay: 30, // default
    endDelay: 1500,

    /**
     * Input information
     */
    inputText: '',
    textState: null,

    /**
     * Canvas/context vars
     */
    canvas: false,
    context: false,

    /**
     * Initializer
     * @param  {Object} opts The options
     */
    initialize: function(opts) {
        this.context = false; // So we re-fetch the context and keep smoothing disabled
        this.printDelay = opts.speed || this.printDelay;
        this.inputText = opts.text || this.inputText;
        this.selectedFlavor = opts.flavor || this.selectedFlavor;
        this.canvas = opts.canvas || this.canvas;
        this.canvas.width = this.dialogWidth;
        this.canvas.height = this.dialogHeight;
        this.textState = {
            lines: [[]],
            delay: this.printDelay
        };
        this.encoder = new Encoder({
            height: this.dialogHeight,
            width: this.dialogWidth,
            renderCallback: opts.onRender || function() {}
        });
    },

    /**
     * Get the context for drawing
     * @return {Object} the context
     */
    getContext: function() {
        if (!this.context) {
            this.context = this.canvas.getContext('2d');
            this.context.mozImageSmoothingEnabled = false;
            this.context.webkitImageSmoothingEnabled = false;
        }
        return this.context;
    },

    render: function(opts) {
        this.initialize(opts);
        this.preprocessText();
        this.renderDialog();
        this.encoder.render();
    },

    preprocessText: function() {
        // Set text locally
        var text = this.inputText;

        // Preformat text
        text = text.replace(/^[\s]*/gi, '@');
        text = text.replace(/\n+[\s]*/gi, '[PAUSE][LINE]@');
        text = text.replace(/@+/gi, '@');
        text = text.replace(/\\/gi, '[DELAY 08]');

        // Set up local vars
        var outText = '';
        var posx = 0;
        var currentWord = '';
        var xlimit = 120;
        var wordBoundary = false;
        var toInsert = '';

        for (var i = 0; i < text.length; i++) {
            toInsert = '';
            switch(text[i]) {
                // If we have a left bracket, pull until we identify a command
                case '[':
                    var cmd = '';
                    while (text[++i] != ']') {
                        cmd += text[i];
                    }
                    var args = cmd.split(' ');
                    if (args[0] == 'LINE') {
                        posx = 0;
                    }
                    toInsert += '[' + cmd + ']';
                    wordBoundary = true;
                    break;
                // If we have a space, move along and indicate a word boundary
                case ' ':
                    posx += 2;
                    wordBoundary = true;
                    toInsert += ' ';
                    break;
                // If we have @, back it up so we can dot the start of text
                case '@':
                    posx -= 6; // neat little terrible hack
                // Otherwise, just add the character to the current word
                default:
                    currentWord += text[i];
            }

            if (wordBoundary) {
                // We have a word boundary, so figure out if we need to put it on a new line
                nextLength = this.calcWordLength(currentWord);
                if (posx + nextLength > xlimit) {
                    // Create a new line
                    outText += '[LINE]';
                    posx = 0;
                }
                // Increment length
                posx += nextLength;

                // Add word
                outText += currentWord;

                // Reset current word and boundary
                currentWord = '';
                wordBoundary = false;
            }

            // Add the inserted word into the outbound text
            outText += toInsert;
        }
        if (currentWord != '') {
            outText += currentWord;
        }
        this.inputText = outText;
    },

    calcWordLength: function(word) {
        width = 0;
        for (var i = 0; i < word.length; i++) {
            width += Glyphs.getLength(word[i]);
        }
        return width;
    },

    renderDialog: function() {
        var lastCommand = '';

        this.drawFrame(); // first frame is empty box

        var shouldDraw = false;
        for (var i = 0; i < this.inputText.length; i++) {
            shouldDraw = true;
            switch(this.inputText[i]) {
                case '[':
                    var cmd = '';
                    while (this.inputText[++i] != ']') {
                        cmd += this.inputText[i];
                    }
                    var args = cmd.split(' ');
                    switch(args[0]) {
                        case 'LINE':
                            this.addLine();
                            shouldDraw = false;
                            lastCommand = 'LINE';
                            break;
                        case 'DELAY':
                            this.addDelay(args[1]);
                            lastCommand = 'DELAY';
                            break;
                        case 'PAUSE':
                            this.addPause();
                            lastCommand = 'PAUSE';
                            shouldDraw = false;
                            break;
                        default:
                            shouldDraw = false;
                    }
                    break;
                default:
                    this.textState.delay = this.printDelay; 
                    this.textState.lines[this.textState.lines.length - 1].push(this.inputText[i]);
            }
            if (shouldDraw) this.drawFrame();
        }
        if (lastCommand == 'PAUSE') {
            this.addPause();
        } else {
            this.textState.delay = this.endDelay;
            this.drawFrame();
        }
    },

    drawFrame: function(pause) {
        pause = pause || false;
        this.getContext().fillStyle = "rgba(0,255,0,1)";
        this.getContext().fillRect(0,0,this.canvas.width, this.canvas.height);

        // Get the last three lines of the text state, that's all we're going to draw in this frame
        var lines = this.textState.lines.slice(-3);

        // Draw the text box
        this.getContext().drawImage(
            this.asset('dialog'),
            0, 0, this.dialogWidth - 32, this.dialogHeight - 32,
            0, 0, this.dialogWidth - 32, this.dialogHeight - 32
        );
        this.getContext().drawImage(
            this.asset('dialog'),
            0, this.dialogAssetHeight - 32, this.dialogWidth - 32, 32,
            0, this.dialogHeight - 32, this.dialogWidth - 32, 32
        );
        this.getContext().drawImage(
            this.asset('dialog'),
            this.dialogAssetWidth - 32, 0, 32, this.dialogHeight - 32,
            this.dialogWidth - 32, 0, 32, this.dialogHeight - 32
        );
        this.getContext().drawImage(
            this.asset('dialog'),
            this.dialogAssetWidth - 32, this.dialogAssetHeight - 32, 32, 32,
            this.dialogWidth - 32, this.dialogHeight - 32, 32, 32
        );

        for (var idx = 0; idx < lines.length; idx++) {
            this.drawLine(lines[idx], idx);
        }

        // If we're in a pause, we want to draw the pause arrow too.
        if (pause) {
            if (pause % 2 == 1) {
                this.getContext().drawImage(this.asset('arrowbig'), this.dialogWidth - 64, this.dialogHeight - 32, 64, 32);
            } else {
                this.getContext().drawImage(this.asset('arrowsm'), this.dialogWidth - 64, this.dialogHeight - 32, 64, 32);
            }
        }

        // Add the frame to the encoder
        this.encoder.addFrame(this.getContext(), {copy: true, delay: this.textState.delay});
    },

    addLine: function() {
        this.textState.lines.push([]);
    },

    addDelay: function(length) {
        this.textState.delay = parseInt('0x' + length, 16) * this.printDelay;
    },

    addPause: function() {
        var oldDelay = this.textState.delay;
        this.textState.delay = 200;
        for (var i = 1; i < 5; i++) {
            this.drawFrame(i);
        }
        this.textState.delay = oldDelay;
    },

    drawLine: function(line, row) {
        var curX = 14;
        if (line[0] == '@') curX = 8;
        for (var i = 0; i < line.length; i++) {
            var ch = line[i];
            curX += this.drawGlyph(ch, curX, 10 + (16 * row));
        }
    },

    drawGlyph: function(name, posx, posy) {
        if (name === ' ') {
            return 3;
        }

        var position = Glyphs.getLocation(name);
        if (!position) {
            return 0;
        }

        // Draw the glyph in the proper place.
        this.getContext().drawImage(
            this.asset('glyphs'),
            Glyphs.imageStart.x + (Glyphs.width * position.x),
            Glyphs.imageStart.y + (Glyphs.separator.y * position.y),
            position.w,
            Glyphs.height,
            posx * this.scale,
            posy * this.scale,
            position.w * this.scale,
            Glyphs.height * this.scale
        );

        // Return the width of the glyph so we can track how far along in the line we are.
        return position.w;
    },

    asset: function(which) {
        return this.flavorAssets[this.selectedFlavor][which];
    },

    preloadImage: function(url) {
        var image = new Image();
        image.src = url;
        return image;
    },

    preloadAssets: function() {
        for (var i in this.flavors) {
            this.flavorAssets[this.flavors[i]] = {
                arrowsm:  this.preloadImage('assets/flavors/' + this.flavors[i] + '/arrowsm.png'),
                arrowbig: this.preloadImage('assets/flavors/' + this.flavors[i] + '/arrowbig.png'),
                dialog:   this.preloadImage('assets/flavors/' + this.flavors[i] + '/dialog.png'),
            };

            this.flavorAssets[this.flavors[i]].glyphs = (this.flavors[i] == 'plain') ? this.preloadImage('assets/text/plain.png') : this.preloadImage('assets/text/flavored.png');
        }
    }
};

module.exports = EarthboundText;
