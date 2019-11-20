const Koa = require("koa");
const koaBody = require("koa-body");

// global
global.errorMsg = (ctx, msg) => {
  ctx.body = {
    code: 1,
    msg: msg
  };
};

// router info
const bookRouter = require("./router/book.r.js");
const userRouter = require("./router/user.r.js");
const adminRouter = require("./router/admin.r.js");

const app = new Koa();

app.use(koaBody({ multipart: true, maxFields: 10000, maxFieldsSize: "10mb" }));

// use router
app.use(bookRouter.routes());
app.use(userRouter.routes());
app.use(adminRouter.routes());

app.listen(3000, () => {
  console.log("3000 is running ...");
});
