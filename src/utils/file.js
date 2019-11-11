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

const delFile = filepath => {
  // 处理路径
  if (["/", "."].indexOf(filepath[0]) + 1) {
    filepath = path.join(__dirname, filepath);
  }

  // 判断路径是否存在
  if (!fs.existsSync(filepath)) {
    return "file or dir is not exists";
  }

  return new Promise((resolve, reject) => {
    try {
      del(filepath);
      resolve(true);
    } catch (err) {
      reject(false);
    }
  });
};

const del = filepath => {
  if (fs.statSync(filepath).isDirectory()) {
    files = fs.readdirSync(filepath);
    files.map(file => {
      let curPath = filepath + "/" + file;
      // 判断是文件夹还是文件
      if (fs.statSync(curPath).isDirectory()) {
        // recurse
        del(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(filepath);
  } else {
    fs.unlinkSync(filepath);
  }
};

module.exports = { putFile, delFile };
