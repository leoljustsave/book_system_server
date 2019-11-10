const fs = require("fs");
const path = require("path");

const putFile = (
  file,
  { filepath = path.join(__dirname, "../upload"), filename = file.name }
) => {
  // 处理存储路径
  if (["/", "."].indexOf(filepath[0]) + 1) {
    filepath = path.join(__dirname, filepath);
  }

  // 判断存储文件是否存在
  if (!fs.existsSync(filepath)) {
    fs.mkdirSync(filepath);
  }

  // 执行存储操作
  return new Promise((resolve, reject) => {
    try {
      const reader = fs.createReadStream(file.path);
      const writer = fs.createWriteStream(`${filepath}/${filename}`);
      reader.pipe(writer);
      resolve({ name: filename, path: filepath });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { putFile };
