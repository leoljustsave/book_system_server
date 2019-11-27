// node
const file = require("../utils/file");
const path = require("path");

// koa
const router = require("koa-router");

// util
const config = require("../config");
const common = require("../utils/common");
const model = require("../utils/model");

const route = new router();
const env = config.env.lizhi;
const MUser = model.getModel("user");

// 获取用户信息
route.get("/user", async (ctx, next) => {
	const token = common.getToken(ctx);
	const data = await MUser.findById(token);
	ctx.body = data;
});

// 用户注册
route.post("/user", async (ctx, next) => {
	const { body, files } = ctx.request;
	const { avatar } = files;
	// 获取文件后缀
	const avatarExt = path.extname(avatar.name);

	// 获取相应 md5 信息
	const avatarMd5 = file.getFileMd5(avatar.path);

	const defUserInfo = {
		avatar: "",
		readSet: {}
	};

	// 头像文件存储
	const avatarMd5Name = `${avatarMd5 + avatarExt}`;
	const avatarFileOption = {
		filepath: path.join(env.put, "/user/avatar"),
		filename: avatarMd5Name
	};
	await file.putFile(avatar, avatarFileOption);
	defUserInfo.avatar = `${env.get}/user/avatar/${avatarMd5Name}`;

	// 验证必要数据
	const { account, password, name } = body;
	if (!(account && password && name)) {
		return (ctx.body = {
			code: 1,
			msg: "参数缺失"
		});
	}

	// 整合数据
	const userInfo = Object.assign({}, body, defUserInfo);

	// TODO: 存储数据库, 返回 user 的 token
	const userRes = await MUser.create(userInfo);

	return ctx.body = {
		code: 0,
		msg: "add user success",
		token: userRes._id
	};
});

// 用户信息修改
route.patch("/user", (ctx, next) => {
	// 用户 token
	const token = common.getToken(ctx);
	// 传来的数据
	const { body, files } = ctx.request;
	// 需要修改的数据
	const info = {};

	// 是否有需要修改的基础信息
	if (JSON.stringify(body) !== "{}") {
		// body 不为空
		for (key in body) {
			// TODO: 判断是否有不可修改的字段
			info.key = body.key;
		}
	}

	// 是否有需要修改的头像信息
	if (files.avatar) {
		info.avatar = files.avatar;
	}

	// 判断是否有信息要修改
	if (JSON.stringify(info) === "{}") {
		ctx.body = {
			code: 0,
			msg: "none info need change"
		};
	}
	// TODO: 通过 token 查找信息 , 然后进行信息修改
});

module.exports = route;
