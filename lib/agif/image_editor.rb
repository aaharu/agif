# coding: utf-8
require 'RMagick'
require 'uri'
require 'net/https'

module Agif
    module ImageEditor
        def self.split(url)
            url = Komenuka::Util.build_url(url)
            uri = URI.parse(url)
            http = Net::HTTP.new(uri.host, uri.port)
            http.use_ssl = true if uri.scheme == 'https'
            res = http.get(uri.path)
            image = Magick::Image.from_blob(res.body)
            over = nil
            over_list = Array.new
            image.each_with_index do |frame, index|
                if index == 0
                    over = frame
                else
                    if frame.background_color.to_s =~ /#[0-9A-F]{6,8}$/
                        over = over.composite(frame, frame.gravity, frame.page.x, frame.page.y, Magick::OverCompositeOp)
                    else
                        over = frame
                    end
                end
                over_list.push(over)
            end
            return over_list
        end

        def self.reverse(url)
            url = Komenuka::Util.build_url(url)
            uri = URI.parse(url)
            http = Net::HTTP.new(uri.host, uri.port)
            http.use_ssl = true if uri.scheme == 'https'
            res = http.get(uri.path)
            image = Magick::Image.from_blob(res.body)
            list = Magick::ImageList.new
            over = nil
            over_list = Array.new
            image.each_with_index do |frame, index|
                if index == 0
                    over = frame
                else
                    if frame.background_color.to_s =~ /#[0-9A-F]{6,8}$/
                        over = over.composite(frame, frame.gravity, frame.page.x, frame.page.y, Magick::OverCompositeOp)
                        over.delay = frame.delay
                    else
                        over = frame
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
            return list
        end
    end
end
