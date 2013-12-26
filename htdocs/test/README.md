#test

##準備

```
$ sudo gem install bundler
$ sudo bundle install
$ brew install terminal-notifier
```

テストの実行
```
$ ruby test.rb
```

テストはtest.rb,テストの為に必要なメソッドはutil.rbにあります。
テストを追加するときはtest_で始まるメソッドをtest.rb内に記述してください。

一つだけテストをしたいときは
```
$ ruby test.rb --name test_hoge
```
設定はconfig.ymlにあります。
githubのテストユーザとパスワードをいれてください。
またテスト対象のURLもここで変更します。Defaultではlocal.gitfab.orgになっています。

テストは基本的にはリポジトリを作った場合、テストが失敗したか否かに関わらず
最後にはdeleteするようになっています。
またterminal-notifierによって、テストを裏で行いつつ状況を通知でしてくれます。（Mac OSXのみ）
以下のバージョンにて動作確認しました
ruby 2.0.0p247 (2013-06-27 revision 41674) [universal.x86_64-darwin13]

