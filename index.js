const express = require("express");
const app =  express();
const bodyParser = require("body-parser");
const ejs = require("ejs");
const path = require("path");
const fs = require("fs");
const csv = require("csv-parser");
const multer = require("multer");
const CSVToJSON = require("csvtojson");

const { resourceLimits } = require("worker_threads");


app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');
app.use(express.static(path.join(__dirname,"/public")));


const fileStorageEngine = multer.diskStorage({
    destination:(req,file ,callBack) =>{
        callBack(null,"./data");
    },
    filename : (req,file,callBack) =>{
        callBack(null,file.originalname);
    },
});
const upload = multer({storage:fileStorageEngine})


let currentFile = "";
var JSON = [];
var KEYS = [];
app.post("/upload",upload.single("File"),(req,res)=>{
    currentFile = req.file.filename;
    JSON = CSVTOJSON(""+"data/"+currentFile);
    KEYS = Object.keys(JSON[0]);
    res.redirect("/");
});

function CSVTOJSON(PATH){
    const csv = fs.readFileSync(PATH);
    var array = csv.toString().split("\n");
    let result = [];
    let headers = array[0].split(";");
    for (let i = 1; i < array.length -1; i++) {
        let temp = array[i].split(";");
        let obj ={};
        for(let i=0;i<temp.length;i++) {
            obj[headers[i]] = temp[i];
        }
        result.push(obj);
    }
    return result;
}

app.post("/searchByISBN",function(req,res){
    var searchisbn = req.body.searchisbn;
    var Res = [];
    for(let i=0;i<JSON.length;i++){
        if(JSON[i].isbn === searchisbn){
            Res.push(JSON[i]);
        }
    }
    res.render("result",{result:Res,Keys:KEYS});
});

app.post("/searchByEmail",function(req,res){
    var searchByEmail = req.body.searchemail;
    var Res = [];
    for(let i =0;i<JSON.length;i++){
       var Emails = JSON[i].authors.split(",");
        for(let j=0;j<Emails.length;j++){
            if(Emails[j] === searchByEmail){
                Res.push(JSON[i]);
            }
        }
    }
    res.render("result",{result:Res,Keys:KEYS});
});

app.post("/addNewBook",function(req,res){
    var newEntry = "" + req.body.newTitle + ";"+req.body.newIsbn +";"+ req.body.newEmail+";"+ req.body.newDescription+"\n";
    var filePath =""+"data/"+currentFile;
    fs.appendFile(filePath, newEntry,function(err) {
        if (err) throw err;
    });
    res.render("home");
});
app.post("/printAll",function(req,res){
    res.render("result",{result:JSON , Keys : KEYS});
});




const port =  process.env.port || 5000;

app.get("/",function(req,res){
    res.render("home");
});
app.listen(port,function(){
    console.log("Server on 5000");
});

