const express = require("express");
const fs = require("fs");
const router = express.Router();
const {db, genid} = require("../db/DbUtils");


const BASE_URL = "http://localhost:8080";


router.post('/rich_editor_upload', async(req, res)=>{
    if (!req.files) {
        res.send({
            "errno": 1,
            "message": "上传失败"
        });
        return;
    }
    let files = req.files;
    // console.log(files);
    let ret_files = [];
    for (let file of files) {
        let file_ext = file.originalname.substring(file.originalname.lastIndexOf(".") + 1);
        let id = genid.NextId();
        let file_name = id + "." + file_ext;
        // console.log(file_name);

        fs.renameSync(
            process.cwd() + "/public/upload/temp/" + file.filename,
            process.cwd() + "/public/upload/" + file_name
        )
        ret_files.push("/upload/" + file_name);
       
    }
    res.send({
        "errno": 0,
        "data": {
            "url": ret_files[0],
            "message": "上传成功"
        }
    })

});


module.exports = router;