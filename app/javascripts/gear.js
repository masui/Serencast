// Generated by CoffeeScript 2.5.1

// gear.js = 「超」ナビゲーション

// node-webkit / ブラウザでも動く

// http://GitHub.com/masui/Gear

var AnimationTime, ExpandTime, HideAnimationTime, HideTime, StepTime, autoexpand, browserHeight, calc, currentActionTime, dispLine, display, dontShowSingleNode, downfunc, expand, expandTimeout, fire, getActionTime, hashIndex, hideLines, hideTimeout, initData, intValue, json, keydownfunc, lastActionTime, linda, loadData, menuEraseTimeout, menuErased, move, movefunc, nasty, nextNode, nodeList, node_app, oldNodeList, oldSpans, pauseAtLevelChange, prevNode, refresh, repeatedfunc, resizefunc, say, sayCGI, setEraseTiming, setup_paddle, showContents, singleWindow, spans, ts, typeCount, typeCountTimeout, upfunc, useAnimation, useAudio, use_linda;

if (typeof useAnimation === "undefined" || useAnimation === null) {
  useAnimation = true; // アニメーションを使うかどうか
}

if (typeof showContents === "undefined" || showContents === null) {
  showContents = true; // メニューだけだでなく内容も表示するか
}

if (typeof autoexpand === "undefined" || autoexpand === null) {
  autoexpand = true; // 自動展開(デフォルト動作)
}

if (typeof pauseAtLevelChange === "undefined" || pauseAtLevelChange === null) {
  pauseAtLevelChange = true;
}

if (typeof dontShowSingleNode === "undefined" || dontShowSingleNode === null) {
  dontShowSingleNode = true; // 辞書に使うときとか
}

if (typeof singleWindow === "undefined" || singleWindow === null) {
  singleWindow = false; // メニューとコンテンツを同じ画面にするかどうか
}

if (typeof json === "undefined" || json === null) {
  json = 'data.json';
}

console.log("=====================");

if (typeof useAudio === "undefined" || useAudio === null) {
  // sayコマンドで読みあげる
  useAudio = false; // 項目を発声するかどうか
}

if (typeof sayCGI === "undefined" || sayCGI === null) {
  sayCGI = "http://localhost/~masui/say.cgi";
}

node_app = typeof require !== 'undefined'; // node-webkitによるアプリかどうか

node_app = false;

use_linda = typeof io !== 'undefined'; // Lindaを使うかどうか

ts = null;

linda = null;

if (node_app) {
  singleWindow = true;
}

nodeList = {}; // 表示可能ノードのリスト. nodeList[0]を中心に表示する

oldNodeList = {};

spans = {}; // 表示されるspan要素のリスト

oldSpans = {};

//StepTime = 1000         # 段階的展開のタイムアウト時間   ?????
StepTime = 1000; // 段階的展開のタイムアウト時間   ?????

ExpandTime = 2000; // 無操作時展開のタイムアウト時間

//ExpandTime = 900       # 無操作時展開のタイムアウト時間
expandTimeout = null;

AnimationTime = 300; // ズーミングのアニメーション時間

HideTime = 1600; // 無操作時にメニューを消すまでの時間

HideAnimationTime = 700; // メニューが消えるアニメーションの時間

hideTimeout = null;

typeCount = 0; // 連打したかどうか: 連打されてたら表示を行なう

typeCountTimeout = null;

menuEraseTimeout = null;

menuErased = false;

lastActionTime = 0;

currentActionTime = 0;

loadData = function() {
  return $.getJSON(json, function(data) {
    initData(data, null, 0);
    calc(data[0]);
    return expandTimeout = setTimeout(expand, ExpandTime);
  });
};

initData = function(nodes, parent, level) { // 木構造をセットアップ
  var i, k, node, ref, results;
//for i, node of nodes
  results = [];
  for (i = k = 0, ref = nodes.length; (0 <= ref ? k < ref : k > ref); i = 0 <= ref ? ++k : --k) {
    node = nodes[i];
    node.level = level;
    node.elder = (i > 0 ? nodes[i - 1] : null);
    node.younger = (i < nodes.length - 1 ? nodes[i + 1] : null);
    node.parent = parent;
    if (node.children) {
      results.push(initData(node.children, node, level + 1));
    } else {
      results.push(void 0);
    }
  }
  return results;
};

