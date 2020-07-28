---
title: Magento backend - грузим картинку через админку
summary: |
  Ну вот по просьбе одного из читателей блога, я решил сначала добавить
  возможность загрузки картинки для модуля Freaks_Quotes. Итак...
author: sstotskyi
categories:
  - backend
createdAt: 2011-02-11T10:53:00.000Z
meta:
  keywords:
    - magento
    - backend
    - загрузка картинки
alias: magento-backend---gruzim-kartinku-cherez-adminku
---

Если кто-то пропустил предыдущие главы, то модуль для дальнейшей работы можно скачать [ЗДЕСЬ](./Freak_Quotes_All.zip).

Итак для начала нужно написать mysql-upgrade для нашего модуля, чтобы добавить поле в котором будет сохраняться путь к файлу. Создаем **app/code/local/Freaks/Quotes/sql/quotes\_setup/mysql4-upgrade-0.2.0-0.3.0.php**

```php
<?php
$installer = $this;
$installer->startSetup();

$installer->run("
ALTER TABLE `{$this->getTable('freaks_quotes/quote')}` ADD `image` VARCHAR( 255 ) NOT NULL
");
 
$installer->endSetup();
```

ВНИМАНИЕ!!! Не забываем сменить версию нашего в модуля в **config.xml**, иначе upgrade не запустится!!!

## Крутим педали

Открываем теперь файл формы (**app/code/local/Freaks/Quotes/Block/Adminhtml/Edit/Form.php**) и добавляем новое поле с типом _image_

```php
<?php
class Freaks_Quotes_Block_Adminhtml_Edit_Form extends Mage_Adminhtml_Block_Widget_Form
{
    protected function _prepareForm()
    {
        $quote = Mage::registry('current_quote');
        $form = new Varien_Data_Form(array(
            'enctype'=> 'multipart/form-data'
        ));
        $fieldset = $form->addFieldset('edit_quote', array(
            'legend' => Mage::helper('freaks_quotes')->__('Quote Details')
        ));

        if ($quote->getId()) {
            $fieldset->addField('id', 'hidden', array(
                'name'      => 'id',
                'required'  => true
            ));
        }
 
        $fieldset->addField('name', 'text', array(
            'name'      => 'name',
            'title'     => Mage::helper('freaks_quotes')->__('Title'),
            'label'     => Mage::helper('freaks_quotes')->__('Title'),
            'maxlength' => '250',
            'required'  => true,
        ));
        
        $fieldset->addField('dscr', 'textarea', array(
            'name'      => 'dscr',
            'title'     => Mage::helper('freaks_quotes')->__('Contents'),
            'label'     => Mage::helper('freaks_quotes')->__('Contents'),
            'style'     => 'width: 98%; height: 200px;',
            'required'  => true,
        ));
 
        $fieldset->addField('image', 'image', array(
            'name'      => 'image',
            'label'     => Mage::helper('freaks_quotes')->__('Image')
        ));
 
 	$form->setMethod('post');
        $form->setUseContainer(true);
        $form->setId('edit_form');
        $form->setAction($this->getUrl('*/*/save'));
        
        $data = $quote->getData();
        $data['image'] = $quote->getImage();
        $form->setValues($data);
 
        $this->setForm($form);
    }
}
```

Меняем модель (**app/code/local/Freaks/Quotes/Model/Quote.php**), чтобы он умел сохранять рисунок на файловую систему в папку **media**.

```php
<?php
class Freaks_Quotes_Model_Quote extends Mage_Core_Model_Abstract
{
    protected $imagePath = 'freaks_quotes';
 
    protected function _construct()
    {
        $this->_init('freaks_quotes/quote');
    }
    
    protected function _beforeSave()
    {
        if ($this->getData('image/delete')) {
            $this->unsImage();
        }
        try {
            $uploader = new Varien_File_Uploader('image');
            $uploader->setAllowedExtensions(array('jpg','jpeg','gif','png'));
            $uploader->setAllowRenameFiles(true);
            
            $this->setImage($uploader);
        } catch (Exception $e) {
            // it means that we do not have files for uploading
        }
        
        return parent::_beforeSave();
    }
    
    public function getImagePath()
    {
        return Mage::getBaseDir('media') . DS . $this->imagePath . DS;
    }
    
    public function setImage($image)
    {
        if ($image instanceof Varien_File_Uploader) {
            $image->save($this->getImagePath());
            $image = $image->getUploadedFileName();
        }
        $this->setData('image', $image);
        return $this;
    }
    
    public function getImage()
    {
        if ($image = $this->getData('image')) {
            return Mage::getBaseUrl('media') . $this->imagePath . DS . $image;
        } else {
            return '';
        }
    }
    
    protected function prepareImageForDelete()
    {
        $image = $this->getData('image');
        return str_replace(Mage::getBaseUrl('media'), Mage::getBaseDir('media') . DS, $image['value']);
    }
    
    public function unsImage()
    {
        $image = $this->getData('image');
        if (is_array($image)) {
            $image = $this->prepareImageForDelete();
        } else {
            $image = $this->getImagePath() . $image;
        }
        
        if (file_exists($image)) {
            unlink($image);
        }
        $this->setData('image', '');
        return $this;
    }
}
```

Сначала переопределим метод _\_beforeSave_ модели, в котором будем сохранять или удалять картинку. Чтобы сохранить загружаемый пользователем файл, используем стандартный _Varien\_File\_Uploader,_ в конструктор которого передаем ключ файла из массива _$\_FILES_ (если передать ключ, которого не существует в супер глобальной переменной _$\_FILES_, то будет брошено исключение). Он сделает всю грязную работу за нас.

Рассмотрим теперь методы _unsImage_ и _setImage_.

*   _setImage -_ проверяет, если передаваемое значение является объектом класса _Varien\_File\_Uploader_, если да - сохраняет его на файловую систему в нужную нам директорию и устанавливает значение в модель
*   _unsImage -_ проверяет, если значение в модели является массивом, если да - это значит данные были переданы из формы, поэтому заменяем **media base url** на **media base path**. Проверяем если файл существует, то удаляем его

Вот и все, так просто!!!

Скачать модифицированый модуль можно [ЗДЕСЬ](./Freak_Quotes_With_Image.zip)