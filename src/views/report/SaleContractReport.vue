<template>
  <el-row id="spotstock">
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-autocomplete
            v-model="filters.keyword"
            :fetch-suggestions="querySearchAsync"
            placeholder="请输入客户名称"
            @select="handleSelect1"
          ></el-autocomplete>
        </el-form-item>
        <el-form-item>
          <el-date-picker
            v-model="filters.validateTime"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="searchTime"
          ></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            class="el-icon-search"
            :loading="selLoading"
            v-on:click="getContract"
            v-if="findShow"
          >查询</el-button>
        </el-form-item>

        <!-- <el-form-item>
          <el-button type="danger" class="el-icon-delete" @click="delContract" v-if="delShow">删除</el-button>
        </el-form-item>-->
      </el-form>
    </el-col>
    <!--列表-->
    <el-col>
      <el-table
        ref="contractTable"
        :data="contractGridData"
        highlight-current-row
        v-loading="listLoading"
        element-loading-text="拼命加载中"
        @selection-change="handleSelectionChange"
        style="width: 100%;"
      >
        <!-- <el-table-column property="id" v-if="isshow" label="ID" width="100">
          <template slot-scope="scope">
            <span>{{scope.row.id}}</span>
          </template>
        </el-table-column>-->
        <el-table-column property="contractno" label="合同号" width="180">
          <template slot-scope="scope">
            <span>{{scope.row.contractno}}</span>
          </template>
        </el-table-column>
        <el-table-column property="customername" label="客户名称" width="200">
          <template slot-scope="scope">
            <span>{{scope.row.customername}}</span>
          </template>
        </el-table-column>
        <el-table-column property="actualweight" label="客户结算总吨位" width="140">
          <template slot-scope="scope">
            <span>{{scope.row.actualweight}}</span>
          </template>
        </el-table-column>
        <el-table-column property="actualamount" label="客户结算总金额" width="160">
          <template slot-scope="scope">
            <span>{{scope.row.actualamount}}</span>
          </template>
        </el-table-column>
        <el-table-column property="purchaseweight" label="采购总吨位" width="160">
          <template slot-scope="scope">
            <span>{{scope.row.purchaseweight}}</span>
          </template>
        </el-table-column>
        <el-table-column property="purchaseamount" label="采购总金额" width="160">
          <template slot-scope="scope">
            <span>{{scope.row.purchaseamount}}</span>
          </template>
        </el-table-column>

        <el-table-column property="processfee" label="加工费" width="160">
          <template slot-scope="scope">
            <span>{{scope.row.processfee}}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column property="transportweight" label="运输吨位" width="160">
          <template slot-scope="scope">
            <span>{{scope.row.transportweight}}</span>
          </template>
        </el-table-column>-->
        <el-table-column property="transportfee" label="运输费" width="160">
          <template slot-scope="scope">
            <!-- <el-input size="mini" v-model="scope.row.num" placeholder="请输入内容"></el-input> -->
            <span>{{scope.row.transportfee}}</span>
          </template>
        </el-table-column>
        <el-table-column property="stockouttotalfee" label="出库费" width="160">
          <template slot-scope="scope">
            <!-- <el-input size="mini" v-model="scope.row.num" placeholder="请输入内容"></el-input> -->
            <span>{{scope.row.stockouttotalfee}}</span>
          </template>
        </el-table-column>
        <el-table-column property="shorttransporttotalfee" label="短驳费" width="160">
          <template slot-scope="scope">
            <!-- <el-input size="mini" v-model="scope.row.num" placeholder="请输入内容"></el-input> -->
            <span>{{scope.row.shorttransporttotalfee}}</span>
          </template>
        </el-table-column>

        <el-table-column property="overtimefee" label="提货加班费" width="160">
          <template slot-scope="scope">
            <!-- <el-input size="mini" v-model="scope.row.num" placeholder="请输入内容"></el-input> -->
            <span>{{scope.row.overtimefee}}</span>
          </template>
        </el-table-column>

        <el-table-column property="grossprofit" label="所得毛利" width="160">
          <template slot-scope="scope">
            <!-- <el-input size="mini" v-model="scope.row.num" placeholder="请输入内容"></el-input> -->
            <span>{{scope.row.grossprofit}}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column property="status" label="状态">
        <template slot-scope="scope">-->
        <!-- <el-input size="mini" v-model="scope.row.num" placeholder="请输入内容"></el-input> -->
        <!-- <span>{{scope.row.status}}</span>
          </template>
        </el-table-column>-->
      </el-table>
    </el-col>
  </el-row>
</template>

<script>
//   import http from '../../utils/http'