console.log("+++++++++++++++++");

$(function() { // document.ready()
  var height, menuwidth, nativeMenuBar, nw, param, width, win;
  if (node_app) {
    // v0.10からMacではこれが必要らしい
    nw = require('nw.gui');
    win = nw.Window.get();
    nativeMenuBar = new nw.Menu({
      type: "menubar"
    });
    if (nativeMenuBar.createMacBuiltin) {
      nativeMenuBar.createMacBuiltin("Gear", {
        hideEdit: true,
        hideWindow: true
      });
      win.menu = nativeMenuBar;
      window.addEventListener("resize", function() {
        return win.enterFullscreen();
      }, false);
    }
  }
  // 可能ならpaddle対応
  if (use_linda) {
    setup_paddle();
  }
  loadData();
  if (showContents) {
    if (singleWindow) { // コンテンツ表示ウィンドウを開く

    } else {
      height = screen.availHeight;
      menuwidth = Math.min(screen.availWidth / 5, 300);
      width = screen.availWidth - menuwidth;
      param = `top=0,left=${menuwidth},height=${height},width=${width},scrollbars=yes`;
      // $.contentswin = window.open "","Contents",param
      $.contentswin = $('webview');
    }
  }
  //if singleWindow
  //  $('#menu').css('left','200pt')
  //else
  //  $('#menu').css('left','10pt')
  return $('#menu').addClass('show_menu');
});

refresh = function() { // 不要DOMを始末する. 富豪的すぎるかも?
  var i, results, span;
  for (i in spans) {
    span = spans[i];
    span.show();
  }
  results = [];
  for (i in oldSpans) {
    span = oldSpans[i];
    results.push(span.remove());
  }
  return results;
};

browserHeight = function() { // jQuery式の標準関数がありそうだが?
  if (window.innerHeight) {
    return window.innerHeight;
  }
  if (document.body) {
    return document.body.clientHeight;
  }
  return 0;
};

resizefunc = function() {
  var height, width;
  height = screen.height;
  width = screen.width;
  $('body').css('width', width);
  $('body').css('height', height);
  $('#iframe').css('width', width);
  $('#iframe').css('height', height);
  $('#image').css('width', width);
  $('#image').css('height', height);
  // $('#menu').css('height',height)
  // $('#menu').css('height',400)
  $('#menu').css('height', '100%');
  $('#panel').css('width', width);
  return $('#panel').css('height', height);
};

expand = function() { // 注目してるエントリの子供を段階的に展開する
  var shrinking;
  if (singleWindow) {
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(hideLines, HideTime);
  }
  expandTimeout = null;
  shrinking = false;
  if (nodeList[0].children) {
    if (useAudio) {
      say(nodeList[0].children[0]);
    }
    calc(nodeList[0].children[0]);
    expandTimeout = setTimeout(expand, StepTime);
  }
  return setEraseTiming();
};

intValue = function(s) {
  return Number(s.replace(/px/, ''));
};

hideLines = function() {
  return $('span').animate({
    opacity: 0.0
  }, HideAnimationTime);
};

dispLine = function(node, ind, top, color, bold, showloading) {
  var fontsize, span;
  if (singleWindow) {
    if (typeCount < 2 && !nodeList[0].children) {
      return;
    }
  }
  fontsize = (singleWindow ? 18 : 11);
  span = $('<span>');
  // span.attr 'class', 'line'
  span.addClass('line');
  span.addClass('show_line');
  span.css('width', $('#menu').css('width'));
  // span.css 'color', color
  if (color === '#000000') {
    span.addClass('show_line');
  } else {
    span.addClass('show_selected_line');
  }
  span.css('top', top); // String(top)
  if (bold) {
    span.css('font-weight', 'bold');
  }
  span.css('font-size', `${fontsize}pt`);
  span.text(Array(node.level + 1).join("　") + `・${node.title}`);
  if (showloading) { // ローディングGIFアニメ表示
    // http://preloaders.net/ で作成したロード中アイコンを利用
    $('<span>').text(' ').appendTo(span);
    $('<img>').attr('src', "images/loading.gif").css('height', '12pt').appendTo(span);
  }
  $('#menu').append(span);
  if (useAnimation) {
    span.hide();
  }
  spans[ind] = span;
  return node.span = span;
};

