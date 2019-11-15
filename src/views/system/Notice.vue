<template>
  <div id="notice">
    <el-row>
      <!--工具条-->
      <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
        <el-form :inline="true" :model="filters">
          <el-form-item>
            <el-input v-model="filters.keyword" placeholder="请输入标题"></el-input>
          </el-form-item>
          <el-form-item v-if="findShow">
            <el-button
              type="primary"
              class="el-icon-search"
              :loading="selLoading"
              v-on:click="getNotices"
            >查询</el-button>
          </el-form-item>
          <el-form-item v-if="addShow">
            <el-button type="success" class="el-icon-plus" @click.native="showDialogForm">新增</el-button>
          </el-form-item>
          <!-- <el-form-item>
					<el-button type="error" class="el-icon-edit" @click="editNotice">编辑</el-button>
          </el-form-item>-->
          <el-form-item v-if="delShow">
            <el-button type="danger" class="el-icon-delete" @click="delNotice">删除</el-button>
          </el-form-item>
          <!-- <el-form-item>
					<el-button type="danger" class="el-icon-delete" @click="toueditor">百度富文本框</el-button>
          </el-form-item>-->
        </el-form>
      </el-col>

      <!--列表-->
      <el-col>
        <el-table
          :data="notices"
          v-loading="listLoading"
          element-loading-text="拼命加载中"
          @selection-change="handleSelectionChange"
          style="width: 100%;"
        >
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="id" label="id" width="80" sortable></el-table-column>
          <el-table-column prop="title" label="标题" width="400" sortable></el-table-column>
          <el-table-column prop="content" label="内容" width="800" sortable></el-table-column>
          <el-table-column prop="crt" label="创建时间" width="200" sortable>
            <template slot-scope="scope">
              <span>{{scope.row.crt, 'yyyy-MM-dd hh:mm:ss' | dataFormat}}</span>
            </template>
          </el-table-column>
          <el-table-column prop="upt" label="更新时间" width="200" sortable>
            <template slot-scope="scope">
              <span
                v-show="scope.row.upt!=null"
              >{{scope.row.upt, 'yyyy-MM-dd hh:mm:ss' | dataFormat}}</span>
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="100" v-if="editShowIt">
            <template slot-scope="scope">
              <el-button type="text" size="small" @click="editShow(scope.row)">编辑</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
      <el-col>
        <div class="block" style="float: right;margin-right: 10px;margin-top: 10px;">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="startPage"
            :page-sizes="pageSizes"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
          ></el-pagination>
        </div>
      </el-col>
      <el-col :span="2">
        <el-dialog :title="thistitle" :visible.sync="dialogFormVisible">
          <div style="width:80%;margin: 0 auto">
            <el-form
              :model="noticeRuleForm"
              status-icon
              :rules="rules"
              ref="noticeRuleForm"
              :inline="false"
              label-width="90px"
              class="demo-userRuleForm"
            >
              <el-form-item label="标题" prop="title">
                <el-input
                  type="text"
                  placeholder="请输入标题"
                  auto-complete="off"
                  v-model="noticeRuleForm.title"
                ></el-input>
              </el-form-item>
              <el-form-item label="内容" prop="content">
                <div>
                  <quill-editor
                    ref="myTextEditor"
                    v-model="noticeRuleForm.content"
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
                  <div slot="footer" class="limit">
                    当前已输入
                    <span>{{nowLength}}</span> 个字符，您还可以输入
                    <span>{{SurplusLength}}</span> 个字符。
                  </div>
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible = false">取 消</el-button>
            <el-button @click="resetForm('noticeRuleForm')">重 置</el-button>
            <el-button type="primary" @click="submitForm('noticeRuleForm')">保 存</el-button>
          </div>
        </el-dialog>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  data() {
    return {
      thistitle: "新增公告",
      readonly: false,
      isshow: false,
      filters: {
        keyword: ""
      },
      noticeRuleForm: {
        id: "",
        title: "",
        content: ""
      },
      pageSizes: [30, 50, 80, 100],
      startPage: 1,
      pageSize: 30,
      total: 0,
      notices: [],
      page: 1,
      maxLength: 5000,
      content: "",
      htmlContent: "",
      listLoading: false,
      selLoading: false,
      dialogFormVisible: false,
      formLabelWidth: "120px",
      noticeIds: [], // 用户ids
      memberId: "",
      editorOption: {
        modules: {
          toolbar: "#toolbar"
        }
      },
      theme: "snow",
      heights: document.documentElement.clientHeight - 200,
      currentLength: "",
      leftLength: "",
      // 表单验证
      rules: {
        title: [
          { required: true, message: "请输入公告标题" },
          { min: 5, max: 20, message: "长度在 5 到 20 个字符" }
        ],
        content: [{ required: true, message: "请输入公告内容" }]
      }
    };
  },
  methods: {
    // 编辑用户
    async editShow(row) {
      this.thistitle = "编辑公告";
      this.readonly = true;
      this.noticeRuleForm.id = row.id;
      this.noticeRuleForm.title = row.title;
      this.noticeRuleForm.content = row.content;
      this.dialogFormVisible = true;
    },

    // 查询用户
    async getNotices() {
      let _this = this;
      _this.listLoading = true;
      let params = new FormData();
      params.append("startPage", _this.startPage);
      params.append("pageSize", _this.pageSize);
      params.append("keyword", _this.filters.keyword);
      params.append("memberId", this.memberId);
      this.axios
        .post(process.env.API_ROOT + "/SysApi/v1/findNoticeByPage", params)
        .then(response => {
          if (!response.data) {
            _this.listLoading = false;
            return;
          }
          if (response.data && response.data.status === 200) {
            _this.notices = response.data.data;
            _this.total = response.data.total;
          } else {
            _this.message(true, response.data.msg, "error");
            _this.notices = [];
          }
          _this.listLoading = false;
        })
        .catch(err => {
          console.log(err);
        });
    },
    // 表单提交
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.addNotice();
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    // 重置
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    // 显示添加公告窗口
    showDialogForm() {
      this.dialogFormVisible = true;
      this.noticeRuleForm.id = "";
      this.noticeRuleForm.title = "";
      this.noticeRuleForm.content = "";
    },
    // 添加公告
    async addNotice() {
      let _this = this;
      let params = new FormData();
      params.append("id", _this.noticeRuleForm.id);
      params.append("title", _this.noticeRuleForm.title);
      params.append("content", _this.noticeRuleForm.content);
      this.axios
        .post(process.env.API_ROOT + "/SysApi/v1/addNotice", params)
        .then(response => {
          if (!response.data) {
            return;
          }

          if (response.data.status === 200) {
            this.message(true, response.data.msg, "success");
            _this.resetForm("noticeRuleForm");
            _this.dialogFormVisible = false;
          } else {
            _this.message(true, response.data.msg, "error");
          }
          this.getNotices();
        })
        .catch(err => {
          console.log(err);
        });
    },
    // 删除用户
    delNotice(id) {
      if (this.noticeIds.length === 0) {
        this.message(true, "请选择需要删除的公告", "error");
        return;
      }
      this.$confirm("此操作将永久删除该记录, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "error"
      })
        .then(() => {
          this.delNotices();
        })
        .catch(() => {
          this.message(true, "已取消删除", "error");
        });
    },
    // 删除用户
    async delNotices() {
      let params = new FormData();
      params.append("ids", this.noticeIds);
      this.axios
        .post(process.env.API_ROOT + "/SysApi/v1/delNotice", params)
        .then(response => {
          if (!response.data) {
            return;
          }
          if (response.data.status === 200) {
            this.message(true, response.data.msg, "success");
          } else {
            this.message(true, response.data.msg, "error");
          }
          this.getNotices();
        });
    },
    // 获取选中集
    handleSelectionChange(val) {
      this.noticeIds = [];
      if (val) {
        val.forEach(row => {
          this.noticeIds.push(row.id);
        });
      }
    },
    // 每页大小改变时触发
    handleSizeChange(val) {
      this.pageSize = val;
      this.getNotices();
    },
    // 当前页码改变时触发
    handleCurrentChange(val) {
      this.startPage = val;
      this.getNotices();
    },
    // switchChange(status,id) {
    // this.editNoticeStatus(status, id)
    // 	},
    // 	// 编辑用户状态
    // 	async editNoticeStatus (status,id) {
    // 		let _this = this
    // 		let params = new FormData()
    // 		params.append('id',id)
    // 		params.append('type',status)
    // 		this.axios.post(process.env.API_ROOT +'/NoticeApi/v1/editNoticeStatus', params).then((response) => {

    // 			if(!response.data) {
    // 				return
    // 			}

    // 			if (response.data.status === 200) {
    // 				_this.message(true,response.data.msg,'success')
    // 			} else {
    // 				_this.message(true,response.data.msg,'error')
    // 			}
    // 			this.getNotices()
    // 		})
    // 	},
    onEditorBlur(editor) {
      this.editor = editor;
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
    /**
     * ifshow: true/false msg: message  type: error/error/success
     */
    message(ifshow, msg, type) {
      this.$message({
        showClose: ifshow,
        message: msg,
        type: type
      });
    }
  },
  mounted() {
    var usr = JSON.parse(this.$cookie.get("user"));
    this.memberId = usr.memberId;
    this.getNotices();
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
    },
    addShow() {
      return this.getHasRule("新增公告");
    },
    delShow() {
      return this.getHasRule("删除公告");
    },
    findShow() {
      return this.getHasRule("公告查询");
    },
    editShowIt() {
      return this.getHasRule("编辑公告");
    }
  }
};
</script>

<style >
#notice .el-dialog__footer .limit {
  text-align: left;
  margin: 0 0 20px 180px;
}

#notice .quill-editor .ql-container {
  height: 400px;
  overflow: auto;
}
</style>
