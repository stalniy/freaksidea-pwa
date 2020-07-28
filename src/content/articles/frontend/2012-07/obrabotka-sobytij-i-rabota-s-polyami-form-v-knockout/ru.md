---
title: 'Обработка событий и работа с полями форм в Knockout '
summary: |
  Никакое приложение не может быть востребованным и популярным, если оно не
  отвечает на действия пользователя. KO предоставляет ряд инструментов
  (байндингов) для обработки разных событий и управления полями формы.
author: sstotskyi
categories:
  - frontend
  - important
createdAt: 2012-07-02T15:49:00.000Z
meta:
  keywords:
    - javascript
    - knockout
    - bind
alias: obrabotka-sobytij-i-rabota-s-polyami-form-v-knockout
---

Никакое приложение не может быть востребованным и популярным, если оно не отвечает на действия пользователя. KO предоставляет ряд инструментов (байндингов) для обработки разных событий и управления полями формы.

## Click байндинг

Добавляет обработчик события (_JavaScript_ функцию) для указанного элемента. Чаще всего используется для обработки нажатия мыши по кнопкам, чекбоксам и ссылкам, но также применим и к любому другому элементу. Например

```html
<div>
    You've clicked <span data-bind="text: numberOfClicks"></span> times
    <button data-bind="click: incrementClickCounter">Click me</button>
</div>
 
<script type="text/javascript">
    var viewModel = {
        numberOfClicks : ko.observable(0),
        incrementClickCounter : function() {
            var previousCount = this.numberOfClicks();
            this.numberOfClicks(previousCount + 1);
        }
    };
</script>
```

При каждом нажатии на кнопку мыши, вызывается метод **viewModel::incrementClickCounter**, который увеличивает внутренний счетчик на 1. Данный байндинг принимает только один параметр, **callback** функцию, в которую передает 2 параметра: первый - текущий контекст (в примере выше это _viewModel_) и второй - объект события. Если нужно передать больше параметров, можно воспользоваться оберткой

```html
<button data-bind="click: function(data, event) { myFunction.call($root, data, event, 'param1', 'param2') }">
    Click me
</button>
```

Или же использовать метод [bind](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind) для функции (если он доступен, по сути делает то же самое)

```html
<button data-bind="click: myFunction.bind($root, $data, event, 'param1', 'param2')">
    Click me
</button>

```

По умолчание КО предотвращает стандартное поведение _DOM_ элемента при клике на нем. В большей степени это сделано для работы с ссылками (или же button\[type="submit"\]), так же как и с любыми другими элементами. Например, при нажатии по ссылке на которой установлен байндинг **click**, выполнится только _callback_ функция и броузер не перенаправит пользователя на адрес указанный в атрибуте _href_. Но все же, если нужно разрешить стандартное поведение, то достаточно чтобы _callback_ метод вернул **true**.

Иногда нужно предотвратить всплывание события. Например, в случае если родительский и дочерний элемента оба определяют _callback_ для _click_ байндинга:

```html
<div data-bind="click: myDivHandler">
    <button data-bind="click: myButtonHandler, clickBubble: false">
        Click me
    </button>
</div>
```

Чтобы при нажатии на кнопку не запускался метод **myDivHandler**, для нее нужно определить еще один байндинг с именем **clickBubble** и передать ему параметр **false**.

Все это относится и к другим типам событий. Например, чтобы отменить всплывание для **mouseover** события, нужно задать **mouseoverBubble** с параметром **false**.

## Event байндинг

Этот байндинг позволяет задать сразу несколько событий. Например

```html
<div>
    <div data-bind="event: { mouseover: enableDetails, mouseout: disableDetails }">Mouse over me</div>
    <div data-bind="visible: detailsEnabled">Details</div>
</div>
 
<script type="text/javascript">
    var viewModel = {
        detailsEnabled: ko.observable(false),
        enableDetails: function() {
            this.detailsEnabled(true);
        },
        disableDetails: function() {
            this.detailsEnabled(false);
        }
    };
    ko.applyBindings(viewModel);
</script>
```

