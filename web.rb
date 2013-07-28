# coding: utf-8
# Copyright (c) 2013 aaharu
require 'sinatra'
require 'RMagick'
require 'uri'
require 'net/http'
require 'rack/contrib'
require 'base64'
require 'punycode'

use Rack::Deflater
use Rack::StaticCache, :urls => ['/favicon.ico', '/robots.txt'], :root => 'public'

def buildUrl(url)
    unless /^http/ =~ url
        url = 'http://' + url
    else
        unless url.index('://') then
            url.sub!(':/', '://')
        end
    end
    url.sub!(/:\/\/([^\/]+)/) {|match|
        words = $1.split('.')
        words.each_with_index {|word, i|
            next if word =~ /[0-9a-z\-]/
                words[i] = "xn--#{Punycode.encode(word)}"
        }
        "://#{words.join('.')}"
    }
    return url
end

get '/' do
    expires 60, :private, :must_revalidate
    'hello'
end

get '/gif/frame' do
    url = params['url']
    unless url then
        halt 400, 'no url parameter'
    end
    begin
        url = buildUrl(url)
        uri = URI.parse(url)
        res = Net::HTTP.start(uri.host, uri.port) {|http|
            http.get(uri.path)
        }
        image = Magick::Image.from_blob(res.body)
    rescue Exception => e
        logger.error e.to_s
        halt 500, 'error'
    end

    expires 259200, :public
    erb :frame, :locals => {:images => image}
end

get '/gif/frame/*' do |url|
    begin
        url = buildUrl(url)
        uri = URI.parse(url)
        res = Net::HTTP.start(uri.host, uri.port) {|http|
            http.get(uri.path)
        }
        image = Magick::Image.from_blob(res.body)
    rescue Exception => e
        logger.error e.to_s
        halt 500, 'error'
    end

    expires 259200, :public
    erb :frame, :locals => {:images => image}
end

get '/gif/playback' do
    url = params['url']
    unless url then
        halt 400, 'no url parameter'
    end
    begin
        url = buildUrl(url)
        uri = URI.parse(url)
        res = Net::HTTP.start(uri.host, uri.port) {|http|
            http.get(uri.path)
        }
        image = Magick::Image.from_blob(res.body).reverse!

        list = Magick::ImageList.new
        index = 0
        image.each do |frame|
            list.push(frame)
            list[index].delay = frame.delay
            index += 1
        end
        list.iterations = 65535
    rescue Exception => e
        logger.error e.to_s
        halt 500, 'error'
    end

    expires 259200, :public
    content_type :gif
    list.to_blob
end

get '/gif/playback/*' do |url|
    begin
        url = buildUrl(url)
        uri = URI.parse(url)
        res = Net::HTTP.start(uri.host, uri.port) {|http|
            http.get(uri.path)
        }
        image = Magick::Image.from_blob(res.body).reverse!

        list = Magick::ImageList.new
        index = 0
        image.each do |frame|
            list.push(frame)
            list[index].delay = frame.delay
            index += 1
        end
        list.iterations = 65535
    rescue Exception => e
        logger.error e.to_s
        halt 500, 'error'
    end

    expires 259200, :public
    content_type :gif
    list.to_blob
end
