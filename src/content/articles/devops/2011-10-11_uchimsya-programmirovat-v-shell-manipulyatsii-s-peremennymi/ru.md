---
title: 'Учимся программировать в Shell: манипуляции с переменными'
summary: |
  Для написания скриптов логика которых сложнее чем просто вывод текста и вызов
  нескольких стандартных команд, необходимо знать основные управляющие
  конструкции и базовые манипуляции с переменными.
author: sstotskyi
categories:
  - devops
  - important
createdAt: 2011-10-11T12:25:00.000Z
meta:
  keywords:
    - linux
    - Bash
    - переменные
alias: uchimsya-programmirovat-v-shell-manipulyatsii-s-peremennymi
---

Для написания скриптов логика которых сложнее чем просто вывод текста и вызов нескольких стандартных команд, необходимо знать основные управляющие конструкции и базовые манипуляции с переменными.

## Переменные

Переменные в Bash не типизированы, т.е. при создании переменной не нужно указывать какой тип данных она будет в себе содержать. Существует 3 основных типы переменных: строки, числа, массивы.

```bash
enej@linux:~$ str='My First String'
enej@linux:~$ echo $str
My First String
enej@linux:~$ num=5
enej@linux:~$ echo $num
5
enej@linux:~$ arr=(my first array)
enej@linux:~$ echo ${arr[@]}
my first array
```

Обязательным является отсутствие пробелов перед и после знака равенства иначе получим ошибку

```bash
enej@linux:~$ title = 'My First Var'
title: command not found
```

В большинстве случаев в Shell мы работаем с текстовыми данными, т.е. строками. По-этому нужно разобраться в базовых понятиях создания и манипулирования ими.

Строку можно создать при помощи кавычек одинарных или двойных. Весь текст записанный в одинарных кавычках будет восприниматься интерпретатором, как обычный текст

```bash
enej@linux:~$ echo '"$title" is not a var it is just a text'
"$title" is not a var it is just a text
```

Но если записать то же самое в двойных кавычках, то

```bash
enej@linux:~$ echo "\"$title\" is not a var it is just a text"
"My First Var" is not a var it is just a text
```

увидим, что переменная **$title** интерполировалась в текст. Для того чтобы этого избежать используется экранирование с помощью символа обратной косой черты

```bash
enej@linux:~$ echo "\"\$title\" is not a var it is just a text"
"$title" is not a var it is just a text
```

## Манипуляции с переменными

Рассмотрим базовые манипуляции с переменными

*   конкатенация строк

    ```bash
    enej@linux:~$ anotherVar=$title' is a var'
    enej@linux:~$ echo $anotherVar
    My First Var is a var

    ```

*   **${str:-word}** - использовать значение по умолчанию (если переменная равно **null** или пустой строке, то будет использоваться значение по умолчанию)

    ```php
    enej@linux:~$ title=
    enej@linux:~$ echo ${title:-test}
    test
    enej@linux:~$ title=''
    enej@linux:~$ echo ${title:-test}
    test
    ```

*   **${str:=word}** - установить значение по умолчанию (если переменная равно **null** или пустой строке, то ей будет присвоено значение по умолчанию)

    ```bash
    enej@linux:~$ title=''
    enej@linux:~$ echo ${title:=test}
    test
    enej@linux:~$ echo $title
    test
    ```

*   **${str:?word}** - выход из команды и вывод сообщения об ошибке, если значение переменной равно **null** или пустой строке

    ```bash
    enej@linux:~$ title=''
    enej@linux:~$ echo ${title:?'error message'}
    bash: title: error message
    ```

*   **${str:+word}** - альтернативное значение (если переменная не равна **null** и пустой строке, то ей будет использоваться альтернативное значение)

    ```bash
    enej@linux:~$ title=''
    enej@linux:~$ echo ${title:+test}

    enej@linux:~$ title=bla
    enej@linux:~$ echo ${title:+test}
    test
    ```

*   **${str:offset:length}** - вырезать подстроку (если **offset** < 0, то отсчет ведется начиная с конца строки, **length** может быть только больше нуля, необязательный параметр)

    ```bash
    enej@linux:~$ title="My String"
    enej@linux:~$ echo ${title:3}
    String
    enej@linux:~$ echo ${title:0-6:6}
    String
    ```

