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

  def test_create
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

  def test_create_fork
    open_base
    login
    create_project("fork-test")
    open_base
    to_project(@createProjects.last)
    fork_project
    open_base
  end

  def test_create_rename
    open_base
    login
    create_project("rename-test")
    open_base
    to_project(@createProjects.last)
    rename_project("renamed-my-project")
    open_base
  end

  def test_create_fork_renameMaster_renameBranch
    open_base
    login
    create_project("fork-and-rename-test")
    open_base
    to_project(@createProjects.last)
    fork_project
    open_base
    to_project(@createProjects[@createProjects.length-1])
    rename_project("renamed-master")
    open_base
    to_project(@createProjects[@createProjects.length-1])
    fork_project
    open_base
    
  end

  def test_fork_rename
    open_base
    login
    to_others_project
    fork_project
    open_base
    to_project(@createProjects.last)
    rename_project("rename-others-project")
    open_base
  end

=begin
  def test_delete
    open_base
    login
    #delete_all_own_project
  end
=end


end
