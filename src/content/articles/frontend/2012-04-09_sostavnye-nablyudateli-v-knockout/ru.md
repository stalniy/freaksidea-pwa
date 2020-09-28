---
title: Составные наблюдатели в KnockOut
summary: |
  Что если одно из свойств View модели зависит от значения других? Опираясь на
  профессиональную лень предположу, что было бы хорошо, если бы оно
  пересчитывалось автоматически при изменении одного из свойств от которого
  зависит, без участия посторонних сил. Для этого в KnockOut и реализованы
  составные свойства
author: sstotskyi
categories:
  - frontend
createdAt: 2012-04-09T11:14:00.000Z
meta:
  keywords:
    - javascript
    - knockout
    - observables
alias: sostavnye-nablyudateli-v-knockout
---

Представим ситуацию, ViewModel имеет 2 [наблюдаемых свойства](../2012-04-05_knockout-nablyudaem-za-vsem-i-vezde): (_firstName_, _lastName_) и нужно вывести _fullName_ (_firstName_ \+ _lastName_). Т.е. при изменении _lastName_ или _firstName_, _fullName_ должен автоматически обновится. В этом деле помогут составные наблюдатели

```javascript
function AppViewModel() {
    this.firstName = ko.observable('Bob');
    this.lastName  = ko.observable('Smith');

    this.fullName  = ko.computed(function() {
        return this.firstName() + " " + this.lastName();
    }, this);
}
```

Теперь можно сделать байнд свойства к тегу

```html
The name is <span data-bind="text: fullName"></span>
```

и _View_ будет обновляться при изменении _firstName_ или _lastName в соответствии_ с анонимной функцией, которая передана в качестве первого аргумента.

## Управление скоупом

Если Вы не опытный _JavaScript_ разработчик, то может показаться странным, что вторым параметром в метод **computed** передана переменная **this**. На самом деле здесь нет ничего странного, потому как в _JavaScript_ функции являются полноценными объектами не привязанными к какому-то конкретному контексту (если же конечно не указать его прямо). А это значит, что если бы мы не передали **this** в качестве второго параметра, то не было бы возможности обратится к свойствам _ViewModel_.

Если все это кажется напряжным, то можно создать замыкание на **this** следующим образом и забыть о скоупах

```javascript
function AppViewModel() {
    var self = this;

    self.firstName = ko.observable('Bob');
    self.lastName = ko.observable('Smith');
    self.fullName = ko.computed(function() {
        return self.firstName() + " " + self.lastName();
    });
}
```

## Написание составных свойств

Так как составные свойства состоят из нескольких наблюдаемых, то логично было бы предположить, что их можно только читать. Но в KO предусмотрен **callback**, с помощью которого можно сделать что-то полезное со значениями из которого оно состоит.

Например, если нужно отобразить цену для пользователя со знаком валюты, округленное до второй цифры после комы, но чтобы само значение хранилось в модели, как число с плавающей точкой (**float**).

```javascript
function MyViewModel() {
    this.price = ko.observable(25.99);

    this.formattedPrice = ko.computed({
        read: function () {
            return "$" + this.price().toFixed(2);
        },
        write: function (value) {
            // Strip out unwanted characters, parse as float, then write the raw data back to the underlying "price" observable
            value = parseFloat(value.replace(/[^\.\d]/g, ""));
            this.price(isNaN(value) ? 0 : value); // Write to underlying storage
        },
        owner: this
    });
}

ko.applyBindings(new MyViewModel());
```

Чаще всего в качестве параметра в метод computed передается анонимная функция, которая отвечает за чтение свойства, но также можно передать и объект со следующими параметрами

*   **read** -  обязательный, _callback_ для чтения свойства
*   **write** - необязательный, _callback_ для записи свойства
*   **owner** - необязательный, объект в скоупе, которого будут запускаться _read_ и _write_ анонимный функции

Теперь можно привязать цену к элементу на странице

```html
<p>Enter bid price: <input data-bind="value: formattedPrice" /></p>
```

Когда пользователь изменит цену и уберет фокус с поля, значение в модели автоматически обновится и будет числом с плавающей точкой, а не строкой благодаря **write** _callback_\-у.

Другой пример с валидацией пользовательских данных. Например, нужно проверять, чтобы пользователь обязательно ввел число в текстовое поле. Для этого понадобится 2 свойства: _numericValue_, _isLasInputValid_. Оба наблюдаемые

```javascript
function AppViewModel() {
    this.numericValue = ko.observable(123);
    this.isLastInputValid = ko.observable(true);

    this.attemptedValue = ko.computed({
        read: this.numericValue,
        write: function (value) {
            if (isNaN(value)) {
                this.isLastInputValid(false);
            } else {
                this.isLastInputValid(true);
                this.numericValue(value)
            }
        },
        owner: this
    });
}

ko.applyBindings(new AppViewModel());
```

Привяжем свойства к странице

```html
<p>Enter a numeric value: <input data-bind="value: attemptedValue"/></p>
<div data-bind="visible: !isLastInputValid()" class="error">That's not a number!</div>
```

Теперь **numericValue** будет иметь только валидное числовые значение, а если пользователь введет не число, то увидит сообщение об ошибке. Но для таких простых проверок лучше использовать _jQuery Validation_, установив полю класс **number**. КО отлично работает с _jQuery_ и  примером тому является [редактируемая таблица](http://knockoutjs.com/examples/gridEditor.html).

А алгоритм с КО следует использовать когда валидация или фильтрация данных более сложная чем та которая реализована в _jQuery Validation_.

## Принцип работы механизма отслеживания зависимостей

В общем алгоритм очень простой и довольно красивый

1.  Когда определено составное свойство, КО сразу же вызывает _callback_, чтобы получить начальное значение свойства.
2.  Во время работы _callback_\-а, КО логирует все наблюдаемые (или составные) свойства, которые используются в нем.
3.  Когда _callback_ закончит работу, КО подпишет это составное свойство на все наблюдаемые (или составные) атрибуты **ViewModel**, к которым обращались. Так же устанавливается обратный подписчик, чтобы вызвать повторный запуск _callback_, замыкая весь процесс на 1-ый шаг, чтобы удалить все старые подписки.
4.  КО уведомит всех подписчиков о новом значении составного свойства.

То есть КО определяет зависимости не только во время первого вызова **callback**, а каждый раз заново. А это значит, что зависимости могут быть динамическими. Зависимости не нужно определять они вычисляются автоматически во время работы скрипта.

Декларативные байндинги реализованы как составные наблюдаемые свойства. А это значит, что когда банйдинг читает зависимое значение свойства, то он становится зависимым от последнего.  И это в свою очередь означает, что значение байндинга будет изменятся при изменении свойства.

**P.S.**: все примеры можно попробовать запустить [здесь](http://learn.knockoutjs.com/)

**По материалам**: [KnockOut](http://knockoutjs.com/documentation/computedObservables.html)
