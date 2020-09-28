---
title: 'Magento модели от А до Я: 3 кита'
summary: |
  Magento построена на базе Zend фреймворка. Но это платформа и неудивительно
  что она использует свой фреймворк, который по сути является рассширением
  Zend-а. Он называется Varien. И чтобы иметь хорошее представление о моделях,
  нужно заглянуть внутрь самой системы
author: sstotskyi
categories:
  - backend
  - important
createdAt: 2012-01-16T19:11:00.000Z
meta:
  keywords:
    - magento
    - Zend
    - Varien
    - модели
alias: magento-modeli-ot-a-do-ya-3-kita
---

_Magento_ написана при помощи _Zend_ фреймворка и библиотеки _Varien_. Базовый функционал всех моделей сконцентрирован именно в последней. А именно - это 3 кита _Magento_: _Varien\_Object_, _Varien\_Data\_Collection_ и _Varien\_Data\_Collection\_Db_.

## Varien\_Object

Большинство моделей в _Magento_ наследуют функционал этого класса. Если в двух словах, то этот класс упрощает работу с данными. Конструктор принимает один необязательный аргумент массив данных, который записывается в свойство **$\_data**. По-скольку класс реализовывает интерфейс _ArrayAccess_, то к данным в объекте можно обращаться при помощи квадратных скобок (**\[\]**). Так же в классе реализованы магические методы: **\_\_get()**, **\_\_set()**, **\_\_call()**, благодаря которым также можно получать данные хранящиеся в объекте. Например, чтобы получить данные из объекта

```php
$user = new Varien_Object(array(
    'is_enabled' => true,
    'group_id'   => 1,
    'name'       => 'Вася Пупкин'
));

# first one
echo $user->getIsEnabled(), "\n";
echo $user->getName(), "\n";

# second one
echo $user->is_enabled, "\n";
echo $user->name, "\n";

# third one
echo $user['is_enabled'], "\n";
echo $user['name'], "\n";
```

Аналогично при помощи тех же конструкций можно установить значение

```php
# first one
$user->setIsEnabled(false);
echo (int)$user->getIsEnabled(), "\n";

# second one
$user->is_enabled = false;
echo (int)$user->is_enabled, "\n";

# third one
$user['is_enabled'] = false;
echo (int)$user['is_enabled'], "\n";
```

Все выше упомянутые методы работают либо через интерфейс, либо благодаря магическим методам базируясь на функциях класса **setData()** или **getData()**.

```php
$user->setData('is_enabled', false);
echo (int)$user->getData('is_enabled'), "\n";
```

Эти методы очень упрощают работу! Например, если приходят данные с формы, то вместо вызова нескольких методов можно просто написать

```php
$user = new Varien_Object();
$user->setData($_POST);

echo $user->getName(), "\n";
```

А метод **getData()** позволяет напрямую обращаться к определенному значению в многомерном массиве при помощи пути

```php
$user = new Varien_Object(array(
    'name'       => 'Вася Пупкин',
    'friends'    => array(
        'university' => array(1,2,3,4,5),
        'home'       => array('Petrov' => 1, 'Pupkin' => 2)
    )
));

echo $user->getData('friends/home/Petrov'), "\n";
```

Все бизнес модели являются потомками этого класса. Например, модели продукта и пользователя

```php
$customer = Mage::getModel('customer/customer');

$customer->setFirstname('Vasya')
    ->setLastname('Pupkin')
    ->save();

var_dump($customer->getId());
```

Так же очень интересными есть методы **setId()**, **getId()** и **setIdFieldName()**. Благодаря им достаточно просто и удобно работать с любимы именами идентификаторов в базе. Например, в базе поле _PRIMARY\_KEY_ називается _entity\_id_, но все равно к нему можно обращаться при помощи методов _setId/getId_

```php
$user = new Varien_Object(array(
    'entity_id' => 12
));
$user->setIdFieldName('entity_id');

echo $user->getId(), "\n";
```

Этот класс имеет и ряд методов по конвертации данных. Например, в _json_, _xml_, _array_ и _string_

```php
$user = new Varien_Object(array(
    'name'       => 'Вася Пупкин',
    'id'         => 5
));

echo $user->toString(), "\n";
echo $user->toXml(), "\n";
echo $user->toJson(), "\n";
var_dump($user->toArray());
```

