const express = require("express");
// 导入fs 和 path
const fs = require("fs");
const path = require("path");

const router = express.Router();
const {db, genid} = require("../db/DbUtils");

// 添加
router.post("/_token/add", async (req, res) => {
    let {title, category_id, content} = req.body;
    let id = genid.NextId();
    let create_time = new Date().getTime();
    const inset_sql = "INSERT INTO `blogs` (`id`, `title`, `category_id`, `content`, `create_time`) VALUES(?,?,?,?,?)";
    let params = [id, title, category_id, content, create_time]; 
    // console.log(id);
    let {err, rows} = await db.async.run(inset_sql, params);
    if (err == null){
        res.send({
            code: 200,
            msg: "添加成功"
        })
    }else{
        res.send({
            code: 500,
            msg: "添加失败"
        })
    }
})

// 修改
router.put("/_token/update", async (req, res) => {
    let {id, title, category_id, content} = req.body;
    const update_sql = "UPDATE `blogs` SET `title`=?, `content`=?, `category_id`=? WHERE `id`=?";
    let params = [title, content, category_id, id];
    let {err, rows} = await db.async.run(update_sql, params);
    if (err == null){
        res.send({
            code: 200,
            msg: "修改成功"
        })
    }else{
        res.send({
            code: 500,
            msg: "修改失败"
        })
    }
})


// 删除
router.delete("/_token/delete", async (req, res) => {
    let id = req.query.id;
    // console.log(id);
    const delete_sql = "DELETE FROM `blogs` WHERE `id`=?";
    let {err, rows} = await db.async.run(delete_sql, [id]);
    if (err == null){
        res.send({
            code: 200,
            msg: "删除成功"
        })
    }else{
        // console.log(err);
        res.send({
            code: 500,
            msg: "删除失败"
        })
    }
})

// 查询
router.post("/search", async (req, res) => {
    let {keyword, category_id, page, pageSize} = req.query;
    // console.log(pageSize);
    // console.log(page);
    page = page==null?1:page;
    pageSize = pageSize==null?10:pageSize;
    category_id = category_id==null?0:category_id;
    keyword = keyword==null?"":keyword;
    // console.log(pageSize);

    let params = [];
    let whereSqls = [];
    if (category_id != 0){
        whereSqls.push(" `category_id` = ? ");
        params.push(category_id);
    }
    if (keyword != ""){
        whereSqls.push(" `title` LIKE ? OR `content` LIKE ? ");
        params.push("%" + keyword + "%");
        params.push("%" + keyword + "%");
    }
    let whereSqlStr = "";
    if (whereSqls.length > 0){
        whereSqlStr = " WHERE " + whereSqls.join(" AND ");
    }

    // 查询分页数据
    let search_sql = " SELECT `id`, `category_id`, `create_time`, `title`, substr(`content`,0,50) as `content` FROM `blogs` " + whereSqlStr + "ORDER BY `create_time` DESC LIMIT ?, ? ";
    // console.log(search_sql)
    // let search_sql = " SELECT * FROM `blogs` " + whereSqlStr + "ORDER BY `create_time` DESC LIMIT ?, ? ";
    let searchSqlParams = params.concat([(page - 1) * pageSize, pageSize]);

    // 查询数据总数
    let search_count_sql = " SELECT count(*) as `count` FROM `blogs` " + whereSqlStr;
    let search_count_params = params;
    // console.log(search_sql);
    // console.log(searchSqlParams);
    let searchRes = await db.async.all(search_sql, searchSqlParams)
    let countRes = await db.async.all(search_count_sql, search_count_params)
    // console.log("查询结果"+searchRes);

    if (searchRes.err == null && countRes.err == null){
        res.send({
            code: 200,
            msg: "查询成功",
            data: {
                keyword: keyword,
                category_id: category_id,
                page: page,
                pageSize: pageSize,
                rows: searchRes.rows,
                count: countRes.rows[0].count
            }
        })
        // console.log(page)

    } else{
        res.send({
            code: 500,
            msg: "查询失败"
        })
    }
    
})


router.get("/detail", async (req, res) => {

    let { id } = req.query
    let detail_sql = "SELECT * FROM `blogs` WHERE `id` = ? "
    let { err, rows } = await db.async.all(detail_sql, [id]) ;

    if (err == null) {
        res.send({
            code: 200,
            msg: "获取成功",
            rows
        })
    } else {
        res.send({
            code: 500,
            msg: "获取失败"
        })
    }

})

// 删除图片
router.delete("/_token/deleteImages", (req, res) => {
    let images = req.body.images;
    
    // 提取出images中的图片
    for (var i = 0; i < images.length; i++){
        let image = images[i];
        let image_name = image.src.split("/").pop();
        // 删除图片
        try {
            fs.unlinkSync(process.cwd() + "/public/upload/" + image_name);
            res.send({
                code: 200,
                msg: "删除成功"
            })
            
        } catch (error) {
            res.send({
                code: 500,
                msg: "删除失败"
            })
            console.log(error);
        }
    }
    
})

module.exports = router;