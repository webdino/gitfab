# ビルド

以下の 3 点を解説します。

* ビルドに必要なソフトウェア
* 事前準備
* ビルド方法

## ビルドに必要なソフトウェア

ビルドのためには以下のソフトウェアが必要です。
インストール方法については、それぞれの Web サイトをご覧ください。

* [node.js](http://node.js/)
* [npm](https://npmjs.org/‎)

## 事前準備

ビルド環境を設定するために、以下の作業が必要です。
これは 1 度行えば良い作業です。

1. 必要な node モジュールのインストール
2. 動作に必要なライブラリのダウンロード

以下の通りコマンドを実行すると、事前準備が終了します。

    % npm install
	% ./node_modules/bower/bin/bower install

## ビルド

Grunt コマンドでビルドします。

    % grunt
	
# ディレクトリ構成

    src         ：ソースコード
	public      ：ビルド先
	node_modules：ビルドに必要な node module がインストールされるディレクトリ
	components  ：実行に必要なライブラリがインストールされるディレクトリ
	package.json：ビルドに必要な node module のリスト
	bower.json  ：実行に必要なライブラリのリスト
	Gruntfile.js：ビルドルール
