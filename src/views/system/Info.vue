<template>
	<div id='Info'>
		<div class="demo-form-inline">
			<el-form :inline="true" :rules="rules" ref="corpRuleForm" :model="corpRuleForm">
				<el-col :span="8">
					<el-form-item label="公司名称" prop="companyName">
						<el-input v-model="corpRuleForm.companyName" placeholder="请输入公司名称"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="16">
					<el-form-item label="公司地址" prop="companyAddress">
						<el-input v-model="corpRuleForm.companyAddress" placeholder="请输入公司地址"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="8">
					<el-form-item label="电话/传真" prop="fax">
						<el-input v-model="corpRuleForm.fax" placeholder="请输入电话/传真"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="16">
					<el-form-item label="开户行" prop="bankName">
						<el-input v-model="corpRuleForm.bankName" placeholder="请输入开户行"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="8">
					<el-form-item label="账号" prop="bankAccount">
						<el-input v-model="corpRuleForm.bankAccount" placeholder="请输入账号"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="16">
					<el-form-item label="税号" prop="taxNumber">
						<el-input v-model="corpRuleForm.taxNumber" placeholder="请输入税号"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="8">
					<el-form-item label="联系人" prop="linkman">
						<el-input v-model="corpRuleForm.linkman" placeholder="请输入联系人"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="16">
					<el-form-item label="联系人手机" prop="linkmanPhone">
						<el-input v-model="corpRuleForm.linkmanPhone" placeholder="请输入联系人手机"></el-input>
					</el-form-item>
				</el-col>
				<el-col :span="16">
					<el-form-item label="邀请码" prop="invitecode">
						<el-input v-model="corpRuleForm.inviteCode" placeholder="请输入邀请码" :readonly="true"></el-input>
					</el-form-item>
				</el-col>
			</el-form>
		</div>
		<div class="footer">
			<el-button size="small" type="primary" @click="saveForm('corpRuleForm')">保存</el-button>
			<el-button size="small">取消</el-button>
		</div>
	</div>
</template>

<script>
import md5 from "js-md5";
let Base64 = require("js-base64").Base64;
export default {
  data() {
    return {
      memberId: "",
      corpRuleForm: {
        companyName: "",
        companyAddress: "",
        fax: "",
        bankName: "",
        bankAccount: "",
        taxNumber: "",
        id: "",
        linkman: "",
        linkmanPhone: "",
        inviteCode: ""
      },
      // 表单验证
      rules: {
        companyName: [
          { required: true, message: "请输入公司名称", trigger: "blur" }
        ],
        companyAddress: [
          { required: true, message: "请输入公司地址", trigger: "blur" }
        ],
        fax: [{ required: true, message: "请输入传真", trigger: "blur" }],
        bankName: [
          { required: true, message: "请输入银行名称", trigger: "blur" }
        ],
        bankAccount: [
          { required: true, message: "请输入银行账号", trigger: "blur" }
        ],
        taxNumber: [{ required: true, message: "请输入税号", trigger: "blur" }],
        linkman: [{ required: true, message: "请输入联系人", trigger: "blur" }],
        linkmanPhone: [
          { required: true, message: "请输入联系人手机", trigger: "blur" }
        ]
      }
    };
  },
  mounted() {
    var usr = JSON.parse(this.$cookie.get("user"));
    this.memberId = usr.memberId;
    this.getCorpInfo();
    // this.getContract()
  },
  methods: {
    getCorpInfo() {
      let params = new FormData();
      params.append("memberId", this.memberId);
      this.axios
        .post(process.env.API_ROOT + "/SysApi/v1/corpInfo", params)
        .then(response => {
          if (response.data.length > 0) {
            this.corpRuleForm.companyName = response.data[0].companyname;
            this.corpRuleForm.companyAddress = response.data[0].companyaddress;
            this.corpRuleForm.fax = response.data[0].fax;
            this.corpRuleForm.bankName = response.data[0].bankname;
            this.corpRuleForm.bankAccount = response.data[0].bankaccount;
            this.corpRuleForm.taxNumber = response.data[0].taxnumber;
            this.corpRuleForm.linkman = response.data[0].linkman;
            this.corpRuleForm.linkmanPhone = response.data[0].linkmanPhone;
            this.corpRuleForm.id = response.data[0].id;
            this.corpRuleForm.inviteCode = response.data[0].invitecode;
          }
        });
    },
    async saveForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          let params = new FormData();
          params.append("companyname", this.corpRuleForm.companyName);
          params.append("companyaddress", this.corpRuleForm.companyAddress);
          params.append("fax", this.corpRuleForm.fax);
          params.append("bankname", this.corpRuleForm.bankName);
          params.append("bankaccount", this.corpRuleForm.bankAccount);
          params.append("taxnumber", this.corpRuleForm.taxNumber);
          params.append("linkman", this.corpRuleForm.linkman);
          params.append("linkmanPhone", this.corpRuleForm.linkmanPhone);
          params.append("id", this.corpRuleForm.id);
          this.axios
            .post(process.env.API_ROOT + "/SysApi/v1/saveCorpInfo", params)
            .then(response => {
              if (!response.data) {
                return;
              }

              if (response.data.status === 200) {
                this.$message({
                  showClose: true,
                  message: response.data.msg,
                  type: "success"
                });
              }
            });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
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
  }
};
</script>

<style>
.content-container {
  position: relative;
}
#Info {
  height: 85vh;
}
#Info .demo-form-inline {
  width: 1550px;
  margin: 0px 50px 0px 0;
  padding: 10px;
  overflow: hidden;
  height: 80vh;
}
#Info .el-form-item__label {
  width: 100px;
}
#Info .el-input {
  width: 300px;
}
#Info .footer {
  padding: 0 50px;
  overflow: hidden;
  /* height: 62px; */
  /* left: 10px; */
  /* line-height: 62px; */
  /* bottom: 10px;  */
  background: #fff;
  height: 5vh;
}
</style>
