---
title: Чтение директорий и поиск файлов в PHP
summary: |
  Для чтения содержимого директории в PHP есть старые проверенные функции
  readdir, opendir и closedir. Не все до сих пор знают, но в 5 версии появилось
  нечто более мощное - итераторы. С их помощью рутинная работа по поиску файлов
  намного упростилась и стала в несколько раз быстрее.
author: sstotskyi
categories:
  - backend
  - important
createdAt: 2011-10-20T09:20:00.000Z
meta:
  keywords:
    - файлы
    - symfony
    - поиск
    - iterrators
alias: chtenie-direktorij-i-poisk-fajlov-v-php
---

Для чтения содержимого директории в PHP есть старые проверенные функции _readdir_, _opendir_ и _closedir_. Не все до сих пор знают, но в 5 версии появилось нечто более мощное - [итераторы](http://www.php.net/manual/en/spl.iterators.php). С их помощью рутинная работа по поиску файлов намного упростилась и стала в несколько раз быстрее. Рассмотрим пример, как с помощью итератора прочитать все содержимое каталога

```php
// some flags to filter . and .. and follow symlinks
$flags = FilesystemIterator::SKIP_DOTS | FilesystemIterator::FOLLOW_SYMLINKS;
 
// create a simple recursive directory iterator
$iterator = new RecursiveDirectoryIterator($dir, $flags);
 
// make it a truly recursive iterator
$iterator = new RecursiveIteratorIterator($iterator, RecursiveIteratorIterator::SELF_FIRST, RecursiveIteratorIterator::CATCH_GET_CHILD);
 
// iterate over it
foreach ($iterator as $file)
{
  // do something with $file (a SplFileInfo instance)
}
```

Как видим все просто, нужно только знать когда какой итератор использовать, его разрешенные флаги и как их можно совмещать. Рассмотрим основные флаги

*   FilesystemIterator::SKIP\_DOTS - указывает, что нужно пропустить текущую (**.**) и родительскую директории (**..**)
*   FilesystemIterator::FOLOW\_SYMLINKS - указывает, что нужно идти по символьным ссылкам и выводить их содержимое
*   RecursiveIteratorIterator::SELF\_FIRST - указывает на то, что нужно показать сначала родительские элементы, а потом дочерние
*   RecursiveIteratorIterator::CATCH\_GET\_CHILD - если у итератора не будет прав на чтение какой-либо директории, он просто пропустит ее
*   RecursiveIteratorIterator::LEAVES\_ONLY - показывает только файлы
*   RecursiveIteratorIterator::CHILD\_FIRST - указывает на то, что нужно показать сначала дочерние элементы, а потом родительские

К сожалению есть небольшая проблема - все слишком объекто-ориентировано. Для обычной фильтрации итераторов нужно создать специальный класс-фильтр. Но не смотря на это итераторы в PHP очень гибкие и мощные. Допустим нужно отфильтровать все html файлы

```php
class OnlyHtmlFilesFilterIterator extends FilterIterator {
  public function accept() {
    $fileinfo = $this->getInnerIterator()->current();
 
    return preg_match('/\.html$/', $fileinfo);
}
```

В этом специальном классе пишется метод **accept**, в котором содержится логика отсечения не нужных файлов и директорий. Применить фильтр очень просто

```php
$iterator = new OnlyHtmlFilesFilterIterator($recursiveIterator);
```

## Итераторы в Symfony

В _Symfony_ начиная из первых версий был компонент **sfFinder**, думаю он многим знакомый. Этот класс очень удобный для поиска файлов и каталогов по заданным критериям. По своей сути он похож на команду **find** в Linux. А основной плюс, что его можно использовать отдельно от _Symfony_. Например, что-то вроде этого

```php
sfFinder::type('file') 
  ->name('*Table.class.php')
  ->ignore_version_control()
```

Интерфейс простой и понятный, возвращает массива файлов и директорий соответствуючих критерию поиска. Но он использует старый механизм _opendir_, _readdir_, _closedir_.

Думаю именно по-этому он был переписан во второй версии _Symfony_ - теперь он использует итераторы и работает быстрее. Поскольку Symfony 2.0 написан на PHP 5.3, то нужно помнить про неймспейсы. Например

```php
use Symfony\Components\Finder\Finder;
 
$finder = new Finder();
$iterator = $finder->files()->in(__DIR__);
 
foreach ($iterator as $file) {
  print $file->getRealpath()."\n";
}
```

Пример выше выведет рекурсивно на экран все файлы из текущей директории. Почти все методы класса возвращают экземпляр объекта, исключением является метод **in**, который возвращает итератор для заданного каталога. Рассмотрим пример

```php
$iterator = $finder
  ->files()
  ->name('test.*')
  ->notName('*.rb')
  ->exclude('ruby')
  ->followLinks()
  ->size('>= 1K')
  ->size('<= 2K')
  ->ignoreVCS()
  ->in(__DIR__)
;
```

Этот код исчет файлы, имя которых **test** с любым расширением, кроме файлов _ruby_, идет по символьным ссылкам, фильтрует по размеру и пропускает файлы систем контроля версий (svn например). Фильтровать можно также при помощи анонимной функции

```php
$filter = function (\SplFileInfo $fileinfo) {
  return strlen($fileinfo) > 10);
};
 
$finder
  ->files()
  ->name('*.php')
  ->filter($filter);
```

Как видим итераторы очень гибкое и мощное дополнение в PHP и доказательством этого есть класс **Finder** в _Symfony 2.0_