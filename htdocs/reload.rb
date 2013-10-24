#!/usr/bin/env ruby
require 'net/telnet'
def mozrepl_open
  $telnet = Net::Telnet.new("Host" => "localhost", "Port" => 4242, "Prompt" => /repl\> \z/n)
end
def mozrepl_cmd(str)
  $telnet.cmd(str)
  sleep(0.5)
end
def mozrepl_close
  $telnet.puts("repl.quit()")
  $telnet.close
end
mozrepl_open
#mozrepl_cmd("gBrowser.selectedTab = gBrowser.addTab()")
mozrepl_cmd("content.location.reload(true)")

mozrepl_close