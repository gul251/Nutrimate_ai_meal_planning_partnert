<?php
include 'configdb.php';
header('Content-Type: application/json');

$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents("php://input"), true);

switch($action){

    // Save user profile
    case 'save_profile':
        $name = $data['name'];
        $age = $data['age'];
        $height = $data['height'];
        $weight = $data['weight'];
        $activity = $data['activity'];
        $diet = $data['diet'];
        $gender = $data['gender'];
        $user_id = $data['user_id'];

        if($user_id){
            $stmt = $conn->prepare("UPDATE users SET name=?, age=?, height=?, weight=?, activity=?, diet=?, gender=? WHERE id=?");
            $stmt->bind_param("siiddssi",$name,$age,$height,$weight,$activity,$diet,$gender,$user_id);
            $stmt->execute();
            echo json_encode(['status'=>'success','user_id'=>$user_id]);
        } else {
            $stmt = $conn->prepare("INSERT INTO users(name,age,height,weight,activity,diet,gender) VALUES(?,?,?,?,?,?,?)");
            $stmt->bind_param("siiddss",$name,$age,$height,$weight,$activity,$diet,$gender);
            $stmt->execute();
            echo json_encode(['status'=>'success','user_id'=>$stmt->insert_id]);
        }
        break;

    // Load profile
    case 'load_profile':
        $user_id = $_GET['user_id'];
        $res = $conn->query("SELECT * FROM users WHERE id=$user_id");
        echo json_encode($res->fetch_assoc());
        break;

    // Add meal
    case 'add_meal':
        $name = $data['name'];
        $cal = $data['cal'];
        $protein = $data['protein'];
        $price = $data['price'];
        $img = $data['img'];
        $stmt = $conn->prepare("INSERT INTO meals(name,cal,protein,price,img) VALUES(?,?,?,?,?)");
        $stmt->bind_param("siids",$name,$cal,$protein,$price,$img);
        $stmt->execute();
        echo json_encode(['status'=>'success','meal_id'=>$stmt->insert_id]);
        break;

    // Fetch meals
    case 'fetch_meals':
        $res = $conn->query("SELECT * FROM meals ORDER BY id DESC");
        $meals = [];
        while($row = $res->fetch_assoc()) $meals[] = $row;
        echo json_encode($meals);
        break;

    // Delete meal
    case 'delete_meal':
        $meal_id = $data['meal_id'];
        $conn->query("DELETE FROM meals WHERE id=$meal_id");
        echo json_encode(['status'=>'success']);
        break;

    default:
        echo json_encode(['status'=>'error','message'=>'Invalid action']);
}
?>
