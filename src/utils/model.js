const mongoose = require("mongoose");
const moment = require("moment");

const DB_URL = "mongodb://localhost:27017/book_system";

mongoose.connect(DB_URL, { useUnifiedTopology: true, useNewUrlParser: true });

// mogoose 设置
mongoose.set("useFindAndModify", false);

// 连接成功
mongoose.connection.on("connected", function() {
	console.log("mongodb connecting...");
});

// 连接失败
mongoose.connection.on("error", function(err) {
	console.log("mongodb connect fail by: " + err);
});

const models = {
	book: {
		name: { type: String, require: true }, // 书名
		author: { type: String, default: "unknow" }, // 作者
		press: { type: String, default: "unknow" }, // 出版社
		desc: { type: String, require: true }, // 描述
		catalog: { type: Array, default: [] }, // 目录
		tag: { type: Array, default: [] }, // 分类
		like: { type: Number, default: 0 }, // 点赞人数
		collect: { type: Number, default: 0 }, // 收藏人数
		cover: { type: String, require: false }, // 封面
		path: { type: String, require: true }, // 路径
		md5: { type: String, require: true } // md5
	},
	article: {
		title: { type: String, require: true }, // 文章名
		author: { type: String, default: "unknow" }, // 作者
		desc: { type: String, require: true }, // 描述
		tag: { type: Array, default: [] }, // 分类
		like: { type: Number, default: 0 }, // 点赞人数
		collect: { type: Number, default: 0 }, // 收藏人数
		cover: { type: String, require: false }, // 封面
		book: { type: String, require: true }, // 相关书籍
		bookId: { type: String, require: true }, // 相关书籍 id
		time: {
			type: String,
			require: true,
			default: moment().format("YYYY.MM.DD HH:mm")
		}
	},
	user: {
		// name: { type: String, required: true },
		avatar: { type: String, required: true },
		account: { type: String, required: true },
		password: { type: String, required: true },
		likeTag: { type: Array, default: [] },
		likeBook: { type: Array, default: [] },
		article: { type: Array, default: [] },
		readBook: { type: Array, default: [] },
		readSet: { type: Object, default: {} },
		collectBook: { type: Array, default: [] },
		uploadBook: { type: Array, default: [] }
	}
};

for (let m in models) {
	mongoose.model(m, new mongoose.Schema(models[m]));
}

module.exports = {
	getModel: function(name) {
		return mongoose.model(name);
	}
};
