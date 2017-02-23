<?php

$region = new Region;
$method = filter_input(INPUT_SERVER, 'REQUEST_METHOD', FILTER_SANITIZE_SPECIAL_CHARS);
if ($method == "GET") {
    $territory = filter_input(INPUT_GET, 'territory', FILTER_SANITIZE_SPECIAL_CHARS);
    $email = filter_input(INPUT_GET, 'email', FILTER_VALIDATE_EMAIL);

    if (!is_null($territory) && ($territory !== FALSE)) {
        $region->territoryElement($territory);
    } elseif (!is_null($email) && ($email !== FALSE)) {
        $region->getUser($email);
    }
} elseif ($method == "POST") {
    $name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_SPECIAL_CHARS);
    $email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
    $regionId = filter_input(INPUT_POST, 'regionId', FILTER_SANITIZE_SPECIAL_CHARS);
    if ($name && $email && $regionId) {
        $region->addUser($name, $email, $regionId);
    }
}

$region->returnError([$method, $email]);

//$region->returnError('Некорректный запрос');

class Region {

    protected $db;
    protected $strQuery;
    protected $result;
    protected $row;

    public function __construct() {
        $this->db = new PDO("mysql:host=localhost;dbname=testaj", "root", "");
    }

    public function territoryElement($param = 0) {
        if ($param == "NULL") {
            $this->strQuery = "SELECT `ter_id`,`ter_name`,`ter_type_id` FROM `t_koatuu_tree` WHERE `ter_pid` IS NULL ";
        } else {
            $this->strQuery = "SELECT `ter_id`,`ter_name`,`ter_type_id` FROM `t_koatuu_tree` WHERE `ter_pid` = ? ";
        }
        $this->result = $this->db->prepare($this->strQuery);
        $this->result->execute(array($param));
        if ($this->result !== FALSE) {
            $this->row = $this->result->fetchAll(PDO::FETCH_ASSOC);
            if ($this->row) {
                $this->sendRequest($this->row);
            }
        }
        $this->sendRequest(array());
    }

    protected function findUser($email) {
        $this->strQuery = "SELECT u.*,t.* FROM `user` as u, `t_koatuu_tree` as t WHERE u.`email`= ? AND u.`territory` = t.`ter_id`";
        $this->result = $this->db->prepare($this->strQuery);
        $this->result->execute(array($email));
        if ($this->result !== FALSE) {
            $this->row = $this->result->fetch(PDO::FETCH_ASSOC);
            if ($this->row) {
                return $this->row;
            }
        }
        return FALSE;
    }

    public function getUser($email) {
        $user = $this->findUser($email);
        $this->sendRequest($user);
    }

    public function addUser($name, $email, $regionId) {
        if ($this->findUser($email) !== FALSE) {
            $this->returnError('Пользователь с таким Email уже есть в базе');
        }
        $this->strQuery = " INSERT INTO `user` VALUES ( NULL , ? , ? , ?  ) ";
        $this->result = $this->db->prepare($this->strQuery);
        $this->result->execute(array($name, $email, $regionId));
        $col = $this->result->rowCount();
        if ($col) {
            $this->sendRequest(['status' => 'ok', 'message' => 'Вы зарегистрированы']);
        }
        $this->returnError(['status' => 'error', 'message' => 'Sorry...server Error...']);
    }

    public function returnError($param = ' ') {
        $this->sendRequest(['status' => 'error', 'message' => $param]);
    }

    protected function sendRequest($ajaxRequest) {
        header('Content-Type: text/json');
        header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
        header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . 'GMT');
        header('Cache-Control: no-cache, must-revalidate');
        header('Pragma: no-cache');
        echo( json_encode($ajaxRequest) );
        exit;
    }

}
