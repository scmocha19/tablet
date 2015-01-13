<?php
	$result_string = $_POST['postresult_string'];
	file_put_contents('SC_noisyresults.csv', $result_string, FILE_APPEND);
?>