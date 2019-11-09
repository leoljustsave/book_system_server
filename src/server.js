const Koa = require("koa");
const koaBody = require("koa-body");

// router info
const bookRouter = require("./router/book.r.js");

const app = new Koa();

app.use(koaBody({ multipart: true, maxFields: 10000, maxFieldsSize: "10mb" }));

// use router
app.use(bookRouter.routes());

app.listen(3000, () => {
  console.log("3000 is running ...");
});