hashIndex = function(hash, entry) { // ハッシュの値を検索. 標準関数ないのか?
  var key, val;
  for (key in hash) {
    val = hash[key];
    if (val === entry) {
      return key;
    }
  }
  return null;
};

calc = function(centerNode) { // centerNodeを中心にnodeListを再計算して表示
  var i, newNodeList, node;
  newNodeList = {}; // 毎回富豪的にリストを生成
  newNodeList[0] = centerNode;
  node = centerNode;
  i = 0;
  while (node = nextNode(node)) {
    newNodeList[++i] = node;
  }
  node = centerNode;
  i = 0;
  while (node = prevNode(node)) {
    newNodeList[--i] = node;
  }
  return display(newNodeList);
};

nextNode = function(node) {
  var nextnode;
  nextnode = node.younger;
  while (!nextnode && node.parent) {
    node = node.parent;
    nextnode = node.younger;
  }
  return nextnode;
};

prevNode = function(node) {
  var prevnode;
  prevnode = node.elder;
  while (!prevnode && node.parent) {
    prevnode = node.parent;
  }
  return prevnode;
};

nasty = function(url) { // 意地悪サイト
  return url.match(/twitter\.com/i) || url.match(/www\.ted\.com/i);
};

display = function(newNodeList) { // calc()で計算したリストを表示
  var center, dest, i, j, lineHeight, newnode, node, oldnode, parent, results, top, url;
  oldNodeList = nodeList;
  nodeList = newNodeList;
  oldSpans = spans;
  spans = {};
  center = browserHeight() / 2;
  // iframeまたは別ウィンドウにコンテンツを表示
  console.log(nodeList[0]);
  url = nodeList[0].url;
  url = nodeList[0]['url'];
  console.log(url);
  showContents = true;
  if (url && showContents) {
    if (singleWindow) {
      if (showContents && !nasty(url)) {
        if (url.match(/(gif|jpg|jpeg|png)$/i)) {
          $('#iframe').css('display', 'none');
          $('#image').css('display', 'block');
          $('#image').attr('src', url);
        } else {
          $('#iframe').css('display', 'block');
          $('#image').css('display', 'none');
          $('#iframe').attr('src', url);
        }
      }
    } else {
      $.contentswin[0].setAttribute("src", url);
      $.contentswin[0].setAttribute("id", "ELECTRON"); // ????
      $.contentswin.css('height', screen.height);
      $('#menu').css('width', 250); // 何故ここで??????
    }
  }
  
  // 新しいノードの表示位置計算
  node = nodeList[0];
  lineHeight = (singleWindow ? 30 : 20);
  dispLine(node, 0, center, '#0000ff', true, node.children);
  i = 1;
  while (node = nodeList[i]) {
    top = center + i * lineHeight;
    if (top > browserHeight() - 40) {
      break;
    }
    dispLine(node, i, top, '#000000', false, false);
    i += 1;
  }
  i = -1;
  while (node = nodeList[i]) {
    top = center + i * lineHeight;
    if (top < 0) {
      break;
    }
    dispLine(node, i, top, '#000000', false, false);
    i -= 1;
  }
  // アニメーション表示
  if (useAnimation) {
// 古いエントリの扱いを調査
    for (i in oldNodeList) {
      oldnode = oldNodeList[i];
      if (j = hashIndex(nodeList, oldnode)) { // 新しいリストに存在するか調査
        if (spans[j]) {
          if (oldSpans[i]) {
            oldSpans[i].animate({ // 移動アニメーション
              top: nodeList[j].span.css('top')
            }, {
              duration: AnimationTime,
              complete: function() {
                typeCount = 2;
                return refresh(); // 見えなくなるエントリは即座に消す
              }
            });
          }
        } else {
          if (oldnode.span) {
            oldnode.span.hide(); // 古いエントリが消える場合
          }
        }
      } else {
        if (typeof shrinking !== "undefined" && shrinking !== null) {
          if (j = hashIndex(nodeList, oldnode.parent)) { // 親の位置にシュリンクしながら消える
            if (oldSpans[i]) {
              oldSpans[i].animate({
                top: nodeList[j].span.css('top'),
                color: '#ffffff',
                opacity: 0.1
              }, {
                duration: AnimationTime,
                complete: function() {
                  this.remove();
                  typeCount = 2;
                  return refresh(); // 即座に消す
                }
              });
            }
          }
        } else {
          if (oldnode.span !== void 0) {
            oldnode.span.hide();
          }
        }
      }
    }
// 新たに出現するエントリ
    results = [];
    for (i in nodeList) {
      newnode = nodeList[i];
      if (null === hashIndex(oldNodeList, newnode)) {
        parent = newnode.parent;
        if (parent && (typeof shrinking === "undefined" || shrinking === null)) { // 親の位置から出現する
          if (j = hashIndex(nodeList, parent)) {
            if (newnode.span) {
              dest = newnode.span.css('top');
              newnode.span.show();
              newnode.span.css('opacity', 0);
              newnode.span.css('top', intValue(parent.span.css('top')) + 20);
              results.push(newnode.span.animate({
                top: dest,
                color: '#000000',
                opacity: 1.0
              }, {
                duration: AnimationTime,
                complete: function() {
                  typeCount = 2;
                  return refresh();
                }
              }));
            } else {
              results.push(void 0);
            }
          } else {
            results.push(void 0);
          }
        } else {
          results.push(void 0);
        }
      } else {
        results.push(void 0);
      }
    }
    return results;
  }
};

