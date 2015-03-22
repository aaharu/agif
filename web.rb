# coding: utf-8
# Copyright (c) 2013 aaharu
require 'sinatra'
require 'rack/contrib'
require 'base64'
require './lib/agif'
configure :production do
    require 'newrelic_rpm'
end

use Rack::Deflater
use Rack::StaticCache, :urls => ['/favicon.ico', '/robots.txt'], :root => 'public'

get '/' do
    expires 3600, :private, :must_revalidate
    erb :index
end

get '/page/frame/*' do |url|
    over_list = nil
    begin
        over_list = Agif::ImageEditor.split(url)
    rescue => e
        logger.error e.to_s
        halt 500, 'error'
    end

    expires 259200, :public
    erb :frame, :locals => {:images => over_list}
end

get '/page/split' do
    expires 259200, :public
    erb :split
end

get '/page/split/*' do |url|
    begin
        url = Komenuka::Util.build_url(url)
    rescue => e
        logger.error e.to_s
        halt 500, 'error'
    end

    redirect to('/page/split#' + url)
end

get '/gif/playback/*' do |url|
    list = nil
    begin
        list = Agif::ImageEditor.reverse(url)
    rescue => e
        logger.error e.to_s
        halt 500, 'error'
    end

    expires 259200, :public
    content_type :gif
    list.to_blob
end

get '/page/reverse' do
    expires 259200, :public
    erb :reverse
end

get '/page/reverse/*' do |url|
    begin
        url = Komenuka::Util.build_url(url)
    rescue => e
        logger.error e.to_s
        halt 500, 'error'
    end

    redirect to('/page/reverse#' + url)
end
