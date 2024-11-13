const express = require("express");
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Expires', '-1');
    res.setHeader('Pragma', 'no-cache');
    next();
  });
const port = 8000;
const mysql = require("./connection").con; 
app.set('view engine',"hbs");
app.set("views","./views");
app.use(express.urlencoded({extended:false}))
app.use(express.static(__dirname+"/public"));
app.get("/",(req,res)=>{
    res.render("Homepage");
 })

app.get("/studentResultPage",(req,res)=>{
    res.render("studentResultPage");
})
app.get("/updatePassword",(req,res)=>{
    res.render("updatePassword");
})

app.get("/TeacherPage",(req,res)=>{
    res.render("TeacherPage");
})

app.get("/temp",(req,res)=>{
    res.render("temp");
})
app.get("/add",(req,res)=>{
    res.render("add");
})
app.get("/search",(req,res)=>{
    res.render("search");
})
app.get("/update",(req,res)=>{
    res.render("update",{removeMsg:true});
})
app.get("/delete",(req,res)=>{
    res.render("delete");
})
app.get('/view',(req,res)=>{
    res.render('view');
})
app.get("/AllotMarks",(req,res)=>{
    res.render('AllotMarks',{idPage:true})
})
 
app.post("/student-submit", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    let qry = "select * from student where RollNumber=? and Password=?";
    mysql.query(qry, [username, password], (err, results) => {
        if (err) {
            throw err;
        } else {
            if (results.length > 0) {

                res.render('studentResultPage', { data: results });
            } else {
                res.render('Homepage', { msg: true });
            }
        }
    });
});
 
app.get('/updatePass',(req,res)=>{
    const{rollno,prevPassword,newPassword} = req.query;
    let qry  = 'select*from student where RollNumber = ? and Password =?';
    mysql.query(qry,[rollno,prevPassword],(err,results)=>{
        if(err){
            throw err;
        }
        else{
            if(results.length>0){
                let qry1 = 'update student set Password = ? where RollNumber = ?';
                mysql.query(qry1,[newPassword,rollno],(err,updateresults)=>{
                    if(err){
                        throw err;
                    }
                    else if(updateresults.affectedRows>0){
                        res.render('Homepage',{updatePassMsg:true})
                    }
                })
            }
        else{
            res.render('Homepage',{notUpdated:true})
        }
        }
    })
})

app.get('/clickedDone',(req,res)=>{
    const {number,sem} = req.query;
    const semName = mysql.escapeId(sem);
    let qry = `select ${semName}.RollNumber, ${semName}.Maths,${semName}.CGPA,${semName}.Physics,${semName}.Chemistry from ${semName} INNER JOIN student ON ${semName}.RollNumber = ? LIMIT 1`;
    mysql.query(qry,[number],(err,results)=>{
        if(err){    
            throw err;
        }
        else{
            let qry1 = "select * from student where RollNumber = ?";
            mysql.query(qry1,[number],(err,details)=>{
                if(err){
                    throw err;
                }
                else{
                    res.render('studentResultPage',{data:details,marksData:results,msg:true});
                }
            })
        }
    })
})  

app.get("/Qsubmit",(req,res)=>{
    const {username,desc} = req.query;
    let qry = "update student set Queries = ? where RollNumber =?";
    mysql.query(qry,[desc,username],(err,results)=>{
        if(err){
            throw err;
        }
        else{
            let qry = "select * from student where RollNumber =?";
            mysql.query(qry,[username],(err,results)=>{
                if(err){
                    throw err;
                }
                else{
                    res.render('studentResultPage',{data:results,msggg:true,msg:true})
                }
            })   
        }
    })
})

app.post("/teacher-submit",(req,res)=>{
    const username = req.body.username;
    const password  = req.body.password;
    let qry1 = "select * from teacher where Username=? and Password=?";
    mysql.query(qry1,[username,password],(err,results)=>{
        if(err){
            throw err;
        }
        else {
            if(results.length>0){   
                res.render("TeacherPage",{data:results})
            }
            else{
                res.render('Homepage',{msgg:true});
            }
        }
    })
})

app.post("/addstudent", (req, res) => {
        const { name, rollno, password, year, branch } = req.body;
        let qry2 = 'Select * from student where RollNumber = ?';
        mysql.query(qry2,[rollno],(err,results)=>{
            if(results.length==0){
                let qry = 'INSERT INTO student (Name, RollNumber, Password, Year, Branch) VALUES (?, ?, ?, ?, ?)';
                mysql.query(qry, [name, rollno, password, year, branch], (err, results) => {
                    if (err) {
                      throw err;
                    } else {
                      const semesterTables = ['semester', 'semester2','semester3','semester4','semester5','semester6','semester7','semester8'];
                      semesterTables.forEach((table,index)=>{
                          let qry1 = `insert into ${table} (RollNumber) values (?)`  ;
                          mysql.query(qry1,[rollno],(err,results)=>{
                              if(err){
                                  throw err;
                              }
                              else{
                                  if(index === semesterTables.length-1){
                                      res.render('add',{addmsg:true})
                                  }
                              }
                          })
                      })
                  }
              });
            }
            else{
                res.render('add',{alreadyPresent:true})
            }
        })
});
      
