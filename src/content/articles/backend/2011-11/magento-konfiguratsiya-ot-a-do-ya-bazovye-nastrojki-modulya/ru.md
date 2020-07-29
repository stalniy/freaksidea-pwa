---
title: 'Magento конфигурация от А до Я: базовые настройки модуля'
summary: |
  Magento, как и любая другая современная система, состоит из модулей. Понятно,
  что любой модуль имеет свои настройки. По-этому для написания дополнительного
  функционала стоит разораться с их форматом в Magento.
author: sstotskyi
categories:
  - backend
  - important
createdAt: 2011-11-04T00:20:00.000Z
meta:
  keywords:
    - magento
    - модуль
    - конфигурация
alias: magento-konfiguratsiia-ot-a-do-ya-bazovye-nastrojki-modulia
---

_Magento_, как и любая другая современная система, состоит из модулей. Понятно, что любой модуль имеет свои настройки. По-этому для написания дополнительного функционала стоит разораться с их форматом в _Magento_.

В _Magento_ основная часть конфигурации модуля находится в файле  _etc_/_config.xml_. Для оптимизации загрузки модуля, часть конфигурации можно вынести в _adminhtml.xml_, но об этом позже.

## Структура конфигурации модуля

Любая конфигурация модуля состоит из корневого элемента _config_ (заголовок _XML_\-я необязательный) и нескольких базовых секций: _modules_, _frontend_, _adminhtml_, _global_, _admin_, _default_, _crontab_

```xml
<config>
    <modules>.................</modules>
    <frontend>................</frontend>
    <adminhtml>...............</adminhtml>
    <global>..................</global>
    <default>.................</default>
    <crontab>.................</crontab>
    <admin>...................</admin>
</config>
```

В секции _modules_ находится информация об имени и версии модуля, в случае _Mage\_Cms_

```xml
<Mage_Cms>
    <version>0.7.13</version>
</Mage_Cms>
```

Секция _frontend_ задает настройки модуля для фронта (т.е. сайта): настройка роутинга, обсерверов событий, переводов и _layout-update_\-ов.

```xml
<frontend>
  <routers>
    <cms>
      <use>standard</use>
      <args>
        <module>Mage_Cms</module>
        <frontName>cms</frontName>
      </args>
    </cms>
  </routers>
  <events>
    <controller_action_noroute>
      <observers>
        <cms>
          <class>cms/observer</class>
          <method>noRoute</method>
        </cms>
      </observers>
    </controller_action_noroute>
    <controller_action_nocookies>
      <observers>
        <cms>
          <class>cms/observer</class>
          <method>noCookies</method>
        </cms>
      </observers>
    </controller_action_nocookies>
  </events>
  <translate>
    <modules>
      <Mage_Cms>
        <files>
          <default>Mage_Cms.csv</default>
        </files>
      </Mage_Cms>
    </modules>
  </translate>
  <layout>
    <updates>
      <cms>
        <file>cms.xml</file>
      </cms>
    </updates>
  </layout>
</frontend>
```

В секции _routers_ указываем, какие запросы будут обрабатываться контроллерами данного модуля. Каждое правило роутинга имеет свое имя, оно задается в качестве имени первого тега, в данном случае - _<cms>_, т.е. имя - **cms**. Тег **use** задает, какую модель роутера использовать в данном случае используем стандартный. Для его инициализации нужно передать аргументы и это можно сделать при помощи тега **args**. Для стандартного роутера нужно передать имя модуля и префикс запроса - **frontName**. Теперь все запросы по адресу _http://BASE\_URL/cms/\*_ будут обрабатываться контроллерами модуля **Mage\_CMS**.