Теперь, если курсор мыши будет находится над первым _div_\-ом, то второй _div_ отобразится на странице, если убрать курсор последний исчезнет. Во всем остальном **event** байндинг аналогичен **click**\-у.

## Submit байндинг

**submit** байндинг добавляет обработчик события формы - **submit**. При использовании этого байндинга KO предотвращает стандартное поведение формы, т.е. браузер не отправит данные из формы на сервер. Если же нужно отправить ее, то обработчик события должен вернуть **true**. Например

```html
<form data-bind="submit: doSomething">
    <!-- form contents go here -->
    <button type="submit">Submit</button>
</div>
 
<script type="text/javascript">
    ko.applyBindings({
        doSomething: function(formElement) {
            // e.g. validate form values
        }
    });
</script>
```

Стоит обратить внимание, что КО в качестве первого аргумент для этого байндинга передает элемент формы, а не текущий контекст. Для решения подобных проблем существует 2 известных способа:

*   передать контекст в качестве параметра
    
    ```html
    <form data-bind="submit: function(form, event) { $root.doSomething($data, form, event) }">
        <input type="submit" value="submit" />
    </form>
    ```
    
*   использовать **ko.contextFor**
    
    ```javascript
    ko.applyBindings({
       doSomething: function(form, event) {
           var context = ko.contextFor(form);
           alert(context.$data);
       }
    });
    ```
    

Думаю второй более предпочтительнее ибо выглядит лучше и понятней.

Здесь может возникнуть вполне логичный вопрос: а почему бы просто не поставить **click** байндинг на кнопку и в обработчике отправлять форму? Ответ кроется в том, что форму можно отправить и при помощи нажатия клавиши **Enter** в текстовом поле. Поэтому лучше использовать **submit** байндинг.

## Enable/Disable байндинги

Эти байндинги используются для контроля доступности элементов формы, таких как _input_, _textarea_, _select_. Первый из них делает элемент доступным, второй наоборот - выключает, если переданное байндингу значение будет равняться **true**. (также можно передавать _JavaScript_ выражения, которые вернут **true** или **false**). Например

```html
<p>
    <input type='checkbox' data-bind="checked: hasCellphone" />
    I have a cellphone
</p>
<p>
    Your cellphone number:
    <input type='text' data-bind="value: cellphoneNumber, enable: hasCellphone" />
</p>
 
<script type="text/javascript">
    var viewModel = {
        hasCellphone : ko.observable(false),
        cellphoneNumber: ""
    };
</script>
```

В данном примере, если пользователь нажмет на чекбокс, то значение **ViewModel::hasCellphone** будет равняться **true** и текстовый элемент включится, пользователь сможет изменить телефонный номер.

**disable** байндинг - противоположность **enable**. Эквивалент для первого используя второй

```html
<input data-bind="enable: !someViewModelValue()" />
```

## Value байндинг

Этот байндинг ассоциирует значение элемента формы с указанным свойством _ViewModel_\-и. Можно использовать для **input**, **select** и **textarea**. Стоит обратить внимание, что для работы с радио кнопками и чекбоксами стоит использовать **checked** байндинг, а не **value**.

```html
<p>Login name: <input data-bind="value: userName" /></p>
<p>Password: <input type="password" data-bind="value: userPassword" /></p>
 
<script type="text/javascript">
    ko.applyBindings({
        userName: ko.observable(""),        // Initially blank
        userPassword: ko.observable("123"), // Prepopulate
    });
</script>
```

**value** принимает один параметр: имя связанного свойства. Если последнее является наблюдаемым, то значение текстового поля будет меняться при каждом изменении свойства _ViewModel_ и наоборот. По умолчанию КО обновляет _ViewModel_ после того как поле потеряет фокус. Это поведение можно изменить задав еще один параметр - _valueUpdate_. Например

