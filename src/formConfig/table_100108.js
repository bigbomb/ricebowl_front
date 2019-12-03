// 其它证明文件
let rule = [
  {
    type: 'input',
    title: '总提运单号', // label名称
    field: 'billNo', // 字段名称
    value: '', // input值,
    props: {
      type: 'text',
      //   disabled: true, // 是否显示清空按钮
      placeholder: '请输入...'
    },
    validate: [
      {
        required: true,
        message: '请设置总提运单号',
        trigger: 'blur'
      }
    ]
  }
]

const content = {
  rule // rule字段名称不能更改
}

export default content
