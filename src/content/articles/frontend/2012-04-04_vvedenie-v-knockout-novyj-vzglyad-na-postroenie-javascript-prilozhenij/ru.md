---
title: Введение в KnockOut - новый взгляд на построение JavaScript приложений
summary: |
  Являясь пользователем Хабра очень часто видел статьи и обзоры фреймворков
  Knockout и Backbone. Честно говоря, не смотря на все прелести о которых писали
  об этих "штуках", интереса изучать их не было. Но когда у меня появилась
  задача создания сложных пользовательских интерфейсов, первое что я подумал -
  это использовать один из них.
author: sstotskyi
categories:
  - frontend
  - important
createdAt: 2012-04-04T17:55:00.000Z
meta:
  keywords:
    - javascript
    - knockout
    - jQuery
    - MVVM
alias: vvedenie-v-knockout---novyj-vzglyad-na-postroenie-javascript-prilozhenij
---

Являясь пользователем [Хабра](http://habrahabr.ru "Habr") очень часто видел статьи и обзоры фреймворков **Knockout** и **Backbone**. Честно говоря, не смотря на все прелести о которых писали об этих "штуках", интереса изучать их не было. Но когда у меня появилась задача создания сложных пользовательских интерфейсов, первое что я подумал - это использовать один из них. Так уж сложилось благодаря профессиональной лени, что я быстрее нагуглил _[Knockout](http://knockoutjs.com "Кнокаут")_ нежели _Backbone_, зашел в [туториалы](http://learn.knockoutjs.com/), попробовал повторить и мне снесло башку. Большой интерес захватил мой мозг и я начал жадно поглощать всю документацию, которая доступна на официальном сайте.

Перевода на русский язык я не нашел и подумал: почему бы не опубликовать ее у себя в блоге. Предполагается перевести всю документацию с офф. сайта в вольном стиле.

## Введение в Knockout

_Knockout_ \- это _JavaScript_ библиотека, которая позволяет создавать сложные пользовательские интерфейсы и при этом оставляет код "чистым", расширяемым и хорошо читабельным. Основная задача, которую выполняет эта чудо-коробка - это автоматическое обновление пользовательского интерфейса при обновлении свойства в _JavaScript_ модели.

Основные преимущества:

*   **отслеживание зависимостей** - автоматически обновляет нужные части интерфейса, когда данные в модели изменяются;
*   **декларативное связывание** - простой и понятный способ привязки (байндинга) определенных частей интерфейса к модели. Можно создать сложные динамические интерфейсы используя только вложенные привязки;
*   **расширяемость** \- можно создавать нестандартные байндинги написав всего нескольких строк кода.
*   **совместимость** - может работать с любыми клиентскими и серверными технологиями;
*   **компактность** - всего 13Кб после gzip сжатия;
*   **кроссбраузерность** - IE 6+, Firefox 2+, Chrome, Safari и другие;
*   **независимость** от других библиотек;
*   **хорошая документация**.

В основе фреймворка лежит _MVVM_ патерн разработанный в компании _Microsoft_. Последний, как и _MVC_ используется для разделения логики и представления и также состоит из трех частей:

*   _Model_ - как и в _MVC_ представляет собой фундаментальные данные, необходимые для работы приложения;
*   _View_ - отображение модели;
*   _View Model_ - замена контроллеру, является посредником между первым и вторым. Включает в себе _Model_ и команды, которые может использовать _View_ не влияя непосредственно на саму модель.

_ViewModel_ связывает модель и отображение при помощи событий. Если что-то поменялось в модели, то нужно изменить отображение и наоборот.

## Knockout не замена jQuery!

Наверное все знают и любят _jQuery_. Это очень удобная обертка для роботы с _DOM API_, которая решает множество кроссбраузерных проблем. _jQuery_ используется для изменения страницы при помощи низкоуровневого _API_, тогда как _Knockout_ решает другие задачи!

Сложно использовать _jQuery_, когда создание пользовательского интерфейса становится нетривиальным: количество кода возрастает, он находится во все возможных частях вашего приложения, а фикс бага с каждой фичей занимает все больше времени. Например, нужно отобразить список сущностей, с указанием количества элементов в списке и кнопкой "_Add Item_", которая включена только если в списке меньше чем 5 элементов. Допустим количество строк будет хранится в каком-то _span_\-e, тогда при изменении количества нужно не забыть обновить его содержимое подсчитывая при этом количество _tr_ тегов или каких-то элементов с определенным классом. Также нужно не забыть выключить кнопку после того как к-во элементов станет равным 5. Потом конечно же захочется создать кнопку "_Delete_", при нажатии на которую, нужно также обновить весь пользовательский интерфейс.

_Knockout_ решает подобные проблемы в несколько строк. Он позволяет расширять приложение и не боятся за последствия. Все что нужно сделать - это представить сущности как _JavaScript_ массив и потом использовать **foreach** байндинг для того, чтобы представить его в виде таблицы или списка. Если он изменится отображение автоматически изменится, т.е. пользовательский интерфейс остается в актуальном состоянии без лишних телодвижений. Например, чтобы выводить к-во элементов в _span_\-e, достаточно сделать на него **bind**

**`There are <span data-bind="text: myItems().count"></span> items`**

И все теперь можно вообще забыть о представлении и работать только с моделью. При каждом изменении модели _Knockout_ сам обновит _DOM_ элементы. Аналогично создать кнопку добавления нового элемента очень просто

```html
<button data-bind="click: addItem, enable: myItems().count < 5">Add</button>
```

На кнопку прописано 2 байнда: **click** и **enable**. Первый - это функция обработчик на событие нажатия кнопки, а вторая - фильтр: как только к-во элементов станет равным 5, кнопка выключится автоматически.

И позже при создании кнопки удаления не придется думать о том что, где и как нужно обновить, _Knockout_ сделает это за нас.

## В заключение

_Knockout_ (KO) не конкурент _jQuery_ или другой библиотеки, которая предоставляет _API_ для низкоуровневого управления элементами страницы. KO предоставляет высокоуровневый путь самурая способ связывания модели данных с ее отображением. KO не зависит от _jQuery_, но это не значит что их нельзя использовать вместе, это даже нужно делать поскольку в последнем реализовано очень много функционала, который позволяет делать отображение элементов более приятным.

**P.S.**: кого заинтересовало быстро идем [на страничку туториалов](http://learn.knockoutjs.com/). После изучения KO _Gmail_ уже не покажется таким уж сложным _AJAX_ приложением.

**По материалам**: [Knockout](http://knockoutjs.com/documentation/introduction.html)