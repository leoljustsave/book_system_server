const env = {
	lizhi: {
		get: "www.resource.com:8000",
		put: "D:/mine_za/NGINX-RESOURCE"
	}
};

/**
 * 用户可配置信息
 * 密码不在此列 , 单独出来一个接口
 */
const userCanConfig = [
	"name",
	"likeTag",
	"likeBook",
	"article",
	"uploadBook",
	"readBook",
	"collectBook",
	"avatar",
	"readSet"
];

const bookCanConfig = ["name", "cover", "author", "press", "desc", "tag"];

module.exports = { env, userCanConfig, bookCanConfig };
