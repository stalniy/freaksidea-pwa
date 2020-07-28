---
title: sjFilemanager - конфигурируем файловый менеджер
summary: |
  В этой статье я расскажу о том как настроить sjFilemanager под свои нужды. И
  создам sjFilemanagerPlugin для Symfony 1.4
author: sstotskyi
categories:
  - backend
createdAt: 2011-01-22T13:22:00.000Z
meta:
  keywords:
    - файловый менеджер
    - ajax
    - symfony plugin
alias: sjfilemanager---konfiguriruem-fajlovyj-menedzher
---

Итак приступаем к делу! Конфигурация задается в виде ассоциативного массива\*.

## Базовые настройки

```php
$sjConfig = array(
#    'allowed_actions' => array(),
    'charset'  => 'utf-8',
    'base_dir' => dirname(dirname(dirname(__FILE__))),
    'root' => $_SERVER['DOCUMENT_ROOT'] . '/media/uploads',
    'uploader'   => array(
       'allowed_types' => array('jpeg','jpg','rar','png','doc','docx','ppt','pptx','xls','xlsx','mdb','accdb', 'swf', 'zip', 'rtf', 'pdf', 'psd', 'mp3', 'wma', 'flv', 'mp4'),
        'dynamic_name' => true,
        'override' => false,
        'images'   => array(
            'width' => 500,
            'height'=> 500,
            'type'  => 'width', // width, height, auto, zoom
            'crop'  => 'left-top' # left-top, left-bottom, center, right-top, right-bottom, custom array('x' => 100, 'y' => 200)
        ),
        'thumbs'   => array(
            'tmb_' => array(
                'width' => 125,
                'height'=> 70,
                'type'  => 'width',
                'crop'  => 'left-top'
            )/*,
            'mcr_' => array(
                'width' => 50,
                'height'=> 50,
                'type'  => 'width',
                'crop'  => 'left-top'
            )
            */
        )
    )
);
$sjConfig['lib_dir']  = $sjConfig['base_dir'] . '/lib/php';
$sjConfig['base_url'] = str_replace($_SERVER['DOCUMENT_ROOT'], '', $sjConfig['base_dir']);
$sjConfig['root_url'] = str_replace($_SERVER['DOCUMENT_ROOT'], '', $sjConfig['root']);
$sjConfig['root_url'] = rtrim($sjConfig['root_url'], DIRECTORY_SEPARATOR);

$max_size = ini_get('post_max_size');
$unit = strtoupper(substr($max_size, -1));
$multiplier = ($unit == 'M' ? 1048576 : ($unit == 'K' ? 1024 : ($unit == 'G' ? 1073741824 : 1)));

$sjConfig['uploader']['max_size'] = 2048; #$multiplier * (float)$max_size;
```

\* - конфигурация скопирована из [демо](/media/sjFilemanager/test/examples/)

## Параметры

*   allowed\_actions \- список разрешенных действий для пользователя на данный момент доступны следующие: 'refresh','cut','copy','remove','paste','rename','perms','createDir','upload','download','dirInfo','transform'. При выполнение всех других действий пользователь получит в ответ "Access denied"
*   charset \- используемая кодировка (задается в в конструкторе JsHttpRequest)
*   base\_dir \- корневая директория sjFilemanager-а
*   root \- корневой путь к рабочей папке
*   uploader:max\_size - максимальний загружаемый объем файлов
*   uploader:allowed\_types - разрешнные типы файлов для загрузки
*   uploader:dynamic\_name - если появляется конфликт имен файлов, например, файл с именем "test.php", загрузив в папку файл с таким же именем получим test(1).php и т.д.
*   uploader:override - если появляется конфликт имен файлов, то старый файл будет перезаписан новым
*   uploader:images - параметры которые будут применяться ко всем загружаемым рисункам
*   uploader:thumbs - создание thumbnail-ов для загружаемых картинок с определенным префиксом. Префикс это ключ массива. Количество элементов массива thumbs - не ограничено.
*   lib\_dir - путь к backend-у
*   base\_url - url относительно корня sjFilemanager-а
*   root\_url - url относительно рабочей папки

## sjFilemanager как плагин для Symfony 1.4

Все это хорошо, но есть проблема :). Ведь в таком случае кто-угодно будет иметь доступ к вашей рабочей папке! Есть несколько вариантов решения этой проблемы

*   создать авторизации для sjFilemanager
*   просто сделать проверку в config.php на наличие в сессии определенных данных
*   вынести менеджер из корневой директории сайта, подправить config.php и подключить файл index.php в одном из своих контроллеров

3 вариант мне нравится больше всего :) Сделаем плагин для популярного фреймворка Symfony 1.4.

Имеем такую файловую структуру:

```bash
   |-lib
   |-licenses
   |-test
   |-web
   |---css
   |---docs
   |---img
   |---js
   |---index.php
```

Для начала переместим из web директории файл index.php в корень sjFilemanager-a. Создаем папки /config, /modules/sjFilemanager/actions и /modules/sjFilemanager/templates и /modules/sjFilemanager/config. Получаем:

```bash
   |-config
   |-lib
   |-licenses
   |-modules
   |---sjFilemanager
   |-----actions
   |-----config
   |-----templates
   |-test
   |-web
   |---css
   |---docs
   |---img
   |---js
   |-index.php
```

