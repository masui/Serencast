// Generated by CoffeeScript 1.10.0
var AnimationTime, ExpandTime, HideAnimationTime, HideTime, StepTime, autoexpand, browserHeight, calc, dispLine, display, dontShowSingleNode, downfunc, expand, expandTimeout, fire, hashIndex, hideLines, hideTimeout, initData, intValue, json, keydownfunc, keyupfunc, linda, loadData, move, movefunc, nasty, nextNode, nodeList, node_app, oldNodeList, oldSpans, pauseAtLevelChange, prevNode, refresh, repeatedfunc, resizefunc, say, sayCGI, setup_paddle, showContents, singleWindow, spans, ts, typeCount, typeCountTimeout, upfunc, useAnimation, useAudio, use_linda;

if (typeof useAnimation === "undefined" || useAnimation === null) {
  useAnimation = true;
}

if (typeof showContents === "undefined" || showContents === null) {
  showContents = true;
}

if (typeof autoexpand === "undefined" || autoexpand === null) {
  autoexpand = true;
}

if (typeof pauseAtLevelChange === "undefined" || pauseAtLevelChange === null) {
  pauseAtLevelChange = true;
}

if (typeof dontShowSingleNode === "undefined" || dontShowSingleNode === null) {
  dontShowSingleNode = true;
}

if (typeof singleWindow === "undefined" || singleWindow === null) {
  singleWindow = false;
}

if (typeof json === "undefined" || json === null) {
  json = 'data.json';
}

if (typeof useAudio === "undefined" || useAudio === null) {
  useAudio = false;
}

if (typeof sayCGI === "undefined" || sayCGI === null) {
  sayCGI = "http://localhost/~masui/say.cgi";
}

node_app = typeof require !== 'undefined';

use_linda = typeof io !== 'undefined';

ts = null;

linda = null;

if (node_app) {
  singleWindow = true;
}

nodeList = {};

oldNodeList = {};

spans = {};

oldSpans = {};

StepTime = 700;

ExpandTime = 900;

expandTimeout = null;

AnimationTime = 300;

HideTime = 1600;

HideAnimationTime = 700;

hideTimeout = null;

typeCount = 0;

typeCountTimeout = null;

loadData = function() {
  return $.getJSON(json, function(data) {
    initData(data, null, 0);
    calc(data[0]);
    return expandTimeout = setTimeout(expand, ExpandTime);
  });
};

