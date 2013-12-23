require "json"
require "selenium-webdriver"
gem "test-unit"
require "test/unit"
require "./util.rb"

class TestUtils < Test::Unit::TestCase


  
  def est_login_logout
    login
    logout
    login
    logout
  end

  def test_create_and_delete
    open_base
    login
    create_project("create-test")
    open_base
  end

  def test_fork_from_others_twice
    open_base
    login 
    to_others_project
    fork_project
    open_base
    to_project(@createProjects.last)
    rename_project("renamed-others-project")
    to_project(@forkProjects.last)
    fork_project
    open_base
  end

  def test_fork_from_fork_from_others
    open_base
    login
    to_others_project
    fork_project
    open_base
    to_project(@createProjects.last)
    fork_project
    open_base
  end


end