В директории /modules/sjFilemanager/config создем файл security.yml, следующего содержания:

```cpp
default:
  is_secure: true
```

Потом - файл routing.yml в директории /config:

```javascript
sjFilemanager:
  url: /sjFilemanager
  param: { module: sjFilemanager, action: index }
```

Теперь очередь контроллера (actions.class.php), который будет обрабатывать все запросы. Идем в папку /modules/sjFilemanager/actions:

```php
<?php
class sjFilemanagerActions extends sfActions {
    public function executeIndex(sfWebRequest $request) {
        $webDir = dirname(dirname(dirname(dirname(__FILE__))));
        require $webDir . DIRECTORY_SEPARATOR . 'index.php';

        $this->setLayout(false);
        return sfView::NONE;
    }
}
```

Осталось только настроить и добавить на страницу наш файл-менеджер. Создаем файл \_assets.php в /modules/sjFilemanager/templates, в нем будет содержатся конфигурация для frontend-a sjFilemanager-a:

```php
<?php
$base_url = url_for('@sjFilemanager');
$web_root = '/sjFilemanagerPlugin';
use_stylesheet($web_root . '/css/desktop.css');
use_javascript($web_root . '/js/lang/lang_ru.js');
use_javascript($web_root . '/js/pack/sjs.js');
use_javascript($web_root . '/js/pack/swfupload.js');
use_javascript($web_root . '/js/pack/sjFilemanager.js');
?>
<script type="text/javascript">
sjs.ready(function(){
    FileManage.getInstance(null, "<?php echo $base_url ?>?tmpl=window&show_actions=1", {
        dirUrl: '<?php echo $base_url ?>',
        actionUrl: '<?php echo $base_url ?>',
        actionSel: '#sjFmActions',
        events: {
            onServerError: function(js, html) {
                FileManage.createWindow({
                    id: this.id,
                    title: $_LANG.TITLE_WARNING,
                    content: '<p>' + js.response.msg + '</p>'
                });
            }
        },
        upload: {
            object:  SWFUpload,
            onReadyEventName: 'file_dialog_complete_handler',
            flash_url : "<?php echo $web_root ?>/js/swfupload/swfupload.swf",
            file_post_name:'files',
            custom_settings : {
                progressTarget : "sjFmUploadProgress"
            },
            file_size_limit : "10MB",
            file_types : "*.*",
            file_types_description : "All Files",
            file_upload_limit : 100,
            file_queue_limit : 0,

            button_text_left_padding: 5,
            button_text_top_padding: 1,
            button_image_url: "/<?php echo $web_root ?>/js/swfupload/sbtn.png",
            button_placeholder_id: "sjFmButtonPlaceHolder",
            button_text: '<span class="submit">' + $_LANG.UPLOAD_BTN_TEXT + '</span>',
            button_width: "65",
            button_text_style: ".submit { font-size: 11; color:#000000; font-family:Tahoma, Arial, serif; }",
            button_height: "20",
            file_queued_handler: fileQueued,
            file_queue_error_handler: fileQueueError,
            upload_start_handler: uploadStart,
            upload_progress_handler: uploadProgress,
            upload_error_handler: uploadError,
            upload_success_handler: uploadSuccess
        }
    });
});
</script>
<div id="sjWindowTmpl" style="display:none">
    <div class="sjs_wtop">
    	<div class="sjs_wltitle"></div>
    	<div class="sjs_wrtitle"></div>
        <div class="sjs_wtitle">Window title</div>
    	<img src="<?php echo $base_url ?>img/load.gif" alt="" class="upload_img" />
        <div class="sjs_waction">
            <a href="#" class="minimize" onclick="return false;" tabindex="0"></a
            ><a href="#" class="maximize" onclick="return false;" tabindex="0"></a
            ><a href="#" class="close" onclick="return false;" tabindex="0"></a>
        </div>
    </div>
    <div class="window_main">
        <div class="bbottom"></div>
        <div class="bleft"></div>
        <div class="bright"></div>
        <div class="sjs_wcontent"></div>
    </div>
</div>
```

Сконфигурировав все по своему желанию, можна использовать этот файл в любом модуле, используя include\_partial('sjFilemanager/assets') или просто скопировать этот файл в нужное место. Кто захочет также можна перенести конфигурацию в app.yml.

Осталось сконфигурировать backend. Открываем /lib/php/config.php и меням несколько строк:

```php
$sjConfig = array(
...................................................
    'base_dir' => dirname(dirname(dirname(__FILE__))),
    'root' => $_SERVER['DOCUMENT_ROOT'] . '/uploads',
    /** @var $this sfWebController */
    'base_url' => $this->genUrl('@sjFilemanagerPlugin') # '/sjFilemanagerPlugin'
.....................................................
);
```

Не забываем, что новый плагин нужно включить в конфигурации вашого проекта или приложения следующим образом:

```php
$this->enablePlugins(array(
     'sjFilemanagerPlugin'
));
```

Теперь включаем модуль sjFilemanager модуль в **settings.yml** вашего приложения и все!

Готовый результат можна скачать [ЗДЕСЬ](./sjFilemanagerPlugin.zip).

```php
base_dir
```