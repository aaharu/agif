source 'https://rubygems.org'
ruby '2.1.2'
gem 'thin', '~> 1.5'
gem 'sinatra', '~> 1.4'
gem 'rmagick', '~> 2.13', :require => 'RMagick'
gem 'rack-contrib'
gem 'punycode4r', '~> 0.2.0'

group :production do
    gem 'newrelic_rpm'
end

group :development, :test do
    gem 'rake'
end
