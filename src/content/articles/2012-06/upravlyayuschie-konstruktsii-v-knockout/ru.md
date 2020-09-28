---
title: Управляющие конструкции в KnockOut
summary: |
  По аналогии большинству языков программирования в Knockout реализованы
  основные управляющие конструкции: foreach, if, ifnot и with. foreach будет
  полезен при итерировании по массиву значений, if - для принятия какого-либо
  решения и with - для создания определенного контекста выполнения. Рассмотрим
  их более детально.
author: sstotskyi
categories:
  - frontend
createdAt: 2012-06-06T14:17:00.000Z
meta:
  keywords:
    - knockout
    - observables
    - конструкции
alias: upravlyayuschie-konstruktsii-v-knockout
---

По аналогии большинству языков программирования в _Knockout_ реализованы основные управляющие конструкции: **foreach**, **if**, **ifnot** и **with**. foreach будет полезен при итерировании по массиву значений, if - для принятия какого-либо решения и with - для создания определенного контекста выполнения. Рассмотрим их более детально.

## Конструкция foreach

Этот байндинг копирует часть разметки для каждого элемента в массиве. А это очень полезно при отображении списков или таблиц. Если массив является наблюдаемым, то при удалении (или добавлении) какого-либо элемента, автоматически удалится (или добавится новая) часть разметки, которая отвечает за его отображение. И, конечно же, есть возможность смешивать управляющие конструкции в произвольном порядке, с любой вложенностью. Например

```html
<table>
    <thead>
        <tr><th>First name</th><th>Last name</th></tr>
    </thead>
    <tbody data-bind="foreach: people">
        <tr>
            <td data-bind="text: firstName"></td>
            <td data-bind="text: lastName"></td>
        </tr>
    </tbody>
</table>
 
<script type="text/javascript">
    ko.applyBindings({
        people: [
            { firstName: 'Bert', lastName: 'Bertington' },
            { firstName: 'Charles', lastName: 'Charlesforth' },
            { firstName: 'Denise', lastName: 'Dentiste' }
        ]
    });
</script>
```

