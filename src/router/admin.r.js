const router = require("koa-router");
const model = require("../utils/model");

const route = new router();

const MUser = model.getModel("user");

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

module.exports = route;