```html
<p>Your value: <input data-bind="value: someValue, valueUpdate: 'afterkeydown'" /></p>
<p>You have typed: <span data-bind="text: someValue"></span></p> <!-- updates in real-time -->
 
<script type="text/javascript">
    ko.applyBindings({
        someValue: ko.observable("edit me")
    });
</script>
```

**valueUpdate** может принимать такие значения:

*   **change** - стандартное поведение, _viewModel_ обновляется после того как поле измениться;
*   **keyup** - обновляет после того как пользователь отпустит нажатую кнопку;
*   **keypress** - обновляет сразу при нажатии кнопки;
*   **afterkeydown** - начинает обновлять в тот момент когда пользователь начинает что-то набирать.

Последний вариант подходит наилучшим образом, если нужно обновлять _ViewModel_ в реальном времени. Если свойство с которым ассоциирован байндинг не наблюдаемое, то КО сможет наблюдать только за изменениями в пользовательском интерфейсе и соответственно обновлять значение свойства. Но при изменении свойства - _View_ меняться не будет. Также **value** можно использовать в связке с **options** байндинг для _html_ списков.

## hasfocus байндинг

**hasfocus** ассоциирует состояние фокуса элемента со свойством _ViewModel_\-и. Удобно для реализации подсказок для элементов формы, например

```html
<input data-bind="hasfocus: isSelected" />
<button data-bind="click: setIsSelected">Focus programmatically</button>
<span data-bind="visible: isSelected">The textbox has focus</span>

<script type="text/javascript">
var viewModel = {
    isSelected: ko.observable(false),
    setIsSelected: function() { this.isSelected(true) }
};
ko.applyBindings(viewModel);
</script>
```

В данном примере, когда текстовое поле получает фокус появляется подсказка в _span_ элементе. Данный байндинг принимает всего один булевский параметр. Если последний равен **true** - поле получает фокус, если **false** - теряет.

При помощи этого байндинга достаточно просто реализовать редактирование текстового элемента, например

```html
<p>
    Name: <b data-bind="visible: !editing(), text: name, click: edit"> </b>
    <input data-bind="visible: editing, value: name, hasfocus: editing" />
</p>
<p><em>Click the name to edit it; click elsewhere to apply changes.</em></p>

<script type="text/javascript">
function PersonViewModel(name) {
    // Data
    this.name = ko.observable(name);
    this.editing = ko.observable(false);
         
    // Behaviors
    this.edit = function() { this.editing(true) }
}
 
ko.applyBindings(new PersonViewModel("Bert Bertington"));
</script>
```

Т.е. при нажатии на имя включается режим редактирования, при котором элемент _b_ становится невидимым, а текстовый - видимым. Так как свойство name ассоциировано со значением _input_\-а, то когда он потеряет фокус имя обновится и для _b_ тега.

## Checked байндинг

Используется для наблюдения за состоянием чекбоксов или радио кнопок. В качестве параметра принимает одно булевское значение, например

```html
<p>Send me spam: <input type="checkbox" data-bind="checked: wantsSpam" /></p>
 
<script type="text/javascript">
    var viewModel = {
        wantsSpam: ko.observable(true) // Initially checked
    };
     
    setTimeout(function() {
       // The checkbox becomes unchecked
       viewModel.wantsSpam(false);
    }, 3000);
    ko.applyBindings(viewModel);
</script>
```

Для чекбоксов также можно передавать массив. Если значие атрибута _value_ есть в массиве, то значение свойства _checked_ чекбокса будет равнятmся **true**. Например

