---
title: Symfony 1.4 - мирим I18n и Searchable Doctrine 1.2 шаблоны
summary: |
  Большинство программистов, кто работал с Symfony 1.4 и Doctrine 1.2, наверняка
  использовали 2 стандартных шаблона для моделей: Searchable и I18n. Но к
  сожалению (из официальных источников) существует баг в Doctrine, который не
  позволяет использовать вместе эти шаблоны. Посмотрим почему и как это можно
  исправить
author: sstotskyi
categories:
  - backend
createdAt: 2011-10-13T22:49:00.000Z
meta:
  keywords:
    - Doctrine
    - symfony
    - I18n
    - поиск
alias: symfony-14---mirim-i18n-i-searchable-doctrine-12-shablony
---

Большинство программистов, кто работал с Symfony 1.4 и Doctrine 1.2, наверняка использовали 2 стандартных шаблона для моделей: Searchable и I18n. Но к сожалению (из официальных источников) существует баг в Doctrine, который не позволяет использовать вместе эти шаблоны, т.е. нельзя применить первый ко второму используя _actAs_ директиву в конфигурации _schema.yml_.

Вот [ссылка](http://www.doctrine-project.org/jira/browse/DC-199) на баг в Doctrine и в комментариях видим:

```html
this is a known issue with the behaviors and it is a bigger problem that can't be fixed. Some behaviors just won't work together. 
```

Это означает, что разработчики не могут придумать нормального решения, чтобы исправить баг.

## Идеология

Как говорится на нет и суда нет. Нельзя ну и пусть, не будем спорить с авторами такого гибкого и мощного ORM. Вместо этого

```javascript
CmsContent:
  actAs:
    I18n:
      fields:
        - title
        - description
      actAs:
        Searchable:
          fields: [title]
```

напишем

```javascript
CmsContent:
  actAs:
    I18n:
      fields:
        - title
        - description
    Searchable:
      fields: [title_ru, title_en]
```

т.е. применяем оба шаблона к модели _CmsContent_.

## Копаемся в коде

От источника проблемы мы ушли, теперь осталось реализовать поддержку для нашей идеи. Для этого придется погрепать _Doctrine\_Template\_Searchable_

```php
class Doctrine_Template_Searchable extends Doctrine_Template
{
    public function __construct(array $options = array())
    {
          parent::__construct($options);
          $this->_plugin = new Doctrine_Search($this->_options);
    }

    // another lines
}
```

Видим по коду, что шаблон _Searchable_ использует в качестве плагина (т.е. того кто делает основную работу) объект класса _Doctrine\_Search_. Теперь давайте посмотрим на листенер, который вызывается на _postUpdate_ модели _CmsContent_ для создания поискового индекса

```php
class Doctrine_Search_Listener extends Doctrine_Record_Listener
{
    public function postUpdate(Doctrine_Event $event)
    {
        $record = $event->getInvoker();
        $this->_search->updateIndex($record->toArray());
    }
   
    // some another lines
}
```

Проанализировав код видим, что в метод _updateIndex_ передается ассоциативный массив данных модели и эти знания очень важны.

## Решение

Осталась маленькая проблемка. Мы указали (в файле конфигурации _schema.yml_), что поиск нужно проводить основываясь на поле _title_ модели _CmsContent_, но это поле хранится в таблице _Translation_... Для того чтобы это подкорректировать перепишем метод _toArray_

```php
class CmsContent extends BaseCmsContent {
    /**
     * Fix for combining Doctrine_Searchable & Doctrine_I18n
     */
    public function toArray($deep = true, $prefixKey = false) {
        $data = parent::toArray($deep, $prefixKey);

        $table = $this->getTable();
        if ($table->hasTemplate('Searchable') && $table->hasTemplate('I18n')) {
            $fields = $table->getTemplate('Searchable')->getOption('fields');
            // get langs from somewhere
            $langs  = array('ru', 'en');
            foreach ($langs as $lang) {
                foreach ($fields as $field) {
                    if (isset($data['Translation'][$lang][$field])) {
                        $data[$field . '_' . $lang] = $data['Translation'][$lang][$field];
                    }
                }
            }
        }
        return $data;
    }

    // another lines
}
```

Т.е. смотрим если наша таблица имеет и _Searchable_, и _I18n_ шаблоны, то перепишем поля (которые отвечает за поисковый индекс) из таблицы переводов в массив _$data_. Теперь наш индекс создается и обновляется.

**P.S.**: знаю это костиль, но все же лучше чем ничего