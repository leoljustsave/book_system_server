const router = require("koa-router");

function getToken(ctx) {
  const token = ctx.request.headers.token;

  if (Number(token)) {
    ctx.body = {
      code: 1,
      msg: "need login"
    };

    // 貌似可以直接重定向 ?
    router.redirect("/login");
    return false;
  }

  return token;
}

module.exports = {
  getToken
};
