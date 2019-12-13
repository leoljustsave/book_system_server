const router = require("koa-router");

const route = new router();
const MArticle = model.getModel("article");

/**
 * 获取文章信息
 * 0 - 获取成功
 * 1 - 参数缺失
 * 2 - 获取文章失败
 * 3 - 文章不存在
 */
route.get("/article", async ctx => {
	const { id } = ctx.params;

	if (!id) {
		return (ctx.body = {
			code: 1,
			msg: "参数缺失"
		});
	}

	let articleRes;
	try {
		articleRes = await MArticle.findById(id);
		if (!articleRes) {
			return (ctx.body = {
				code: 3,
				msg: "文章不存在"
			});
		}
	} catch (e) {
		return (ctx.body = {
			code: 2,
			msg: "获取文章失败"
		});
	}

	ctx.body = {
		code: 0,
		msg: "文章获取成功",
		data: articleRes
	};
});

/**
 * 添加文章
 * 0 - 添加成功
 * 1 - 参数缺失
 */
route.post("/article", async ctx => {
	const { body } = ctx.request;
	const info = {};

	// 所需参数
	// TODO: 可优化
	const { title, author, desc, tag, cover, book, bookId, content } = body;
	// cover 可缺省
	if (!(title && author && desc && tag && book && bookId && content)) {
		return (ctx.body = { code: 1, msg: "参数缺失" });
	}

	await MArticle.create(title, author, desc, tag, cover, book, bookId, content);

	ctx.body = { code: 0, msg: "文章添加成功" };
});

module.exports = route;
