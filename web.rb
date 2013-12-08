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
    expires 3600, :private, :must_revalidate
    erb :index
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
        url = buildUrl(url)
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
        url = buildUrl(url)
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
    url = buildUrl(url)
    collection = nil
    list = nil
    use_cache = false
    begin
        db = get_connection
        collection = db.collection('playback')
        collection.find('url' => url).each {|row|
            list = Magick::ImageList.new.from_blob(row['img'].to_s)
            use_cache = true
        }
    rescue Exception => e
        logger.warn e.to_s
    end
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
            list.iterations = 65535
        end
    rescue Exception => e
        logger.error e.to_s
        halt 500, 'error'
    end
    begin
        unless use_cache
            collection.insert({'url' => url, 'img' => BSON::Binary.new(list.to_blob, BSON::Binary::SUBTYPE_BYTES)})
        end
    rescue Exception => e
        logger.warn e.to_s
    end

    expires 259200, :public
    content_type :gif
    list.to_blob
end
