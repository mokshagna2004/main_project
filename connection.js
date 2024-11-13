const mysql = require("mysql");
const con = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:'projectDB',
    port:3306
});
con.connect((err)=>{
    if(err){
       throw err;
    }
    else{
        console.log("DB connected successfully");   
    }
})
module.exports.con = con;