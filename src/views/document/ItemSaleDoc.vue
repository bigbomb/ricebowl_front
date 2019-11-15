<template>
  <div id='itemSaleDoc'>
    <div class="demo-form-inline">
      <el-form :inline="true" :rules="rules" ref="saleDocRuleForm" :model="saleDocRuleForm">
        <el-col :span="24">
          <el-form-item label="" prop="content">
            <div>
              <quill-editor ref="myTextEditor" v-model="saleDocRuleForm.content" :options="editorOption" @blur="onEditorBlur($event)" @focus="onEditorFocus($event)" @ready="onEditorReady($event)" @change="onEditorChange($event)">>
                <div id="toolbar" slot="toolbar">
                  <button class="ql-bold">Bold</button>
                  <button class="ql-italic">Italic</button>
                  <select class="ql-size">
                    <option value="small"></option>
                    <option selected></option>
                    <option value="large"></option>
                    <option value="huge"></option>
                  </select>
                  <span class="ql-formats">
                    <select class="ql-align">
                      <option selected="selected"></option>
                      <option value="center"></option>
                      <option value="right"></option>
                      <option value="justify"></option>
                    </select>
                  </span>
                  <!-- <span class="ql-formats"><button type="button" @click="imgClick">
                                <svg viewBox="0 0 18 18"> <rect class="ql-stroke" height="10" width="12" x="3" y="4"></rect> <circle class="ql-fill" cx="6" cy="7" r="1"></circle> <polyline class="ql-even ql-fill" points="5 12 5 11 7 9 8 10 11 7 13 9 13 12 5 12"></polyline> </svg>
                                </button></span>
                                <input type="file" class="custom-input" @change='upload' style='display: none !important;'> -->
                </div>
              </quill-editor>
              <div class="limit">当前已输入
                <span>{{nowLength}}</span> 个字符，您还可以输入
                <span>{{SurplusLength}}</span> 个字符。</div>
            </div>
          </el-form-item>
        </el-col>

      </el-form>

    </div>
    <div slot="footer" class="dialog-footer">
      <el-button size="small" type="primary" @click="submitForm('saleDocRuleForm')">保存</el-button>
      <el-button size="small">取消</el-button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      memberId: "",
      saleDocRuleForm: {
        id: "",
        content: ""
      },
      maxLength: 5000,
      name: "base-example",
      content: "",
      htmlContent: "",
      editorOption: {
        modules: {
          toolbar: "#toolbar"
        }
      },
      rules: {
        content: [{ required: true, message: "请输入报价单内容" }]
      },
      theme: "snow",
      heights: document.documentElement.clientHeight - 200,
      currentLength: "",
      leftLength: ""
    };
  },
  mounted() {
    var usr = JSON.parse(this.$cookie.get("user"));
    this.memberId = usr.memberId;
    this.getSaleDoc();
  },
  methods: {
    // 表单提交
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.addItemSaleDoc();
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    async getSaleDoc() {
      let _this = this;
      let params = new FormData();
      params.append("memberid", _this.memberId);
      this.axios
        .post(process.env.API_ROOT + "/SaleDocApi/v1/getSaleDoc", params)
        .then(response => {
          if (!response.data) {
            return;
          }

          if (response.data.status === 200) {
            this.message(true, response.data.msg, "success");
            _this.saleDocRuleForm.id = response.data.data.id;
            _this.saleDocRuleForm.content = response.data.data.pricecontent;
            _this.dialogFormVisible = false;
          } else {
            _this.message(true, response.data.msg, "error");
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    // 重置
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    async addItemSaleDoc() {
      let _this = this;
      let params = new FormData();
      params.append("id", _this.saleDocRuleForm.id);
      params.append("memberid", _this.memberId);
      params.append("pricecontent", _this.saleDocRuleForm.content);
      this.axios
        .post(process.env.API_ROOT + "/SaleDocApi/v1/addSaleDoc", params)
        .then(response => {
          if (!response.data) {
            return;
          }

          if (response.data.status === 200) {
            this.message(true, response.data.msg, "success");
            _this.resetForm("saleDocRuleForm");
            _this.dialogFormVisible = false;
          } else {
            _this.message(true, response.data.msg, "error");
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    onEditorFocus(editor) {
      this.editor = editor;
      editor.root.contentEditable = true;
    },
    onEditorReady(editor) {
      this.editor = editor;
    },
    onEditorChange(editor) {
      this.editor = editor;
      this.currentLength = editor.text.replace("\n", "").length;
      this.content = editor.html;
    },
    onEditorBlur(editor) {
      this.editor = editor;
    },
    message(ifshow, msg, type) {
      this.$message({
        showClose: ifshow,
        message: msg,
        type: type
      });
    }
  },
  computed: {
    nowLength: function() {
      if (Number(this.currentLength) - this.maxLength >= 0) {
        this.$refs.myTextEditor.quill.root.contentEditable = false;
        let currentText = this.$refs.myTextEditor.quill.root.innerText;

        this.content = currentText.substring(0, this.maxLength);
        this.$refs.myTextEditor.quill.root.innerText = this.content;
      }

      return this.currentLength;
    },
    SurplusLength: function() {
      // 计算属性 获得当前输入字符长度
      let num = this.maxLength - Number(this.currentLength);
      if (num > 0) {
        return num;
      } else {
        return 0;
      }
    }
  }
  //  computed: {
  //   addShow() {
  //     return this.getHasRule('新增用户')
  //   },
  //   delShow() {
  //     return this.getHasRule('删除用户')
  //   },
  //   findShow() {
  //     return this.getHasRule('查询用户')
  // 	},
  // 	 statusShow() {
  //     return this.getHasRule('编辑用户状态')
  //   }
  // }
};
</script>

<style>
#itemSaleDoc .content-container {
  position: relative;
  overflow: auto;
}
#itemSaleDoc {
  height: 85vh;
}

#itemSaleDoc .demo-form-inline {
  margin: 0px 50px 0px 0;
  padding: 10px;
  overflow: hidden;
  height: 80vh;
}
#itemSaleDoc .el-form-item__label {
  width: 100px;
}
#itemSaleDoc .el-input {
  width: 300px;
}
#itemSaleDoc .footer {
  padding: 0 50px;
  overflow: hidden;
  /* height: 62px; */
  /* left: 10px; */
  /* line-height: 62px; */
  /* bottom: 10px;  */
  background: #fff;
  height: 5vh;
}

#itemSaleDoc .quill-editor {
  width: 800px;
}
#itemSaleDoc .quill-editor .ql-container {
  height: 400px;
  overflow: auto;
}

#itemSaleDoc .limit {
  height: 30px;
  text-align: left;
}
</style>