```html
<p>Send me spam: <input type="checkbox" data-bind="checked: wantsSpam" /></p>
<div data-bind="visible: wantsSpam">
    Preferred flavors of spam:
    <div><input type="checkbox" value="cherry" data-bind="checked: spamFlavors" /> Cherry</div>
    <div><input type="checkbox" value="almond" data-bind="checked: spamFlavors" /> Almond</div>
    <div><input type="checkbox" value="msg" data-bind="checked: spamFlavors" /> Monosodium Glutamate</div>
</div>
 
<script type="text/javascript">
    var viewModel = {
        wantsSpam: ko.observable(true),
        spamFlavors: ko.observableArray(["cherry","almond"]) // Initially checks the Cherry and Almond checkboxes
    };
     
    setTimeout(function() {
       // Now additionally checks the Monosodium Glutamate checkbox
       viewModel.spamFlavors.push("msg");
    }, 3000);
    ko.applyBindings(viewModel);
</script>
```

При нажатии на чекбокс значение в массив будет добавляться (или удаляться из него) в зависимости от состояния свойства _checked_. И наоборот (если массив наблюдаемый), свойство чекбокса _checked_ будет равно **true**, если добавить в массив значение и **false**, если удалить элемент из массива.

Для радио кнопок поведение немного другое. Последняя будет отмечена только в том случае если значение в свойстве _ViewModel_ и значение атрибута **value** будут равны. Например

```html
<p>Send me spam: <input type="checkbox" data-bind="checked: wantsSpam" /></p>
<div data-bind="visible: wantsSpam">
    Preferred flavor of spam:
    <div><input type="radio" name="flavorGroup" value="cherry" data-bind="checked: spamFlavor" /> Cherry</div>
    <div><input type="radio" name="flavorGroup" value="almond" data-bind="checked: spamFlavor" /> Almond</div>
    <div><input type="radio" name="flavorGroup" value="msg" data-bind="checked: spamFlavor" /> Monosodium Glutamate</div>
</div>
 
<script type="text/javascript">
    var viewModel = {
        wantsSpam: ko.observable(true),
        spamFlavor: ko.observable("almond") // Initially selects only the Almond radio button
    };

    setTimeout(function() {
        // Now only Monosodium Glutamate is checked
        viewModel.spamFlavor("msg");
    }, 3000);
    ko.applyBindings(viewModel);
</script>
```

## options байндинг

Используется для указания возможных вариантов **<option>** для выпадающего списка **<select>**. Не применим больше ни к какому другому элементу. В качестве параметра можно передать наблюдаемый либо обычный массив. Чтобы указать (или узнать) какие из вариантов выбраны используется **value** байндинг для обычного _<select>_ и **selectedOptions** для множественного. Например

```html
<p>Choose some countries you'd like to visit: <select data-bind="options: availableCountries" size="5" multiple="true"></select></p>
 
<script type="text/javascript">
    var viewModel = {
        availableCountries : ko.observableArray(['France', 'Germany', 'Spain'])
    };
    ko.applyBindings(viewModel);
</script>
```

Данный байндинг имеет ряд необязательных параметров:

*   **optionsCaption** - добавляет опцию в начало массива с указанным текстом и значением **undefined**. Используется в основном с обычным выпадающим списком в тех случаях когда нежелательно, чтобы один из вариантов был выбран по умолчанию. Например
    
    ```html
    <select data-bind='options: myOptions, optionsCaption: "Select an item...", value: myChosenValue'></select>
    ```
    
*   **optionsText** - используется, чтобы указать текст для тега **<option>**, если элемент массива является объектом. В качестве аргумента принимает строку с именем поля в последнем. Также можно передать функцию, чтобы задать специфическую логику для вывода. В качестве параметра ей передается текущий элемент массива. Например
    
    ```html
    <p>
        Your country: 
        <select data-bind="options: availableCountries, optionsText: 'countryName', value: selectedCountry, optionsCaption: 'Choose...'"></select>
    </p>
    <script type="text/javascript">
        // Constructor for an object with two properties
        var country = function(name, population) {
            this.countryName = name;
            this.countryPopulation = population;    
        };        
     
        var viewModel = {
            availableCountries : ko.observableArray([
                new country("UK", 65000000),
                new country("USA", 320000000)
            ]),
            selectedCountry : ko.observable() // Nothing selected by default
        };
    </script>
    ```
    
    или с использованием _callback_
    
    ```html
    <!-- viewModel the same as in example above -->
    <select data-bind="options: availableCountries, 
                       optionsText: function(item) { 
                           return item.countryName + ' (pop: ' + item.countryPopulation + ')' 
                       }, 
                       value: selectedCountry, 
                       optionsCaption: 'Choose...'"></select>
    ```
    
