const express = require('express');
const fs = require('fs');
const router = express.Router();

const app = express();

/* GET home page. */
// router.get('/', function(req, res, next) {
  app.get('/', (req, res) => {
  console.log('jin')
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
            console.log('jsonData: ', jsonData)
            res.status(200);
            res.json(jsonData)
            // res.render('index', { "language": jsonData });
          })
        }
      })
    } else {
      console.log('目录不存在')
      // 展示 创建 页面
    }
  })
});
// res
//   res.json( { title: 'Express' });
// });

module.exports = app;
