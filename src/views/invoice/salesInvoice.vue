<template>
  <el-row>
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
          >查询</el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <el-col :span="24">
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="未开" name="未开"></el-tab-pane>
        <el-tab-pane label="已开" name="已开"></el-tab-pane>
      </el-tabs>
    </el-col>
    <!--列表-->
    <el-col>
      <el-table
        ref="purchaseTable"
        :data="purchaseContracts"
        highlight-current-row
        v-loading="listLoading"
        element-loading-text="拼命加载中"
        style="width: 100%;"
      >
        <el-table-column prop="id" label="id" sortable fixed="left" width="80"></el-table-column>

        <el-table-column
          prop="customerid"
          label="id"
          sortable
          fixed="left"
          width="150"
          v-if="isshow"
        ></el-table-column>
        <el-table-column prop="customername" label="客户名称" sortable fixed="left" width="250"></el-table-column>
        <el-table-column prop="contractno" label="销售合同号" sortable width="200"></el-table-column>
        <el-table-column prop="contractdate" label="合同日期" sortable width="200">
          <template slot-scope="scope">
            <span>{{scope.row.contractdate, 'yyyy-MM-dd' | dataFormat}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="actualamount" label="结算金额" sortable width="150"></el-table-column>
        <el-table-column prop="invoiceStatus" label="状态" sortable width="200"></el-table-column>
        <el-table-column prop="createBy" label="创建人" sortable width="200"></el-table-column>
        <el-table-column prop="crt" label="创建日期" sortable width="400">
          <template slot-scope="scope">
            <span v-show="scope.row.crt!=null">{{scope.row.crt, 'yyyy-MM-dd hh:mm:ss' | dataFormat}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="operation" fixed="right" label="操作">
          <template slot-scope="scope">
            <div v-if="scope.row.invoiceStatus==='已开'||scope.row.actualamount===undefined"></div>
            <div v-else-if="submitShow">
              <el-button type="text" size="small" @click="editShow(scope.row)">确认已开</el-button>
            </div>
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
  </el-row>
</template>

<script>
export default {
  data() {
    return {
      thistitle: "新增用户",
      readonly: false,
      isshow: false,
      producer: "",
      filters: {
        keyword: "",
        validateTime: []
      },
      dateObj: {
        startTime: "",
        endTime: ""
      },
      purchaseContracts: [],
      activeName: "未开",
      statusTab: "未开",
      customerList: [],
      tableData1: [],
      pageSizes: [30, 50, 80, 100],
      startPage: 1,
      pageSize: 30,
      total: 0,
      page: 1,
      listLoading: false,
      selLoading: false,
      dialogFormVisible: false,
      formLabelWidth: "120px",
      memberId: ""
    };
  },
  methods: {
    handleClick(tab, event) {
      this.statusTab = tab.name;
      this.getContract();
    },
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

    // 重置
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },

    async editShow(row) {
      let params = new FormData();
      params.append("id", row.id);
      this.axios
        .post(
          process.env.API_ROOT + "/SaleContractApi/v1/confirmSaleContract",
          params
        )
        .then(response => {
          if (!response.data) {
            return;
          }
          if (response.data.status === 200) {
            this.message(true, response.data.msg, "success");
            this.getContract();
          } else {
            this.message(true, response.data.msg, "error");
          }
        });
      //this.getContract()
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
    // 查询列表
    async getContract() {
      let _this = this;
      _this.listLoading = true;
      let params = new FormData();
      params.append("startPage", _this.startPage);
      params.append("pageSize", _this.pageSize);
      params.append("keyword", _this.filters.keyword);
      params.append("memberId", _this.memberId);
      params.append("invoiceStatus", _this.statusTab);
      params.append("startTime", _this.dateObj.startTime);
      params.append("endTime", _this.dateObj.endTime);
      params.append("verifyBy", "yes");
      this.axios
        .post(
          process.env.API_ROOT + "/SaleContractApi/v1/findSaleContractByPage/",
          params
        )
        .then(response => {
          if (!response.data) {
            _this.listLoading = false;
            return;
          }
          if (response.data && response.data.status === 200) {
            _this.purchaseContracts = response.data.data;
            _this.total = response.data.total;
          } else {
            _this.message(true, response.data.msg, "error");
            _this.purchaseContracts = [];
          }
          _this.listLoading = false;
        })
        .catch(err => {
          console.log(err);
        });
    },

    querySearchAsync(queryString, cb) {
      let customerList = this.customerList;
      let results = queryString
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
    handleSelect1(item) {
      this.filters.keyword = item.value;
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
    this.usr = JSON.parse(this.$cookie.get("user"));
    this.memberId = this.usr.memberId;
    this.producer = this.usr.userName;
    this.getContract();
    this.getCustomerList();
  },
  computed: {
    submitShow() {
      return this.getHasRule("确认已开");
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

/* 打印提货单 */
#pillorderSheet {
  width: 950px;
  font-size: 16px;
  margin: 0 auto;
}
#pillorderSheet .titleMenu {
  letter-spacing: 10px;
  margin-bottom: 30px;
  font-size: 30px;
  text-align: center;
  color: #292929;
}
#pillorderSheet .titleBox div {
  padding: 2px;
}
#pillorderSheet .botom {
  border-bottom: 1px solid #d9d9d9;
  text-align: center;
}
#pillorderSheet .txtleft {
  text-align: left;
  border-bottom: 1px solid #d9d9d9;
}
#pillorderSheet .addorder {
  margin-bottom: 15px;
  border: 1px solid #ebeef5;
}
#pillorderSheet .footeremark .padingnone {
  padding: 0 !important;
}
#pillorderSheet .footeremark .padtop {
  padding: 15px !important;
}
#pillorderSheet .footeremark .el-row div {
  padding: 10px 15px;
}
#pillorderSheet .footeremark .footrightBox {
  text-align: right;
  padding: 0 30px 0 0;
}
#pillorderSheet .footeremark .footrightBox p {
  margin: 0;
}
</style>
