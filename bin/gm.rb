require 'haml'
require 'sinatra'

set :port, 8080
set :public, 'public'
set :static, true
set :views, 'views'

get '/' do
    haml :index_vue
end

get '/angular/?' do
    haml :index_angular
end
