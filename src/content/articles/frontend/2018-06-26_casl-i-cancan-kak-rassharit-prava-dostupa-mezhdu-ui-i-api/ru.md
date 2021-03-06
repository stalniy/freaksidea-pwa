---
id: 4
title: CASL и Cancan. Как расшарить права доступа между UI и API
summary: В этой статье я хочу раcсказать о том как интегрировать CASL с Rails API.
author: sstotskyi
categories:
  - frontend
  - important
  - backend
createdAt: 2018-06-26T05:00:00.000Z
meta:
  keywords:
    - права доступа
    - Ruby
    - casl
alias: casl-i-cancan-kak-rassharit-prava-dostupa-mezhdu-ui-i-api
---

![CASL Vuex + Rails API](./casl-vue-rails-logo.png "CASL Vuex + Rails API")

С ростом количества и типов устройств приложения были разделены на два отдельных компонента: UI (front-end, то, что пользователь видит и взаимодействует) и API (back-end, подразумевает бизнес-правила). Эти 2 части могут быть написаны на одном языке (например, JavaScript) или на разных (например, JavaScript на UI и Ruby on API). Такой подход позволяет описать бизнес-правила всего один раз и реализовывать отдельные пользовательские интерфейсы для каждого типа устройства (например, Web, iOS, Android).

В приложениях, которые поддерживают аутентификацию, мы часто хотим изменить то, что пользователи могут делать в зависимости от их роли. Например, гостевой пользователь может видеть сообщение, но только зарегистрированный пользователь или администратор видит кнопку для удаления этого сообщения.

Управление этими правами может стать кошмаром для приложений, которые разделены на UI и API. Более того, если есть две разные команды, которые реализуют эти части, они, скорее всего, придут к созданию кода, который будет обрабатывать разрешения для UI и API отдельно. Таким образом, изменения в логике прав доступа back-end-а потребуют изменений на UI и наоборот.

Это увеличивает время для разработки и увеличивает количество ошибок в приложении. Так как же с этим бороться?

## Делитесь правами доступа :)

