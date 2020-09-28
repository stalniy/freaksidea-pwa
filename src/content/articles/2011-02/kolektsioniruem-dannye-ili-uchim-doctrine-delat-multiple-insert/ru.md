---
title: Колекционируем данные или учим Doctrine делать multiple insert
summary: Учим Doctrine делать множественную вставку строк
author: sstotskyi
categories:
  - backend
  - important
createdAt: 2011-02-18T15:10:00.000Z
meta:
  keywords:
    - Doctrine
    - multiple insert
alias: kolektsioniruem-dannye-ili-uchim-doctrine-delat-multiple-insert
---

В моей практике достаточно часто возникает проблема с импортом excel или csv файлов в базу данных. Свои проекты в основном пишу на symfony 1.4 + doctrine 1.2. Конечно же, хочется сделать, чтобы все работало быстро и с минимальными затратами ресурсов.

## Идея

Идея же конечно очень простая - использовать multiple insert. Такие запросы точно поддерживает MySQL-сервер и они я думаю намного быстрее выполняются чем несколько аналогичных по одному.

## Проблемы

К сожалению Doctrine 1.2 не поддерживает вставку множества строк одним запросом. Наверно из-за того, что на любой модели может быть какой-то listener или hook, который не будет выполнен посредством такого запроса. Но все же, есть ситуации, когда это нужно для таблиц, которые не имеют ни listener-ов, ни hook-ов. Понятно, что при импорте не очень то хочется делать 10000 запросов к базе данных. Мне на ум пришло 2 варианта:

*   использовать InnoDB таблицы и транзакции
*   расширить возможности Doctrine\_Query

В первом все понятно. Предлагаю рассмотреть реализацию второго варианта.

## Ставим задачу

По щучьему велению по моему хотению хочу:

*   запрос должен иметь очередь вставляемых строк
*   все строки будут массивами, ключи в которых должны соответствовать полям в базе
*   если таблица имеет связь с другими, можно вставлять множество строк в несколько таблиц (2 запроса или больше) и вложенность может быть произвольной
*   возможность получить id последних вставленных строк

## Нет проблем

Подумаем какие дополнительные атрибуты нужны для класса _sjQuery_, который будет расширять _Doctrine\_Query_

*   array _$\_insert\_queue -_ очередь вставляемых строк. 1 строка - 1 массив, ключи которого соответствуют полям в моделе
*   array _$\_relations\_queue -_ очередь связей для нашей таблицы
*   array _$\_last\_insert\_ids_ - id последних вставленных строк
*   int _$\_insert\_queue\_size_ - размер очереди

Реализуем для начала возможность добавлять новые строки в очередь, а также метод, который будет делать запросы в базу данных, то есть открытый api interface

```php
class weQuery extends Doctrine_Query {
    protected
        $_insert_queue_size = 0,
        $_insert_queue = array(),
        $_last_insert_ids = array(),
        $_relations_queue = array();

   public function queueSize(){
      return count($this->_insert_queue);
   }

   public function setQueue(array $queue){
      $this->_insert_queue = $queue;
      return $this;
   }

   public function pushToQueue($data){
      $this->_insert_queue[] = $data;

      return $this;
   }

   public function popFromQueue(){
      array_pop($this->_insert_queue);
      return $this;
   }

    public function multipleInsert($tableName){
        if (!isset($this->_insert_queue[0])) {
            return false;
        }
        $this->reset();
        $table = Doctrine_Core::getTable($tableName);

        return $this->prepareInsert($table);
    }

    public function reset() {
        $this->_relations_queue = array();
        $this->_last_insert_ids = array();
        return $this;
    }
.....................................................................
}
```

Здесь все просто. После того как все данные собраны вызываем метод _multipleInsert_, который принимает всего один параметр - это имя модели таблицы.

Основную работу я решил отдать методу _prepareInsert._ Познакомимся с ним поближе

```php
..................................................................................
    protected function prepareInsert(Doctrine_Table $table){
        $tableName = $table->getTableName();
        $data = $this->prepareQueueValues($table);

        try {
            $this->_conn->beginTransaction();
            // build the statement
            $query = 'INSERT INTO ' . $this->_conn->quoteIdentifier($tableName)
                . ' (' . implode(', ', $data['fields']) . ')'
                . ' VALUES ' . implode(', ', $data['values']);

            $result = $this->_conn->exec($query, $data['params']);
            $this->_insert_queue_size = $this->queueSize();

            if ($result && !empty($this->_relations_queue)) {
                $result = $result && $this->insertRelationDataFor($table);
            }

            if (!$result) {
                throw new Doctrine_Connection_Exception("Failed inserting records in " . get_class($table));
            }
            $this->_conn->commit();

            $this->_insert_queue = array();
            return $result;
        } catch (Exception $e) {
            $this->_conn->rollBack();
            throw $e;
        }
    }
...........................................................................................
```

