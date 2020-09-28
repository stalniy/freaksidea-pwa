---
title: 'Best practisies в Knockout: упрощаем view'
summary: |
  Одним из моих подручных инструментов для реализации single page application-ов
  стал Knockout. И я хочу поделится некоторыми трюками для написания хорошего
  кода с использованием этого чудесного фреймворка.
author: sstotskyi
categories:
  - frontend
  - important
createdAt: 2013-03-25T12:29:00.000Z
meta:
  keywords:
    - knockout
    - MVVM
    - view
    - template
alias: best-practisies-v-knockout-uproschaem-view
---

Последний год я имел удовольствие работать над созданием так называемых _single page application_\-ов, используя новейшие технологии, такие как: **MV\*** _based frameworks_, **HTML5**, **CSS3**.

Одним из моих подручных инструментов стал **Knockout**. Это удивительный фреймворк: когда думаешь, что уже все о нем знаешь, пишешь код достаточно долго, изменяешь стандартное поведение, создаешь вложенные _View Model_\-и - найдется, что-то новое, загадочное и до трепета программистских чувств волнительное полезное.

К сожалению, существует не так уж много хороших примеров по применению _Knockout_ (есть один [хороший блог](http://www.knockmeout.net/)). Вот и я узнав пару тройку трюков, хочу ими поделиться.

## Создавайте читабельное View

_Knockout_, так сказать, рекомендует декларативный стиль для создания шаблонов, более того он дает для этого все инструменты. Это значит, что _data-bind_ должен быть максимально простым и максимально читабельным. Чтобы шаблоны можно было "читать" добавляйте _dependent observable_\-ы. Допустим у есть _view model_:

```javascript
var ViewModel = function () {
  this.items = ko.observableArray();
};
```

Плохо:

```html
<div data-bind="visible: !items().length">There are no items</div>
```

Если читать код, упуская синтаксические конструкции, получается: _"There are no items" visible not items length_ или _"There are no items"_ _visible items length equals 0_. Хотя и понятно, но не читабельно. Всегда читайте свой код, если код прозрачный, эффективный и может быть переиспользован - его можно прочесть, как обычное предложение на английском (понятно, что без сахара не обойтись, но лучше добавить сахар чем потом писать кучу документации). Придерживайтесь правила: никаких комментариев, минимум документации.

Чтобы улучшить предыдущий пример, нужно добавить новое _computed_ свойство - _hasItems_. Логично, что модель которая имеет массив айтемов имеет метод _hasItems_. Тем более, любую логику относящуюся к внутренней реализации нужно прятать от вьюхи. В будущем внутренняя реализация модели может изменяться и при таких условиях хотелось бы оставить шаблон без изменений.

```javascript
var ViewModel = function () {
  this.items = ko.observableArray();
  this.hasItems = ko.computed(function () {
    return this.items().length > 0
  }, this);
};
```

Хорошо:

```html
<div data-bind="ifnot: hasItems">There are no items</div>
```

Попробуем прочитать: _"There are no items" if not has items_. Уже на много лучше!

## Уничтожайте зло

Никогда не используйте анонимные ф-ции внутри байндингов, если так хочется передать параметры в метод используйте метод _bind_, а лучше - _data-\*_ атрибуты, они для этого и были придуманы.

Плохо:

```html
<a data-bind="click: function(vm, event) { $data.doSmth(event, 'param_1', 'param_2') }">Click Me</a>
```

Чуть лучше, но ставит в зависимость от последовательности передаваемых аргументов:

```html
<a data-bind="click: doSmth.bind($data, 'param_1', 'param_2')">Click Me</a>
```

Хорошо:

```html
<a data-bind="clickWithData: doSmth" data-param1="param_1" data-param2="param_2">Click Me</a>
```

_clickWithData_ байндинг - нестандартный (его реализация занимает пару минут): первым аргументом в метод _doSmth_ передается хэш _data_ атрибутов. Такой подход намного более гибкий: нет зависимости от последовательности передаваемых аргументов и делает шаблон более прозрачным.

## Уменьшайте количество байндингов

Допустим есть таблица. Нужно сделать, чтобы по нажатию на названия колонок происходила сортировка и соответственно колонка по которой отсортирована таблица должна иметь стрелочку вверх/вниз. Конечно же, первое что приходит в голову:

Плохо:

```html
<table class="table">
  <thead>
    <tr>
     <th data-bind="click: sortBy.bind($data, 'name'), css: classForColumn('name')">Name</th> 
     <th data-bind="click: sortBy.bind($data, 'status'), css: classForColumn('status')">Status</th>
     <th data-bind="click: sortBy.bind($data, 'created_at'), css: classForColumn('created_at')">Created At</th>
    </tr>
  </thead>
  <tbody>...</tbody>
</table>
```

С увеличением колонок, код мягко говоря станет ужасным, а что если надо будет добавить еще какой-то байндинг... Здесь существует 3 проблемы:

*   во-первых, слишком много байндингов на сантиметр квадратный
*   во-вторых, метод **bind** ухудшает чтение, используйте его в самом крайнем случае (к тому же создает замыкание на каждую колонку)
*   в третьих, дублирование названий колонок

Чтобы решить эту проблему придется написать 2 собственных байндинга. Первый решает проблему с читабельностью, а второй с множеством _event handler_\-ов и _bind_ методом. Помните, кастомные байндинги должны быть максимально абстрактными, чтобы можно было использовать в любом месте.

Создадим байндинг **setChildrenCss**, который пройдет по всем дочерним элементам и применит на них стандартный _css binding_:

```javascript
(function (cssBinding) {
  ko.bindingHandlers.setChildrenCss = {
    update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
      var rules = ko.utils.unwrapObservable(valueAccessor());
      var children = ko.utils.arrayFilter(element.childNodes, function (child) {
        return child.nodeType == 1;
      });

      var updater;
      if (rules.call) {
        rules = rules.bind(viewModel);
        updater = function (child) {
          var nodeName = child.getAttribute('data-name');
          cssBinding.update(child, function () { return rules(nodeName) });
        };
      } else {
        updater = function (child) { cssBinding.update(child, valueAccessor) };
      }
      ko.utils.arrayForEach(children, updater);
    }
  };
})(ko.bindingHandlers.css);
```

Этот байндинг в качестве параметра может принимать, такие же значения как и его ровесник _css_, а также ф-цию, в которую передает атрибут _data-name_ - имя _DOM_ элемента. Используя этот байндинг предыдущий пример можно записать:

```html
<table class="table">
  <thead>
    <tr data-bind="setChildrenCss: classForColumn">
     <th data-name="name" data-bind="click: sortBy.bind($data, 'name')">Name</th> 
     <th data-name="status" data-bind="click: sortBy.bind($data, 'status')">Status</th>
     <th data-name="created_at" data-bind="click: sortBy.bind($data, 'created_at')">Created At</th>
    </tr>
  </thead>
  <tbody>...</tbody>
</table>
```

Стало чуть лучше, но _click_ байндинг все еще портит весь пейзаж. Для решения этой проблемы напишем новый _on data-binding_ c использованием **jquery** и его метода **on**.

```javascript
(function ($) {
  function lookupMethodIn(context, methodName) {
    var scopes = [ context.$data ].concat(context.$parents), i = 0, count = scopes.length;
      
    do {
      var scope = scopes[i];
    } while (++i < count && !(scope[methodName] && scope[methodName].call));
      
    if (!scope[methodName] || !scope[methodName].call) {
      throw new Error('Unknown method "' + methodName + '" in context');
    }
    return scope[methodName].bind(scope);
  }

  function createEventHandlerFor(config, rule) {
    var methodName = config[rule], dataKey = ko.utils.unwrapObservable(config.data);
    
    return function (event) {
      var context = ko.contextFor(this), data = $(this).data(dataKey);
      if (data.bind) {
        delete data.bind;
      }
      var method = lookupMethodIn(context, methodName);
      var result = method(data, context.$data, event);
      if (result !== true) {
        event.preventDefault();
      }
    };
  }

  ko.bindingHandlers.on = {
    init: function (element, valueAccessor, allBindings, viewModel) {
      var config = valueAccessor(), domNode = $(element);
      
      for (var rule in config) {
        if (config.hasOwnProperty(rule)) {
          var handler = createEventHandlerFor(config, rule);
          rule = rule.split(/\s+/, 2);
          if (rule[1]) {
            domNode.on(rule[0], rule[1], handler);
          } else {
            domNode.on(rule[0], handler);
          }
        }
      }
    }
  };
})(jQuery);
```

Байндинг принимает в качестве параметра хэш событий и обработчиков. Имя события может быть расширено _css_ селектором ("_click a_", "_mouseenter .item_"). В конечном итоге первоначальный шаблон выглядит так:

Хорошо:

```html
<table class="table">
  <thead>
    <tr data-bind="on: { 'click th': 'sortBy', data: 'name' }, setChildrenCss: classForColumn">
     <th data-name="name">Name</th> 
     <th data-name="status">Status</th>
     <th data-name="created_at">Created At</th>
    </tr>
  </thead>
  <tbody>...</tbody>
</table>
```

Можно прочесть: _on click - th sort by data name and set children css class for column_.

Созданный байндинг **on** решает как минимум 3 задачи:

*   делает шаблоны более простыми и читабельными (чистота и порядок - свойства качественного кода)
*   уменьшает к-во создаваемых обработчиков событий (уменьшение используемых ресурсов)
*   реализовывает механизм передачи параметров в хэндлеры посредством _data-\*_ атрибутов (гибкость для методов _view model_\-и)

На счет делегирования событий можно ознакомится и с [другой реализацией](http://www.knockmeout.net/2012/11/revisit-event-delegation-in-knockout-js.html).

**P.S.**: _Knockout_ предоставляет очень мощные инструменты, не бойтесь их использовать, усовершенствовать и добавлять свои.