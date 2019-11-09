const mongoose = require("mongoose");

const DB_URL = "mongodb://localhost:27017/blog_react";

mongoose.connect(DB_URL, { useNewUrlParser: true });

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
    name: { type: String, require: true },
    cover: { type: String, require: false },
    author: { type: String, require: false },
    press: { type: Array, require: true },
    desc: { type: String, require: true },
    catalog: { type: Array, require: true },
    class: { type: Array, require: true },
    like: { type: Number, require: false },
    collect: { type: Number, require: false }
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