Этот метод сначала вызывает _prepareQueueValues_, который подготавливает данные для запроса, а также вызывает другой метод, который находит все связи и записывает их в массив _$\_relations\_queue_. Рассмотрим эти методы

```php
...........................................................................................

    protected function prepareQueueValues(Doctrine_Table $table) {
        $relations = array();

        // column names are specified as array keys
        $cols = array();
        $a = $b = array();
        $fields = reset($this->_insert_queue);
        foreach ($fields as $fieldName => $value) {
            if (is_array($value) && $table->hasRelation($fieldName)) {
                $relations[] = $fieldName;
            } else {
                $cols[] = $this->_conn->quoteIdentifier($table->getColumnName($fieldName));
                $a[] = '?';
            }
        }

        $a = '('.implode(',', $a).')';
        $b = array_fill(0, count($this->_insert_queue), $a);

        $this->prepareRelations($table, $relations);
        $values = array_map('array_values', $this->_insert_queue);
        $values = call_user_func_array('array_merge', $values);

        return array(
            'fields' => $cols,
            'values' => $b,
            'params' => $values
        );
    }

    protected function prepareRelations(Doctrine_Table $table, array $relations) {
        if (empty($relations)) {
            return $this;
        }

        foreach ($this->_insert_queue as $k => &$row) {
            foreach ($relations as &$relation) {
                $this->_relations_queue[$relation][] = $row[$relation];
                unset($this->_insert_queue[$k][$relation]);
            }
        }

        return $this;
    }
..........................................................................................
```

Здесь только уточню, что _prepareQueueValues_ возврашает массив з подготовленными данными только для 1 запроса! Все в массиве очереди (_$\_insert\_queue_) должны иметь единый формат!!!

Дальше открываем транзакцию. После выполнения первого запроса, проверяем есть ли у нас связи для вставки, если есть тогда вызываем метод _insertRelationDataFor_.

Что же происходит дальше?

```php
...........................................................................................
    public function getLastInsertIds(Doctrine_Table $table) {
        if (!empty($this->_last_insert_ids)) {
            return $this->_last_insert_ids;
        }

        $last_id = $this->_conn->lastInsertId('id');
        $count = $this->_insert_queue_size;
        $ids = array();

        if ($count && $count != 1) {
            $idFieldName = $table->getIdentifier();
            $q = $table->createQuery('ls')
                ->select('ls.' . $idFieldName . ' as id')
                ->where('ls.' . $idFieldName . ' <= ?', $last_id + $count - 1)
                ->orderBy('ls.' . $idFieldName . ' DESC')
                ->limit($count);
            $data = $q->execute(array(), Doctrine_Core::HYDRATE_SCALAR);
            if (empty($data)) {
                throw new Doctrine_Connection_Exception("Failed to get last insert ids for " . get_class($table) . ". Before using this method you must execute insert");
            }
            $i = count($data);
            $k = 0;
            while ($i--) {
                $id = $data[$i]['ls_id'];
                $this->_insert_queue[$k++][$idFieldName] = $id;
                $ids[] = $id;
            }
        } else {
            $ids[] = $last_id;
        }
        return $this->_last_insert_ids = $ids;
    }

    protected function insertRelationDataFor(Doctrine_Table $table) {
        $ids = $this->getLastInsertIds($table);
        $return = true;

        foreach ($this->_relations_queue as $relation => &$value) {
            $relationObj = $table->getRelation($relation);
            $foreignColumn = $relationObj->getForeignColumnName();
            $localColumn = $relationObj->getLocalColumnName();

            foreach ($value as $k => &$row) {
                $row = array_values($row);
                foreach ($row as $i => &$subRow) {
                    $subRow[$foreignColumn] = &$this->_insert_queue[$k][$localColumn];
                }
            }
            $value = call_user_func_array('array_merge', $value);
            $result = Doctrine_Query::create()
                ->setQueue($value)
                ->multipleInsert($relationObj->getClass());

            $return = $return && $result;
            if (!$return) {
                throw new Doctrine_Relation_Exception(sprintf(
                    "Can not insert relation data (%s) for %s table",
                    $relationObj->getTable()->getTableName(),
                    $table->getTableName()
                ));
            }
            unset($this->_relations_queue[$relation]);
        }
        $this->_relations_queue = array();
        return $return;
    }
.........................................................................................
```