move = function(delta, shrinkMode) { // 視点移動
  var i, newNodeList, shrinking;
  if (typeCount <= 2) {
    clearTimeout(typeCountTimeout);
    typeCount = Math.min(typeCount + 1, 2);
    typeCountTimeout = setTimeout(function() {
      return typeCount = 0;
    }, 1000);
  }
  refresh();
  if (singleWindow) {
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(hideLines, HideTime);
  }
  clearTimeout(expandTimeout);
  if (!$.mouseisdown) {
    expandTimeout = setTimeout(expand, ExpandTime);
  }
  shrinking = true;
  if (nodeList[delta]) {
    if (!$.step1) {
      $.step1 = nodeList[delta];
    }
    if (shrinkMode === 0) { // フォーカスがはずれたらシュリンクする
      calc(nodeList[delta]);
    } else {
      newNodeList = {};
      i = 0;
      while (nodeList[i + delta]) {
        newNodeList[i] = nodeList[i + delta];
        i += 1;
      }
      i = -1;
      while (nodeList[i + delta]) {
        newNodeList[i] = nodeList[i + delta];
        i -= 1;
      }
      display(newNodeList);
    }
  }
  if (useAudio) {
    say(nodeList[0]);
  }
  return false;
};

//$(window).blur(function(){ // ????
//    setTimeout(window.focus,100);
//});
getActionTime = function() {
  lastActionTime = currentActionTime;
  return currentActionTime = new Date().getTime();
};

// メニューを消すCSS transition
setEraseTiming = function() {
  $('.line').removeClass('erase_line');
  $('.line').addClass('show_line');
  $('#menu').removeClass('erase_menu');
  $('#menu').addClass('show_menu');
  clearTimeout(menuEraseTimeout);
  console.log(currentActionTime - lastActionTime);
  return menuEraseTimeout = setTimeout(function() {
    if (currentActionTime - lastActionTime > 1000) {
      $('.line').removeClass('show_line');
      $('.line').removeClass('show_selected_line');
      $('.line').addClass('erase_line');
      $('#menu').removeClass('show_menu');
      $('#menu').addClass('erase_menu');
    }
    return menuErased = true;
  }, 3000);
};

$(window).mousewheel(function(event, delta, deltaX, deltaY) {
  var d;
  getActionTime();
  setEraseTiming();
  if (menuErased) {
    menuErased = false;
    return;
  }
  d = (delta < 0 ? 1 : -1);
  return move(d, 0);
});

downfunc = function(e) {
  e.preventDefault();
  if (e.type === 'mousedown') {
    $.mousedowny = e.pageY;
  }
  if (e.type === 'touchstart') {
    $.mousedowny = event.changedTouches[0].pageY;
  }
  return $.mouseisdown = true;
};

upfunc = function(e) {
  e.preventDefault();
  $.mouseisdown = false;
  clearTimeout(expandTimeout);
  expandTimeout = setTimeout(expand, ExpandTime);
  return $.step = 0;
};

