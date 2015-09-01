'use strict';

var $ = require('jquery');
var EarthBoundText = require('./lib/ebtext');

$(document).ready(function() {
  EarthBoundText.preloadAssets();

  $('#tabs a').click(function (e) {
    e.preventDefault()
    $(this).tab('show')
  })

  $('#generate').click(function (e) {
    e.preventDefault();
    $('.loader').addClass('loading');
    document.getElementById('image').src = '';

    EarthBoundText.render({
      canvas: document.getElementById('bitmap'),
      flavor: $('input:radio[name=flavor]:checked').val(),
      speed: $('input:radio[name=speed]:checked').val(),
      text: $('#text').val(),
      onRender: function(blob) {
        $('#image').attr('src', URL.createObjectURL(blob));
        $('.loader').removeClass('loading');
      }
    });
  });
});
