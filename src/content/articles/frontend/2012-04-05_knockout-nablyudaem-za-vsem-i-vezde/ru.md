---
title: KnockOut - наблюдаем за всем и везде
summary: |
  О MVVM патерне, вокруг которого все крутится, уже упоминалось в предыдущей
  статье. В соответствии патерну, на котором построен фреймворк, Капитан
  Очевидность КО состоит из 3 основных частей: наблюдаемые свойства и
  зависимости, декларативные привязки (байндинги) и шаблоны (темплейтинг). В
  этот раз поговорим о наблюдаемых свойствах
author: sstotskyi
categories:
  - frontend
  - important
createdAt: 2012-04-05T16:42:00.000Z
meta:
  keywords:
    - javascript
    - knockout
    - MVVM
alias: knockout---nablyudaem-za-vsem-i-vezde
---

О [MVVM](http://ru.wikipedia.org/wiki/Model-View-ViewModel) патерне, вокруг которого все крутится, уже упоминалось [в предыдущей статье](../2012-04-04_vvedenie-v-knockout-novyj-vzglyad-na-postroenie-javascript-prilozhenij). В соответствии патерну, на котором построен фреймворк, КО состоит из 3 основных частей:

*   наблюдаемые свойства и зависимости;
*   декларативные привязки (байндинги);
*   шаблоны (темплейтинг).

## Отображение View Model

В качестве _ViewModel_ может быть любой _JavaScript_ объект со свойствами и методами, например

```javascript
var PersonViewModel = {
    personName: 'Серега',
    personAge:  22
};
```

Для создания самого простого отображения этой модели достаточно прописать байндинг для любого _DOM_ элемента, например:

```html
Меня зовут <span data-bind="text: personName"></span> и мне <span data-bind="text: personAge"></span> года
```

Чтобы заставить все это работать достаточно написать (ko - глобальный объект)

```javascript
ko.applyBindings(PersonViewModel);
```

В этом случае knockout пройдет по всем элементам _DOM_, в которых есть атрибут **data-bind** и выполнит все привязки. Этот атрибут нестандартный для HTML (HTML5 не в счет, он еще не утвержден как стандарт), но это не мешает броузеру работать в нормальном лихорадочном режиме.

Вызов этого скрипта можно поместить в самый низ страницы или же добавить как слушателя на событие **DOMContentLoaded,** с чем отлично может справится _jQuery._ Результатом выполнения будет

```html
Меня зовут <span data-bind="text: personName">Серега</span> и мне <span data-bind="text: personAge">22</span> года
```

Метод **applyBindings** принимает 2 параметра:

*   обязательный, _View Model_;
*   необязательный, можно передать _DOM_ элемент, в котором нужно активировать байндинги. Это достаточно удобно когда есть несколько _View_ моделей, так как позволяет ассоциировать каждую из них со своим блоком на странице.

Достаточно просто, не так ли?

## Наблюдаемые свойства

Мы уже научились создавать базовую _View_ модель и отображать ее на странице используя байндинги. Но основная изюминка КО - это автоматическое обновление _UI_, когда происходят определенные изменения в модели. Каким образом Капитан узнает о таких изменениях? Все очевидно! Нужно просто объявить свойства модели как наблюдаемые при помощи метода **observable**, тогда они становятся объектами, которые умеют сообщать всем подписчикам, что в них произошли изменения. Этот метод принимает единственный необязательный параметр - инициализируемое значение для свойства, если не указать, то будет браться значение из элемента к которому привязано данное свойство.

**`var PersonViewModel = {
    personName: ko.observable('Серега'),
    personAge:  ko.observable(22)
};`**

_HTML_ код изменять не нужно. Все будет работать как прежде за исключением того, что при изменении свойства модели, _view_ автоматически обновится.

Поскольку не все броузеры (да-да речь идет именно о _IE_) поддерживают геттеры/сеттеры в JavaScript, то было решено создать методы-врапперы и устанавливать или получать значения свойств при их помощи. Относительно конкретной модели:

*   прочитать значение можно при помощи обращения к свойству как к методу PersonViewModel.personName() или PersonViewModel.personAge();
*   записывается значение аналогично как и читается, только нужно передать параметр в метод PersonViewModel.personAge(23) - поменяет значение свойства на 23;
*   при вызове наблюдаемых свойств-методов можно пользоваться цепочкой вызовов PersonViewModel.personAge(23).personName()

То есть, когда КО найдет элемент с атрибутом data-bind="text: personName" он подпишет этот элемент на изменения свойства personName и наоборот, при изменении значения текста в DOM элементе об этом будет уведомлено свойство _View_ модели.

Подписаться на изменения свойства также можно вручную при помощи метода **subsribe**

**`PersonViewModel.personName.subscribe(function(newValue) {
    alert("Имя человека изменилось на " + newValue);
});`**

Но в большинстве случаев этого делать не придется, потому что встроенных байндингов достаточно для манипуляции подписками.

**По материалам:** [KnockOut](http://knockoutjs.com/documentation/observables.html)