movefunc = function(e) {
  var delta, i, k, l, newstep, ref, ref1;
  e.preventDefault();
  if ($.mouseisdown) {
    delta = 0;
    if (e.type === 'mousemove') {
      delta = e.pageY - $.mousedowny;
    }
    if (e.type === 'touchmove') {
      delta = event.changedTouches[0].pageY - $.mousedowny;
    }
    if (delta > 0) {
      newstep = Math.floor(delta / 20.0);
      for (i = k = 0, ref = newstep - $.step; (0 <= ref ? k < ref : k > ref); i = 0 <= ref ? ++k : --k) {
        //if newstep > $.step
        move(-1, 1);
      }
    } else {
      //else
      //  move(1,1) for i in [0 ... $.step-newstep]
      newstep = Math.floor((0 - delta) / 20.0);
      for (i = l = 0, ref1 = newstep - $.step; (0 <= ref1 ? l < ref1 : l > ref1); i = 0 <= ref1 ? ++l : --l) {
        //if newstep > $.step
        move(1, 1);
      }
    }
    //else
    //  move(-1,1) for i in [0 ... $.step-newstep]
    return $.step = newstep;
  }
};

keydownfunc = function(e) {
  getActionTime();
  setEraseTiming();
  if (menuErased) {
    menuErased = false;
    return;
  }
  switch (e.keyCode) {
    case 37:
      return move(-1, 1); // 左
    case 38:
      return move(-1, 0); // 上
    case 39:
      return move(1, 1); // 右
    case 40:
      return move(1, 0); // 下
    default:
      return false;
  }
};

$(window).on({
  'keydown': keydownfunc
});

// $(window).on
//   'keydown':    keydownfunc
//   'mousedown':  downfunc
//   'touchstart': downfunc
//   'mouseup':    upfunc
//   'touchend':   upfunc
//   'mousemove':  movefunc
//   'touchmove':  movefunc
//   'resize':     resizefunc
setup_paddle = function() {
  var socket;
  socket = io.connect("http://localhost:3000");
  linda = new Linda().connect(socket);
  ts = linda.tuplespace('paddle');
  return linda.io.on('connect', function() {
    $.starttime = null;
    $.moveTimeout = null; // move()をsetTimeout()で呼ぶ
    $.nexttime = null; // 次のmove()予定時刻
    return ts.watch({
      type: "paddle"
    }, function(err, tuple) {
      var curtime, direction, interval, value;
      if (err) {
        alert("Linda error");
      }
      direction = tuple.data['direction'];
      value = tuple.data['value'];
      curtime = new Date();
      clearTimeout($.moveTimeout);
      if (value < 10) {
        // ポンと押してすぐ離したときひとつぶんだけ移動してほしいので、
        // ひとつ先の位置をstep1に記録しておき、すぐ離した場合は
        // そこに移動するようにする。
        if (curtime - $.starttime < 300 && $.step1) { // 一瞬で離した場合は1ステップだけ動かす
          refresh();
          calc($.step1);
        }
        $.starttime = null;
        $.nexttime = null;
        return $.step1 = null;
      } else {
        // このあたりのパラメタは結構重要
        interval = value > 500 ? 25 : value > 400 ? 50 : value > 300 ? 100 : value > 200 ? 200 : value > 150 ? 300 : value > 80 ? 400 : 500;
        if ($.starttime === null) {
          $.starttime = curtime;
          $.nexttime = $.starttime;
        }
        return fire($.nexttime - curtime, interval, movefunc(direction === "left" ? 1 : -1));
      }
    });
  });
};

// wait時間待った後でfuncを起動し、その後はintervalごとにfuncを起動
fire = function(wait, interval, func) {
  var curtime;
  curtime = new Date();
  if (wait === 0) {
    func();
    $.nexttime = Number(curtime) + interval;
    return $.moveTimeout = setTimeout(repeatedfunc(interval, func), interval);
  } else {
    $.nexttime = Number(curtime) + wait;
    return $.moveTimeout = setTimeout(repeatedfunc(interval, func), wait);
  }
};

repeatedfunc = function(interval, func) {
  return function() {
    return fire(0, interval, func);
  };
};

movefunc = function(delta) {
  return function() {
    return move(delta, 0);
  };
};

say = function(node) {
  var text;
  text = node.title;
  if (text) {
    //if(! node.children){
    //  text = text.substring(0,6);

    return $.ajax({
      type: "GET",
      async: true,
      url: `${sayCGI}?text=${text}&level=${node.level}`
    });
  }
};
