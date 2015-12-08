var n = document.getElementById('n'),
  m = document.getElementById('m'),
  input = document.getElementById('input'),
  b = document.getElementById('b'),
  s = document.getElementById('s');

var init = document.getElementById('init'),
  initSpan = document.getElementById('init-span'),
  initInput = document.getElementById('init-input'),
  initInputName = document.getElementById('init-name-input'),
  initBtn = document.getElementById('init-btn'),
  initNote = document.getElementById('init-note');

var windowHeight = window.innerHeight;

if (localStorage.firebaseUrl) {
  initInput.value = localStorage.firebaseUrl;
}

if (localStorage.imusername) {
  initInputName.value = localStorage.imusername;
}

initBtn.onclick = function() {
  start();
}
initInputName.onkeydown = function(e) {
  if (e.keyCode == 13) {
    start();
  }
}

function start(){
  if (initInput.value && initInputName.value) {
    loadFirebase(initInput.value, initInputName.value);
    localStorage.firebaseUrl = initInput.value;
    localStorage.imusername = initInputName.value;
    initNote.innerText = '';
  } else {
    initNote.innerText = '請輸入完整資訊';
  }
}

function loadFirebase(url, yourName) {

  var myDataRef = new Firebase('https://' + url + '.firebaseio.com/');

  input.style.display = 'block';
  s.style.display = 'block';
  init.style.display = 'none';

  // n.innerText = yourName;

  s.style.height = windowHeight - input.offsetHeight + 'px';

  window.onresize = function() {
    windowHeight = window.innerHeight;
    s.style.height = window.innerHeight - input.offsetHeight + 'px';
  }

  function _push(name, text, userid, time) {
    myDataRef.push({
      name: name,
      text: text,
      userid: userid, // 增加一個 id 判斷是不是自己
      time: time
    });
  }

  b.onclick = function(e) {
    var date = new Date();
    var time = date.getFullYear() + '/' + (date.getMonth() + 1).toString() + '/' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
    _push(yourName, m.value, yourName, time);
    m.value = '';
  };

  m.onkeydown = function(e) {
    if (e.keyCode == 13) {
      var date = new Date();
      var time = date.getFullYear() + '/' + (date.getMonth() + 1).toString() + '/' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
      _push(yourName, m.value, yourName, time);
      m.value = '';
    }
  };


  myDataRef.on("value", function(snapshot) {
    var val = [];
    snapshot.forEach(function(data) {
      val.push(data.val());
    });

    if (!val[val.length - 1].name) {
      nn = '(沒有名字)';
    } else {
      nn = val[val.length - 1].name;
    }

    if (!val[val.length - 1].text) {
      tt = '(沒有內容)';
    } else {
      tt = val[val.length - 1].text;
    }

    if (!val[val.length - 1].userid) {
      uu = '(沒有名字)';
    } else {
      uu = val[val.length - 1].userid;
    }

    if (!val[val.length - 1].time) {
      time = '00:00:00';
    } else {
      time = val[val.length - 1].time;
    }


    if (uu == yourName) {
      s.innerHTML += '<div class="u1"><span class="u1t"></span><b> 我(' + nn + ')</b> <i>' + time + '</i></div>';
      var sa = document.querySelectorAll('.u1t');
      sa[sa.length - 1].innerText = tt;
    } else {
      s.innerHTML += '<div class="u2"><b>' + nn + '</b>  <i>' + time + '</i>' + '<span class="u2t"></span><br/>';
      var sa = document.querySelectorAll('.u2t');
      sa[sa.length - 1].innerText = tt;
    }
    s.scrollTop = s.scrollHeight;

  }, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
  });

}
