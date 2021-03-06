---
title: 'Учимся программировать в Shell: обработка сигналов'
summary: |
  Обработка сигналов также важна, как и обработка ошибок. "Правильные" скрипты в
  Bash прослушивают и реагируют на появление сигналов. В основном - это сигналы
  прерывающие выполнение работы скрипта. Например, если скрипт создает
  файлы-блокировки, то он должен их удалить по завершению выполнения или получив
  один из сигналов прерывания. Рассмотрим, какие возможности для этого
  предоставляет нам Bash
author: sstotskyi
categories:
  - devops
  - important
createdAt: 2011-10-20T21:21:00.000Z
meta:
  keywords:
    - linux
    - Bash
    - прерывания
alias: uchimsya-programmirovat-v-shell-obrabotka-signalov
---

Сбой работы скрипта может произойти не только из-за какой-то ошибки, но и из-за сигналов. Рассмотрим следующий пример

```bash
#!/bin/bash

echo "this script will endlessly loop until you stop it"
while true; do
    : # Do nothing
done
```

Этот скрипт будет выполнятся до тех пор пока его кто-то или что-то не прервет при помощи сигналов. Такой сигнал можно послать при помощи комбинации клавиш _CTRL + C_, такой сигнал называется _SIGINT_.

## Уборка за собой

В большинстве случаев обработку сигналов не нужно писать. Но в некоторых условиях все же является обязательным. Например

```bash
#!/bin/bash

# Program to print a text file with headers and footers

TEMP_FILE=/tmp/printfile.txt

pr $1 > $TEMP_FILE

echo -n "Print file? [y/n]: "
read
if [ "$REPLY" = "y" ]; then
    lpr $TEMP_FILE
fi
```

Данный скрипт обрабатывает, переданный в качестве аргумента, файл при помощи команды **pr** и сохраняет результат во временном файле. Потом он спрашивает пользователя нужно ли напечатать файл. Если он (пользователь) ответит да ("y"), то файл отправляется на печать (если у Вас не установлен принтер, то вместо **lpr** можно использовать **less**).

В этом скрипте можно заметить множество проблем. Поскольку мы передаем файл, то для начала нужно проверить передается ли аргумент вообще и является ли он файлом. Но это вовсе не то, на чем мы сфокусируемся. Основная проблема в том, что если выполнение скрипта будет  прервано сигналом, то на файловой системе останется временной файл.

Хорошим тоном является удаление временных файлов, если скрипт получил сигнал на прерывание. И **Bash** предоставляет нам возможности определить это событие.

## trap

Команда **trap** позволяет запустить функцию во время получения какого-то сигнала. Ее синтаксис

```bash
trap arg signals
```

"signals" - это список сигналов, которые нужно прослушивать, "arg" - это команда, которую нужно запустить при появлении одного из заданных сигналов. Для нашего примера - это будет выглядеть следующим образом

```bash
#!/bin/bash

# Program to print a text file with headers and footers

TEMP_FILE=/tmp/printfile.txt

trap "rm $TEMP_FILE; exit" SIGHUP SIGINT SIGTERM

pr $1 > $TEMP_FILE

echo -n "Print file? [y/n]: "
read
if [ "$REPLY" = "y" ]; then
    lpr $TEMP_FILE
fi
rm $TEMP_FILE
```

В скрипте мы прослушиваем 3 сигнала, но можно добавить и больше. Полный список сигналов можно получить выполнив **trap -l**. Сигнала можно указывать не только по имени, но и по их числовым идентификаторам.

Все же существует сигнал, который нельзя прослушивать - это _SIGNKILL (9)_. Ядро _Linux_ мгновенно прерывает скрипт, который получает такой сигнал. Обычно это делается когда какой-то процесс завис. Это делается при помощи команды **kill -9 processId**. Но все же не забывайте, что посылая такой сигнал, программа, которую вы хотите остановить никаким образом не сможет отреагировать на него. Например, скрипт, который создает файлы-блокировки не сможет их удалить получив такой сигнал и тогда следующий его запуск будет невозможен. Файлы-блокировки придется удалять вручную и это хорошо если команда сообщит Вам где они находятся.

## Clean Up функция

Хотя команда **trap** и позволяет прослушивать появление сигналов, она все же имеет некоторые ограничения - можно передать только простую строку команд на выполнение. Конечно можно разделить их двоеточием, но тогда когда перестанет быть читабельным. Более правильным способом является создание **clean\_up** функции, которая выполняет все основные действия. Конечный вариант нашего скрипта выглядит следующим образом

```bash
#!/bin/bash

# Program to print a text file with headers and footers

TEMP_FILE=/tmp/printfile.txt

function clean_up {
    # Perform program exit housekeeping
    rm $TEMP_FILE
    exit
}

trap clean_up SIGHUP SIGINT SIGTERM

pr $1 > $TEMP_FILE

echo -n "Print file? [y/n]: "
read
if [ "$REPLY" = "y" ]; then
    lpr $TEMP_FILE
fi
clean_up
```

## Создание "безопасных" временных файлов

Наш скрипт можно кое-чем улучшить. Традиционно, в _Unix_, все временные файлы хранятся в директории **/tmp**. Из-за этого возникает ряд проблем. Имена создаваемых Вами файлов должны быть уникальными, чтобы не испортить работу какой-то другой программы, но и в тоже время их имя должно быть читабельным и понятным для пользователя. Для создания подобных имен можно использовать следующую технику

```php
TEMP_FILE=/tmp/printfile.$$.$RANDOM
```

Т.е. имя файла осталось тоже самое - **printfile**. Переменная **$$** хранит в себе идентификатор процесса (_pid_) - это поможет найти процесс, который отвечает за создание и удаление этого файла. Но этого не достаточно, чтобы получить уникальное имя, по-этому добавляем произвольно сгенерированное число при помощи **shell** переменной _RANDOM_. При помощи этой техники у нас получилось создать одновременно читабельное и уникальное имя временного файла.

По мотивам [http://linuxcommand.org](http://linuxcommand.org)
