---
title: 'Байндинги в KnockOut: управление видимостью и содержимым'
summary: |
  KO построен по принципам MVVM паттерна, т.е. предоставляет возможность
  изменять View посредством изменения ViewModel. А делает он это при помощи
  байндингов. Рассмотрим какие из них отвечают за управление видимостью и
  содержимым элементов
author: sstotskyi
categories:
  - frontend
  - important
createdAt: 2012-04-18T12:00:00.000Z
meta:
  keywords:
    - javascript
    - knockout
alias: bajndingi-v-knockout-upravlenie-vidimostyu-i-soderzhimym
---

KO построен по принципам _MVVM_ паттерна, т.е. предоставляет возможность изменять _View_ посредством изменения _ViewModel_. А делает он это при помощи байндингов. Рассмотрим какие из них отвечают за управление видимостью и содержимым элементов.

## visible

Отвечает за отображение _DOM_ элемента, т.е. делает его скрытым или видимым, в зависимости от переданного значения свойства _ViewModel_.

```html
<div data-bind="visible: shouldShowMessage">
    You will see this message only when "shouldShowMessage" holds a true value.
</div>

<script type="text/javascript">
    var viewModel = {
        shouldShowMessage: ko.observable(true) // Message initially visible
    };
    viewModel.shouldShowMessage(false); // now it's hidden
    viewModel.shouldShowMessage(true); // now it's visible again
    ko.applyBindings(viewModel);
</script>
```

Принимает всего один параметр:

*   если равен **false** (в том числе **0**, **null** и **undefined**), то _css_ свойство **display** элемента (DomElement.style.display) установится в **none**
*   если равен **true** (все что угодно кроме _false_ подобных значений), свойство **display** будет **удалено** с элемента

Если параметр наблюдаемый, то элемент будет показываться/прятаться при каждом изменении последнего. Если он не наблюдаемый, то видимость будет установлено только один раз, при вызове ko.applyBindings.

Также в качестве параметра можно передать JavaScript выражение или функцию, которую в последствии выполнит КО и использует вернувшийся результат, чтобы определить видимость элемента.

```html
<div data-bind="visible: myValues().length > 0">
    You will see this message only when 'myValues' has at least one member.
</div>

<script type="text/javascript">
    var viewModel = {
        myValues: ko.observableArray([]) // Initially empty, so message hidden
    };
    viewModel.myValues.push("some value"); // Now visible
    ko.applyBindings(viewModel)
</script>
```

## text

Текстовый банйдинг отвечает за изменения текста в элементе. В основном используется с тегами <span> и <em>, которые обычно отображают какой-то текст. Технически его можно использовать с любым другим элементом.

```html
Today's message is: <span data-bind="text: myMessage"></span>

<script type="text/javascript">
    var viewModel = {
        myMessage: ko.observable() // Initially blank
    };
    viewModel.myMessage("Hello, world!"); // Text appears
    ko.applyBindings(viewModel)
</script>
```

Принимает один параметр, который устанавливается в свойство _DOM_ элемента **innerText** (для _IE_) или **textContent** (_FireFox_ и другие). Если передать что-либо другое кроме строки или числа, то параметр приведется к строковому типу посредством вызова его метода **toString**.

Байндинг заескейпит любой переданный ему _html_ код, например

```javascript
viewModel.myMessage("<i>Hello, world</i>!");
```

приведет к такому результату

```html
Today's message is: <span data-bind="text: myMessage">&lt;i&gt;Hello, world&lt;i&gt;!</span>
```

Это достаточно удобно, так как предотвращает [XSS](http://ru.wikipedia.org/wiki/%D0%9C%D0%B5%D0%B6%D1%81%D0%B0%D0%B9%D1%82%D0%BE%D0%B2%D1%8B%D0%B9_%D1%81%D0%BA%D1%80%D0%B8%D0%BF%D1%82%D0%B8%D0%BD%D0%B3) атаки.

## html

Полностью аналогичен предыдущему с той разницей, что он изменяет свойство **innerHTML** у элемента.

```html
<div data-bind="html: details"></div>

<script type="text/javascript">
    var viewModel = {
        details: ko.observable() // Initially blank
    };
    viewModel.details("<em>For further details, view the report <a href='report.html'>here</a>.</em>");
    ko.applyBindings(viewModel)
</script>
```

## css

Этот байндинг удаляет или добавляет _CSS_ класс элементу. Это полезно, например, для подсветки элемента, когда он выбран.

```html
<div data-bind="css: { profitWarning: currentProfit() < 0 }">
   Profit Information
</div>

<script type="text/javascript">
    var viewModel = {
        currentProfit: ko.observable(150000) // Positive value, so initially we don't apply the "profitWarning" class
    };
    viewModel.currentProfit(-50); // Causes the "profitWarning" class to be applied
    ko.applyBindings(viewModel);
</script>
```

В таком случае элементу установится класс profitWarning при условии, что свойство currentProfit станет меньше 0 и удалит этот класс, когда значение станет больше 0.

Принимает один параметр в виде хэша, ключи которого являются названиями классов, а значения - свойствами/выражениями/функциями связанными с _ViewModel_. Если нужно добавлять/удалять класс вида my-class, то его нужно взять в апострофы.

```html
<div data-bind="css: { 'my-class': someValue, test: anotherValue }">...</div>
```

Это связано с ограничениями в _JavaScript_ на имена ключей.

## style

Этот байндинг по синтаксису похож на предыдущий, но меняет он одно или несколько _css_ свойств элемента. Это пригодится когда нужно изменять ширину элемента в зависимости от % закачки файла.

```html
<div style="background-color:#f00" data-bind="style: { width: progress + '%' }">
   Profit Information
</div>

<script type="text/javascript">
    var viewModel = {
        progress: ko.observable(0)
    };
    viewModel.progress(50);
    ko.applyBinding(viewModel)
</script>
```

Так как ключи являются свойствами _JavaScript_ объекта **style**, то чтобы привязать background-color нужно писать backgroundColor.

```html
<div data-bind="style: { backgroundColor: bgColor }">
   Profit Information
</div>
```

Полный список _JavaScript_ эквивалентов названий _css_ свойств можно найти [здесь](http://www.comptechdoc.org/independent/web/cgi/javamanual/javastyle.html).

## attr

Байндинг также по синтаксису похож на 2 предыдущих и изменяет значения атрибутов элемента. Это часто используется, когда нужно поменять атрибут **src** у картинки или **href** у ссылки.

```html
<a data-bind="attr: { href: url, title: details }">
    Report
</a>

<script type="text/javascript">
    var viewModel = {
        url: ko.observable("year-end.html"),
        details: ko.observable("Report including final year-end statistics")
    };
    ko.applyBindings(viewModel)
</script>
```

Все остальное аналогично, как в двух предыдущих байндингах.

**По материалам**: [KnockOut](http://knockoutjs.com/documentation/visible-binding.html)
