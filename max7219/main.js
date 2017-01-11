$(function() {

  var clipboard = new Clipboard('#copy');

  clipboard.on('success', function(e) {
    $('#copy').text(i18n.t('CODE_COPIED')).attr('disabled', true);
    setTimeout(function() {
      $('#copy').text(i18n.t('COPY')).attr('disabled', false);
    }, 1000);
  });

  var deviceId = $('#deviceId'),
    connect_btn = $('#connect_btn'),
    ready = $('#ready'),
    marquee = $('.marquee'),
    btnR = $('#btn-r'),
    btnL = $('#btn-l'),
    btnStop = $('#btn-stop');

  var matrix,
    timer,
    t = 0,
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

  var i18nResources = {
    en: {
      translation: {
        "WEBDUINO_LED_MATRIX_CODE_GENERATOR": "Webduino LED Matrix Code Generator",
        "BOARD": "Board",
        "BOARD_READY": "Board ready!",
        "BOARD_ERROR": "Board error!",
        "CONNECTING": "Connecting...",
        "CONNECT": "Connect",
        "CONNECTED": "Connected",
        "MARQUEE": "Marquee: ",
        "MARQUEE_LEFT": "← Left",
        "MARQUEE_RIGHT": "Right →",
        "MARQUEE_STOP": "Stop",
        "CODE": "Code",
        "ICON": "Icon",
        "COPY": "Copy",
        "RESET": "Reset",
        "UPPERCASE": "Uppercase",
        "LOWERCASE": "Lowercase",
        "NUMBER": "Number",
        "CODE_COPIED": "Code copied!",
        "CODE_RESET": "Code reset!",
        "SCAN_QRCODE": "Scan QRCode",
        "TO_USE_ON_MOBILE": " to use on mobile"
      }
    },
    'zh-TW': {
      translation: {
        "WEBDUINO_LED_MATRIX_CODE_GENERATOR": "Webduino LED 點矩陣代碼產生器",
        "BOARD": "開發版",
        "BOARD_READY": "開發板待命中！",
        "BOARD_ERROR": "開發板發生錯誤！",
        "CONNECTING": "連線中⋯",
        "CONNECT": "連線",
        "CONNECTED": "已連線",
        "MARQUEE": "跑馬燈: ",
        "MARQUEE_LEFT": "← 向左",
        "MARQUEE_RIGHT": "向右 →",
        "MARQUEE_STOP": "停止",
        "CODE": "代碼",
        "ICON": "圖形",
        "COPY": "複製",
        "RESET": "重設",
        "UPPERCASE": "大寫字母",
        "LOWERCASE": "小寫字母",
        "NUMBER": "數字",
        "CODE_COPIED": "已複製代碼！",
        "CODE_RESET": "已重設代碼！",
        "SCAN_QRCODE": "掃瞄 QRCode",
        "TO_USE_ON_MOBILE": "使用手機操作"
      }
    }
  }

  i18n.init({
    resStore: i18nResources
  }, function(err, t) {
      $('body').i18n();
  });

  connect_btn.on('click', function() {
    localStorage.boardName = deviceId.val();
    ready.text(i18n.t('CONNECTING'));
    boardReady(deviceId.val(), function(board) {
      connect_btn.text(i18n.t('CONNECTED')).attr('disabled', true);
      ready.text(i18n.t('BOARD_READY')).removeClass().addClass('text-success');
      board.samplingInterval = 20;
      matrix = getMax7219(board, 9, 10, 11);
      matrix.on(code.val());
      marquee.show(300);
      btnR.on('click', function() {
        _marqueeRight(code.val());
      });
      btnL.on('click', function() {
        _marqueeLeft(code.val());
      });
      btnStop.on('click', function() {
        //matrix.animateStop();
        clearTimeout(timer);
        t=0;
      });
      d = 1;
      board.on('error', function(err) {
        d = 0;
        connect_btn.text(i18n.t('CONNECT')).attr('disabled', false);
        ready.text(i18n.t('BOARD_ERROR')).removeClass().addClass('text-danger');
        marquee.slideUp(300);
      });
    });
  });

  $('.b').each(function() {
    $(this).on('click', function() {
      changeCode.val('');
      var row = $(this).parent('.a').index();
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
    clear.text(i18n.t('CODE_RESET')).attr('disabled', true);
    setTimeout(function() {
      clear.text(i18n.t('RESET')).attr('disabled', false);
    }, 1000);
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
    //matrix.animateStop();
    clearTimeout(timer);
    t=0;
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

    mmm();
    function mmm(){
      if(t<8){
        //matrix.on(m3[t]);
        _codeGen(m3[t]);
        code.val(m3[t]);
        t=t+1;
        timer = setTimeout(mmm,100);
      }
      else{
        t=0;
        mmm();
      }
    }

    //matrix.animate(m3, 100);
  }

  function _marqueeRight(v) {
    //matrix.animateStop();
    clearTimeout(timer);
    t=0;
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

    mmm();
    function mmm(){
      if(t<8){
        //matrix.on(m3[t]);
        _codeGen(m3[t]);
        code.val(m3[t]);
        t=t+1;
        timer = setTimeout(mmm,100);
      }
      else{
        t=0;
        mmm();
      }
    }

    //matrix.animate(m3, 100);
  }
});
