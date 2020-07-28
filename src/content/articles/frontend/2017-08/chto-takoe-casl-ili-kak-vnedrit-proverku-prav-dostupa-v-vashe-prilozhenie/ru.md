---
title: Что такое CASL или как внедрить проверку прав доступа в ваше приложение?
summary: "В наше время почти каждое приложение предусматривает различный функционал для разных групп пользователей (например таких как admin, member, subscriber и т.д. ). Эти группы обычно называются \"ролями\".\r\n\r\nПо своему опыту, могу сказать, что у большинства приложений логика построеа вокруг ролей (например, если у пользователя есть эта роль, тогда он может это сделать)  и в итоге имеем массивную систему с множеством сложных проверок, которую трудно поддерживать. Эту проблему можно решить при помощи CASL."
author: sstotskyi
categories:
  - frontend
  - important
createdAt: 2017-08-14T09:00:00.000Z
meta:
  keywords:
    - права доступа
    - javascript
    - nodejs
    - acl
    - casl
alias: chto-takoe-casl-ili-kak-vnedrit-proverku-prav-dostupa-v-vashe-prilozhenie
---

[CASL](https://stalniy.github.io/casl/ "CASL") - это библиотека для авторизации в JavaScript, которая заставляет задумываться о том, что пользователь может делать в системе, а не какую роль он имеет (проверка звучит так: если пользователь имеет эту способность, то он может сделай это). Например, в приложении для блогов пользователь может создавать, редактировать, удалять, просматривать статьи и комментарии. Давайте разделим эти способности между двумя группами пользователей: анонимными пользователями (теми, кто не вошел в систему) и писателями (теми, кто вошел в систему).

**Анонимные пользователи** могут только читать посты и комментарии. **Писатели** могут делать тоже самое и не только, а именно управлять своими статьями и комментариями (“управлять” означает создавать, читать, обновлять и удалять их). При помощи [CASL](https://github.com/stalniy/casl) это можно записать вот так:

```javascript
import { AbilityBuilder } from 'casl'

const user = whateverLogicToGetUser()
const ability = AbilityBuidler.define(can => {
  can('read', ['Post', 'Comment'])

  if (user.isLoggedIn) {
    can('create', 'Post')
    can('manage', ['Post', 'Comment'], { authorId: user.id })
  }
})
```

Таким образом, можно определить, что пользователь может делать не только на основе ролей, но и на базе любых других критериев. Например, мы можем разрешить пользователям модерировать другие комментарии или статьи на основе их репутации, разрешить просмотр некоторого контента только для людей, которые подтвердили, что им исполнилось 18 лет и т.д. С [CASL](https://stalniy.github.io/casl/) можно определить всю эту логику доступа в одном месте!

Кроме того, с помощью библиотеки можно использовать базовые операторы запросов MongoDB для определения прав доступа. Подробнее об этом смотрите [в документации](https://stalniy.github.io/casl/abilities/2017/07/20/define-abilities.html).

## Проверяем возможности

Экземпляр класса Ability имеет 3 метода, которые позволяют проверять права доступа пользователя:

```javascript
ability.can('update', 'Post')
ability.cannot('update', 'Post')
ability.throwUnlessCan('update', 'Post')
```

Первый метод возвращает false, второй возвращает true, а третий выбрасывает ForbiddenError для анонимных пользователей.

В качестве второго аргумента эти методы могут принимать экземпляр класса. Они определяют тип объекта на основе constructor.name или любой другой логики, которую можно указать с помощью параметра subjectName конструктора Ability:

```javascript
const post = new Post({ title: 'What is CASL?' })

ability.can('read', post)
```

В этом случае can ('read', post) возвращает true, потому что выше мы определили, что каждый пользователь может читать все статьи. Давайте проверим случай, когда пользователь пытается изменить чужую статью (я буду ссылаться на идентификатор другого автора как **anotherId**, а к  идентификатору текущего пользователя как **myId**):

```javascript
const post = new Post({ title: 'What is CASL?', authorId: 'anotherId' })

ability.can('update', post)
```

В этом случае can ('update', post) возвращает false, поскольку он может изменять только свои собственные статьи. Очевидно, что для собственной статьи метод возвращает true:

```javascript
const post = new Post({ title: 'What is CASL?', authorId: 'myId' })
ability.can('update', post)
```

Более детально о [Проверке Прав](https://stalniy.github.io/casl/abilities/2017/07/21/check-abilities.html) можно найти в официальной документации.

## Интеграция с базой данных

CASL предоставляет функции, которые позволяют преобразовывать правила допуска в запрос к базе данных. В настоящее время CASL поддерживает только MongoDB, но библиотеку можно интегрировать с другими базами данных. Чтобы конвертировать права доступа в запрос MongoDB, используйте функцию **toMongoQuery** и метод **rulesFor** экземпляра Ability.

```javascript
import { toMongoQuery } from 'casl'
```

В этом случае query будет пустым объектом, потому что пользователь может читать все статьи. Давайте проверим, что будет на выходе для операции обновления:

```javascript
const query = toMongoQuery(ability.rulesFor('update', 'Post'))
// { $or: [{ authorId: 'myId' }] }
```

Теперь query содержит запрос, который должен возвращать статьи, созданные только мной. Все обычные правила проходят через логическое OR, поэтому вы видите $or оператор в результате запроса. Подробности об [Объединении Правил](https://stalniy.github.io/casl/abilities/2017/07/20/define-abilities.html#combining-abilities) можно найти в документации.

Также CASL предоставляет плагин для [mongoose](http://mongoosejs.com/), который добавляет accessibleBy метод к моделям. Этот метод под капотом вызывает функцию **toMongoQuery** и передает результат в метод `find` mongoose-a.

```javascript
const { mongoosePlugin, AbilityBuilder } = require('casl')
const mongoose = require('mongoose')

mongoose.plugin(mongoosePlugin)

const Post = mongoose.model('Post', mongoose.Schema({
  title: String,
  author: String,
  content: String,
  createdAt: Date
}))

// by default it asks for `read` rules and returns mongoose Query, so you can chain it
Post.accessibleBy(ability).where({ createdAt: { $gt: Date.now() - 24 * 3600 } })

// also you can call it on existing query to enforce visibility.
// In this case it returns empty array because rules does not allow to read Posts of `someoneelse` author
Post.find({ author: 'someoneelse' }).accessibleBy(ability, 'update').exec()
```

По умолчанию `accessibleBy` создаст запрос на базе `read` прав доступа. Чтобы построить запрос для другого действия, просто передайте его вторым аргументом. Более детальная информация в разделе [Интеграция с базой данных](https://stalniy.github.io/casl/abilities/database/integration/2017/07/22/database-integration.html).

## И еще одно...

CASL написан на чистом ES6, поэтому его можно использовать в любой среде JavaScript. Это означает, что Вы можете использовать одну и ту же библиотеку авторизации как на API так и на UI стороне. Благодаря этому UI может запросить все права доступа пользователя с API, и отобразить или скрыть какой-то функционал приложения.

Примеры интеграции с популярными фреймворками можно найти в правом меню официальной документации, [секция "Examples and Integrations"](https://stalniy.github.io/casl/).