Посмотреть живой пример можно [здесь](http://knockoutjs.com/documentation/foreach-binding.html#example_2_live_example_with_addremove). Чтобы создать кнопки удаления и добавления достаточно реализовать 2 метода во _ViewModel_:

```javascript
var viewModel = {
    people: ko.observableArray([
        {firstName: "John", lastName: "Kovalskiy"},
        {firstName: "Peter", lastName: "Ruskiy"},
        {firstName: "Stefan", lastName: "Salvatore"}
    ])
};

var self = viewModel;
viewModel.addPerson = function() {
    self.people.push({firstName: "Test " + new Date, lastName: "Blah " + new Date});
};

viewModel.removePerson = function() {
    self.people.remove(this);
};

ko.applyBindings(viewModel);
```

И потом забайндить их на разметке:

```html
<table data-bind="visible: people().length > 0">
    <thead>
        <tr><th>First name</th><th>Last name</th></tr>
    </thead>
    <tbody data-bind="foreach: people">
        <tr>
            <td data-bind="text: firstName"></td>
            <td data-bind="text: lastName"></td>
            <td><a href="#" data-bind="click: $root.removePerson">remove</a></td>
        </tr>
    </tbody>
</table>
<button data-bind="click: addPerson">Add Person</button>
```

Переменную **$root** нужно было использовать, так как каждая строка - это контекст элемента массива **ViewModel::people**, у которого нет метода _removePerson_. По-этому нужно было сослаться на главный контекст, т.е. на _ViewModel_. Уже зная о байндинге **visible**, можно добавить его к таблице и делать последнюю невидимой, если массив людей пуст.

**foreach** принимает единственный параметр: объект по-которому нужно итерировать или же объект настроек:

*   **data** - итерируемый массив.
*   **includeDestroyed** - флаг, который указывает показывать ли элементы в которых свойство **\_destroy** установлено в **true**. По умолчанию равно **false**.
*   **afterRender** - callback функция, которая вызывается каждый раз после того как новая порция разметки вставлена в документ. Принимает 2 параметра: массив вставленных DOM элементов и элемент-контекст.
*   **afterAdd** - аналогичен предыдущему за исключением, что вызывается каждый раз когда в массив добавляется новый элемент. Принимает 3 параметра: DOM элемент, который будет вставлен в документ, индекс нового элемента массива и сам элемент массива. Можно использовать для реализации анимации, когда элемент добавляется в массив. Например, при помощи функции **jQuery** $(domNode).fadeIn().
*   **beforeRemove** - вызывается после того, как элемент из массива удален, но его разметка все еще присутствует в документе. Принимает 3 параметра: DOM элемент, который будет удален, индекс удаленного элемента массива и сам элемент. Полезен для реализации анимации при удалении, например, при помощи $(domNode).fadeOut().

Пример реализации анимации при добавлении элемента можно посмотреть [здесь](http://knockoutjs.com/examples/animatedTransitions.html).

Если элементы вашего массива не объекты, а, например, строки, тогда нужно использовать ключевое слово **$data**, которое содержит в себе текущий элемент массива. В предыдущих примерах можно тоже использовать **$data**, но это усложняет восприятие слоя _View_, который должен быть максимально простым!

```html
<ul data-bind="foreach: months">
    <li>
        The current item is: <b data-bind="text: $data"></b>
    </li>
</ul>
 
<script type="text/javascript">
    ko.applyBindings({
        months: [ 'Jan', 'Feb', 'Mar', 'etc' ]
    });
</script>
```

_KnockOut_ сильно опирается на контексты выполнения конструкций. В одном из примеров пришлось использовать переменную контекста **$root**, которая ссылается на ViewModel, есть также переменные **$index** и **$parent**. Первый содержит индекс текущего элемента массива, по-которому производится итерация, а последний возвращает ссылку на родительский контекст.

Чтобы использовать **foreach**, если нет родительского блока, в который можно поместить шаблон для каждого элемента, предусмотрена следующая конструкция:

```html
<ul>
    <li class="header">Header item</li>
    <!-- ko foreach: myItems -->
        <li>Item <span data-bind="text: $data"></span></li>
    <!-- /ko -->
</ul>
 
<script type="text/javascript">
    ko.applyBindings({
        myItems: [ 'A', 'B', 'C' ]
    });
</script>
```

Комментарии <!-- ko foreach: myItems --> и <!-- /ko --> используются как начальный и конечный маркеры для **foreach**. Аналогичные маркеры есть и для **if**, **ifnot** и **with**.

## Конструкция if

Эта конструкция определяет нужно показывать или нет часть разметки. В отличии от байндинга **visible** (который скрывает элемент при помощи _css_), **if** полностью удаляет или добавляет все дочерние элементы относительно родительского, того к которому применен байндинг. Например

```html
<label><input type="checkbox" data-bind="checked: displayMessage" /> Display message</label>
 
<div data-bind="if: displayMessage">Here is a message. Astonishing.</div>

<script type="text/javascript">
ko.applyBindings({
    displayMessage: ko.observable(false)
})
</script>
```

Пример роботы можно посмотреть [здесь](http://knockoutjs.com/documentation/if-binding.html#example_1).

Конструкция **ifnot** полностью аналогична **if** и была реализовано только из эстетических соображений. Чтобы не писать

```html
<div data-bind="if: !displayMessage()">Here is a message. Astonishing.</div>
```

можно писать

```html
<div data-bind="ifnot: displayMessage">Here is a message. Astonishing.</div>
```

## Конструкция with

Эта конструкция задает контекст для внутренних байндингов, по аналогии к _JavaScript_ оператору **with**

```html
<h1 data-bind="text: city"> </h1>
<p data-bind="with: coords">
    Latitude: <span data-bind="text: latitude"> </span>,
    Longitude: <span data-bind="text: longitude"> </span>
</p>
 
<script type="text/javascript">
    ko.applyBindings({
        city: "London",
        coords: {
            latitude:  51.5001524,
            longitude: -0.1262362
        }
    });
</script>
```

Если выражение переданное в **with** является _null_ или _undefined_, то все дочерние элементы будут скрыты. Если выражение является наблюдаемым объектом, то каждый раз при его изменении _Knockout_ будет делать ререндеринг, что в свою очередь приведет к удалении всех дочерних элементов из документа и вставки их новых копий.

**По материалам**: [KnockOut](http://knockoutjs.com/)