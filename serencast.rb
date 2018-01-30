# -*- coding: utf-8 -*-
# -*- ruby -*-

$:.unshift File.expand_path 'lib', File.dirname(__FILE__)

require 'rubygems'

require 'sinatra'
require 'sinatra/cross_origin' # gem install sinatra-cross_origin

require 'gethistory'
require 'getsbdata'

configure do
  enable :cross_origin
end

get '/:project' do |project|
  redirect "/#{project}/__bookmarks"
end

get '/:project/' do |project|
  redirect "/#{project}"
end

get '/:project/:page' do |project,page|
  @project = project
  @page = page
  erb :serencast
end

get '/:project/:page/json' do |project,page|
  response['Access-Control-Allow-Origin'] = '*'
  getsbdata(project,page).to_json
end

get '/' do
  send_file File.join(settings.public_folder, 'index.html')
  # redirect 'index.html'
end

# get '/index.html' do
#   redirect 'https://masui.github.io/Serencast/'
# end

error do
  "Error!"
end