Каждый из этих методов имеет необязательные параметры, при помощи которых можно отфильтровать данные.

## Varien\_Data\_Collection

Этот класс реализовывает методы упрощающие работу с коллекцией объектов (айтемов), к примеру с массивом объектов класса _Varien\_Object_. В качестве айтемов может быть любой другой объект. Для изменения класса предназначен метод **setItemObjectClass(string $className)**. Этот класс реализовывает 2 интерфейса _IteratorAggregate_ и _Countable_, что позволяет перебирать его айтемы при помощи цикла **foreach** и узнавать к-во элементов при помощи ф-ции **count**.

Сам по себе этот класс нигде не используется, а просто реализовывает базовый функционал. Достаточно странно, что он не абстрактный. Потому как он реализовывает базовый функционал пейджинга, но сам его нигде не использует (**getCurPage()**, **getLastPageNumber()**, **getPageSize()** и **getSize()**). Разница между методом **getSize()** и вызовом ф-цию **count()** на объекте в том, что при вызове первого к-во записывается в свойство объекта **$\_totalRecords** и потом не пересчитывается. При втором способе будет каждый раз пересчитываться.

Для работы с элементами доступны методы: **addItem(), getFirstItem()**, **getLastItem(), getNewEmptyItem(), removeItemByKey** и **getItems()**. Очистить коллекцию можно при помощи метода **clear**. Также есть набор методов (_set/get/has_) по установке флагов коллекции (это могут быть не только булевские значения). Например

```php
$user = new Varien_Object(array(
    'name'       => 'Вася Пупкин',
    'id'         => 5
));


$collection = new Varien_Data_Collection();

$collection->addItem($user)
    ->setFlag('is_new')
    ->setFlag('is_test', 'yes');

echo (int)$collection->hasFlag('is_new'), "\n";
echo $collection->getFlag('is_test'), "\n";
```

Можно получить массив значений определенного поля из всех элементов при помощи метода **getColumnValues($colName)**. Или же получить все айтыми, у которых значение определенного поля равно заданному **getItemsByColumnValue($column, $value).** Также можно получить идентификаторы всех элементов при помощи метода **getAllIds()**.

В коде _Magento_ очень часто фигурируют массивы такой структуры

```php
# first: Option Hash
$data = array(
    $value => $label
..........................
);

# second: Option Array
$data = array(
..........................
    array(
        'label' => $label,
        'value' => $value
    )
);
```

По-этому неудивительно, что данный класс реализовывает 2 метода: **toOptionHash()** и **toOptionArray()**, которые преобразовывают данные в коллекции именно к таким структурам соответственно. Поля $_value_ и $_label_ настраиваются для каждого класса отдельно при помощи защищенных методов **\_toOptionHash()** и **\_toOptionArray()**.

## Varien\_Data\_Collection\_Db

Этот класс является фундаментом для всех коллекций в _Magento._ Для взаимодействия с базой используются расширенные _Zend_\-овские классы. Запрос к базе создается при помощи объекта класса _Zend\_Db\_Select_.

Конструктор коллекции принимает один необязательный параметр - объект соединения, который является экземпляром потомка класса _Zend\_Db\_Adapter\_Abstract_. Получить объект селекта позволяет метод _getSelect()_, объект соединения с базой - _getConnection()_, _getData()_ позволяет получить вместо объектов массивы данных из базы, _setOrder($field, $direction)_ - устанавливает порядок сортировки, _load()_ - загружает коллекцию из базы данных (вызывается автоматически перед перебором элементов или вызовом метода _getItems()_) и самый интересный _addFieldToFilter($field, $condition)_ - добавляет в запрос фильтр по полю.

Последний метод стоит рассмотреть более детально, поскольку значение _$condition_ может быть достаточно разнообразным. Например

```php
$collection->addFieldToFilter('sku', array('eq' => 'ZH12b5'));
```

то же самое

```php
$collection->addFieldToFilter('sku', 'ZH12b5');
```

Чтобы разобраться с этим составим таблицу: выражения в PHP и соответствующий ему SQL.

```php
array("eq" => 'ZH12b5')
```

```sql
 WHERE (sku = 'ZH12b5')
```

```php
array("neq" => 'ZH12b5')
```

