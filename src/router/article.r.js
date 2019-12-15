const router = require("koa-router");
const model = require("../utils/model");

const route = new router();
const MBook = model.getModel("book");
const MArticle = model.getModel("article");
const MArticleData = model.getModel("articleData");

/**
 * 获取文章信息
 * 0 - 获取成功
 * 1 - 参数缺失
 * 2 - 获取文章出错
 * 3 - 文章不存在
 */
route.get("/article/:id", async ctx => {
	const { id } = ctx.params;
	let articleRes;
	try {
		articleRes = await MArticleData.findById(id);
		if (!articleRes) {
			return (ctx.body = {
				code: 3,
				msg: "文章不存在"
			});
		}
	} catch (e) {
		return (ctx.body = {
			code: 2,
			msg: "获取文章出错"
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
 * 2 - 不存在该书籍
 */
route.post("/article", async ctx => {
	const { body } = ctx.request;
	const { token } = ctx.request.headers;

	// 所需参数
	// TODO: 可优化
	let { title, desc, tag, bookId, content } = body;
	if (!(title && desc && tag && bookId && content)) {
		return (ctx.body = { code: 1, msg: "参数缺失" });
	}

	// 通过 bookId 查找书名
	let bookRes = undefined;

	try {
		bookRes = await MBook.findById(bookId);
	} catch (err) {
		console.log('err');
	}

	if (!bookRes) {
		return (ctx.body = { code: 2, msg: "不存在该书籍" });
	}

	// 数据相关处理以及整合
	tag = JSON.parse(tag);
	let info = { title, desc, tag, bookId };
	const defArticleInfo = {
		author: token,
		book: bookRes.name
	};

	// 存储文章内容到 articleData 中 , 获取返回 id 存储到 article 中
	const articleDataRes = await MArticleData.create({ content });
	info.articleId = articleDataRes._id;

	Object.assign(info, defArticleInfo);
	await MArticle.create(info);

	ctx.body = { code: 0, msg: "文章添加成功" };
});

module.exports = route;
