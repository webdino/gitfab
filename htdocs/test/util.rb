require "json"
require 'yaml'
require "selenium-webdriver"
gem "test-unit"
require "test/unit"

class TestUtils < Test::Unit::TestCase
  def setup
    @accept_next_alert = true
    @verification_errors = []
    @config = YAML.load_file("config.yml")
    @user1 = @config['testUser1']['name']
    @passwd1 = @config['testUser1']['passwd']
    @user2 = @config['testUser2']['name']
    @passwd2 = @config['testUser2']['passwd']
    @driver = Selenium::WebDriver.for :firefox 
    @driver.manage.timeouts.implicit_wait = 30
    @baseUrl = @config['baseUrl']
    @createProjects = []
    @forkProjects = []
    open_base
  
  end
  
  def teardown
    notifier("teardown")
    assert_equal [], @verification_errors
    delete_all_project
    p @createProjects
    @driver.quit
  end

  def notifier(notified)
    if notified != "[]"
      str  = "terminal-notifier -message '" + notified + "'"
      p str
      system(str)  
      p notified
    end
  end

  def open_url(url)
    notifier("open: "+url)
    @driver.get(url)
  end

  def open_base
    open_url(@baseUrl + "/")
  end 

  def create_project(name)
    notifier("creating "+name+" ...")
    @driver.find_element(:id,"create").click
    rename(name)
    commit
    @driver.get(@baseUrl+"/"+@user1+"/"+name+"/master/")
    #check_project_own
    save_create_project_data
  end

  def commit
    notifier "commit!!!! " +get_current_project.to_s 
    @driver.find_element(:id, "commit-button").click
    if alert_present?()
      @driver.switch_to.alert.accept
    end
  end

  def delete_project(project)
    to_project(project)
    @createProjects.delete(get_current_project)
    @driver.find_element(:id, "delete-button").click
    if alert_present?
      alert = @driver.switch_to.alert
      assert_match alert.text,"Are you sure to remove this project?" 
      alert.accept
    end 

    if alert_present?()
      @driver.switch_to.alert.accept
    end
    assert !100.times{
      p "waiting :"+@driver.current_url() 
      break if (@driver.current_url() == @baseUrl + "/"  rescue false) 
      sleep 1
    }
    
  end

  def delete_all_project
    p @createProjects
    @createProjects.reverse_each do |project|
      delete_project(project)
    end
  end

  def rename(name)
    @keys = []
    @driver.find_element(:id, "repository").text.length.times{
      @keys.push(:delete)
    }
    @keys.push(name)
    @keys.push(:return)
    @driver.find_element(:id, "repository").click
    @driver.find_element(:id, "reusable-textfield").send_keys @keys
    @driver.find_element(:id, "append-markdown").click
    p @driver.switch_to.methods
    
  end
  def rename_project(name)
    @createProjects.delete(get_current_project)
    projData = get_current_project
    notifier projData.to_s + " rename to " + name
    if is_branch? 
      newUrl = @baseUrl +"/"+projData[0]+"/"+projData[1]+"/"+name+"/"
    else
      newUrl = @baseUrl +"/"+projData[0]+"/"+name+"/master/"
    end
    rename(name)
    commit
    assert !300.times{
      break if (@driver.current_url() == newUrl)
      sleep 1
    }
    save_create_project_data
  
  end

  def to_project(data)
    notifier get_current_project.to_s
    path = @baseUrl +"/" + data[0] + "/" + data[1] + "/" + data[2] +"/"
    @driver.get(path)
  end

  def logout
    if @driver.find_element(:id, 'logout').displayed? then
      @driver.find_element(:id, "logout").click
    end
    assert !60.times{
      break if !(@driver.find_element(:css, "div#logger").displayed? rescue false)
      sleep 1
    }
    assert @driver.find_element(:id, "login").displayed?
    
  end  

  def login
    if @driver.find_element(:id, 'login').displayed? then
      @driver.find_element(:id, "login").click
    end
    @driver.find_element(:id,'login_field').send_keys @user1
    @driver.find_element(:id,'password').send_keys @passwd1
    @driver.find_element(:css, 'input.button').click
    assert !60.times{
      break if (@driver.current_url() == @baseUrl + '/'  rescue false) 
      sleep 1
    }
    assert !60.times{
      break if !(@driver.find_element(:css, "div#logger").displayed? rescue false) 
      sleep 1
    }
    assert @driver.find_element(:id, "logout").displayed?
    
  end

  def to_others_project
    notifier "to_others_project"
    xpath = "id('project-list')/li/div/a[position()=2][not(@href='/"+@user1+"/')]"
    @driver.find_element(:xpath,xpath).click
    xpath = "id('project-list')/li/div/a"
    @driver.find_element(:xpath,xpath).click
    notifier @driver.current_url()
  end
  
  def fork_project
    save_fork_project_data
    notifier "fork project :" + get_current_project.to_s
    @driver.find_element(:id, "fork-button").click
    if alert_present?()
      @driver.switch_to.alert.accept
    end
    if alert_present?()
      @driver.switch_to.alert.accept
    end
    assert !100.times{
      if alert_present?()
        @driver.switch_to.alert.accept
      end
      p @driver.current_url().split("/")[3] 
      break if (@driver.current_url().split("/")[3] == @user1  rescue false) 
      sleep 1
    }
    save_create_project_data
    sleep 4
  end

  def save_create_project_data
    @createProjects.push(get_current_project)
  end

  def save_fork_project_data
    @forkProjects.push(get_current_project)
  end 

  def get_current_project
    return @driver.current_url.split("/")[3,5]
  end

  def is_branch?
    return @driver.current_url.split("/")[5] != "master"
  end


  def check_create_project

  end

  def check(how,what)
    assert element_present?(how,what)&&
            @driver.find_element(how,what).displayed?,
            how.to_s + ": "+ what
  end

  def check_project_not_own

  end

  def check_project_own
    check(:id,"slide-button")
    check(:id,"fork-button")
    #check(:id,"add-collaborator-button")
    check(:id,"customize-css")
    check(:id,"delete-button")
    check(:id,"histories")  
  end

  def has_project(owner,repos,branch)

  end

  def append_md
    @driver.find_element(:id,"append_md").click

  end

  def edit_css(code)

  end
  
  def upload_file(path)
    @driver.find_element(:id, "opened_file").click
  end



  def element_present?(how, what)
    @driver.find_element(how, what)
    true
  rescue Selenium::WebDriver::Error::NoSuchElementError
    false
  end
  
  def alert_present?()
    @driver.switch_to.alert
    notifier "alert:"+@driver.switch_to.alert.text
    
    true
  rescue Selenium::WebDriver::Error::NoAlertPresentError
    false
  end
  
  def verify(&blk)
    yield
  rescue Test::Unit::AssertionFailedError => ex
    @verification_errors << ex
  end
  
end

