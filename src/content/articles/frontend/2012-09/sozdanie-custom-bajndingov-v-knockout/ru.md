---
title: Создание custom байндингов в Knockout
summary: |
  Knockout позволяет расширять свой функционал, а это значит, что конечный
  пользователь не ограничен использованием только стандартных байндингов, таких
  как click, value, text, etc. Даже не используя своих сверхспособностей
  программиста, можно без особых усилий написать байндинг, который реализует
  стандартное grid поведение (сортировка, удаление, добавление, пейджинг).
author: sstotskyi
categories:
  - frontend
createdAt: 2012-09-06T12:12:00.000Z
meta:
  keywords:
    - knockout
    - observables
    - bind
alias: sozdanie-custom-bajndingov-v-knockout
---

Вы не поверите, но _Knockout_ позволяет расширять свой функционал, а это значит, что конечный пользователь не ограничен использованием только стандартных байндингов, таких как _click_, _value_, _text_, etc. Даже не используя своих сверхспособностей программиста, можно без особых усилий написать байндинг, который реализует стандартное **grid** [поведение](http://knockoutjs.com/examples/grid.html "Knockout Grid") (сортировка, удаление, добавление, пейджинг).

## Регистрация байндинга

Как обычно это бывает, новый функционал нужно где-то зарегистрировать, чтобы потом можно было им пользоваться. КО не является исключением, поэтому чтобы создать новый байндинг, достаточно добавить новое свойство в объект **ko.bindingHandlers**:

```javascript
ko.bindingHandlers.yourBindingName = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        // This will be called when the binding is first applied to an element
        // Set up any initial state, event handlers, etc. here
    },
    update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        // This will be called once when the binding is first applied to an element,
        // and again whenever the associated observable changes value.
        // Update the DOM element based on the supplied values here.
    }
};
```

И потом его можно использовать в **data-bind** атрибуте

```html
<div data-bind="yourBindingName: someValue"></div>
```

Выглядит достаточно привлекательно ибо просто. Также стоит упомянуть, что не обязательно реализовывать оба метода, достаточно указать только один, если это то что подходит для конкретной задачи.

## Копаем глубже

Чтобы писать собственные байндинги достаточно понять когда вызываются методы **init** и **update**. Первый вызывается один раз для каждого _DOM_ элемента на который он привязан. В основном в этом методе происходит инициализация _View_ начальным значением или устанавливаются обработчики событий. Для примера напишем байндинг _slideVisible_, который показывает и скрывает элементы плавно, используя анимацию. В качестве параметра он принимает _true/false_ значение, которое указывает скрывать или показывать элемент. Стоит учитывать, что нужно скрыть элемент, если начальное значение байндинга равно _false_ и показать его если _true_. Это и нужно реализовать в **init** методе:

```javascript
ko.bindingHandlers.slideVisible = {
    init: function(element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor()); // Get the current value of the current property we're bound to
        element.style.display = value ? 'block' : 'none'
    }
};
```

Первый параметр - это _DOM_ элемент и _valueAccessor_ - функция, которая возвращает _accessor ViewModel_\-и.

Если привязанное к байндингу свойство _ViewModel_\-и является наблюдаемым, то при каждом его изменении будет вызываться метод **update**. Этот метод принимает немного больше параметров:

*   _element_ - _DOM_ элемент
*   _valueAccessor_ - функция, которая возвращает _accessor ViewModel_
*   _allBindingsAccessor_ - объект через который можно получить доступ ко всем байндингам на том же DOM элементе
*   _currentContext_ - текущий контекст выполнения байндинга (т.е., внутри _with: person_, _currentContext_ = _person_)
*   _bindingContext_ - объект, который содержит контекст байндинга. Имеет такие свойства, как _$parent_, _$root_, _$parents_

Приступим к реализации используя _jQuery_ куда же без него ибо цель топика в другом:

```javascript
ko.bindingHandlers.slideVisible = {
    init: function(element, valueAccessor) {
        // leave as it is
    },
    update: function(element, valueAccessor, allBindingsAccessor) {
        // First get the latest data that we're bound to
        var value = valueAccessor(), allBindings = allBindingsAccessor();
         
        // Next, whether or not the supplied model property is observable, get its current value
        var valueUnwrapped = ko.utils.unwrapObservable(value); 
         
        // Grab some more data from another binding property
        var duration = allBindings.slideDuration || 400; // 400ms is default duration unless otherwise specified
         
        // Now manipulate the DOM element
        if (valueUnwrapped) {
            $(element).slideDown(duration); // Make the element visible
        } else {
            $(element).slideUp(duration);   // Make the element invisible
        }
    }
};
```

Теперь можно использовать сколько влезет по назначению:

```html
<div data-bind="slideVisible: giftWrap, slideDuration:600">You have selected the option</div>
<label><input type="checkbox" data-bind="checked: giftWrap" /> Gift wrap</label>
 
<script type="text/javascript">
    var viewModel = {
        giftWrap: ko.observable(true)
    };
    ko.applyBindings(viewModel);
</script>
```

Дополнительный байндинг **slideDuration** является просто настройкой для **slideVisible**, которая указывает длительность анимации (если внимательно посмотреть на код метода _update_, то можно увидеть строку allBindings.slideDuration || 400). Все же, это еще не все. КО позволяет применять байндинги не только на _DOM_ элементы, но и на "виртуальные" (специальный формат _HTML_ комментариев). Сама реализация байндинга не дает возможности применять его на виртуальных элементах ибо для поддержки этой фичи нужно немного изменить реализацию.

## Байндинг на виртуальных элементах

Допустим есть байндинг _randomOrder_, который все _DOM_ элементы внутри себя перемешивает в произвольном порядке:

```javascript
ko.bindingHandlers.randomOrder = {
    init: function(elem, valueAccessor) {
        // Pull out each of the child elements into an array
        var childElems = [];
        while(elem.firstChild)
            childElems.push(elem.removeChild(elem.firstChild));
 
        // Put them back in a random order
        while(childElems.length) {
            var randomIndex = Math.floor(Math.random() * childElems.length),
                chosenChild = childElems.splice(randomIndex, 1);
            elem.appendChild(chosenChild[0]);
        }
    }
};
```

Он отлично будет работать на простом элементе:

```html
<div data-bind="randomOrder: true">
    <div>First</div>
    <div>Second</div>
    <div>Third</div>
</div>
```

Но если его применить к виртуальному, то получим ошибку (_The binding 'randomOrder' cannot be used with virtual elements_)

```html
<!-- ko randomOrder: true -->
    <div>First</div>
    <div>Second</div>
    <div>Third</div>
<!-- /ko -->
```

Исправить это недоразумение не составляет труда, достаточно просто написать:

```javascript
ko.virtualElements.allowedBindings.randomOrder = true;
```

Но все же ничего не работает. Причина конечно же очевидна, в метод **init** передается не обычный _DOM_ элемент, а виртуальный (и броузер ничего не знает о наличии в нем дочерних элементов ибо это не является стандартным _DOM API_). Чтобы это исправить достаточно использовать КО API для работы с виртуальными DOM элементами. Т.е., вместо element.firstChild писать ko.virtualElements.firstChild(element), вместо element.nextSibling писать ko.virtualElements.nextSibling(element) и так далее по аналогии. Используя эти методы, байндинг будет поддерживать как обычные, так и виртуальные _DOM_ элементы. Перепишем метод **init**, чтобы этот байндинг заработал

```javascript
ko.bindingHandlers.randomOrder = {
    init: function(elem, valueAccessor) {
        // Build an array of child elements
        var child = ko.virtualElements.firstChild(elem),
            childElems = [];
        while (child) {
            childElems.push(child);
            child = ko.virtualElements.nextSibling(child);
        }
 
        // Remove them all, then put them back in a random order
        ko.virtualElements.emptyNode(elem);
        while(childElems.length) {
            var randomIndex = Math.floor(Math.random() * childElems.length),
                chosenChild = childElems.splice(randomIndex, 1);
            ko.virtualElements.prepend(elem, chosenChild[0]);
        }
    }
};
```

## Virtual Element API

KO предоставляет несколько полезных функций для работы с элементами, применимы как к обычным, так и к виртуальным элементам:

*   ko.virtualElements.allowedBindings - объект, ключи которого определяют какие байндинги можно использовать с виртуальными элементами
*   ko.virtualElements.emptyNode(container) - удаляет все дочерние элементы из _container_
*   ko.virtualElements.firstChild(container) - возвращает первый элемент _container_
*   ko.virtualElements.insertAfter(container, nodeToInsert, insertAfterNode) - вставляет элемент _nodeToInsert_ внутрь контейнера сразу за _insertAfterNode_ (последний должен быть дочерним элементом _container_)
*   ko.virtualElements.nextSibling(container) - возвращает следующий элемент после указанного
*   ko.virtualElements.prepend(container, nodeToPrepend) - вставляет _nodeToPrepend_ первым дочерним элементом внутрь контейнера
*   ko.virtualElements.setDomNodeChildren(container, arrayOfNodes) - удаляет все дочерние элементы из контейнера и вставляет новые из _arrayOfNodes_

**По материалам**: [Knockout](http://knockoutjs.com/documentation/custom-bindings.html "Knockout Custom Bindings")