export default {
  data() {
    return {
      filters: {
        keyword: "",
        validateTime: []
      },
      value: "",
      multipleSelection: "",
      customerList: [],
      timeout: null,
      gridData: [],
      contractData: [],
      pageSizes: [15, 50, 80, 100],
      startPage: 1,
      pageSize: 15,
      total: 0,
      page: 1,
      listLoading: false,
      selLoading: false,
      dialogFormVisible: false,
      formLabelWidth: "120px",
      currentRow: null,
      contactIds: [],
      selectedIds: [],
      addstock: [],
      isshow: false,
      rowShow: true,
      chooseRow: "",
      chooseRowIndex: "",
      // 表单验证
      uploadUrl: "",
      name: "base-example",
      theme: "snow",
      heights: document.documentElement.clientHeight - 200,
      currentLength: "",
      leftLength: "",
      dateObj: {
        startTime: "",
        endTime: ""
      }
    };
  },

  methods: {
    searchTime() {
      if (
        this.filters.validateTime &&
        this.filters.validateTime[0] &&
        this.filters.validateTime[1]
      ) {
        this.dateObj.startTime = this.filters.validateTime[0];
        this.dateObj.endTime = this.filters.validateTime[1];
      } else {
        this.dateObj = {
          startTime: "",
          endTime: ""
        };
      }
    },

    // 切换tab数据
    handleItemSelectionChange(val) {
      this.selectedIds = [];
      if (val) {
        val.forEach(row => {
          this.selectedIds.push(row.id);
        });
        this.multipleSelection = val;
      }
    },

    // 查询合同
    async getContract() {
      let _this = this;
      _this.listLoading = true;
      let params = new FormData();
      params.append("startPage", _this.startPage);
      params.append("pageSize", _this.pageSize);
      params.append("memberid", _this.memberId);
      params.append("keyword", _this.filters.keyword);
      params.append("startTime", _this.dateObj.startTime);
      params.append("endTime", _this.dateObj.endTime);
      this.axios
        .post(
          process.env.API_ROOT + "/SaleContractApi/v1/findSaleContractAnalyse",
          params
        )
        .then(response => {
          if (!response.data) {
            _this.listLoading = false;
            return;
          }
          if (response.data && response.data.status === 200) {
            _this.contractGridData =
              response.data.data.saleContractAnalyseDtoList;
            _this.total = response.data.total;
          } else {
            _this.message(true, response.data.msg, "error");
            _this.contractGridData = [];
          }
          _this.listLoading = false;
        })
        .catch(err => {
          console.log(err);
        });
    },

    arraySpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 10) {
        row.total = (row.price * row.num * row.weight).toFixed(2);
      }
    },
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "总计";
          return;
        } else if (index === 1) {
          sums[index] = "";
          return;
        } else if (index === 2) {
          sums[index] = "";
          return;
        } else if (index === 3) {
          sums[index] = "";
          return;
        } else if (index === 4) {
          sums[index] = "";
          return;
        } else if (index === 6) {
          sums[index] = "";
          return;
        } else if (index === 8) {
          sums[index] = "";
          return;
        }
        const values = data.map(item => Number(item[column.property]));
        if (!values.every(value => isNaN(value))) {
          sums[index] = values.reduce((prev, curr) => {
            const value = Number(curr);
            if (!isNaN(value)) {
              return prev + curr;
            } else {
              return prev;
            }
          }, 0);

          if (index === 5) {
            sums[index] = sums[index].toFixed(3);
            this.totalWeight = sums[index];
            sums[index] += "吨";
          } else if (index === 9) {
            sums[index] = sums[index].toFixed(2);
            this.totalAmount = sums[index];
            sums[index] += "元";
          }
        } else {
          sums[index] = "";
        }
      });
      return sums;
    },

    // 重置
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },

    getCustomerList() {
      let _this = this;
      var usr = this.usr;
      let memberId = "";
      if (usr) {
        memberId = usr.memberId;
      }
      let params = new FormData();
      params.append("memberId", memberId);
      this.axios
        .post(process.env.API_ROOT + "/CustomerApi/v1/getCustomerList", params)
        .then(response => {
          if (!response.data) {
            return;
          }
          let customerdata = response.data.data;
          this.customerList = [];
          for (let lcustomer of customerdata) {
            if (lcustomer.companyname != null) {
              let jsoncompany = {
                value: lcustomer.companyname,
                id: lcustomer.id
              };
              this.customerList.push(jsoncompany);
            }
          }
        })
        .catch(err => {
          console.log(err);
        });
    },

    querySearchAsync(queryString, cb) {
      var customerList = this.customerList;
      var results = queryString
        ? customerList.filter(this.createStateFilter(queryString))
        : customerList;

      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        cb(results);
      }, 500);
    },

    createStateFilter(queryString) {
      return state => {
        return state.value.indexOf(queryString) >= 0;
      };
    },
    handleSelectCustomer(item) {
      this.ruleForm.customerId = item.id;
    },

    handleSelectKeyword(item) {
      this.filters.keyword = item.value;
    },

    handleRowChange() {
      this.rowShow = false;
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
    timestampToTime: function(timestamp) {
      var date = new Date(timestamp); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
      var Y = date.getFullYear() + "-";
      var M =
        (date.getMonth() + 1 < 10
          ? "0" + (date.getMonth() + 1)
          : date.getMonth() + 1) + "-";
      var D = date.getDate() + " ";
      return Y + M + D;
    },

    // 每页大小改变时触发
    handleSizeChange(val) {
      this.pageSize = val;
      this.getContract();
    },
    // 当前页码改变时触发
    handleCurrentChange(val) {
      this.startPage = val;
      this.getContract();
    },

    // toueditor() {
    // 	this.$router.push({ path: '/ueditor' });
    // },
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
    if (this.$cookie.get("user") !== null) {
      this.usr = JSON.parse(this.$cookie.get("user"));
    }

    this.memberId = this.usr.memberId;
    this.getContract();
    this.getCustomerList();
  },
  computed: {
    inputdisable: function() {
      if (
        this.ruleForm.contractstatus === "意向合同" ||
        this.ruleForm.contractstatus === ""
      ) {
        return false;
      } else {
        return true;
      }
    },
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
      return this.getHasRule("生成现货销售合同");
    },
    findShow() {
      return this.getHasRule("查询库存");
    }
  }
};
</script>

