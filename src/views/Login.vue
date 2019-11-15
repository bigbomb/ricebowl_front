<template>
  <el-form :model="ruleForm2" :rules="rules2" ref="ruleForm2" label-position="left" label-width="0px" class="demo-ruleForm login-container">
    <h3 class="title">系统登录</h3>
    <el-form-item prop="account">
      <el-input type="text" v-model="ruleForm2.account" auto-complete="off" placeholder="账号" @keyup.enter.native="login"></el-input>
    </el-form-item>
    <el-form-item prop="checkPass">
      <el-input type="password" v-model="ruleForm2.checkPass" auto-complete="off" placeholder="密码" @keyup.enter.native="login"></el-input>
    </el-form-item>
    <el-checkbox v-model="checked" checked class="remember">记住密码</el-checkbox>
    <el-form-item style="width:100%;">
      <el-button type="primary" plain :loading="loginLoading" style="width:100%;" @click.native.prevent="login">登录</el-button>
      <!--<el-button @click.native.prevent="handleReset2">重置</el-button>-->
    </el-form-item>
  </el-form>
</template>

<script>
import md5 from "js-md5";
export default {
  data() {
    return {
      loginLoading: false,
      ruleForm2: {
        account: "",
        checkPass: ""
      },
      rules2: {
        account: [
          { required: true, message: "请输入账号", trigger: "blur" }
          //{ validator: validaePass }
        ],
        checkPass: [
          { required: true, message: "请输入密码", trigger: "blur" }
          //{ validator: validaePass2 }
        ]
      },
      checked: true
    };
  },
  methods: {
    async login() {
      var _this = this;
      _this.loginLoading = true;
      let params = new FormData();
      params.append("name", _this.ruleForm2.account);
      params.append("pass", _this.ruleForm2.checkPass);
      // let params = {
      //   name:_this.ruleForm2.account,
      //   pass:_this.ruleForm2.checkPass
      // }
      this.axios
        .post(process.env.API_ROOT + "/LoginApi/v1/login", params)
        .then(response => {
          if (response.data.status === -404) {
            _this.message(true, response.data.msg, "error");
            _this.loginLoading = false;
            return;
          }
          if (response.data.status === 200) {
            _this.message(true, response.data.msg, "success");
            var userdata = {
              userId: response.data.data.id,
              userName: response.data.data.username,
              email: response.data.data.email,
              userImg: response.data.data.userImg,
              user: response.data.data.memberId + "_" + response.data.data.username,
              memberId: response.data.data.memberId
            };
            this.$cookie.set("user", JSON.stringify(userdata), 1);
            let permis = response.data.data.rolePermis;
            window.localStorage.setItem("rolePermis", JSON.stringify(permis));
            let permisChildrens = [];
            if (permis.length > 0) {
              for (var i in permis) {
                {
                  if (permis[i].children.length > 0) {
                    for (var j in permis[i].children) {
                      if (permis[i].children[j].children.length > 0) {
                        for (var k in permis[i].children[j].children)
                          permisChildrens.unshift(
                            permis[i].children[j].children[k].name
                          );
                      }
                    }
                  }
                }
              }
            }
            window.localStorage.setItem("permitsButtons", permisChildrens);
            _this.$router.push({ path: "/saleContractList" });
          } else {
            _this.message(true, response.data.msg, "error");
          }
          _this.loginLoading = false;
        });
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
  }
};
</script>

<style lang="scss" scoped>
.login-container {
  /*box-shadow: 0 0px 8px 0 rgba(0, 0, 0, 0.06), 0 1px 0px 0 rgba(0, 0, 0, 0.02);*/
  -webkit-border-radius: 5px;
  border-radius: 5px;
  -moz-border-radius: 5px;
  background-clip: padding-box;
  margin: 180px auto;
  width: 350px;
  padding: 35px 35px 15px 35px;
  background: #fff;
  border: 1px solid #eaeaea;
  box-shadow: 0 0 25px #cac6c6;
  .title {
    margin: 0px auto 40px auto;
    text-align: center;
    color: #505458;
  }
  .remember {
    margin: 0px 0px 35px 0px;
  }
}
</style>
