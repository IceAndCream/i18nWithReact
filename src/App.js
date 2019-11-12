import React, { Component } from 'react';
import { Button, Table } from 'antd';
import $ from 'jquery';
import './App.css';

export default class App extends Component {
  state = {
    data: [],
    rawData: {},
  }

  componentWillMount() {
    const _this = this;
    $.ajax({
      type:'get',
      url:'http://localhost:4000/readFiles',
      success:function(data){
        const dataSource = []

        let dataS = {}
        const locales = Object.keys(data);

        if(Object.keys(data).length > 0) {
          Object.keys(data[locales[0]]).map(key => {
            if(!dataS[key]) dataS[key] = {};
            
            locales.map(item => dataS[key][item] = data[item][key])
            dataS[key].name = key
          })
        }
        

        Object.keys(dataS).map(item => dataSource.push(dataS[item]))
        _this.setState({ data: dataSource, rawData: data, })
      },
      error:function(err){
        console.log("error", err)
      }
    })
  }

  setColumns() {
    const { rawData } = this.state;
    const locales = Object.keys(rawData);

    let columns = [{
      title: 'columns',
      key: 'name',
      dataIndex: 'name',
    }];

    locales.map(locale =>
      columns.push({
        title: locale,
        key: locale,
        dataIndex: locale,
      })
    )
console.log('columns: ', columns)
    return columns
  }

  render() {
    const { data } = this.state;
    console.log('data: ', data)
    return (
      <div className="App">
        <header className="App-header">
          i18n Wording
        </header>
        <Table
          bordered
          pagination={false}
          dataSource={data}
          columns={this.setColumns()}
        />
      </div>
    )
  }
};