```sql
 WHERE (sku <> 'ZH12b5')
```

```php
array("like" => 'ZH12b5')
```

```sql
 WHERE (sku LIKE 'ZH12b5')
```

```php
array("nlike" => 'ZH')
```

```sql
 WHERE (sku NOT LIKE 'ZH')
```

```php
array("is" => 'zh')
```

```sql
 WHERE (sku IS 'zh')
```

```php
array("in" => array('zh', 'pl'))
```

```sql
 WHERE (sku IN ('zh', 'pl'))
```

```php
array("nin" => array('zh', 'pl'))
```

```sql
 WHERE (sku NOT IN ('zh', 'pl'))
```

```php
array("notnull" => true )
```

```sql
 WHERE (sku IS NOT NULL)
```

```php
array("null" => true)
```

```sql
 WHERE (sku IS  NULL)
```

```php
array("gt" => 5)
```

```sql
 WHERE (sku > 5)
```

```php
array("lt" => 10)
```

```sql
 WHERE (sku < 10 )
```

```php
array("gteq" => 10)
```

```sql
 WHERE (sku >= 5)
```

```php
array("lteq" => 22)
```

```sql
 WHERE (sku =< 5)
```

```php
array("finset" => array('test'))
```

```sql
 WHERE (find_in_set('test', sku))
```

```php
array('from' => 2, 'to' => 30)
```

```sql
 WHERE (sku >= '2' AND sku <= '30')
```

С этим все предельно ясно, но интересно узнать как комбинировать условия при помощи **AND**/**OR**. Достаточно просто:

```php
$collection->addFieldToFilter('name', array('like' => 'ZH%'))
    ->addFieldToFilter('is_enabled', true);
```

Такой вызов приведет к созданию следующего запроса

```sql
 WHERE (name LIKE 'ZH%') AND (is_enabled = 1)
```

Для использования **OR** в запросе все не так очевидно:

```php
$collection->addFieldToFilter('name', array(
    array('like' => 'ZH%'),
    array('like' => '%P')
));
```

Такая конструкция создаст следующий запрос

```sql
 WHERE ((name LIKE 'ZH%') OR (name LIKE '%P')) 
```

Если у таблицах совпадают имена полей, значит нужно сделать маппинг для фильтра. Например, есть таблицы пользователей (_users_) и ролей(_user\_roles_), каждая из таблиц имеет поле _name_. Хотим сделать фильтр по полю из таблицы пользователей. Тогда

```php
$collection->addFilterToMap('user_name', 'users.name')
    ->addFilterToMap('role_name', 'user_roles.name')
    ->addFieldToFilter('user_name', array('like' => 'Admin%'));
```

Теперь немного об оптимизации. Коллекция предоставляет функционал кэширования при помощи метода:

```php
public function initCache($cacheInstance, $cachePrefix, array $cacheTags);
```

Объект **$cacheInstance** может быть каким угодно, он даже не должен реализовывать какой-либо интерфейс, НО должен иметь методы **load($cacheId)** и **save(string $data, $cacheId, $cacheTags)**.

Метод **load()** коллекции загружает все строки из базы данных соответствующие заданным критериям, но что если таких строк будет 100000 - тогда это 100000 объектов. Можно с 100% увереностью сказать, что не каждый сервер сможет поместить такое к-во объектов в памяти. Именно тогда и нужно использовать метод **fetchItem()** (доступный с версии 1.5.1). Если его вызвать он возвратит только один элемент за раз, если вызвать еще возвратит следующий.

```php
while ($item = $collection->fetchItem()) {
   $data = $item->callSomeMethod();
   // do some operations
   unset($item);
}
```

Это позволит работать с большими данными и при этом целесообразно использовать оперативную память сервера.

Проблема с памятью относится и к таким методам как **toOptionHash()** и **toOptionArray()**. По-этому был написан аналог первого (про второй видимо забыли), но с использованием метода **fetchItem()** и называется он **\_toOptionHashOptimized()**. Это защищенный метод, по-этому доступ к нему можно получить только внутри класса. Но ничто не мешает создать наследника от этого класса и написать публичный метод **toOptionHashOptimized()**.

**P.S.:** в следующей статье начнем разбираться с "реальными" классами в _Magento_. Узнаем общую структуру моделей, что такое Magento-path и многое другое