*   **${!prefix\*}, ${!prefix@}** - ищет все переменные имя, которых начинается с указанного префикса и возвращает их имена

    ```bash
    enej@linux:~$ p_title=1
    enej@linux:~$ p_test=2
    enej@linux:~$ echo ${!p_*}
    p_test p_title
    enej@linux:~$ echo ${!p_@}
    p_test p_title
    ```

*   **${!arr\[@\]}, ${arr\[@\]}** - первый возвращает все ключи массива, второй - все значения

    ```bash
    enej@linux:~$ arr=(my first array)
    enej@linux:~$ echo ${arr[@]}
    my first array
    enej@linux:~$ echo ${!arr[@]}
    0 1 2
    ```

*   **${#parameter}** - возвращает длину строки или последний индекс массива

    ```php
    enej@linux:~$ arr=(my first array)
    enej@linux:~$ echo ${#arr}
    2
    enej@linux:~$ title="test"
    enej@linux:~$ echo ${#title}
    4
    ```

*   **${parameter#word}, ${parameter##word}** - если **word** совпадает с началом строки, то оно удаляется из строки, если **parameter** - это массив, то операция будет применена ко всем его элементам

    ```bash
    enej@linux:~$ title='test'
    enej@linux:~$ arr=(amy afirst aarray);
    enej@linux:~$ echo ${title#t}
    est
    enej@linux:~$ echo ${arr[@]#a}
    my first array
    ```

*   **${parameter%word}, ${parameter%%word}** - то же самое, что и предыдущее, только удаляет суффикс

    ```bash
    enej@linux:~$ title='test'
    enej@linux:~$ arr=(mya first arraya);
    enej@linux:~$ echo ${title%st}
    te
    enej@linux:~$ echo ${arr[@]%a}
    my first array
    ```

*   **${parameter/pattern/string}** - заменяет **pattern** на строку в **parameter**. Если **pattern** начинается с **#** - это значит, что искать нужно в начале строки, если с **%** - искать в конце строки, если с **/** - заменить все найденные вхождения **pattern** в строке на **string**

    ```bash
    enej@linux:~$ title='My test string for testing replacement feature'
    enej@linux:~$ echo ${title/test/}
    My string for testing replacement feature
    enej@linux:~$ echo ${title//test/}
    My string for ing replacement feature
    enej@linux:~$ echo ${title/#My/}
    test string for testing replacement feature
    enej@linux:~$ echo ${title/%My/}
    My test string for testing replacement feature
    ```

*   **${parameter^pattern}, ${parameter^^pattern}, ${parameter,pattern}, ${parameter,,pattern}** - первые 2 делают найденный **pattern** - заглавными буквами, вторые две - прописными. **,,** и **^^** - заменяют регистр букв для всех найденных совпадений.

    ```bash
    enej@linux:~$ title='My test string for testing replacement feature'
    enej@linux:~$ echo ${title,M}
    my test string for testing replacement feature
    enej@linux:~$ echo ${title^^m}
    My test string for testing replaceMent feature
    ```


Очень часто возникает задача сохранить результат работы команды в переменную для последующей обработки данных. Для этого есть 2 способа

```bash
enej@linux:~$ title=$(echo 'some result')
enej@linux:~$ echo $title
some result
enej@linux:~$ title=`echo 'some another result'`
enej@linux:~$ echo $title
some another result
```

С помощью "**$()**" или обратных кавычек, также можно интерполировать вывод команды в двойных кавычках

```bash
enej@linux:~$ echo "There is command output: $(echo 'some result')"
There is command output: some result
```

Создавать переменные состоящие из нескольких строк можно при помощи одинарных кавычек или **HERE DOC** синтаксиса. С его помощью также можно передавать текст на стандартный ввод команды. Here Doc работает как двойные кавычки. Разница между "**<<**" и "**<<-**", в том что последняя запись будет удалять из текста лидирующие табы, но не пробелы!

```bash
enej@linux:~$ read -d '' title <<-_EOF_
test
big
text
_EOF_

enej@linux:~$ echo $title
test big text
enej@linux:~$ echo "$title"
test
big
text
```

Видим один нюанс, если переменную взять в кавычки, то переводы строк сохранятся при использование команды **echo**, если нет, то вместо перевода строки используется пробел.
