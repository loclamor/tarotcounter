<?php
//set a title to your application
define('SITE_NAME', 'loclablog');

//table name prefix for the database
define('TABLE_PREFIX','blog_');

//default controller and action
define('DEFAULT_CONTROLLER', 'home');
define('DEFAULT_ACTION', 'index');

//define the location folder of the BPC Framework
define('BPCF', 'src/bpcf');
define('BPCF_ROOT', 'src');

define('APPLICATION_ENV', 'dev');

if(APPLICATION_ENV == 'dev') {//on est en local
        error_reporting(E_ALL);
        ini_set('display_errors', '1');
}

require_once BPCF.'/conf.php';