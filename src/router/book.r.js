const router = require("koa-router");
const file = require("../utils/file");
const route = new router();

// 获取书籍
route.get("/book/:id", (ctx, next) => {
  const id = ctx.params.id;
  ctx.body = id;
});

// 上传书籍
route.post(
  "/book",
  (ctx, next) => {
    // const { avatar } = ctx.request.files;
    // file
    //   .putFile(avatar, "/upload", avatar.name)
    //   .then(res => {
    //     console.log(res);
    //   })
    //   .catch(error => {
    //     throw new Error(error);
    //   });
    console.log("first");
  },
  (ctx, next) => {
    console.log("second");
  }
);

module.exports = route;
