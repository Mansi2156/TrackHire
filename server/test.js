const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://mansiptamkhane21_db_user:JbjucxSGtZl3cu7U@cluster0.sjhmzx5.mongodb.net/?appName=Cluster0"
)
.then(() => {
  console.log("Connected");
  process.exit();
})
.catch(err => {
  console.error(err);
});