В секции **events** задаем настройки для обсерверов. Имя любого дочернего тега в секции _events_ является названием события в _Magento_. В случае с модулем _Mage\_Cms_ указываем, что при возникновении события _controller\_action\_noroute_ нужно вызвать метод **noRoute** модели _cms/observer_. Благодаря этому, в административном интерфейсе существует возможность создать собственную страницу и приаттачить ее на  [404 HTTP](http://uk.wikipedia.org/wiki/HTTP_404) ошибку.

В секции _translate_ можно указать название файла для локализации (в _Magento_ для этого используются [csv файлы](http://ru.wikipedia.org/wiki/CSV)).

В секции _layout_ можно указать файл, в котором прописаны настройки для [layout-update-ов](/php_and_somethings/show-49-magento-konfighuratsiia-ot-a-do-ia-layout-updates).

Для секции _adminhtml_ справедливо все то, что и для _frontend_. Разница только в том, что эти настройки будут применяться для административной части, а не для фронта. Чтобы файл _config.xml_ не был слишком большим (что замедляет его загрузку и разбор **xml**), все директивы относящиеся к секции _adminhtml_ (т.е. к административному интерфейсу) можно вынести в отдельный файл - _adminhtml.xml_. Именно так и сделано в модуле **Mage\_Cms**

```xml
<config>
    <menu>.....</menu>
    <acl>
        <resources>
            <admin>
                <children>....</children>
            </admin>
        </resources>
    </acl>
</config>
```

Конфигурация обычно состоит из 2 секций: _menu_ и _acl_, но также можно указывать и другие директивы (например, _events_, _layout-update_ и т.д.). Первая отвечает за добавление новых элементов в меню административной части, а вторая - за права доступа, т.е. [ACL](http://ru.wikipedia.org/wiki/ACL). Рассмотрим секцию _menu_

```xml
<cms translate="title" module="cms">
    <title>CMS</title>
    <sort_order>70</sort_order>
    <children>
        <page translate="title" module="cms">
            <title>Pages</title>
            <action>adminhtml/cms_page</action>
            <sort_order>0</sort_order>
        </page>
        <block translate="title" module="cms">
            <title>Static Blocks</title>
            <action>adminhtml/cms_block</action>
            <sort_order>10</sort_order>
        </block>
    </children>
</cms>
```

Чтобы добавить новый элемент меню нужно указать: _title_, _action_ и _sort\_order_. Атрибут _translate_ указывает, содержимое какого тега нужно переводить, нужно указывать для каждого элемента меню. Атрибут _module_ указывает используемый модуль, не смотря на то, что он указан для каждого тега, его можно задать только для верхнего родительского элемента (в данном случае **cms**), для остальных он пронаследуется.

Тег _action_ указывает на модель контроллера. Например, _adminhtml/cms\_page_ - **Mage\_Adminhtml\_Cms\_PageController**.

Перейдем к секции _acl_

```xml
<cms translate="title" module="cms">
    <title>CMS</title>
    <sort_order>70</sort_order>
    <children>
        <block translate="title">
            <title>Static Blocks</title>
            <sort_order>10</sort_order>
        </block>
        <page translate="title">
            <title>Pages</title>
            <sort_order>0</sort_order>
            <children>
                <save translate="title">
                    <title>Save Page</title>
                    <sort_order>0</sort_order>
                </save>
                <delete translate="title">
                    <title>Delete Page</title>
                    <sort_order>10</sort_order>
                </delete>
            </children>
        </page>
        <media_gallery translate="title">
            <title>Media Gallery</title>
            <sort_order>20</sort_order>
        </media_gallery>
    </children>
</cms>
```

В _ACL_ можно задать структуру для возможности изменения прав доступа в административной панели (**System** -> **Permissions** -> _Выбрать роль_ -> **Role Resources** -> **Custom**). Потом проверить имеет ли пользователь права на определенные действия можно при помощи конструкции

```php
Mage::getSingleton('admin/session')->isAllowed('cms/page/save');
```

А в контроллере при помощи метода **\_isAllowed** (пример взят из _Mage\_Adminhtml\_Cms\_PageController_ класса)

```php
/**
 * Check the permission to run it
 *
 * @return boolean
 */
protected function _isAllowed()
{
    switch ($this->getRequest()->getActionName()) {
        case 'new':
        case 'save':
            return Mage::getSingleton('admin/session')->isAllowed('cms/page/save');
            break;
        case 'delete':
            return Mage::getSingleton('admin/session')->isAllowed('cms/page/delete');
            break;
        default:
            return Mage::getSingleton('admin/session')->isAllowed('cms/page');
            break;
    }
}
```

Будьте внимательны в файле _adminhtml.xml_ можно задавать только права доступа (_acl_) и добавлять новые элементы меню!

В секции _global_ можно задавать тоже самое, что и в секции _frontend_. Директивы из этой секции будут применяться, как для фронта, так и для административной части. Здесь в основном задаются префиксы для имен классов

```xml
<blocks>
    <cms><class>Mage_Cms_Block</class></cms>
</blocks>
<helpers>
    <cms><class>Mage_Cms_Helper</class></cms>
</helpers>
<models>
    <cms>
        <class>Mage_Cms_Model</class>
        <resourceModel>cms_mysql4</resourceModel>
    </cms>
    <cms_mysql4>
        <class>Mage_Cms_Model_Mysql4</class>
        <entities>
            <page>
                <table>cms_page</table>
            </page>
            <page_store>
                <table>cms_page_store</table>
            </page_store>
            <block>
                <table>cms_block</table>
            </block>
            <block_store>
                <table>cms_block_store</table>
            </block_store>
        </entities>
    </cms_mysql4>
</models>
```

Когда _Magento_ обрабатывает _layout-update_\-ы и видит конструкцию

```xml
<block type="cms/block" name="cms_footer_links" before="footer_links" />
```

То сначала она разбирает атрибут _type_, который указывает класс блока. _cms/block_ - первая часть (до слэша) определяет модуль - **Mage\_Cms**. Смотрим настройки данного модуля, находим содержимое _blocks/cms/class_, в данном случае _Mage\_Cms\_Block_ и добавляем к нему вторую часть от атрибута _type_ (после слэша, в данном случае **block**) и получаем имя класса **Mage\_Cms\_Block\_Block**. Аналогично все происходит для моделей и хелперов.

Бизнес модель связана с ресурс моделью при помощи тега _models/cms/resourceModel_, в котором хранится имя другого тега, отвечающего за конфигурацию последней. В данном случае - это тег **cms\_mysql4**. В теге _models/cms/cms\_mysql4/entities_ указываются имена и элиасы таблиц в базе данных, доступ к которым можно получить в ресурс модели при помощи конструкции

```php
$blocksTable = $this->getTable('cms/block'); # cms_block
```

В данном случае метод смотрит конфигурацию модуля (_models/cms\_mysql4/entities/block/table_) и возвращает его контент. Если такого тега не существует, то возвращается передаваемая строка. По-этому рекомендуется обращаться к имени таблицы именно таким методом, а не хардкодить или писать, что-то вроде

```php
$blocksTable = $this->getTable('cms_block');
```

потому что это неправильно!

В секции _default_ можно прописать настройки по умолчанию для _Magento_, именно те, которые можно редактировать в **System** -> **Configuration**. Например, часть секции из модуля _Mage\_Cms_

```xml
<default>
    <cms>
        <wysiwyg>
            <enabled>enabled</enabled>
        </wysiwyg>
    </cms>

    <!-- another configs -->
</default>
```

указывает, что по умолчанию [WYSIWYG](http://ru.wikipedia.org/wiki/WYSIWYG) редактор включен.

В секции _crontab_ можно создать задание, которое выполнится через крон в _Magento_. Информация о всех заданиях крона хранится в таблице _cron\_schedule_. Рассмотрим пример из модуля _Mage\_Newsletter_

```xml
<crontab>
    <jobs>
        <newsletter_send_all>
            <schedule><cron_expr>*/5 * * * *</cron_expr></schedule>
            <run><model>newsletter/observer::scheduledSend</model></run>
        </newsletter_send_all>
    </jobs>
</crontab>
```

Имена всех дочерних тегов секции _crontab/jobs_ являются именами заданий в таблице крона и хранятся в поле _job\_code_. В данном случае задача называется **newsletter\_send\_all**. В секции _schedule/cron\_expr_ задается периодичность выполнения задания, в данном случае каждые 5 минут. Формат похож на тот, который используется в [Linux cron табе](http://ru.wikipedia.org/wiki/Cron). В директиве _run/model_ задается модель (_newsletter/observer_) и метод, который нужно запустить в определенное время (_scheduledSend_).

Последняя секции _admin_ - в основном здесь прописываются правила роутинга для административной панели

```xml
<admin>
    <routers>
        <adminhtml>
            <args>
                <modules>
                    <importexport before="Mage_Adminhtml">Mage_ImportExport_Adminhtml</importexport>
                </modules>
            </args>
        </adminhtml>
    </routers>
</admin>
```

## На последок

В файле конфигурации также могут быть и нестандартные теги. Например, в модуле _Mage\_ImportExport_ есть секция _global/importexport_. Доступ к нестандартным настройкам можно получить при помощи конструкции

```php
$dataArray = Mage::getConfig()->getNode('global/importexport')->asCanonicalArray();
```
