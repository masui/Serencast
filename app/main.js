//
// Serencastアプリの起動
//

'use strict';

// Electronのモジュール
const electron = require("electron");

// アプリケーションをコントロールするモジュール
const app = electron.app;

// ウィンドウを作成するモジュール
const BrowserWindow = electron.BrowserWindow;

// メインウィンドウはGCされないようにグローバル宣言
let mainWindow;

require('dotenv').config({path: `${process.env.HOME}/.env`});

// 引数または環境変数からトップページを取得
var project = process.argv[2];
if(! project) project = process.env.SERENCAST_PROJECT;
if(! project) project = "Serencast";
var page = process.argv[3];
if(! page) page = process.env.SERENCAST_PAGE;
if(! page) page = "Top";

// 全てのウィンドウが閉じたら終了
app.on('window-all-closed', function() {
    if (process.platform != 'darwin') {
	app.quit();
    }
});

// % electron . project page username password
// Quoted from electron.atom.io
//
// - パスワード情報は ~/.profile などで定義している
// - dotenv を使う方法もあり
//
app.on('login', function(event, webContents, request, authInfo, callback) {
    event.preventDefault();
    if(authInfo.host == 'video.masuilab.org'){
        callback(process.env.VIDEOM_USER, process.env.VIDEOM_PASS);
    }		
    if(authInfo.host == 'masui.sfc.keio.ac.jp'){
        callback(process.env.MASUI_SFC_USER, process.env.MASUI_SFC_PASS);
    }		
    if(authInfo.host == 'masui.org'){
        callback(process.env.MASUIORG_USER, process.env.MASUIORG_PASS);
    }		
});

// Electronの初期化完了後に実行
app.on('ready', function() {
    const Screen = electron.screen;
    var size = Screen.getPrimaryDisplay().size;
    
    // メイン画面の表示。ウィンドウの幅、高さを指定できる
    mainWindow = new BrowserWindow({
	width: size.width,
	height: size.height,
	fullscreen: true
    });
    mainWindow.loadURL('file://' + __dirname + `/index.html?project=${project}&page=${page}`);

    // ウィンドウが閉じられたらアプリも終了
    mainWindow.on('closed', function() {
        mainWindow = null;
    });
});
