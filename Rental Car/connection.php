<?php 
  $db_hostname = 'kc-sce-appdb01';
  $db_database = "smlhv3";
  $db_username = "smlhv3";
  $db_password = "vyMT8L6uLuF4qQaXfKI7";
  
  $connection = mysqli_connect($db_hostname, $db_username,$db_password,$db_database);
  
  if(!$connection){
      die("Unable to connecto MySQL: ".mysqli_connect_errno());
  }
?>