<template>
  <div>
    <div>
      <quill-editor
        ref="myTextEditor"
        v-model="content"
        :options="editorOption"
        @blur="onEditorBlur($event)"
        @focus="onEditorFocus($event)"
        @ready="onEditorReady($event)"
        @change="onEditorChange($event)"
      >
        >
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
          <input type="file" class="custom-input" @change='upload' style='display: none !important;'>-->
        </div>
      </quill-editor>

      <div class="limit">
        当前已输入
        <span>{{nowLength}}</span> 个字符，您还可以输入
        <span>{{SurplusLength}}</span> 个字符。
      </div>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button>重置</el-button>
      <!-- <el-button @click="resetForm('ruleForm')">重置</el-button> -->
      <el-button type="primary" @click="submitForm()">确 定</el-button>
    </div>
  </div>
</template>
<script>
export default {
  name: "vueditor",
  data() {
    return {
      maxLength: 5000,
      termEditForm: {},
      uploadUrl: "",
      name: "base-example",
      content: "",
      htmlContent: "",
      editorOption: {
        modules: {
          toolbar: "#toolbar"
        }
      },
      theme: "snow",
      heights: document.documentElement.clientHeight - 200,
      currentLength: "",
      leftLength: "",
      memberId: "",
      id: ""
    };
  },
  methods: {
    // 表单提交
    submitForm() {
      if (this.content.length == 0) {
        this.message(true, "合同条款不能为空", "error");
      } else {
        let params = new FormData();
        params.append("id", this.id);
        params.append("memberid", this.memberId);
        params.append("content", this.editor.quill.root.innerHTML);
        this.axios
          .post(
            process.env.API_ROOT + "/SaleContractTermApi/v1/addTerm",
            params
          )
          .then(response => {
            if (response.data.status === 200) {
              this.message(true, response.data.msg, "success");
            } else {
              this.message(true, response.data.msg, "error");
            }
          });
      }
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
    getTerm() {
      let params = new FormData();
      params.append("memberId", this.memberId);
      this.axios
        .post(process.env.API_ROOT + "/SaleContractTermApi/v1/getTerm", params)
        .then(response => {
          if (!response.data) {
            this.listLoading = false;
            return;
          }
          if (response.data && response.data.status === 200) {
            this.content = response.data.data.content;
            this.id = response.data.data.id;
          } else if (response.data && response.data.status === 410) {
            return;
          } else {
            this.message(true, response.data.msg, "error");
            this.content = "";
          }
          this.listLoading = false;
        });
    },
    message(ifshow, msg, type) {
      this.$message({
        showClose: ifshow,
        message: msg,
        type: type
      });
    },
    upload(event) {
      var reader = new FileReader();
      var img1 = event.target.files[0];
      reader.readAsDataURL(img1);
      var that = this;
      reader.onloadend = function() {
        //上传图片
        that.pushImg(reader.result, 1);
      };
    }
  },
  mounted() {
    var usr = JSON.parse(this.$cookie.get("user"));
    this.memberId = usr.memberId;
    this.getTerm();
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
  //  components: {VueEditor}
};
</script>
