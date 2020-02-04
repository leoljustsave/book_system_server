const router = require("koa-router");
const model = require("../utils/model");

const route = new router();

const MUser = model.getModel("user");
const MBook = model.getModel("book");
const MArticle = model.getModel("article");

// =========== about user data ===========

// 根据 id 获取指定用户信息
// 没有的话就获取全部用户信息
route.get("/admin/user", async (ctx, next) => {
  const { id } = ctx.request.query;
  const data = id ? await MUser.findById(id) : await MUser.find({});
  ctx.body = data;
});

// 根据 id 删除指定用户信息
// 没有的话就删除全部用户信息
route.delete("/admin/user", async (ctx, next) => {
  const { id } = ctx.request.query;
  const data = id
    ? await MUser.deleteOne({ _id: id })
    : await MUser.deleteMany({});
  ctx.body = data;
});

// =========== about book data ===========

// 根据 id 获取指定书籍信息
// 没有的话就获取全部书籍信息
route.get("/admin/book", async (ctx, next) => {
  const { id } = ctx.request.query;
  const data = id ? await MBook.findById(id) : await MBook.find({});
  ctx.body = data;
});

// 根据 id 删除指定书籍信息
// 没有的话就删除全部书籍信息
route.delete("/admin/book", async (ctx, next) => {
  const { token } = ctx.request.headers;

  if (token !== "51410") {
    ctx.body = {
      code: 1,
      msg: "access deny"
    };
    return false;
  }

  const { id } = ctx.request.query;
  const data = id
    ? await MBook.deleteOne({ _id: id })
    : await MBook.deleteMany({});
  ctx.body = data;
});

// =========== about article data ===========

// 根据 id 获取指定用户信息
// 没有的话就获取全部用户信息
route.get("/admin/article", async (ctx, next) => {
  const { id } = ctx.request.query;
  const data = id ? await MArticle.findById(id) : await MArticle.find({});
  ctx.body = data;
});

// 根据 id 删除指定用户信息
// 没有的话就删除全部用户信息
route.delete("/admin/article", async (ctx, next) => {
  const { id } = ctx.request.query;
  const data = id
    ? await MArticle.deleteOne({ _id: id })
    : await MArticle.deleteMany({});
  ctx.body = data;
});

route.post("/search", async (ctx, next) => {
  let { search } = ctx.request.body;
  let regex = "";

  search = JSON.parse(search);
  search.map(item => {
    regex += `(?=.*?${item})`;
  });

  regex = new RegExp(regex);

  let bookRes = await MBook.find(
    { name: { $regex: regex } },
    {
      _id: 1,
      name: 1,
      cover: 1,
      author: 1,
      tag: 1,
      press: 1
    }
  );

  let userRes = await MUser.find(
    { account: { $regex: regex } },
    {
      _id: 1,
      account: 1,
      avatar: 1
    }
  );

  let articleRes = await MArticle.find({ title: { $regex: regex } });

  ctx.body = {
    code: 0,
    data: { bookRes, userRes, articleRes }
  };
});

module.exports = route;