*   **optionsValue** - по аналогии к предыдущему параметру, позволяет указать какое из свойств объекта будет использоваться для установки атрибута _value_ тега _<option>_.
*   **selectedOptions** - последний параметр рассмотрим немного позже.

Одной очень положительной особенностью **options** байндинга является способность сохранять свое состояние при любых изменении значения свойства _ViewModel_, если это возможно конечно. Т.е., если добавляется или удаляется элемент из массива, то все выбранные ранее варианты остаются таковыми (конечно же, если они не были удалены).

## selectedOptions байндинг

Этот байндинг контролирует, какие из элементов в списке с множественным выбором выбраны. Применим только к **<select>** элементу и только вместе с **options** байндингом. Когда пользователь отмечает какие-либо элементы, КО автоматически добавляет или удаляет значения из свойства, которое ассоциировано с этим байндингом. А это значит что в качестве параметра может быть только массив (или наблюдаемый его вариант). Например

```html
<p>
    Choose some countries you'd like to visit: 
    <select data-bind="options: availableCountries, selectedOptions: chosenCountries" size="5" multiple="true"></select>
</p>
 
<script type="text/javascript">
    var viewModel = {
        availableCountries : ko.observableArray(['France', 'Germany', 'Spain']),
        chosenCountries : ko.observableArray(['Germany']) // Initially, only Germany is selected
    };
    setTimeout(function() {
       // Now France is selected too
       viewModel.chosenCountries.push('France');
    }, 2000);
    ko.applyBindings(viewModel);
</script>
```

В данном примере, изменение свойства **viewModel::chosenCountries** (добавление/удаление элементов) приведет к тому, что некоторые элементы будут выбраны, а другие - нет. Аналогично при выборе каких-либо опций свойство _ViewModel_ будет автоматически обновлено.

Массив необязательно должен содержать в себе только строки. Как было показано выше в примере с **options** байндигом, можно также работать и с массивом объектов, например

```html
<p>
    Choose some countries you'd like to visit: 
    <select data-bind="options: availableCountries, selectedOptions: chosenCountries, optionsValue: 'code', optionsText: 'name'" size="5" multiple="true"></select>
</p>
<script type="text/javascript">
    function Country(code, name) {
       this.code = code;
       this.name = name;
    }
    var viewModel = {
        availableCountries : ko.observableArray([
            new Country('FR', 'France'),
            new Country('GR', 'Germany'),
            new Country('SP', 'Spain')
        ]),
        chosenCountries : ko.observableArray(['GR']) // Initially, only Germany is selected
    };
    
    ko.applyBindings(viewModel)
</script>
```

## uniqName байндинг

Это самый редко используемый байндинг. Он обеспечивает уверенность в том, что элемент, на котором он применяется, имеет уникальный атрибут **name**. Если DOM элемент не имеет атрибута name, то для него будет сгенерировано уникальное значение. Принимает всего один параметр - **true**. Используется наверно только в следующих случаях:

*   другая библиотека использует уникальные имена тегов для реализации своей логики. Например, [jQuery Validation](http://docs.jquery.com/Plugins/validation) проверяет только те элементы, у которых есть атрибут _name_.
*   IE6 не позволяет отмечать радио кнопки, которые не имеют имени. Это логично, ибо при помощи имени эти элементы группируются.

Например

```html
<input data-bind="value: someModelProperty, uniqueName: true" />
```

**По материалам:** [KnockOut](http://knockoutjs.com/)