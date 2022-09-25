const express = require('express');
const multer = require('multer');
const path = require('path');
const {db, genid} = require("./db/DbUtils");
const cors = require('cors');

const app = express();
const port = 8080;

// 路由配置
const testRouter = require('./routers/TestRouter');
const adminRouter = require('./routers/AdminRouter');
const categoryRouter = require('./routers/CategoryRouter');
const blogsRouter = require('./routers/BlogRouter');
const uploadRouter = require('./routers/UploadRouter');

app.use(cors());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "DELETE, GET, POST, PUT, OPTIONS");
    if (req.method === "OPTIONS") {
        res.sendStatus(200)
    }else{
        next();
    }
});

app.use(express.json());
const update = multer({
    dest: "./public/upload/temp"
});

app.use(update.any());
app.use(express.static(path.join(__dirname, 'public')));


// 中间件验证登录
const ADMIN_TOKEN_PATH = "/_token";
app.all("*", async(req, res, next) => {
    if (req.path.indexOf(ADMIN_TOKEN_PATH) > -1){
        let {token} = req.headers;
        let admin_token_sql = "SELECT * FROM `admin` WHERE `token` = ?"
        let adminRes = await db.async.all(admin_token_sql, [token]);
        if (adminRes.err != null || adminRes.rows.length == 0) {
            res.send({
                code: 403,
                msg: "请先登录"
            })
            return;
        }else{
            next();
        }
    }else{
        next();
    }
})

app.use(testRouter);
app.use('/admin', adminRouter);
app.use('/category', categoryRouter);
app.use('/blogs', blogsRouter);
app.use('/upload', uploadRouter);

app.get('/', (req, res) => {
    res.send("Hello World!");
})

app.listen(port, () => {
    console.log(`启动成功 http://localhost:${port}`);
});
