// Encoder properties
var encoderWorkers = 10;
var encoderQuality = 10;
var encoderBackground = '#000';
var encoderTransparent = 0x00FF00;

// Encoder itself
var Encoder = function(options) {
	var encoder = new GIF({
        workers: encoderWorkers,
        quality: encoderQuality,
        height: options.height,
        width: options.width,
        workerScript: 'scripts/3rdparty/gif.js/dist/gif.worker.js',
        background: encoderBackground,
        transparent: encoderTransparent
    });

	// Set callback
    encoder.on('finished', options.renderCallback); 
    return encoder;
}

module.exports = Encoder;