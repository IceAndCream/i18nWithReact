import React, { Component } from 'react';
import { Button, Table, Input, Form } from 'antd';
import $ from 'jquery';
import './App.css';

const { TextArea } = Input;

const EditableContext = React.createContext();

const EditableRow = ({ form, index, ...props}) => (
  <EditableContext.Provider value={form}>
    <tr {...props} />
  </EditableContext.Provider>
)

const EditableFormRow = Form.create()(EditableRow);

class EditableCell extends Component {
  state = {
    editing: false,
  };

  toggleEdit = () => {
    const editing = !this.state.editing;
    this.setState({ editing }, () => {
      if(editing) {
        this.input.focus();
      }
    })
  }

  save = e => {
    const { record } = this.props;

    this.form.validateFields((error, values) => {
      if(error && error[e.currentTarget.id]) return;
      this.toggleEdit();

      this.props.handleSave(record, values)
    })
  }

  renderCell = form => {
    this.form = form;

    const { children, dataIndex, record } = this.props;
    const { editing } = this.state;

    return editing ? (
      <Form.Item style={{ margin: 0 }}>
        {
          form.getFieldDecorator(dataIndex, {
            initialValue: record[dataIndex],
          })(<TextArea rows={1} size="small" ref={node => {this.input = node}} onPressEnter={this.save} onBlur={this.save} />)
        }
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingRight: 24 }}
        onClick={this.toggleEdit}
      >
        {children}
      </div>
    )
  }

  render() {
    const { editable, dataIndex, title, record, index, handleSave, children, ...restProps } = this.props;

    return (
      <td {...restProps}>
        {
          editable ? <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>
          : children
        }
      </td>
    )
  }
}

export default class App extends Component {
  state = {
    data: [],
    count: 0,
    rawData: {},
  }

  componentWillMount() {
    this.readFile();
  }

  readFile() {
    const _this = this;
    $.ajax({
      type:'GET',
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

            return true;
          })
        }

        Object.keys(dataS).map(item => dataSource.push(dataS[item]))
        // 要有个排序
        _this.setState({ data: dataSource, count: dataSource.length, rawData: data, })
      },
      error:function(err){
        console.log("error", err)
      }
    })
  }

  handleAdd = () => {
    const { count, data, rawData } = this.state;

    const num = count+1;
    let newData = {};
    newData.name = num;

    const locales = Object.keys(rawData);
    locales.map(locale =>
      newData[locale] = num
    )

    const body = locales.map(locale => ({
      locale: locale,
      name: num,
      value: num,
      type: 'new',
    }))

    this.dispatchEdit(body)
    this.setState({
      data: [...data, newData],
      count: num,
    })
  }

  dispatchEdit(body) {
    const _this = this;
    $.ajax({
      type:'POST',
      url:'http://localhost:4000/writeFiles',
      data: JSON.stringify(body),
      contentType: 'application/json;charset=utf-8',
      dataType: 'json',
      success:function(){
        _this.readFile();
      },
      error:function(){
      }
    })
  }

  handleSave = (row, editValue) => {
    const { rawData } = this.state;

    let body = [];
    if(editValue.name) {
      const locales = Object.keys(rawData);
      body = locales.map(locale => ({
        locale: locale,
        name: row.name,
        value: editValue.name,
        type: 'key',
      }))
    } else {
      const editKey = Object.keys(editValue)[0];
      body = [{
        locale: editKey,
        name: row.name,
        value: editValue[editKey],
        type: 'value',
      }]
    }

    this.dispatchEdit(body); 
  }

  setColumns() {
    const { rawData } = this.state;
    const locales = Object.keys(rawData);

    let columns = [{
      title: 'columns',
      key: 'name',
      dataIndex: 'name',
      editable: true,
    }];

    locales.map(locale =>
      columns.push({
        title: locale,
        key: locale,
        dataIndex: locale,
        editable: true,
      })
    )

    return columns;
  }

  render() {
    const { data } = this.state;

    const components = {
      body: {
        row: EditableFormRow,
        cell: EditableCell,
      }
    }

    const columns = this.setColumns().map(col => {
      if(!col.editable) return col;
      return {
        ...col,
        onCell: record => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave,
        }),
      }
    })
    return (
      <div className="App">
        <header className="App-header">i18n Wording</header>
        <Button onClick={this.handleAdd} type="primary">
          Add a row
        </Button>
        <Table
          size="small"
          bordered
          pagination={false}
          rowClassName={() => 'editable-row'}
          components={components}
          dataSource={data}
          columns={columns}
        />
      </div>
    )
  }
};