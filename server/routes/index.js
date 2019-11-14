const express = require('express');
const fs = require('fs');
const app = express();

/* GET home page. */
app.get('/', (req, res) => {
  fs.exists('./locales', (exists) => {
    if(exists) {
      fs.readdir('./locales', (errorReadDir, files) => {
        if(errorReadDir) return console.log('errorReadDir: ', errorReadDir);
        else {
          let actions = [];
          let jsonData = {};

          files.map(file => {
            const fileName = file.split('.')[0];
            const action = () =>
              new Promise(resolve => 
                fs.readFile(`./locales/${file}`, 'utf8', (errReadFile, data) => {
                  if(errReadFile) return res.status(500).send('数据读取失败');
                  jsonData[fileName] = JSON.parse(data)[fileName];
                  resolve();
                })
              )

            actions.push(action())
          })

          Promise.all(actions).then(() => {
            res.status(200);
            res.json(jsonData)
          })
        }
      })
    } else {
      console.log('目录不存在')
      // 展示 创建 页面
    }
  })
});

module.exports = app;
