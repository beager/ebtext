var Glyphs = {
    /**
     * Gets the location of a glyph
     * @param  {String} name The name of the glyph
     * @return {Mixed}       Returns false on nothing, or a vector of coords otherwise
     */
    getLocation: function(name) {
        if (!(name in this.locations)) {
            return false;
        }
        var array = this.locations[name];
        return { x: array[0], y: array[1], w: array[2] };
    },

    /**
     * Gets the length of a glyph
     * @param  {String} name The name of the glyph
     * @return {Number}      The length of the glyph
     */
    getLength: function(name) {
        var combo = false;
        if (combo = this.getLocation(name)) {
            return combo.w;
        }
        return 0;
    },

    /**
     * Glyph separator information
     * @type {Object}
     */
    separator: {
    	x: 16,
    	y: 24
    },

    /**
     * Height of a glyph
     * @type {Number}
     */
    height: 16,

    /**
     * Width of a glyph
     * @type {Number}
     */
    width: 16,

    /**
     * Where in the asset the glpyhs start
     * @type {Object}
     */
    imageStart: {
        x: 24,
        y: 28
    },

    /**
     * Glyph locations, relative to start, with x, y, and width
     * @type {Object}
     */
    locations: {
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
}

module.exports = Glyphs