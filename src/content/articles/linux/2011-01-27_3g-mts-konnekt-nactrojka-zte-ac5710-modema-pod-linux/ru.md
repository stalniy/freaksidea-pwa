---
title: 3G МТС Коннект. Наcтройка ZTE AC5710 модема под Linux
summary: |
  В общем по некоторым причинам мне пришлось перейти на 3G интернет. И так как я
  использую в качестве ОС - Ubuntu, то мне пришлось немного потрудится чтобы все
  это заработало. Итак купил я МТС Коннект...
author: sstotskyi
categories:
  - linux
createdAt: 2011-01-27T06:55:00.000Z
meta:
  keywords:
    - 3G
    - модем
    - linux
alias: 3g-mts-konnekt-nactrojka-zte-ac5710-modema-pod-linux
---

Итак, став счастливым обладателем такой вещицы, как ZTE AC5710,

![images](./fd6c34df85aeef542dc1e0c043f69352.jpeg)

я не знал куда деть свое счастье на протяжение нескольких дней :).

Для начала я решил попробовать установить все на Windows, чтобы убедится что все в рабочем состоянии. После установки я тут же полез в папку **Program Files/%MTS Connect%/drivers/linux** и к своему удивлению, там таки можно обнаружить драйвер :). К сожалению у меня не получилось его скомпилировать под Ubuntu 9.10. Тогда я оставил эту затею и начал искать информацию у всезнающего Google-а.

После многих поисков и попыток, у меня ничего не получалось. Никак не мог найти настройки именно для ZTE AC5710. Тогда я попытался сделать все по аналогии с другими модемами.

Узнав о неизвестных мне ранее свойствах **vendor** и **product** для устройств на Linux у меня сначала была паника. Но это все ничего. Начнем же настраивать наш модем :)

Первое что нужно сделать, это запустить команду **lsusb**, посмотрим определилось ли вообще устройство

```bash
enej@linux:~$ lsusb
Bus 006 Device 097: ID 19d2:fff5 ONDA Communication S.p.A.
Bus 006 Device 001: ID 1d6b:0001 Linux Foundation 1.1 root hub
Bus 003 Device 001: ID 1d6b:0001 Linux Foundation 1.1 root hub
Bus 005 Device 002: ID 0458:003a KYE Systems Corp. (Mouse Systems)
Bus 005 Device 001: ID 1d6b:0001 Linux Foundation 1.1 root hub
Bus 001 Device 002: ID 04f2:b024 Chicony Electronics Co., Ltd USB 2.0 Webcam
Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub
Bus 002 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub
Bus 007 Device 001: ID 1d6b:0001 Linux Foundation 1.1 root hub
Bus 004 Device 001: ID 1d6b:0001 Linux Foundation 1.1 root hub
```

Ищем где же здесь нужное нам устройство, методом исключений :) или же если вы знаете "магические" **vendor** и **product**, которые здесь записаны через ":".

Для ZTE AC5710 **vendor=19d2**, а **product=fff5** . Значит у меня как минимум модем определен. Так как модем работает в режиме [ZeroCD](http://wiki.vectormm.net/index.php/ZeroCD "zerocd zte ac5710"), на нем есть драйвера для нескольких популярных операционных систем.

ZeroCD - это технология, суть которой заключается в том, что в момент подключения к компьютеру новое USB-устройство подключает виртуальный CD-ROM, на котором находятся необходимые драйверы. Для того, чтобы устройство стало готово к выполнению тех задач, для которых было разработано, необходимо отключить ZeroCD. Драйвер устройства сделает это автоматически, однако при отсутствии такового (например для любимого Linux) необходимо отключить самостоятельно.

Для того чтобы отключить самостоятельно нам нужно установить некоторые Debian пакеты, скачать которые вы можете [ЗДЕСЬ](./modem.utils.tar.bz2). Кому не нужен UI интерфейс для подключения к интернет, может не устанавливать gnome-ppp пакет.

Отлично раз все установлено, открываем файл **/etc/usb\_modeswitch.conf**. И пробуем найти там **vendor** и **product** для своего модема. Для ZTE AC5710, я не нашел, поэтому пишем в конец файла следующее и ничего не откоментируем!

**`**DefaultVendor=  0x19d2
DefaultProduct= 0xfff5

TargetVendor=   0x19d2
TargetProduct=  0xffff**`**

Пытаемся подключить модем с помощью **usbserial** и **option** драйверов. Для начала нужно отключить **usbserial** и подключить его с нужными **vendor** и **product**. Для этого нам понадобятся права супер пользователя (**root**)

```bash
root@linux:/home/enej# rmmod option;
root@linux:/home/enej# rmmod usbserial;
root@linux:/home/enej# usb_modeswitch;
root@linux:/home/enej# sleep 2;
root@linux:/home/enej# modprobe usbserial vendor=0x19d2 product=0xffff;
root@linux:/home/enej# modprobe option;
```

Для проверки переключилось ли устройство в режим модема

```php
root@linux:/home/enej# lsusb | grep '19d2:ffff'
Bus 006 Device 097: ID  19d2:ffff ONDA Communication S.p.A.
```

и

```php
root@linux:/home/enej# dmesg | grep 'attached to ttyUSB'
[280563.573308] usb 6-2: generic converter now attached to ttyUSB0
[280563.573437] usb 6-2: generic converter now attached to ttyUSB1
[280563.573562] usb 6-2: generic converter now attached to ttyUSB2
[280563.573683] usb 6-2: generic converter now attached to ttyUSB3
```

Если есть что-то похожее как у меня, то я Вас поздравляю все получилось :)

Теперь включаем **wvdial** для соединения с интернетом. Настройки для этой утилиты можно скачать [ЗДЕСЬ](./wvdial.zip).

```php
root@linux:/home/enej# wvdial -C /root/.wvdial.conf;
```

Если есть подключение на этом все :)

Если что-то не получается всегда смотрите **dmesg**, оставляйте комментарии, пишите, с удовольствием отвечу на Ваши вопросы :)

Для упрощения себе жизни я написал маленький скрипт для подключения модема, который можно скачать [ЗДЕСЬ](./enable_modem.sh). Запускается он только с правами **root**.
