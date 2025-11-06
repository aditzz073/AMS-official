import app from "./app.js";
import connection from "./dbConnect.js";
import cloudinary from "cloudinary"
connection()

cloudinary.config({
    cloud_name: "dso0ycjog",
    api_key: "158161648195158",
    api_secret: "jG9lGE5zdUXZAN-OrpFDd-Nno4Q"
  });

app.listen(process.env.PORT,()=>{
    console.log(`Server is running on http:\\localhost:${process.env.PORT}`);
})

export default cloudinary;
