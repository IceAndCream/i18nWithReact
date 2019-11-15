const express = require('express');
const fs = require('fs');

const app = express();

app.post('/', (req, res) => {
  const path = './src/locales';
  fs.exists(path, (exists) => {
    if(exists) {
      fs.readdir(path, (errorReadDir, files) => {
        if(errorReadDir) return console.log('errorReadDir: ', errorReadDir);
        else {
          const body = req.body;

          const fileFun = (record) => {
            const { locale, name, value, type } = record;

            fs.readFile(`${path}/${locale}.json`, 'utf8', (errReadFile, data) => {
              if(errReadFile) return res.status(500).send(`${locale}:数据读取失败`);

              const resData = JSON.parse(data);

              let reqData = resData;
              if(type === 'value') {
                reqData = {
                  ...resData,
                  [name]: value,
                }
              } else if(type === 'key') {
                const editValue = reqData[name];
                delete reqData[name]
                reqData[value] = editValue;
              } else {
                reqData[name] = value;
              }

              //write
              fs.writeFile(`${path}/${locale}.json`, JSON.stringify(reqData), (errWriteFile) => {
                if(errWriteFile) return res.status(500).send(`${locale}:数据写入失败`);
              })
            })
          }

          body.map(record => fileFun(record))

          let actions = [];

          body.map(record => {
            const action = () =>
              new Promise(resolve => {
                fileFun(record)
                resolve()
              })
            
            actions.push(action())
          })

          Promise.all(actions).then(() => {
            res.status(200);
            res.json({ status: 'success!!' })
          })
        }
      })
    } else {
      res.status(400);
      res.json('目录不存在')
      // 展示 创建 页面
    }
  })
});

module.exports = app;
