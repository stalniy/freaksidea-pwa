---
title: Блоки. Как вывести список всех новинок или спец. предложений в Magento
summary: |
  В любом интернет-магазине есть блоки с выводом нескольких новинок, спец.
  предложений, мы рекомендуем, etc. Попробуем закрыть эту проблему в Magento
author: sstotskyi
categories:
  - backend
createdAt: 2011-10-03T13:56:00.000Z
meta:
  keywords:
    - magento
    - блоки
    - новинки
alias: bloki-kak-vyvesti-spisok-vsekh-novinok-ili-spets-predlozhenij-v-magento
---

Интернет магазин без новинок или спец. предложений - это уже не магазин. Как минимум посетители будут не довольны отсутствием такого функционала, как максимум их будет не много, что подтверждает недавняя практика.

Работая последнее время с Magento мне пришлось реализовать удобный для себя функционал вывода блоков и страниц (с возможностью фильтрации) коллекции продуктов. Достаточно странно, что этого нет в стандартном функционале (нашел только новые продукты в виджетах).

## Блоки. Кирпичик к кирпичику

Немного поразмыслив можно прийти к заключению, что на сайте нужны такие типы блоков для продуктов:

*   новинки
*   последние
*   спец. предложения
*   с определенным флагом, например, featured

Все начинается из [создания стандартного модуля Magento](/php_and_somethings/show-5-magento-sozdanie-crud-modulia)... Поскольку код подразумевает выборку товаров (з кучей атрибутов и прочего всего), то обязательно нужно использовать механизм кэширования. Реализация его в Magento выглядит следующим образом

```php
class Freaks_Products_Block_Region extends Mage_Catalog_Block_Product_Abstract
{
    protected function _construct()
    {
        $this->addData(array(
            'cache_lifetime'    => 86400,
            'cache_tags'        => array(Mage_Catalog_Model_Product::CACHE_TAG),
        ));
    }

    public function getCacheKeyInfo()
    {
        return array(
           'CATALOG_PRODUCT_SPECIALS_AND_NEW',
           Mage::app()->getStore()->getId(),
           Mage::getDesign()->getPackageName(),
           Mage::getDesign()->getTheme('template'),
           Mage::getSingleton('customer/session')->getCustomerGroupId(),
           'template' => $this->getTemplate(),
           $this->getProductsCount(),
           $this->getType()
        );
    }
}
```

В конструкторе указываем, что время жизни кэша, в конкретном случае дня, вполне будет достаточно. Также указываем кэш теги, по которым можно достать кэшированый блок. Метод **getCacheKeyInfo** ответственный за уникальность ключа кэша. В нем определяются все зависимости сохраненных данных, т.е. если один из этих параметров будет другим, то вместо использования старой версии будет создана новая. Например, видно, что кэш будет уникальным для каждого магазина (Magento store), для каждой темы, к-ва выводимых продуктов и шаблона для блока.

Полезным и правильным будет создать возможность указания к-ва выводимых продуктов через layout-ы. Для этого сделаем простые геттеры/сеттеры для свойства **$\_productCount**, а также добавим константу **DEFAULT\_PRODUCTS\_COUNT**

```php
class Freaks_Products_Block_Region extends Mage_Catalog_Block_Product_Abstract
{
    const DEFAULT_PRODUCTS_COUNT = 3;

    protected
        $_productCollection,
        $_productsCount;

    /**
     * Set how much product should be displayed at once.
     *
     * @param $count
     * @return Freaks_Products_Block_Region
     */
    public function setProductsCount($count)
    {
        $this->_productsCount = $count;
        return $this;
    }

    /**
     * Get how much products should be displayed at once.
     *
     * @return int
     */
    public function getProductsCount()
    {
        if (null === $this->_productsCount) {
            $this->_productsCount = self::DEFAULT_PRODUCTS_COUNT;
        }
        return $this->_productsCount;
    }

    // some another methods
}
```

Ну а теперь самое интересное. Реализуем методы для выборки продуктов. Но для начала нужно сделать метод который будет возвращать базовою коллекцию продуктов, к которой потом можно будет применить дополнительные фильтры.

```php
class Freaks_Products_Block_Region extends Mage_Catalog_Block_Product_Abstract
{
    // some another methods
    
    public function getProductCollection()
    {
        $categoryId = Mage::app()->getStore()->getRootCategoryId();
        $this->_productCollection = Mage::getResourceModel('catalog/product_collection')
            ->setStoreId(Mage::app()->getStore()->getId())
            ->addAttributeToSelect(Mage::getSingleton('catalog/config')->getProductAttributes())
            ->addMinimalPrice()
            ->addFinalPrice()
            ->addTaxPercents()
            ->addUrlRewrite($categoryId);
        Mage::getSingleton('catalog/product_status')->addVisibleFilterToCollection($this->_productCollection);
        Mage::getSingleton('catalog/product_visibility')->addVisibleInSearchFilterToCollection($this->_productCollection);
        return $this->_productCollection;
    }
}
```

Как видно по коду данный метод добавляет нужные атрибуты и фильтры, как например фильтр по видимости и статусу.

Добавим еще один полезный метод, который в зависимости от типа блока, который можно установить через layout-update, будет возвращать нужную коллекцию продуктов

```php
class Freaks_Products_Block_Region extends Mage_Catalog_Block_Product_Abstract
{
    // some another methods

    public function getProducts()
    {
        $type = $this->getType();
        if (!$type) {
            Mage::throwException($this->__('Products block type must be specified'));
        }

        $method = 'get' . ucfirst(strtolower($type)) . 'Products';
        if (!method_exists($this, $method)) {
            Mage::throwException($this->__('Unknown products block type'));
        }

        return $this->$method();
    }
}
```

