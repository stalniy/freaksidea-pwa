---
title: Ajax формы в Magento
summary: |
  как быть если нужно отправлять форму асинхронно? Нужно использовать AJAX
  скажут все. Да в точку, но не хочется каждый раз делать рутинную работу. По
  этому представляю Вам FreaksForm - класс для отправки форм посредством AJAX в
  Magento
author: sstotskyi
categories:
  - frontend
  - important
createdAt: 2011-10-01T13:55:00.000Z
meta:
  keywords:
    - ajax
    - magento
    - формы
alias: ajax-formy-v-magento
---

JavaScript формы очень удобны в Magento, так как предоставляют удобный интерфейс валидаторов. Но к сожалению они не умеют отправлять данные посредством ajax технологии. Вооружившись [знаниями по наследованию в JavaScript](http://bonsaiden.github.com/JavaScript-Garden/ru/#object.prototype) было решено реализовать такую возможность в виде **FreaksForm** объекта. Поскольку команда Magento в качестве JavaScript фреймворка использует [Prototype](http://www.prototypejs.org/), то все изложения, понятия и термины будут идти относительно этой библиотеки.

## Замысел и Промысел

Для начала создадим новый класс и наследуемся от **VarienForm**, выглядит это так

```javascript
var FreaksForm = Class.create();
FreaksForm.prototype = new VarienForm();
```

Переопределим конструктора, в нем добавим слушателя на событие отправки формы

```javascript
FreaksForm.prototype.initialize = (function(superConstructor) {
    return function(formId, firstFieldFocus) {
        superConstructor.call(this, formId, firstFieldFocus);
        // if we have form element
        if (this.form) {
            this.responseBlock = null;
            this.loadingBlock  = $(this.form.id + '-ajax');
            this.form.observe('submit', this.submit.bindAsEventListener(this))
        }
    };
})(VarienForm.prototype.initialize);
```

Свойство **loadingBlock** отвечает за блок ajax картинки, которая будет показываться во время отправки и получения данных. Поскольку в конструктор нужно передавать идентификатор формы, то было решено, что **loadingBlock** будет иметь точно такой же id как и форма, только из суффиксом **\-ajax**.

Свойство **responseBlock** отвечает за блок в который будет выводится сообщение, отправленное сервером в качестве результата завершения операции.

Слушатель события отправки формы - простой метод, который проверяет все поля формы на корректность и вызывает метод оправки данных на сервер, если все окей. В качестве url для AJAX запроса берется атрибут формы action, метод которым будет отправлен запрос - атрибут method.

Самое интересное в методе отвечающем за разбор полетов обработку ответа

```javascript
FreaksForm.prototype._processResult = function(transport){
    if (this.loadingBlock) {
        this.loadingBlock.hide();
    }

    var response = '';
    try {
        response = transport.responseText.evalJSON();
    } catch (e) {
        response = transport.responseText;
    }

    if (response.error) {
        this.setResponseMessage('error', response.error);
    } else if(response.success) {
        this.setResponseMessage('success', response.success);
        if (response.formVisibility == 'hide') {
            this.form.hide();
        }
    } else {
        var url = response.redirect ? response.redirect : location.href;
        location.href = url;
    }
};
```

Как видим по коду форма работает только с ответом в формате JSON. Если в ответе есть сообщение об ошибке или удаче, то показывает его и скрываем форму если это нужно. Если в ответе нет никаких нотайсов, то смело перегружаем страницу или отправляем пользователя на указаный url. Чем это хорошо? Тем, что, например, удобно авторизировать пользователя асинхронно и потом перенаправить его в личный кабинет.

Скачать готовый файл можно [здесь](./freaks_form.js)

**P.S.**: Думаю идею форм можно расширить, написанием возможности отправки файлов без лишних мыслей. Чем я и займусь в ближайшее время