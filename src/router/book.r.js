const router = require("koa-router");
const file = require("../utils/file");
const model = require("../utils/model");

const route = new router();
const MBook = model.getModel("book");

// 获取书籍
route.get("/book/:id", async (ctx, next) => {
  const id = ctx.params.id;
  if (+id) {
    ctx.body = id;
  }

  ctx.body = "undefined";
});

// 上传书籍
route.post("/book", async (ctx, next) => {
  const { book } = ctx.request.files;

  // 数据库存储处理

  // TODO: 书名处理
  let fileOption = {
    filepath: "../upload",
    filename: book.name
  };

  file
    .putFile(book, fileOption)
    .then(res => {
      console.log(res);
    })
    .catch(error => {
      throw new Error(error);
    });
});

// 修改书籍信息
route.patch("/book", async (ctx, next) => {
  const { body } = ctx.request;
  
});

module.exports = route;