Теперь посмотрим на код каждого из типов блоков.

#### Новинки

```php
class Freaks_Products_Block_Region extends Mage_Catalog_Block_Product_Abstract
{
    // some another methods
    
    public function getNewProducts()
    {
        $todayDate  = Mage::app()->getLocale()->date()
            ->toString(Varien_Date::DATETIME_INTERNAL_FORMAT);

        return $this->getProductCollection()
            ->addAttributeToFilter('news_from_date', array('or' => array(
                0 => array('date' => true, 'to' => $todayDate),
                1 => array('is' => new Zend_Db_Expr('null')))
            ), 'left')
            ->addAttributeToFilter('news_to_date', array('or' => array(
                0 => array('date' => true, 'from' => $todayDate),
                1 => array('is' => new Zend_Db_Expr('null')))
            ), 'left')
            ->addAttributeToFilter(array(
                array('attribute' => 'news_from_date', 'is' => new Zend_Db_Expr('not null')),
                array('attribute' => 'news_to_date', 'is'   => new Zend_Db_Expr('not null'))
            ))
            ->addAttributeToSort('news_from_date', 'desc')
            ->setPageSize($this->getProductsCount())
            ->setCurPage(1);
    }
}
```

далее немного объяснений... Дату обязательно берем с помощью функций Magento, поскольку в ней (в Magento) можно выбирать часовой пояс независимо от настроек на сервере (в базе Magento хранит все даты в GTM формате). Дальше добавляем фильтры на атрибуты **news\_from\_date** и **news\_to\_date**. Проверка работает следующим образом: если установлен "дата с" которой продукт "новый" - она больше равна сегодня или не установлена, потом проверяется "дата до" - она меньше равна сегодня или не установлена и потом проверяется чтобы хотя б один из атрибутов был установлен. Сортировка установлена по "дате с" в обратном порядке. Только такие продукты выбираются. Кстати, 3 параметр в методе **addAttributeToFilter** означает тип джойна для таблиц в запросе.

#### Последние

```php
class Freaks_Products_Block_Region extends Mage_Catalog_Block_Product_Abstract
{
    // some another methods
    
    public function getLastProducts()
    {
        return $this->getProductCollection()
            ->setOrder('entity_id', 'desc')
            ->setCurPage(1)
            ->setPageSize($this->getProductsCount());
    }
}
```

Тут то объяснять нечего. Берем продукты сортируем по идентификатору в обратном порядке.

#### Спец. предложения

```php
class Freaks_Products_Block_Region extends Mage_Catalog_Block_Product_Abstract
{
    // some another methods
    
    public function getSpecialProducts()
    {
        $date = Mage::getModel('core/date');
        return $this->getProductCollection()
            ->addAttributeToSort('special_from_date','desc')
            ->addAttributeToFilter('special_from_date', array(
                'date' => true, 'to' => $date->date()
            ))
            ->addAttributeToFilter('special_to_date', array( 'or' => array(
                0 => array('date' => true, 'from' => $date->timestamp() + 86400), // tomorrow date
                1 => array('is'   => new Zend_Db_Expr('null')))
            ), 'left')
            ->setCurPage(1)
            ->setPageSize($this->getProductsCount());
    }
}
```

Код работает по аналогии к новым продуктам.

#### Продукты с определенным флагом

```php
class Freaks_Products_Block_Region extends Mage_Catalog_Block_Product_Abstract
{
    // some another methods
    
    public function getFlaggedProducts($flagName, $flagValue = 1)
    {
        return $this->getProductCollection()
            ->addAttributeToFilter($flagName, $flagValue)
            ->addAttributeToSort($this->getFlaggedSortBy());
    }

    public function getFlaggedSortBy()
    {
        $sortBy = $this->getData('flagged_sort_by');
        if (!$sortBy) {
            $sortBy = 'entity_id';
        }
        return $sortBy;
    }
}
```

При помощи метода **setFlaggedSortBy** можно установить порядок сортировки для продуктов с определенным флагом на уровне темы, т.е. в layout-update файлах.

## Используем на практике

Допустим нужно вывести все типы таких блоков на главной странице. Тогда в layout-update пишем

```xml
<?xml version="1.0"?>
<layout version="0.1.0">
    <cms_index_index>
        <reference name="content">
            <block type="freaks_products/region" name="products.new" template="freaks/products.phtml" before="-">
                <action method="setType"><type>new</type></action>
                <action method="setProductsCount"><limit>5</limit></action>
            </block>
            <block type="freaks_products/region" name="products.special" template="freaks/products.phtml" after="products.new">
                <action method="setType"><type>special</type></action>
                <action method="setProductsCount"><limit>3</limit></action>
            </block>
            <block type="freaks_products/region" name="products.last" template="freaks/products.phtml" after="products.special">
                <action method="setType"><type>last</type></action>
                <action method="setProductsCount"><limit>2</limit></action>
            </block>
            <block type="freaks_products/region" name="products.featured" template="freaks/featured_products.phtml" after="products.last">
                <action method="setProductsCount"><limit>10</limit></action>
            </block>
        </reference>
    </cms_index_index>
</layout>
```

Исходники можно скачать [здесь](./Freaks_Products.zip)

**P.S.**: в следующей статье опишу как создавать страницы разных типов с возможностями layered navigation