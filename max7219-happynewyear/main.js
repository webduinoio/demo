$(function() {

  var clipboard = new Clipboard('#copy');

  var deviceId = $('#deviceId'),
    sumit = $('#sumit'),
    ready = $('#ready'),
    image = $('#image'),
    words = $('#words'),
    c = $('#c');

  var timer, i=0, j=0, k=0;

  var code = [
    '02eaaaafaaea0200',
    'ff55ff22128aff02',
    '04fe0188aaffaa88',
    'ff89ff0089ff8900',
    '849695fd95968400',
    '898989ff89a9c900',
    '22f20f02fa9792c2',
    '12fb164457fc5744',
    '8444241f24448400',
    '3c243c04eaa9ea04'
  ];

  if (localStorage.boardName) {
    deviceId.val(localStorage.boardName);
  }

  sumit.on('click', function() {
    
    image.off('click');
    j=0;

    disconnectBoards(function() {

      localStorage.boardName = deviceId.val();
      ready.text('Connecting...');
      boardReady(deviceId.val(), function(board) {
        ready.text('Board ready!!');
        board.samplingInterval = 20;
        matrix = getMax7219(board, 9, 10, 11);
        image.removeClass('no');
        _run();
        j=1;
        image.on('click', function() {
          if(j==0){
            _run();
            j=1;
          }else{
            clearTimeout(timer);
            j=0;
          }
        });
        board.on('error', function(err) {
          j=0;
          clearTimeout(timer);
          ready.text('Board Error!!!!!!');
          image.addClass('no');
          sumit.removeAttr('disabled');
          image.off('click');
        });
      });

    });

  });

  function _run(){
    matrix.on(code[i]);
    c.text(code[i]);
    image.css({
      'background-position':'0 '+(-1*i*480)+'px'
    });
    if(i<9){
      i=i+1;
    }else{
      i=0;
    }
    timer=setTimeout(_run,100);
  }

});
