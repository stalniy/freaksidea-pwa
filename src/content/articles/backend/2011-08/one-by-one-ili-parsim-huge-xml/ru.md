---
title: One by one или парсим HUGE XML
summary: |
  При написании импорта столкнулся с проблемой парсинга больших XML файлов. Если
  нужно импортировать 100к сущностей, то SimpleXML к сожалению не сможет помочь
  в этом деле, так как съест много памяти только для одного разбора...
author: sstotskyi
categories:
  - backend
  - important
createdAt: 2011-08-19T12:27:00.000Z
meta:
  keywords:
    - XML
    - import
alias: one-by-one-ili-parsim-huge-xml
---

На очередном фрилансе при создании синхронизации между 1с и интернет магазином, столкнулся с проблемой чтения и разбора больших XML файлов (~ 500Мб). Нужно было импортировать несколько сотен тысяч продуктов, они кстати выгружались в xml виде. Как настоящий лентяй честный программист поискал готовые решения в гугле, к моему огорчению ничего подходящего не нашлось.

Передо мной стояла дилема: наговнокодить использовать для решения проблемы [SimpleXMLElement](http://php.net/manual/en/book.simplexml.php), прочитав весь файл за раз (у клиента свой, достаточно мощный сервер) или же прислушаться к призыву совести и реализовать полноценный класс для чтения xml построчно. Упрощенный пример импортируемого файла выглядит так:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<products>
............................................................
    <product>
        <ImageFile>MD00454.jpg</ImageFile>
        <Show>1</Show>
        <Articul>MD00454</Articul>
        <Name>Таблетки для сливного бачка</Name>
        <TradeName>Мебель</TradeName>
        <PriceUAH>11.52</PriceUAH>
        <DiscountPrice>8.64</DiscountPrice>
    </product>
............................................................
</products>
```

## Эврика

Решение пришло само собой. Нужно было читать не весь файл, а частями (как не странно) и разбирать в этих кусочках xml данные, т.е. одна строка - это один узел (+ вся информация в нем) product. На счастье в PHP уже был [инструментарий](http://www.php.net/manual/en/ref.xml.php) для реализации моих планов по захвату мира. Осталось завернуть все это в подарочную коробку, чтобы потом использовать без лишних мыслей. Кому стало скучно скачать код можно [здесь](./xml.class.zip).

Что же умеем и где кроются подводные камни???

*   итерирование по xml с помощью цикла foreach (реализует SeekableIterator)
    
    ```php
    $parser = new sjXmlParser('/path/to/test.xml');
    $parser->setRowTagName('product');
    
    foreach ($parser as $row) {
        print_r($row);
    }
    ```
    
*   чтение строки по порядковому номеру
    
    ```php
    // read 255 row
    $row_255 = $parser->seekTo(255)->current();
    
    // go to the first row
    $firstRow = $parser->rewind()->current();
    
    // go to next row
    $nextRow = $parser->next()->current();
    ```
    
*   mapping и игнорирование данных на которых нет мапинг
    
    ```php
    $parser = new sjXmlParser('/path/to/test.xml');
    
    // if you want to ignore all data except mapped
    $parser->setIgnoreNotMappingTags(true);
    
    $parser->setRowTagName('product')
        ->addTagMap('ImageFile', 'image')
        ->addTagMap('PriceUAH', 'price')
        ->addTagMap('Show', 'status');
    ```
    
*   экономия оперативной памяти

## Изюминка

Все это работает благодаря функции xml\_parse и ее сообщникам: xml\_parser\_create, xml\_set\_object, xml\_set\_element\_handler, xml\_set\_character\_data\_handler. Для инициализации разбора в контексте класса нужно сделать как-то так

```php
$this->_parser = xml_parser_create($this->_charset);
xml_set_object($this->_parser, $this);
xml_set_element_handler($this->_parser, '_parseOpenTag', '_parseCloseTag');
xml_set_character_data_handler($this->_parser, '_parseContent');
```

Поскольку было вызвано xml\_set\_object, колбек функции можно передавать просто строкой, будет считаться, что это методы нашего объекта.

А вот ядро всего этого, оно позволяет экономить память и продолжать разбор ПРАВИЛЬНО, что очень важно для моей совести:

```php
/**
 * Read row from xml file
 *
 * @return array current row
 */
protected function _readRow()
{
    if (!isset($this->_data[$this->_currentKey]) || $this->_isInRow && $this->_currentKey == $this->_rowIndex) {
        if (empty($this->_data[$this->_currentKey])) {
            $this->_data = array();
        } else {
            $this->_data = array(
                $this->_currentKey => $this->_data[$this->_currentKey]
            );
        }
        do {
            $isFinal= feof($this->_fileHandler);
            $data   = fread($this->_fileHandler, $this->_bufferSize);
            $result = xml_parse($this->_parser, $data, $isFinal);
            if (!$result) {
                throw new Exception(sprintf('XML error at line %d column %d',
                    xml_get_current_line_number($this->_parser),
                    xml_get_current_column_number($this->_parser)
                ));
            }
        } while ((empty($this->_data) || $this->_isInRow && count($this->_data) == 1) && !$isFinal);
    }
..........................................................
}
```

дальше последует немного объяснений...

Класс имеет флаг $\_isInRow, который указывает, что при чтении файла мы находимся между открывающимся и закрывающимся тегами product (касательно примера, а вообще свойства класса $\_rowTagName).

Сначала идет проверка, была ли прочитана текущая строка или если она была прочитана не полностью, то читаем и разбираем файл до момента пока массив данных $\_data пустой или пока не будем знать на 100%, что прочитали полностью данные об одном продукте.

P.S.: о подводных камнях и проблемах в работе хотелось бы увидеть в комментариях