Когда это возможно, определите права доступа на стороне сервера и поделись ими с клиентской стороной. Этот подход работает очень хорошо, если вы используете _Node.js_, потому что вы можете использовать [CASL](https://github.com/stalniy/casl) с обеих сторон и легко передавать правила с использованием токена JWT например.

Также CASL прекрасно работает с Ruby gem-ом [cancan](https://github.com/ryanb/cancan) (не поддерживаемый, сообщество создало форк под названием [cancancan](https://github.com/CanCanCommunity/cancancan)). На самом деле этот gen был для меня большим вдохновением для создания CASL :)

**Впервые слышете о CASL?** Рекомендую прочесть [Что такое CASL?](../2017-08-14_chto-takoe-casl-ili-kak-vnedrit-proverku-prav-dostupa-v-vashe-prilozhenie)

## Пример интеграции

![CASL Vuex + Rails API](./vuex-rails-app.gif "CASL Vuex + Rails API")

Я создал пример, который показывает, как интегрировать API на базе Rails 5 с пользовательским интерфейсом на базе Vue. Это простое приложение для блога, которое позволяет управлять статьями, входить в приложение и выходить из него.

**Для тех**, кто интересен в конечном результате, перейдите по ссылкам [Vue app](https://github.com/stalniy/casl-vue-api-example) и [Rails API](https://github.com/stalniy/rails-cancan-api-example)

### REST API

На самом деле на серверной стороне нет особо тонкостей, которые требуют объяснений. Это обычное Rails приложение, которое отдает JSON в ответ на запросы. Вся логика авторизации была выполнена с помощью вспомогательной функции _load\_and\_authorize\_resource_ (за деталями обращайтесь к [Wiki Cancancan](https://github.com/CanCanCommunity/cancancan/wiki) проекта).

Сессия управляется с помощью JWT токена. Этот токен содержит только поле _user\_id_. Для входа в систему клиент должен отправить запрос _POST в /api/session_ с электронной почтой и паролем (более детально описано в [README проекта](https://github.com/stalniy/rails-cancan-api-example)). В случае успешного ответа сервер возвращает JWT токен и список правил, совместимых с форматом CASL.

Это ответ для пользователя с ролью "member":

```javascript
{
    "token": "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoyfQ.3MA5pz-JXuSs3YHdIEJcokTpharBLjUmfzXGp1dyYY8",
    "rules": [
        {
            "actions": ["read"],
            "subject": ["all"]
        },
        {
            "actions": ["manage"],
            "subject": ["Article"],
            "conditions": {
                "author_id": 2
            }
        },
        {
            "actions": ["read", "update"],
            "subject": ["User"],
            "conditions": {
                "id": 2
            }
        }
    ]
}
```

Этот ответ говорит, что пользователь может читать все, может управлять статьями, в которых _author\_id_ равно _2_, и может читать и обновлять пользователя _id_ которого равно _2_. Возможно, Вы уже поняли, что число _2_ является идентификатором залогиненого пользователя. Проще говоря, он может управлять собственными статьями, обновлять собственный профиль и читать все остальное.

Cancan хранит правила не так, как CASL, поэтому я добавил метод _to\_list_ в _Ability_, что возвращает массив правил, который может использовать CASL:

```ruby
class Ability
  include CanCan::Ability

  # ....

  def to_list
    rules.map do |rule|
      object = { actions: rule.actions, subject: rule.subjects.map{ |s| s.is_a?(Symbol) ? s : s.name } }
      object[:conditions] = rule.conditions unless rule.conditions.blank?
      object[:inverted] = true unless rule.base_behavior
      object
    end
  end
end
```

### Vue app

CASL поставляется вместе с дополнительным [пакетом для Vue](https://github.com/stalniy/casl/tree/master/packages/casl-vue). Этот пакет добавляет метод _$can_ во все компоненты Vue и позволяет легко проверять права доступа в шаблонах. Например:

```html
<template>
  <div v-if="$can('create', 'Post')">
    <a @click="createPost">Add Post</a>
  </div>
</template>
```

Это приложение использует Vuex для управления локальным состоянием. Все запросы к REST API сделаны с помощью actions в Vuex.Store. Также есть несколько плагинов и модулей, которые Вы можете найти в папке _src/store_, но самым интересным для нас является _src/store/ability.js_.

Этот плагин заполняет экземпляр _Ability_ правами доступа когда пользователь логинится в систему и удаляет его при выходе из системы.

```javascript
import { Ability } from '@casl/ability'

export const ability = new Ability()

export const abilityPlugin = (store) => {
  ability.update(store.state.rules)

  return store.subscribe((mutation) => {
    switch (mutation.type) {
    case 'createSession':
      ability.update(mutation.payload.rules)
      break
    case 'destroySession':
      ability.update([{ actions: 'read', subject: 'all' }])
      break
    }
  })
}
```

В приведенном выше коде я создаю и экспортирую пустой экземпляр _Ability_ (этот экземпляр будет использоваться позже). Затем я создаю плагин для _Vuex_, который подписывается на сохранение изменений. Когда коммитится мутация _createSession_ (т. е. вход пользователя), _Ability_ обновляется указанными правами доступа и на _destroySession_ (т.е., выход пользователя), способность сбрасывается в режим только для чтения.

Позже этот плагин подключается к хранилищу [через свойство _plugins_](https://github.com/stalniy/casl-vue-api-example/blob/master/src/store/index.js#L19) и что способность реэкспортируется и передается в [Vue abilitiesPlugin](https://github.com/stalniy/casl-vue-api-example/blob/master/src/main.js#L13).

Вот и все!

Теперь изменения прав доступа на клиента и на сервера синхронизированы, и когда Вы изменяете правила API, Вам не нужно менять код на UI.

**P.S.**: оригинальная статья была опубликована на [Medium.com](https://medium.com/dailyjs/casl-and-cancan-permissions-sharing-between-ui-and-api-5f1fa8b4bec)

## Вместо заключения

Как видно из примера, CASL достаточно несложно интегрировать с существующими решениями. Если что-то было не понятно - пишите в комментариях или посмотрите в:

*   [Официальной документации](https://stalniy.github.io/casl/)
*   [Менеджмент прав доступа во Vue](https://medium.com/dailyjs/vue-acl-with-casl-781a374b987a)
*   [Управление ACL в React](https://medium.com/dailyjs/managing-user-permissions-in-your-react-app-a93a94ff9b40)
*   [Права доступа пользователей в Aurelia](https://medium.com/@sergiy.stotskiy/casl-based-authorization-in-aurelia-app-3e44c0fe1703)
*   [Авторизация в Express.js API](https://medium.com/@sergiy.stotskiy/authorization-with-casl-in-express-app-d94eb2e2b73b)
*   [Авторизация в Feathers.js API](https://blog.feathersjs.com/authorization-with-casl-in-feathersjs-app-fd6e24eefbff)