initData = function(nodes, parent, level) {
  var i, k, node, ref, results;
  results = [];
  for (i = k = 0, ref = nodes.length; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
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

$(function() {
  var height, menuwidth, nativeMenuBar, nw, param, width, win;
  if (node_app) {
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
  if (use_linda) {
    setup_paddle();
  }
  loadData();
  if (showContents) {
    if (singleWindow) {

    } else {
      height = screen.availHeight;
      menuwidth = Math.min(screen.availWidth / 5, 300);
      width = screen.availWidth - menuwidth;
      param = "top=0,left=" + menuwidth + ",height=" + height + ",width=" + width + ",scrollbars=yes";
      $.contentswin = window.open("", "Contents", param);
    }
  }
  if (singleWindow) {
    return $('#menu').css('left', '200pt');
  } else {
    return $('#menu').css('left', '10pt');
  }
});

refresh = function() {
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

browserHeight = function() {
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
  $('#menu').css('height', height);
  $('#panel').css('width', width);
  return $('#panel').css('height', height);
};

expand = function() {
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
    return expandTimeout = setTimeout(expand, StepTime);
  }
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
  span.attr('class', 'line');
  span.css('width', $('#menu').css('width'));
  span.css('color', color);
  span.css('top', String(top));
  if (bold) {
    span.css('font-weight', 'bold');
  }
  span.css('font-size', fontsize + "pt");
  span.text(Array(node.level + 1).join("　") + ("・" + node.title));
  if (showloading) {
    span.append($(' <span>&nbsp;</span>'));
    span.append($('<img src="/images/loading.gif" style="height:12pt;">'));
  }
  $('#menu').append(span);
  if (useAnimation) {
    span.hide();
  }
  spans[ind] = span;
  return node.span = span;
};

hashIndex = function(hash, entry) {
  var key, val;
  for (key in hash) {
    val = hash[key];
    if (val === entry) {
      return key;
    }
  }
  return null;
};

calc = function(centerNode) {
  var i, newNodeList, node;
  newNodeList = {};
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

nasty = function(url) {
  return url.match(/twitter\.com/i) || url.match(/www\.ted\.com/i);
};

display = function(newNodeList) {
  var center, dest, i, j, lineHeight, newnode, node, oldnode, parent, results, top, url;
  oldNodeList = nodeList;
  nodeList = newNodeList;
  oldSpans = spans;
  spans = {};
  center = browserHeight() / 2;
  url = nodeList[0].url;
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
      $.contentswin.location.href = url;
    }
  }
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
  if (useAnimation) {
    for (i in oldNodeList) {
      oldnode = oldNodeList[i];
      if (j = hashIndex(nodeList, oldnode)) {
        if (spans[j]) {
          if (oldSpans[i]) {
            oldSpans[i].animate({
              top: nodeList[j].span.css('top')
            }, {
              duration: AnimationTime,
              complete: function() {
                typeCount = 2;
                return refresh();
              }
            });
          }
        } else {
          if (oldnode.span) {
            oldnode.span.hide();
          }
        }
      } else {
        if (typeof shrinking !== "undefined" && shrinking !== null) {
          if (j = hashIndex(nodeList, oldnode.parent)) {
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
                  return refresh();
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
    results = [];
    for (i in nodeList) {
      newnode = nodeList[i];
      if (null === hashIndex(oldNodeList, newnode)) {
        parent = newnode.parent;
        if (parent && (typeof shrinking === "undefined" || shrinking === null)) {
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

move = function(delta, shrinkMode) {
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
    if (shrinkMode === 0) {
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

$(window).mousewheel(function(event, delta, deltaX, deltaY) {
  var d;
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
      for (i = k = 0, ref = newstep - $.step; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
        move(-1, 1);
      }
    } else {
      newstep = Math.floor((0 - delta) / 20.0);
      for (i = l = 0, ref1 = newstep - $.step; 0 <= ref1 ? l < ref1 : l > ref1; i = 0 <= ref1 ? ++l : --l) {
        move(1, 1);
      }
    }
    return $.step = newstep;
  }
};

keydownfunc = function(e) {
  switch (e.keyCode) {
    case 37:
      move(-1, 1);
      break;
    case 38:
      move(-1, 0);
      break;
    case 39:
      move(1, 1);
      break;
    case 40:
      move(1, 0);
  }
  if (e.keyCode === 38) {
    $('#up').css('display', 'block');
  }
  if (e.keyCode === 40) {
    return $('#down').css('display', 'block');
  }
};

keyupfunc = function(e) {
  $('#up').css('display', 'none');
  $('#down').css('display', 'none');
  return $('#pressed').text("");
};

$(window).on({
  'mousedown': downfunc,
  'touchstart': downfunc,
  'mouseup': upfunc,
  'touchend': upfunc,
  'mousemove': movefunc,
  'touchmove': movefunc,
  'keydown': keydownfunc,
  'keyup': keyupfunc,
  'resize': resizefunc
});

setup_paddle = function() {
  var socket;
  socket = io.connect("http://localhost:3000");
  linda = new Linda().connect(socket);
  ts = linda.tuplespace('paddle');
  return linda.io.on('connect', function() {
    $.starttime = null;
    $.moveTimeout = null;
    $.nexttime = null;
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
        if (curtime - $.starttime < 300 && $.step1) {
          refresh();
          calc($.step1);
        }
        $.starttime = null;
        $.nexttime = null;
        return $.step1 = null;
      } else {
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
    return $.ajax({
      type: "GET",
      async: true,
      url: sayCGI + "?text=" + text + "&level=" + node.level
    });
  }
};
