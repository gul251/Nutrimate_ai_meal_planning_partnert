
<?php  
// DB Connection
$host = "localhost";
$user = "root";
$pass = "";           // agar password hai to yahan likho
$dbname = "nutrimate";

// Create connection
$conn = new mysqli($host, $user, $pass, $dbname);

// Check connection
if($conn->connect_error){
    // Connection failed
    die("<span style='color:red;'>❌ Connection failed: " . $conn->connect_error . "</span>");
} else {
    // Connection successful
    echo "<span style='color:green;'>✅ Database connected successfully!</span>";
}

// Set charset
$conn->set_charset("utf8mb4");
?>
