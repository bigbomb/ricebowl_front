<template>
  <el-row>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-input v-model="filters.keyword" placeholder="姓名"></el-input>
        </el-form-item>
        <el-form-item v-if="findShow">
          <el-button
            type="primary"
            class="el-icon-search"
            :loading="selLoading"
            v-on:click="getCustomers"
          >查询</el-button>
        </el-form-item>
        <el-form-item v-if="addShow">
          <el-button type="success" class="el-icon-plus" @click.native="showDialogForm">新增</el-button>
        </el-form-item>
        <!-- <el-form-item>
					<el-button type="error" class="el-icon-edit" @click="editCustomer">编辑</el-button>
        </el-form-item>-->
        <el-form-item v-if="delShow">
          <el-button type="danger" class="el-icon-delete" @click="delCustomer">删除</el-button>
        </el-form-item>
        <!-- <el-form-item>
					<el-button type="danger" class="el-icon-delete" @click="toueditor">百度富文本框</el-button>
        </el-form-item>-->
      </el-form>
    </el-col>

    <!--列表-->
    <el-col>
      <el-table
        :data="customers"
        v-loading="listLoading"
        element-loading-text="拼命加载中"
        @selection-change="handleSelectionChange"
        style="width: 100%;"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="id" width="60" sortable></el-table-column>
        <el-table-column prop="companyname" label="客户名称" width="200" sortable></el-table-column>
        <el-table-column prop="companyaddress" label="客户地址" width="400" sortable></el-table-column>
        <el-table-column prop="companyphone" label="会员手机号" width="200" sortable></el-table-column>
        <el-table-column prop="fax" label="电话/传真" width="200" sortable></el-table-column>
        <el-table-column prop="bankname" label="开户行" width="200" sortable></el-table-column>

        <el-table-column prop="bankaccount" label="银行账号" width="200" sortable></el-table-column>
        <el-table-column prop="taxnumber" label="税号" width="200" sortable></el-table-column>
        <el-table-column prop="crt" label="创建时间" width="200" sortable>
          <template slot-scope="scope">
            <span>{{scope.row.crt, 'yyyy-MM-dd hh:mm:ss' | dataFormat}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="upt" label="更新时间" sortable>
          <template slot-scope="scope">
            <span v-show="scope.row.upt!=null">{{scope.row.upt, 'yyyy-MM-dd hh:mm:ss' | dataFormat}}</span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="编辑" width="60">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="editShow(scope.row)">编辑</el-button>
          </template>
        </el-table-column>
        <!-- <el-table-column fixed="right" label="允许微信登陆" width="120" v-if='wxShow'>
          <template slot-scope="scope">
            <el-switch @change="switchChange(scope.row.status,scope.row.id)" v-model="scope.row.status" active-color="#13ce66" inactive-color="#ff4949" :active-value="1" :inactive-value="0">
            </el-switch>
          </template>
        </el-table-column>-->
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
            :model="customerRuleForm"
            status-icon
            :rules="rules"
            ref="customerRuleForm"
            :inline="false"
            label-width="120px"
            class="customer-ruleForm"
          >
            <el-form-item label="会员手机号" prop="companyPhone">
              <el-input
                ref="companyPhone"
                v-model="customerRuleForm.companyPhone"
                :readonly="readonly"
                placeholder="请输入会员手机号"
              ></el-input>
            </el-form-item>
            <el-form-item label="公司名称" prop="companyName">
              <el-input v-model="customerRuleForm.companyName" placeholder="请输入公司名称"></el-input>
            </el-form-item>
            <el-form-item label="公司地址" prop="companyAddress">
              <el-input v-model="customerRuleForm.companyAddress" placeholder="请输入公司地址"></el-input>
            </el-form-item>
            <el-form-item label="电话/传真" prop="fax">
              <el-input v-model="customerRuleForm.fax" placeholder="请输入电话/传真"></el-input>
            </el-form-item>
            <el-form-item label="开户行" prop="bankName">
              <el-input v-model="customerRuleForm.bankName" placeholder="请输入开户行"></el-input>
            </el-form-item>
            <el-form-item label="账号" prop="bankAccount">
              <el-input v-model="customerRuleForm.bankAccount" placeholder="请输入账号"></el-input>
            </el-form-item>
            <el-form-item label="税号" prop="taxNumber">
              <el-input v-model="customerRuleForm.taxNumber" placeholder="请输入税号"></el-input>
            </el-form-item>
            <!-- <el-form-item label="允许微信登入" prop="status">
              <el-switch
                v-model="customerRuleForm.status"
                active-color="#13ce66"
                inactive-color="#ff4949"
                :active-value="1"
                :inactive-value="0"
              ></el-switch>
            </el-form-item>-->
          </el-form>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="closeDialog('customerRuleForm')">取 消</el-button>
          <!-- <el-button @click="resetForm('customerRuleForm')">重置</el-button> -->
          <el-button type="primary" @click="submitForm('customerRuleForm')">确 定</el-button>
        </div>
      </el-dialog>
    </el-col>
  </el-row>
</template>

<script>
import md5 from "js-md5";
let Base64 = require("js-base64").Base64;
var exportMemberId;
var exportThis;
export default {
  data() {
    var validatePhone = (rule, value, callback) => {
      if (Object.keys(exportThis.customerRuleForm.id).length === 0) {
        if (value === "") {
          callback(new Error("请输入正确的手机号码"));
        } else {
          var length = value.length;
          var mobile = /^(13[0-9]{9})|(18[0-9]{9})|(14[0-9]{9})|(17[0-9]{9})|(15[0-9]{9})$/;
          if (length == 11 && mobile.test(value)) {
            let params = new FormData();
            params.append("keyword", value);
            params.append("memberId", exportMemberId);
            this.axios
              .post(process.env.API_ROOT + "/CustomerApi/v1/checkPhone", params)
              .then(response => {
                if (!response.data) {
                  _this.listLoading = false;
                  return;
                }
                if (response.data && response.data.status === 200) {
                  if (response.data.data.length > 0) {
                    callback(new Error("此手机号已存在"));
                  } else {
                    callback();
                  }
                }
              });
          } else {
            callback(new Error("请输入正确的手机号码"));
          }
        }
      } else {
        callback();
      }
    };
    return {
      thistitle: "新增客户",
      filters: {
        keyword: ""
      },
      readonly: false,
      customerRuleForm: {
        id: "",
        companyPhone: "",
        memberId: "",
        companyName: "",
        companyAddress: "",
        fax: "",
        bankName: "",
        bankAccount: "",
        taxNumber: "",
        status: 1
      },
      pageSizes: [30, 50, 80, 100],
      startPage: 1,
      pageSize: 30,
      total: 0,
      customers: [],
      customerIds: [],
      page: 1,
      listLoading: false,
      selLoading: false,
      dialogFormVisible: false,
      formLabelWidth: "120px",
      inactive: 0,
      active: 1,
      // 表单验证
      rules: {
        companyPhone: [
          { required: true, validator: validatePhone, trigger: "blur" }
        ],
        companyName: [
          { required: true, message: "请输入公司名称" },
          { min: 5, max: 30, message: "长度在 5 到 30 个字符" }
        ],
        companyAddress: [{ required: true, message: "请输入公司地址" }],
        fax: [{ required: true, message: "请输入电话/传真", trigger: "blur" }],
        bankName: [
          { required: true, message: "请输入银行名称", trigger: "blur" }
        ],
        bankAccount: [
          { required: true, message: "请输入银行账号", trigger: "blur" }
        ],
        taxNumber: [{ required: true, message: "请输入税号", trigger: "blur" }]
      }
    };
  },
  methods: {
    // 查询用户
    getCustomers() {
      let _this = this;
      _this.listLoading = true;
      let params = new FormData();
      params.append("startPage", _this.startPage);
      params.append("pageSize", _this.pageSize);
      params.append("keyword", _this.filters.keyword);
      params.append("memberId", this.customerRuleForm.memberId);
      this.axios
        .post(process.env.API_ROOT + "/CustomerApi/v1/findByPage", params)
        .then(response => {
          if (!response.data) {
            _this.listLoading = false;
            return;
          }
          if (response.data && response.data.status === 200) {
            _this.customers = response.data.data;
            _this.total = response.data.total;
          } else {
            _this.message(true, response.data.msg, "error");
            _this.customers = [];
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
          this.addCustomer();
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    closeDialog(formName) {
      this.dialogFormVisible = false;
      this.$refs[formName].resetFields();
    },
    // 重置
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    // 显示添加用户窗口
    showDialogForm() {
      let _this = this;
      this.readonly = false;
      _this.thistitle = "新增客户";
      this.customerRuleForm.companyPhone = "";
      this.customerRuleForm.companyName = "";
      this.customerRuleForm.companyAddress = "";
      this.customerRuleForm.fax = "";
      this.customerRuleForm.bankName = "";
      this.customerRuleForm.bankAccount = "";
      this.customerRuleForm.taxNumber = "";
      this.customerRuleForm.id = "";
      this.customerRuleForm.status = "";
      _this.dialogFormVisible = true;
    },
    // 添加客户
    async addCustomer() {
      let _this = this;
      let params = new FormData();
      params.append("companyphone", _this.customerRuleForm.companyPhone);
      params.append("companyname", _this.customerRuleForm.companyName);
      params.append("companyaddress", _this.customerRuleForm.companyAddress);
      params.append("fax", _this.customerRuleForm.fax);
      params.append("bankname", _this.customerRuleForm.bankName);
      params.append("bankaccount", _this.customerRuleForm.bankAccount);
      params.append("taxnumber", _this.customerRuleForm.taxNumber);
      params.append("id", _this.customerRuleForm.id);
      params.append("memberid", _this.customerRuleForm.memberId);
      params.append("status", _this.customerRuleForm.status);
      this.axios
        .post(process.env.API_ROOT + "/CustomerApi/v1/addCustomer", params)
        .then(response => {
          if (!response.data) {
            return;
          }

          if (response.data.status === 200) {
            this.message(true, response.data.msg, "success");
            _this.resetForm("customerRuleForm");
            _this.dialogFormVisible = false;
          } else {
            _this.message(true, response.data.msg, "error");
          }
          this.getCustomers();
        });
    },
    async editCustomerStatus(status, id) {
      let _this = this;
      let params = new FormData();
      params.append("id", id);
      params.append("type", status);
      this.axios
        .post(
          process.env.API_ROOT + "/CustomerApi/v1/editCustomerStatus",
          params
        )
        .then(response => {
          if (!response.data) {
            return;
          }

          if (response.data.status === 200) {
            _this.message(true, response.data.msg, "success");
          } else {
            _this.message(true, response.data.msg, "error");
          }
          this.getCustomers();
        });
    },
    // 删除客户
    delCustomer(id) {
      if (this.customerIds.length === 0) {
        this.message(true, "请选择需要删除的客户么", "error");
        return;
      }
      this.$confirm("此操作将永久删除改客户, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "error"
      })
        .then(() => {
          this.delCustomers();
        })
        .catch(() => {
          this.message(true, "已取消删除", "error");
        });
    },
    // 删除用户
    async delCustomers() {
      let params = new FormData();
      params.append("ids", this.customerIds);
      this.axios
        .post(process.env.API_ROOT + "/CustomerApi/v1/delCustomer", params)
        .then(response => {
          if (!response.data) {
            return;
          }
          if (response.data.status === 200) {
            this.message(true, response.data.msg, "success");
          } else {
            this.message(true, response.data.msg, "error");
          }
          this.getCustomers();
        });
    },
    switchChange(status, id) {
      this.editCustomerStatus(status, id);
    },
    // 获取选中集
    handleSelectionChange(val) {
      this.customerIds = [];
      if (val) {
        val.forEach(row => {
          this.customerIds.push(row.id);
        });
      }
    },
    // 每页大小改变时触发
    handleSizeChange(val) {
      this.pageSize = val;
      this.getCustomers();
    },
    // 当前页码改变时触发
    handleCurrentChange(val) {
      this.startPage = val;
      this.getCustomers();
    },
    async editShow(row) {
      this.thistitle = "编辑客户";
      this.customerRuleForm.id = row.id;
      this.customerRuleForm.companyName = row.companyname;
      this.customerRuleForm.companyAddress = row.companyaddress;
      this.customerRuleForm.fax = row.fax;
      this.customerRuleForm.bankName = row.bankname;
      this.customerRuleForm.bankAccount = row.bankaccount;
      this.customerRuleForm.taxNumber = row.taxnumber;
      this.customerRuleForm.status = row.status;
      this.customerRuleForm.companyPhone = row.companyphone;
      this.readonly = false;
      this.dialogFormVisible = true;
    },

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
    this.customerRuleForm.memberId = usr.memberId;
    exportMemberId = usr.memberId;
    exportThis = this;
    this.getCustomers();
  },
  computed: {
    addShow() {
      return this.getHasRule("新增客户");
    },
    delShow() {
      return this.getHasRule("删除客户");
    },
    findShow() {
      return this.getHasRule("查询客户");
    },
    statusShow() {
      return this.getHasRule("编辑客户");
    },
    wxShow() {
      return this.getHasRule("微信登入开关");
    }
  }
};
</script>

<style scoped>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
