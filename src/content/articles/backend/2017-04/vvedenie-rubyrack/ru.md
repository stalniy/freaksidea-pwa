---
title: 'Введение Ruby::Rack'
summary: |
  Как оказалось создание web приложения на Ruby без использования фреймворков,
  вроде Rails или Sinatra, не так уж просто. Для этого необходимо полностью
  реализовать поддержку протокола HTTP, т.е. написать парсер заголовков и тела
  запроса, а также отдавать результат клиенту при помощи обычной функции print.
  Но все же, не все так плохо и есть дорожка выстеленная благими намерениями -
  это Rack.
author: sstotskyi
categories:
  - backend
  - important
  - backend
createdAt: 2017-04-29T20:31:00.000Z
meta:
  keywords:
    - Ruby
    - Rack
alias: vvedenie-rubyrack
---

Если вдруг кто не знает, у меня есть свой _Open-Source_ проект - бесплатный [AJAX файловый менеджер](/javascript/show-54-sjfilemanager-evoliutsiia-php-ajax-failovyi-menedzher). Начав изучать _Ruby_, первое что пришло мне в голову - это написать для него _backend_ адаптер (и для проекта хорошо и для меня практика). Конечно же, пришлось зарефакторить _JavaScript_ код, но об этом в другой статье.

Как оказалось создание _web_ приложения на _Ruby_ без использования фреймворков, вроде [_Rails_](http://ru.wikipedia.org/wiki/Ruby_on_Rails) или [_Sinatra_](http://ru.wikipedia.org/wiki/Sinatra), не так уж просто. Для этого необходимо полностью реализовать поддержку протокола _HTTP_, т.е. написать парсер заголовков и тела запроса, а также отдавать результат клиенту при помощи обычной функции _print_. Но все же, не все так плохо и есть дорожка выстеленная благими намерениями - это _[Rack](http://en.wikipedia.org/wiki/Rack_(web_server_interface))_.

## Rack? Не, не слышал

_Rack_ - это интерфейс, который создан, чтобы обеспечить минимальное _API_ для подключения веб-серверов поддерживающих _Ruby_ (_WEBrick_, _Mongrel_ и т.д.) и веб-фреймворками (_Rails_, _Sinatra_ и др.). В нем реализован базовый функционал для работы с _HTTP_ протоколом: утилиты для парсинга, классы _Response,_ _Request_, _Session_ и многое другое.

Вернемся к абстрактным вещам. Если проанализировать взаимодействие сервера и клиента, то можно обнаружить 3 ключевых аспекта: статус запроса, заголовки и тело. Именно это и стало фундаментом _Rack Application_.

Что же такое **Rack Application**? Это самый обычный _Ruby_ объект, который отвечает на метод **call**. В этот метод передаются переменные среды (_environment variables_) и он должен возвратить массив состоящий из 3-х элементов: числового статуса, хеша заголовков и тела ответа. Последний должен отвечать на метод _each_, которому передается блок.

Поскольку в _Ruby_ нет интерфейсов и все держится на честном слове, то единственный способ, которым осуществляется проверка наличия метода - это _method\_defined?_ и _respond\_to?_. Т.е., _Ruby_ не может проверить сделали ли Вы что-то с переданным блоком или знает ли Ваш код об этом вообще, по-этому нужно быть предельно внимательным. Достаточно поясничать, давайте посмотрим на пример

```ruby
class Application
  def call(env)
    [200, {'Content-Type' => 'text/html'}, ["This is Rack!"]]
  end
end

run Application.new
```

Сохраняем пример в файл **config.ru** (стандартное конфигурационное имя файла для _rackup_) и в командной строке запускаем сервер:

```bash
rackup config.ru
```

По логам можно определить на каком порту запустился сервер (в моем случае 9292). Открываем броузер _http://localhost:9292_ и видим строку "**This is Rack!**". Заголовок _Content-Type_ является обязательным, если Ваше приложение не возвращает такого заголовка, то _Rack_ выбросит эксепшен.

Отойдя немного от темы, расскажу о существовании сервера _shotgun_, который работает точно также, как и _rackup_, но используется для _development_ целей. При запуске сервера _Ruby_ подгружает нужные файлы в память, которые там "живут" все время, т.е. _rackup_ - что-то вроде _application server_. А это значит, что изменения в любом файле не вступят в силу до тех пор, пока не будет перезагружен сервер. И это становится проблемой во время активной разработки, по этому стоит использовать _shotgun_, он следит за файлами и автоматически их перегружает. Этот сервер доступен, как обычный _Ruby gem_, по этому установить его не составит труда.

## Полезное в Rack изнутри?

Как я уже упомянул раньше _Rack_ содержит набор полезных утилит и 3 важнейших для любого _web_ приложения класса: _Response_, _Request_ и _Session_.

**Rack::Response** предоставляет интерфейс, который упрощает создание ответа клиенту. Позволяет устанавливать заголовки, куки и создавать тело ответа. Класс достаточно простой, его исходники можно найти на [GitHub](https://github.com/rack/rack/blob/master/lib/rack/response.rb)\-е (а чего там нельзя найти?). Несколько примеров:

```ruby
require 'rack'
require 'rack/response'

class Application
  def call(env)
    response = Rack::Response.new

    # Append text to response body
    response.write "This is Rack"
    response.write "!!!"
    # Set Content-Type
    response['Content-Type'] = "text/html"
    # Set cookie
    response.set_cookie("my_cookie", "Hello Rack");
    # [status, headers, body]
    response.finish
  end
end

run Application.new
```

Класс **Rack::Request** более интересен, он предоставляет интерфейс для доступа к переменным запроса и упрощает работу с загружаемыми файлами. В качестве единственного параметра для инициализации принимает хеш переменных среды. Умеет делать множество полезных вещей: проверять тип запроса (_Head, Delete, Options, Get, Post, Put_), парсить _QUERY\_STRING_ в хеш, читать куки, возвращать базовый _URL_, узнать _referer_ или _user\_agent_. Например

```ruby
# inside call method
request = Rack::Request.new(env)

# hash of all GET & POST parameters
request.params

# return "my_param"
request["my_param"]

# set "my_param"
request["my_param"] = "new value"

# read cookie
request.cookies["my_cookie"]

# file upload
if request.post?
  # file is hash that consists from all necessary information about uploaded file including TempFile object
  file = request["my_file"]
  return [200, {"Content-Type" => "text/html"}, [file[:tempfile].read]]
end
```

**Rack::Session** реализован, как функционально-независимая часть и предоставляет 3 адаптера для хранения: в куках, в мемкэш сервере и обычный _HashPool_. Первый не рекомендуется использовать на продакшен серверах в целях безопасности, но вполне годится для девелопмента. К сессии можно обратится через экземпляр класса _Rack::Request_ при помощи метода _session_, который представляет собой простой хеш.

Сессия является оберткой для приложения, если говорить более строгими терминами, то класс сессии является декоратором (паттерн декоратор) для _rack application-_а. Например

```ruby
myapp = MyRackApp.new
sessioned = Rack::Session::Pool.new(myapp,
  :domain => 'foo.com',
  :expire_after => 2592000
)

run sessioned
```

Все конечно хорошо, но хотелось бы добавлять новый функционал с минимальным изменением кода и без нагромождений. Для этого в _Rack_ существует понятие _middleware_ (чем по сути и является сам фреймворк). Используя _middleware_ (посредник/фильтр) можно изменить/подготовить запрос перед тем как он попадет в _Application_, аналогично и с ответом для клиента.

## Rack Middleware

Предыдущий пример можно переписать через _middleware_ и метод _use rackup_ сервера

```ruby
class Application
  def call(env)
    request = Rack::Request.new(env)

    request.session[:user_ip] ||= request.ip
    [200, {'Content-Type' => 'text/html'}, [request.session.inspect]]
  end
end
use Rack::Session::Pool
run Application.new
```

Также можно эмулировать работу _shotgun_ сервера при помощи стандартного **Rack::Reloader** _middleware_.

```ruby
class Application
  def call(env)
    request = Rack::Request.new(env)

    request.session[:user_ip] ||= request.ip
    [200, {'Content-Type' => 'text/html'}, [request.session.inspect]]
  end
end
use Rack::Session::Pool
use Rack::Reloader
run Application.new
```

В отличии от метода _run_, методу _use_ нужно передать класс, а не объект. Выглядит достаточно элегантно и гибко.

## Пишем свой middleware

Для примера можно написать простую авторизацию по _IP_. Если _IP_ пользователя находится в массиве разрешимых, то он получает доступ к приложению, если нет, то отдаем 404 страничку.

```ruby
class IpAuth
  @@trusted_ips = %w(127.0.0.1 ::1)

  def initialize(app)
    @app = app
  end

  def call(env)
    request = Rack::Request.new(env);

    if @@trusted_ips.include?(request.ip)
      @app.call(env)
    else
      [404, {'Content-Type' => "text/html"}, ['Not Found']]
    end
  end
end

class Application
  def call(env)
    request = Rack::Request.new(env)

    request.session[:user_ip] ||= request.ip
    [200, {'Content-Type' => 'text/html'}, [request.session.inspect]]
  end
end

use IpAuth
use Rack::Session::Pool
use Rack::Reloader
run Application.new
```

В метод _initialize_ передается объект _application_, в соответствии с цепочкой _middleware_ (т.е., вызовов методов **use**), в конкретном случае _IpAuth_ получит экземпляр класса _Rack::Session::Pool_. В этом же методе мы просто сохраняем ссылку на приложение, чтобы потом можно было его вызвать в методе **call**. Вот так просто можно добавить авторизацию для своего приложения.

**P.S.**: _Rack_ имеет [документацию](http://rack.rubyforge.org/doc/), но это не то, по чему можно было бы нормально изучать фреймворк, по этому чаще смотрю исходники на GitHub.
