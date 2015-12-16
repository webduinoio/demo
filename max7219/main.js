$(function() {

  var clipboard = new Clipboard('#copy');

  var deviceId = $('#deviceId'),
    sumit = $('#sumit'),
    ready = $('#ready'),
    marquee = $('.marquee'),
    btnR = $('#btn-r'),
    btnL = $('#btn-l'),
    btnStop = $('#btn-stop');

  var matrix,
    d = 0;

  var matrixArea = $('.matrix'),
    box = $('.box');

  var code = $('#code'),
    clear = $('#clear'),
    changeCode = $('.changeCode'),
    a = [],
    b = [],
    gen;

  for (var i = 0; i < 8; i++) {
    a[i] = ['0', '0', '0', '0', '0', '0', '0', '0'];
  }
  for (var i = 0; i < 8; i++) {
    b[i] = '00';
  }

  if (localStorage.boardName) {
    deviceId.val(localStorage.boardName);
  }

  sumit.on('click', function() {

    disconnectBoards(function() {

      localStorage.boardName = deviceId.val();
      ready.text('Connecting...');
      boardReady(deviceId.val(), function(board) {
        ready.text('Board ready!!');
        board.samplingInterval = 20;
        matrix = getMax7219(board, 9, 10, 11);
        matrix.on(code.val());
        marquee.slideDown(300);
        btnR.on('click', function() {
          _marqueeRight(code.val());
        });
        btnL.on('click', function() {
          _marqueeLeft(code.val());
        });
        btnStop.on('click', function() {
          matrix.animateStop();
        });
        d = 1;
        board.on('error', function(err) {
          d = 0;
          ready.text('Board Error!!!!!!');
          marquee.slideUp(300);
        });
      });

    });

  });

  $('.b').each(function() {
    $(this).on('click', function() {
      changeCode.val('');
      var row = $(this).parent('.a').index() - 1;
      var num = 7 - $(this).index();
      var string;
      if ($(this).attr('class').indexOf('click') == -1) {
        $(this).addClass('click');
        a[row][num] = '1';
      } else {
        $(this).removeClass('click');
        a[row][num] = '0';
      }
      string = a[row].join().replace(/,/g, '');
      var t2 = parseInt(string, 2);
      var t10 = t2.toString(10);
      var t16 = t2.toString(16);
      if (t10 * 1 < 16) {
        t16 = '0' + t16;
      }
      b[row] = t16;
      gen = b.join().replace(/,/g, '');
      code.val(gen);
      if (d == 1) {
        matrix.on(gen);
        matrix.animateStop();
      }
    });
  });

  code.on('keyup', function() {
    if (code.val().length == 16) {
      code.removeClass('red');
      _codeGen(code.val());
      changeCode.val('');
    } else {
      code.addClass('red');
    }
  });

  clear.on('click', function() {
    _codeGen('0000000000000000');
    code.val('0000000000000000');
    changeCode.val('');
  });

  changeCode.each(function() {
    $(this).on('change', function() {
      var val = $(this).val();
      changeCode.val('');
      $(this).val(val);
      _codeGen(val);
      code.val(val);
    });
  });

  function _codeGen(v) {
    if (d == 1) {
      matrix.on(v);
      matrix.animateStop();
    }
    var v = v;
    var v16 = [];
    var v2 = [];
    var vimg = [];
    var va = v.split('');
    for (var n = 0; n < 8; n++) {
      v16[n] = va[n * 2] + va[n * 2 + 1];
    }
    for (var m = 0; m < 8; m++) {
      var qq = parseInt(v16[m], 16);
      v2[m] = qq.toString(2);
      if (v2[m].length < 8) {
        var ml = 8 - v2[m].length;
        for (var o = 0; o < ml; o++) {
          v2[m] = '0' + v2[m];
        }
      }
    }
    for (var n = 0; n < 8; n++) {
      vimg[n] = v2[n].split('');
      a[n] = vimg[n];
      for (var m = 0; m < 8; m++) {
        if (vimg[n][m] == 1) {
          $('.a').eq(n).find('.b').eq(7 - m).addClass('click');
        } else {
          if ($('.a').eq(n).find('.b').eq(7 - m).hasClass('click')) {
            $('.a').eq(n).find('.b').eq(7 - m).removeClass('click');
          }
        }
      }
    }
    b = v16;
    gen = v;
  }

  function _marqueeLeft(v) {
    matrix.animateStop();
    var m1 = v;
    var m2 = m1.split("");
    var m3 = [];
    for (var mi = 0; mi < m1.length / 2; mi++) {
      mm(mi);
    }

    function mm(j) {
      var m4 = m2.splice(0, 2);
      m2.push(m4[0], m4[1]);
      m3[j] = m2.join("");
    }
    matrix.animate(m3, 100);
  }

  function _marqueeRight(v) {
    matrix.animateStop();
    var m1 = v;
    var m2 = m1.split("");
    var m3 = [];
    for (var mi = 0; mi < m1.length / 2; mi++) {
      mm(mi);
    }

    function mm(j) {
      var m4 = m2.splice((m1.length - 2), m1.length);
      m2.unshift(m4[0], m4[1]);
      m3[j] = m2.join("");
    }
    matrix.animate(m3, 100);
  }
});
