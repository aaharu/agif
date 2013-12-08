# coding: utf-8
# Copyright (c) 2013 aaharu
require 'sinatra'
require 'RMagick'
require 'uri'
require 'net/http'
require 'rack/contrib'
require 'base64'
require './submodule/komenuka/lib/komenuka/util'

use Rack::Deflater
use Rack::StaticCache, :urls => ['/favicon.ico', '/robots.txt'], :root => 'public'

get '/' do
    expires 3600, :private, :must_revalidate
    erb :index
end

get '/gif/frame' do
    url = params['url']
    unless url then
        halt 400, 'no url parameter'
    end
    begin
        url = Komenuka::Util.buildUrl(url)
        uri = URI.parse(url)
        res = Net::HTTP.start(uri.host, uri.port) {|http|
            http.get(uri.path)
        }
        image = Magick::Image.from_blob(res.body)
        over = nil
        over_list = Array.new
        image.each_with_index do |frame, index|
            if index == 0
                over = frame
            else
                unless frame.background_color.to_s =~ /#[0-9A-F]{6,8}$/
                    over = frame
                else
                    over = over.composite(frame, frame.gravity, frame.page.x, frame.page.y, Magick::OverCompositeOp)
                end
            end
            over_list.push(over)
        end
    rescue Exception => e
        logger.error e.to_s
        halt 500, 'error'
    end

    expires 259200, :public
    erb :frame, :locals => {:images => over_list}
end

get '/gif/frame/simple/*' do |url|
    begin
        url = Komenuka::Util.buildUrl(url)
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
        url = Komenuka::Util.buildUrl(url)
        uri = URI.parse(url)
        res = Net::HTTP.start(uri.host, uri.port) {|http|
            http.get(uri.path)
        }
        image = Magick::Image.from_blob(res.body)
        over = nil
        over_list = Array.new
        image.each_with_index do |frame, index|
            if index == 0
                over = frame
            else
                unless frame.background_color.to_s =~ /#[0-9A-F]{6,8}$/
                    over = frame
                else
                    over = over.composite(frame, frame.gravity, frame.page.x, frame.page.y, Magick::OverCompositeOp)
                end
            end
            over_list.push(over)
        end
    rescue Exception => e
        logger.error e.to_s
        halt 500, 'error'
    end

    expires 259200, :public
    erb :frame, :locals => {:images => over_list}
end

get '/gif/playback' do
    url = params['url']
    unless url then
        halt 400, 'no url parameter'
    end
    begin
        url = Komenuka::Util.buildUrl(url)
        uri = URI.parse(url)
        res = Net::HTTP.start(uri.host, uri.port) {|http|
            http.get(uri.path)
        }
        image = Magick::Image.from_blob(res.body)
        list = Magick::ImageList.new
        over = nil
        over_list = Array.new
        image.each_with_index do |frame, index|
            if index == 0
                over = frame
            else
                unless frame.background_color.to_s =~ /#[0-9A-F]{6,8}$/
                    over = frame
                else
                    over = over.composite(frame, frame.gravity, frame.page.x, frame.page.y, Magick::OverCompositeOp)
                    over.delay = frame.delay
                end
            end
            over_list.push(over)
        end
        over_list.reverse!
        over_list.each do |frame|
            list.push(frame)
        end
        list.optimize_layers(Magick::OptimizeLayer)
        list.iterations = 65535
    rescue Exception => e
        logger.error e.to_s
        halt 500, 'error'
    end

    expires 259200, :public
    content_type :gif
    list.to_blob
end

get '/gif/playback/simple/*' do |url|
    begin
        url = Komenuka::Util.buildUrl(url)
        uri = URI.parse(url)
        res = Net::HTTP.start(uri.host, uri.port) {|http|
            http.get(uri.path)
        }
        image = Magick::Image.from_blob(res.body).reverse!
        list = Magick::ImageList.new
        image.each_with_index do |frame, index|
            list.push(frame)
            list[index].delay = frame.delay
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
    url = Komenuka::Util.buildUrl(url)
    list = nil
    begin
        unless list
            uri = URI.parse(url)
            res = Net::HTTP.start(uri.host, uri.port) {|http|
                http.get(uri.path)
            }
            image = Magick::Image.from_blob(res.body)
            list = Magick::ImageList.new
            over = nil
            over_list = Array.new
            image.each_with_index do |frame, index|
                if index == 0
                    over = frame
                else
                    unless frame.background_color.to_s =~ /#[0-9A-F]{6,8}$/
                        over = frame
                    else
                        over = over.composite(frame, frame.gravity, frame.page.x, frame.page.y, Magick::OverCompositeOp)
                        over.delay = frame.delay
                    end
                end
                over_list.push(over)
            end
            over_list.reverse!
            over_list.each do |frame|
                list.push(frame)
            end
            list.optimize_layers(Magick::OptimizeLayer)
            list.iterations = 0
        end
    rescue Exception => e
        logger.error e.to_s
        halt 500, 'error'
    end

    expires 259200, :public
    content_type :gif
    list.to_blob
end