<style>
.el-popover {
  min-width: auto !important;
}

#spotstock .digitUppercase {
  border: 1px solid #dddddd;
  float: inherit;
  margin: 0 auto;
}
#spotstock .widthInput {
  width: 300px;
}
#spotstock .bordertop {
  border-top: 1px solid #dddddd;
  padding-top: 15px !important;
}
#spotstock .digitUppercase p {
  padding: 0 120px;
}
#spotstock .digitUppercase p span {
  width: 100px;
  display: inline-block;
  text-align: left;
}
#spotstock .contractbox .el-table {
  width: 100%;
  font-size: 14px;
}
#spotstock .contractbox .el-table th {
  padding: 3px 0;
}
#spotstock .contractbox .el-table td {
  padding: 3px 0;
}

#spotstock .contractbox {
  overflow: hidden;
  font-size: 14px;
  line-height: 16px;
}

#spotstock .avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
#spotstock .avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
#spotstock .avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
#spotstock .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
/* #spotstock .el-dialog {
  height: 500px;
} */
#spotstock .dialog-footer {
  margin-bottom: 50px;
}
/* .el-table {
	width:800px
} */
#spotstock .termquill {
  height: 550px;
}
#spotstock .termquill .ql-container {
  height: 600px;
}

#spotstock .tdquill {
  height: 300px;
  width: 350px;
}
#spotstock .tdquill .ql-container {
  height: 250px;
}

#spotstock .jgquill {
  height: 300px;
  width: 350px;
}
#spotstock .jgquill .ql-container {
  height: 250px;
}

#spotstock .limit {
  margin-bottom: 40px;
  height: 30px;
  text-align: left;
}
#spotstock .inputwidth {
  width: 320px;
}
#spotstock .autoinputwidth {
  width: 200px;
}

#spotstock .settleinputwidth {
  width: 150px;
}
#spotstock .el-tb-edit .el-input,
#spotstock .el-tb-edit .el-autocomplete,
#spotstock.el-tb-edit .el-input-number,
#spotstock .el-tb-edit .el-select {
  display: none;
  width: 100%;
}

#spotstock .el-tb-edit .current-row .el-input,
#spotstock .el-tb-edit .current-row .el-autocomplete,
#spotstock .el-tb-edit .current-row .el-input-number,
#spotstock .el-tb-edit .current-row .el-select {
  display: inherit;
}

#spotstock .el-tb-edit .current-row .el-input + span,
#spotstock .el-tb-edit .current-row .el-autocomplete + span,
#spotstock .el-tb-edit .current-row .el-input-number + span,
#spotstock .el-tb-edit .current-row .el-select + span {
  display: none;
}

/* 文本域width设置 */
#spotstock .vehiclewidth {
  width: 350px;
}
/* 表格下拉菜单的width设置 */
.el-popover {
  min-width: 80px;
}

.autoInputwidth .el-input__inner {
  height: 28px;
  line-height: 28px;
}
.name {
  text-overflow: ellipsis;
  overflow: hidden;
  width: 70%;
  float: left;
}
.addr {
  font-size: 12px;
  color: #b4b4b4;
  display: block;
  float: right;
  width: 30%;
}
</style>