app.get("/removestudent",(req,res)=>{
    const {rollno} = req.query;
    let qry = 'delete from student where RollNumber = ?';

    mysql.query(qry,[rollno],(err,results)=>{
        if(err){
            throw err;
        }
        else if(results.affectedRows>0){
            const semesterTables = ['semester', 'semester2','semester3','semester4','semester5','semester6','semester7','semester8'];
            semesterTables.forEach((table,index)=>{
                let qry1 = `delete  from ${table} where RollNumber = ?`;
                mysql.query(qry1,[rollno],(err,res1)=>{
                    if(err){
                        throw err;
                    }
                    else{  
                        if(index === semesterTables.length-1){
                            res.render('delete',{dmsg1:true});
                        }
                    }
                })
            })
        }
        else{
            res.render('delete',{dmsg2:true})
        }
    })
})

app.get("/searchstudent",(req,res)=>{
    const {rollno} = req.query;
    let qry = "select * from student where RollNumber=?";
    mysql.query(qry,[rollno],(err,results)=>{
       if(err){
          throw err;
       }
       else{
          if(results.length>0){
             res.render("search",{msg1:true,data:results});
          }
          else{
             res.render("search",{msg2:true})
          }
       }
    })
 })

 app.get("/updatesearch",(req,res)=>{
    const {rollno} = req.query;
    let qry = "select * from student where RollNumber=?";
    mysql.query(qry,[rollno],(err,results)=>{
       if(err){
          throw err; 
       }
       else{
          if(results.length>0){
             res.render("update",{msg1:true,removeMsg:false,data:results})
          }
          else{
             res.render("update",{msg2:true,removeMsg:true})
          }
       }
    })
 })

 app.get("/updatestudent",(req,res)=>{
    const {name,rollno,year,branch} = req.query;
    let qry = "update student set Name=?,Year=?,Branch=?,Queries=NULL where RollNumber = ?";
    mysql.query(qry,[name,year,branch,rollno],(err,results)=>{
       if(err){
          throw err;
       }
       else {
          if(results.affectedRows>0){
             res.render("update",{umsg:true,removeMsg:true});
          }
       }
    })
 });

app.get('/viewClicked',(req,res)=>{
    const{year,branch} = req.query;
    let qry = 'select * from student where Year=? and Branch=? order by RollNumber asc';
    mysql.query(qry,[year,branch],(err,results)=>{
        if(err){
            throw err;
        }
        else{
            if(results.length>0){

                res.render('view',{data:results,msg:true});
            }
            else{
                res.render('view',{msg:false})
            }
        }
    })
})

app.get("/Report",(req,res)=>{
    let qry = "select * from student where Queries != ' '"
    mysql.query(qry,(err,results)=>{
        if(err){
            throw err;
        }
        else{
           if(results.length>0){
            res.render('Report',{data:results,noOfQueries:results.length,msg:true})
           }
           else{
            res.render('Report',{data:results,noOfQueries:results.length,msg:false})
           }
        }
    })
})


app.get('/allotMarks-submit',(req,res)=>{
    const {roolno,sem} = req.query;
    let qry = "select * from student where RollNumber=?";
    mysql.query(qry,[roolno],(err,results)=>{
        if(err){
            throw err;
        }
        else{
            if(results.length>0){
            let qry2 = ' select * from ?? where RollNumber = ?';
            mysql.query(qry2,[sem,roolno],(err,marksDetails)=>{
                if(err){
                    throw err;
                }
                else{
                    res.render('AllotMarks',{data:results,allotmsg:true,semister:sem,idPage:false,marksdata:marksDetails})
                }
            }) 
            }
            else{
                res.render('AllotMarks',{idPage:true,noData:true})
            }
        }
    })
})

app.get("/marks-submit",(req,res)=>{
    const {maths,physics,chemistry,roolno,sem,CGPA} = req.query;
    let qry = "update ?? set Maths=?,Physics=?,Chemistry=?,CGPA=? where RollNumber= ? ";
    mysql.query(qry,[sem,maths,physics,chemistry,CGPA,roolno],(err,results)=>{
        if(err){
            throw err;
        }
        else{
            let qry2 = 'update student set Queries=NULL where RollNumber = ?';
            mysql.query(qry2,[roolno],(err,results)=>{
                if(err){
                    throw err;
                }
                else{
                    res.render('AllotMarks',{MSmsg:true,idPage:true});
                }
            })
        }
    })
})       

app.listen(port,(err)=>{
    if(err){
        throw err;
    }
    else{
        console.log("Server running succesfully")
    }
})