Этот метод берет id последних вставленных строк, которые устанавливаются в "правильные" строки массива _$\_insert\_queue_. Потом идем по всем связям подготавливаем данные, создаем объект запроса и делаем _multipleInsert_.

Если есть проблема - бросаем исключение. Закрываем транзакцию. Вот и все!!!

Не забываем о самом важном!!! Чтобы Doctrine использовал наш объект для запросов, ему нужно об этом сказать:

```php
$doctrineDbManager->setAttribute(Doctrine::ATTR_QUERY_CLASS, 'sjQuery');
```

Привожу весь код скачать исходники можно [ЗДЕСЬ](https://gist.github.com/stalniy/1dd385d00bb34148d86dd0483468577f)

```php
<?php
class sjQuery extends Doctrine_Query {
    protected
        $_insert_queue_size = 0,
        $_insert_queue = array(),
        $_last_insert_ids = array(),
        $_relations_queue = array();

   public function queueSize(){
      return count($this->_insert_queue);
   }

   public function setQueue(array $queue){
      $this->_insert_queue = $queue;
      return $this;
   }

   public function pushToQueue($data){
      $this->_insert_queue[] = $data;

      return $this;
   }

   public function popFromQueue(){
      array_pop($this->_insert_queue);
      return $this;
   }

    public function multipleInsert($tableName){
        if (!isset($this->_insert_queue[0])) {
            return false;
        }
        $this->reset();
        $table = Doctrine_Core::getTable($tableName);

        return $this->prepareInsert($table);
    }

    public function getLastInsertIds(Doctrine_Table $table) {
        if (!empty($this->_last_insert_ids)) {
            return $this->_last_insert_ids;
        }

        $last_id = $this->_conn->lastInsertId('id');
        $count = $this->_insert_queue_size;
        $ids = array();

        if ($count && $count != 1) {
            $idFieldName = $table->getIdentifier();
            $q = $table->createQuery('ls')
                ->select('ls.' . $idFieldName . ' as id')
                ->where('ls.' . $idFieldName . ' <= ?', $last_id + $count - 1)
                ->orderBy('ls.' . $idFieldName . ' DESC')
                ->limit($count);
            $data = $q->execute(array(), Doctrine_Core::HYDRATE_SCALAR);
            if (empty($data)) {
                throw new Doctrine_Connection_Exception("Failed to get last insert ids for " . get_class($table) . ". Before using this method you must execute insert");
            }
            $i = count($data);
            $k = 0;
            while ($i--) {
                $id = $data[$i]['ls_id'];
                $this->_insert_queue[$k++][$idFieldName] = $id;
                $ids[] = $id;
            }
        } else {
            $ids[] = $last_id;
        }
        return $this->_last_insert_ids = $ids;
    }

    protected function prepareQueueValues(Doctrine_Table $table) {
        $relations = array();

        // column names are specified as array keys
        $cols = array();
        $a = $b = array();
        $fields = reset($this->_insert_queue);
        foreach ($fields as $fieldName => $value) {
            if (is_array($value) && $table->hasRelation($fieldName)) {
                $relations[] = $fieldName;
            } else {
                $cols[] = $this->_conn->quoteIdentifier($table->getColumnName($fieldName));
                $a[] = '?';
            }
        }

        $a = '('.implode(',', $a).')';
        $b = array_fill(0, count($this->_insert_queue), $a);

        $this->prepareRelations($table, $relations);
        $values = array_map('array_values', $this->_insert_queue);
        $values = call_user_func_array('array_merge', $values);

        return array(
            'fields' => $cols,
            'values' => $b,
            'params' => $values
        );
    }

    protected function prepareRelations(Doctrine_Table $table, array $relations) {
        if (empty($relations)) {
            return $this;
        }

        foreach ($this->_insert_queue as $k => &$row) {
            foreach ($relations as &$relation) {
                $this->_relations_queue[$relation][] = $row[$relation];
                unset($this->_insert_queue[$k][$relation]);
            }
        }

        return $this;
    }

    protected function insertRelationDataFor(Doctrine_Table $table) {
        $ids = $this->getLastInsertIds($table);
        $return = true;

        foreach ($this->_relations_queue as $relation => &$value) {
            $relationObj = $table->getRelation($relation);
            $foreignColumn = $relationObj->getForeignColumnName();
            $localColumn = $relationObj->getLocalColumnName();

            foreach ($value as $k => &$row) {
                $row = array_values($row);
                foreach ($row as $i => &$subRow) {
                    $subRow[$foreignColumn] = &$this->_insert_queue[$k][$localColumn];
                }
            }
            $value = call_user_func_array('array_merge', $value);
            #echo "<pre>Relation ", $relation, "n";
            #print_r($value);
            #echo "nn";
            #continue;
            $result = Doctrine_Query::create()
                ->setQueue($value)
                ->multipleInsert($relationObj->getClass());

            $return = $return && $result;
            if (!$return) {
                throw new Doctrine_Relation_Exception(sprintf(
                    "Can not insert relation data (%s) for %s table",
                    $relationObj->getTable()->getTableName(),
                    $table->getTableName()
                ));
            }
            unset($this->_relations_queue[$relation]);
        }
        $this->_relations_queue = array();
        #exit;
        return $return;
    }

    protected function prepareInsert(Doctrine_Table $table){
        $tableName = $table->getTableName();
        $data = $this->prepareQueueValues($table);

        try {
            $this->_conn->beginTransaction();
            // build the statement
            $query = 'INSERT INTO ' . $this->_conn->quoteIdentifier($tableName)
                . ' (' . implode(', ', $data['fields']) . ')'
                . ' VALUES ' . implode(', ', $data['values']);

            $result = $this->_conn->exec($query, $data['params']);
            $this->_insert_queue_size = $this->queueSize();

            if ($result && !empty($this->_relations_queue)) {
                $result = $result && $this->insertRelationDataFor($table);
            }

            if (!$result) {
                throw new Doctrine_Connection_Exception("Failed inserting records in " . get_class($table));
            }
            $this->_conn->commit();

            $this->_insert_queue = array();
            return $result;
        } catch (Exception $e) {
            $this->_conn->rollBack();
            throw $e;
        }
    }

    public function reset() {
        $this->_relations_queue = array();
        $this->_last_insert_ids = array();
        return $this;
    }
}
```

## Как использовать

Покажу на "живом" примере из моего опыта. Имеет 2 связанные таблицы: каталог деталей и другая таблица для поиска "похожих" (альтернативных) деталей, причем первая таблица должна быть на 3 языках (в doctrine 1.2 использовал template I18n). SQL синтаксис:

```sql
CREATE TABLE catalog_translation (
   id INT UNSIGNED,
   name VARCHAR(255) NOT NULL,
   description TEXT,
   lang CHAR(2),
   PRIMARY KEY(id, lang)
) DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE = INNODB;
CREATE TABLE catalog (
   id INT UNSIGNED AUTO_INCREMENT,
   keyword VARCHAR(255) NOT NULL,
   price DECIMAL(12, 4) NOT NULL,
   created_at DATETIME NOT NULL,
   updated_at DATETIME NOT NULL,
   PRIMARY KEY(id)
) DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE = INNODB;
CREATE TABLE catalog_similarkey (
   id INT UNSIGNED AUTO_INCREMENT,
   catalog_id INT UNSIGNED NOT NULL,
   name VARCHAR(255) NOT NULL,
   INDEX catalog_id_idx (catalog_id),
   PRIMARY KEY(id)
) DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ENGINE = INNODB;
ALTER TABLE catalog_translation ADD CONSTRAINT catalog_translation_id_catalog_id
   FOREIGN KEY (id) REFERENCES catalog(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE catalog_similarkey ADD CONSTRAINT catalog_similarkey_catalog_id_catalog_id
   FOREIGN KEY (catalog_id) REFERENCES catalog(id) ON DELETE CASCADE;
```

Импорт нужно было делать из excel файла. Но это упустим и сделаем задачу более теоретической.

```php
<?php
# include doctrine and other files
# P.S. i tested it using lime test framework in symfony

$data = array(
    array(
        'keyword' => 'keyword 1',
        'price' => 10.1,
        'Translation' => array(
            'en' => array(
                'name' => 'name 1 en',
                'description' => 'test en description',
                'lang' => 'en'
            ),
            'ru' => array(
                'name' => 'name 1 ru',
                'description' => '',
                'lang' => 'ru'
            )
        ),
        'CatalogSimilarkey' => array(
            array('name' => 'similar 1 for keyword 1'),
            array('name' => 'similar 2 for keyword 1'),
            array('name' => 'similar 3 for keyword 1'),
            array('name' => 'similar 4 for keyword 1')
        )
    ),
    array(
        'keyword' => 'keyword 2',
        'price' => 15.21,
        'Translation' => array(
            'en' => array(
                'name' => 'name 2 en',
                'description' => 'test en description',
                'lang' => 'en'
            ),
            'ru' => array(
                'name' => 'name 2 ru',
                'description' => '',
                'lang' => 'ru'
            )
        ),
        'CatalogSimilarkey' => array(
            array('name' => 'similar 1 for keyword 2'),
            array('name' => 'similar 2 for keyword 2'),
            array('name' => 'similar 3 for keyword 2'),
            array('name' => 'similar 4 for keyword 2')
        )
    ),
    array(
        'keyword' => 'keyword 3',
        'price' => 5,
        'Translation' => array(
            'en' => array(
                'name' => 'name 3 en',
                'description' => 'test en description',
                'lang' => 'en'
            ),
            'ru' => array(
                'name' => 'name 3 ru',
                'description' => '',
                'lang' => 'ru'
            )
        ),
        'CatalogSimilarkey' => array(
            array('name' => 'similar 1 for keyword 3'),
            array('name' => 'similar 2 for keyword 3'),
            array('name' => 'similar 3 for keyword 3'),
            array('name' => 'similar 4 for keyword 3')
        )
    )
);

$db = Doctrine_Manager::getInstance();
$db->setAttribute(Doctrine::ATTR_QUERY_CLASS, 'sjQuery');
$query = Doctrine_Query::create();

foreach ($data as $row) {
    $query->pushToQueue($row);
}

/** or just do:
 *
 *  $query->setQueue($data)
 */
try {
    $query->multipleInsert('Catalog');
} catch (Doctrine_Exception $e) {
    echo $e->getMessage();
}
```

Запускаем и смотрим в нашу базу данных.

## MultipleInsert vs prepared statement

Запишем 100 000 строк в таблицу каталог (keyword, price, created\_at, updated\_at) с помощью prepared statement + transaction и новым методом multipleInsert.

Тесты провожу у себя на локальной машине

*   Intel(R) Core(TM)2 Duo 2.00GHz
*   2GB RAM
*   Apache/2.2.12 (Ubuntu)
*   MySQL-server Ver 14.14 Distrib 5.1.37
*   PHP 5.2.10-2ubuntu6.5 with Suhosin-Patch 0.9.7 (cli)
*   symfony 1.4 (svn)

Привожу код и файл с тестовыми данными.

Prepared statement:

```php
<?php
#include doctrine and other files

Doctrine::getTable('Catalog')->getConnection()
    ->exec('TRUNCATE TABLE catalog');

$data = unserialize(file_get_contents('/tmp/test.sr'));
/**
 * Row format
 * array(
 *      'keyword' => 'random string',
 *      'price' => 'random number',
 *      'created_at' => now,
 *      'updated_at' => now
 * )
 */

$t = microtime(true);
$conn = Doctrine::getTable('Catalog')->getConnection();
$stmt = $conn->prepare('
        INSERT INTO catalog (
            keyword, price, created_at, updated_at
        ) VALUES (
            :keyword, :price, :created_at, :updated_at
        )');
try {
    $conn->beginTransaction();
    foreach ($data as $row) {
        $stmt->execute($row);
    }
    $conn->commit();
} catch (Exception $e) {
    $conn->rollBack();
}
var_dump(true, 'time: ' . (microtime(true) - $t));
```

Multiple insert:

```php
<?php
#include doctrine and other files
Doctrine::getTable('Catalog')->getConnection()
    ->exec('TRUNCATE TABLE catalog');

$data = unserialize(file_get_contents('/tmp/test.sr'));

$t = microtime(true);
$q = Doctrine_Query::create()
    ->setQueue($data)
    ->multipleInsert('Catalog');

var_dump(true, 'time: ' . (microtime(true) - $t));
```

#### Результаты

*   Multiple insert: 6.74 с
*   Prepared Statement: 24.78 с

Как видно - разница приблизительно в 3-4 раза.

Все это тестировалось только на MySQL базе данных, поэтому буду благодарен, если кто-то протестирует на других серверах.
