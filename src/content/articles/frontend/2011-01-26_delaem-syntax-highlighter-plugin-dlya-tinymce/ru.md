---
title: Делаем syntax highlighter plugin для TinyMCE
summary: |
  Многие из нас сталкивались с проблемой подсветки программного кода в своем
  блоге. Наверное одно из самых лучших на сегодня решений - это highlight.js,
  разработан Иваном Сагалаевым . В этой статье я расскажу, как сделать подсветку
  программного кода с помощью tinyMCE
author: sstotskyi
categories:
  - frontend
createdAt: 2011-01-26T14:12:00.000Z
meta:
  keywords:
    - tinyMCE
    - подсветка синтаксиса
alias: delaem-syntax-highlighter-plugin-dlya-tinymce
---

Многие из нас сталкивались с проблемой подсветки программного кода в своем блоге. Наверное одно из самых лучших на сегодня решений - это highlight.js, разработан Иваном Сагалаевым .

Это все круто конечно, но меня не устраивало то, что каждый раз, когда кто-то зайдет на страничку статьи, его браузер будет во всем DOM дереве искать нужные теги и потом еще и каким то образом вставлять новые.

## Ставим задачу

*   подсветка синтаксиса, неважна технология, важно просто, удобно и оптимизировано
*   возможность работать с этим в TinyMCE
*   возможность видеть подсвеченный код в TinyMCE

## Решение

Все очень просто! Что нам нужно? Плагин для TinyMCE! Скачиваем [SyntaxHL](http://github.com/RichGuk/syntaxhl), он предоставит простую функциональность popup-a с выбором, а так же панель управлением. Сохраняем его в **tiny\_mce/plugins/** и подключаем. В настройках инициализации TinyMCE делаем следуюющее:

```javascript
tinyMCE.init({
// подключаем плагин
   plugins : "... ,syntaxhl, ....",
// определяем местоположение кнопки
   theme_advanced_buttons1 : "... , syntaxhl, ...",
 ....................................
```

Если вы все сделали правильно, то в редакторе должна появится кнопка ![highlight](./highlight.gif) .Теперь скачиваем последнюю версию [**Highlight.js**](http://softwaremaniacs.org/soft/highlight/ru/download/)  с сайта разработчика и копируем ее в **tiny\_mce/plugins/syntaxhl/js**. Открываем файл **tiny\_mce/plugins/syntaxhl/js/dialog.js**, ищем строки:

```javascript
var SyntaxHLDialog = {
  init : function() {
  },
```

меняем на

```javascript
var SyntaxHLDialog = {
  wrapper: document.createElement('div'),
  init : function() {
  },
```

В том же файле

```php
textarea_output = '<pre class="' + options + ';' + f.syntaxhl_language.value += ';
textarea_output brush:">';
textarea_output += tinyMCEPopup.editor.dom.encode(f.syntaxhl_code.value);
textarea_output += '</pre> '; /* note space at the end, had a bug it was inserting twice? */
tinyMCEPopup.editor.execCommand('mceInsertContent', false, textarea_output);
tinyMCEPopup.close();
```

заменяем на

```javascript
f.syntaxhl_code.value = f.syntaxhl_code.value.replace(/</g,'&lt;');
f.syntaxhl_code.value = f.syntaxhl_code.value.replace(/>/g,'&gt;');
textarea_output = '<pre><code ';
textarea_output += 'class="' + f.syntaxhl_language.value + '">';
textarea_output += f.syntaxhl_code.value;
textarea_output += '</code></pre> '; /* note space at the end, had a bug it was inserting twice? */

/* делаем подсветку сразу и передаем полученный HTML в tinyMCE */
this.wrapper.innerHTML = textarea_output;
hljs.highlightBlock(this.wrapper.firstChild.firstChild, '    ');
tinyMCEPopup.editor.execCommand('mceInsertContent', false, this.wrapper.innerHTML);
tinyMCEPopup.close();
```

Что же все это значит? Мы создали элемент-обертку и сначала вставляем код в него и потом при помощи метода **hljs.highlightBlock** подсвечиваем нужные символы и вставляем в tinyMCE уже подготовленный для отображения код.

Теперь при нажатие на кнопочку **syntaxHL** у вас должно появиться окно, в которое вы можете вставить код, выбрать его тип, и он будет обрамлен в нужные нам теги.

## Нюансы

Откроем файл **tiny\_mce/plugins/syntaxhl/dialog.html** и вносим небольшие поправки в названия языков (например в SyntaxHL по умолчанию JavaScript обозван **value="jscript"**, и Highlight.js такой класс не поймет, поэтому его надо переименовать в **value="javascript"**), а так же сортируем их в удобной нам последовательности. У меня выглядит так:

```php
<select name="syntaxhl_language" id="syntaxhl_language">
        <option value="php">PHP</option>
        <option value="javascript">Javascript</option>
        <option value="css">CSS</option>
        <option value="xml">XML/XHTML</option>
        <option value="bash">Bash(Shell)</option>
        <option value="perl">Perl</option>
        <option value="ruby">Ruby</option>
        <option value="sql">SQL</option>
        <option value="plain">Plain(Text)</option>
        <option value="diff">Diff</option>
        <option value="delphi">Delphi</option>
        <option value="groovy">Groovy</option>
        <option value="java">Java</option>
        <option value="python">Python</option>
        <option value="scala">Scala</option>
        <option value="vb">VB</option>
        <option value="csharp">C#</option>
        <option value="cpp">C++</option>
</select>
```

ВНИМАНИЕ! Если у вас стоит русифицированный **tinyMCE**, то вам необходимо перейти в папку **tiny\_mce/plugins/syntaxhl/langs/** и сделать копии имеющихся там файлов **en.js** и **en\_dlg.js**, и переименовать в **ru.js** и **ru\_dlg.js** соответственно.

Чтобы видеть подсветку в **tinyMCE**, нужно в его инициализации добавить одну из тем **highlight.js**

```php
tinyMCE.init({
..............................
    content_css : "/tools/tiny_mce/plugins/syntaxhl/js/hljs/css/default.css",
..............................
});
```

## Результат

Готовое решение можно скачать [ЗДЕСЬ](./syntaxhl.zip)

[SyntaxHL](http://github.com/RichGuk/syntaxhl)
