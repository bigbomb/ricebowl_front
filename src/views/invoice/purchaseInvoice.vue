<template>
	<el-row>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-autocomplete v-model="filters.keyword" :fetch-suggestions="querySearchAsync" placeholder="请输入供应商名称" @select="handleSelect1"></el-autocomplete>
				</el-form-item>
        <el-form-item>
            <el-date-picker v-model="filters.validateTime" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" @change="searchTime">
            </el-date-picker>
        </el-form-item>
				<el-form-item v-if='findShow'>
					<el-button type="primary" class="el-icon-search" :loading="selLoading" v-on:click="getContract">查询</el-button>
				</el-form-item>
			</el-form>
		</el-col>
        <el-col :span="24">           
            <el-tabs v-model="activeName" @tab-click="handleClick">
              <el-tab-pane label="未收到" name="未收到"></el-tab-pane>
              <el-tab-pane label="已收到" name="已收到"></el-tab-pane>
            </el-tabs>
        </el-col> 
		<!--列表-->
		<el-col>
			<el-table ref="purchaseTable" :data="purchaseContracts" highlight-current-row v-loading="listLoading" element-loading-text="拼命加载中" style="width: 100%;">
        <el-table-column prop="id" label="id" sortable fixed="left"  width="80">
        </el-table-column>
        <el-table-column prop="purchasestatus" label="采购单状态" sortable fixed="left"  width="120">
        </el-table-column>
        <el-table-column prop="memberid" label="id" sortable fixed="left" width="150" v-if="isshow">
        </el-table-column>
        <el-table-column prop="supplyername" label="供应商名称" sortable fixed="left" width="250" >
        </el-table-column>
        <el-table-column prop="purchaseno" label="采购合同号" sortable width="200">
        </el-table-column>
        <el-table-column prop="purchaseweight" label="采购入库吨位" sortable width="200">
        </el-table-column>
        <el-table-column prop="purchaseamount" label="采购金额" sortable width="150">
        </el-table-column>
        <el-table-column prop="purchasedate" label="入库日期" sortable width="150">
          <template slot-scope="scope">
            <span>{{scope.row.purchasedate, 'yyyy-MM-dd' | dataFormat}}</span>
          </template>
        </el-table-column>        
        <el-table-column prop="invoicestatus" label="状态" sortable width="200">
        </el-table-column>
        <el-table-column prop="createby" label="创建人" sortable width="100">
        </el-table-column>
        <el-table-column prop="crt" label="创建日期" sortable width="300">
          <template slot-scope="scope">
            <span v-show='scope.row.crt!=null'>{{scope.row.crt, 'yyyy-MM-dd hh:mm:ss' | dataFormat}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="operation" fixed="right" label="操作" >
          <template slot-scope="scope">
              <div v-if="scope.row.invoicestatus==='未收到'&& submitShow"><el-button type="text" size="small" @click='editShow(scope.row)' >确认收到</el-button></div>
              <div v-else></div>
          </template>
        </el-table-column>
      </el-table>
		</el-col>
		<el-col>
			<div class="block" style="float: right;margin-right: 10px;margin-top: 10px;">
				<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="startPage" :page-sizes="pageSizes" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper" :total="total">
				</el-pagination>
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
        validateTime: [],
      },
      activeName:'未收到',
      statusTab: "未收到",
      dateObj: {
        startTime: "",
        endTime: ""
      },
      customerList:[],
      tableData1: [],
      purchaseContracts: [],
      pageSizes: [30, 50, 80, 100],
      startPage: 1,
      pageSize: 30,
      total: 0,
      deliveryOrders: [],
      page: 1,
      listLoading: false,
      selLoading: false,
      dialogFormVisible: false,
      formLabelWidth: "120px",
      deliveryOrderIds: [], // 加工单ids
      deliveryOrderNos: [], //加工单Nos
      memberId: "",
      saleContractNos: [],
      memberId: "",
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
    async editShow(row) {
      let params = new FormData();
      params.append("id", row.id);
      this.axios
        .post(
          process.env.API_ROOT +
            "/PurchaseContractApi/v1/confirmPurchaseContract",
          params
        )
        .then(response => {
          if (!response.data) {
            return;
          }
          if (response.data.status === 200) {
            this.message(true, response.data.msg, "success");
            this.getContract()
          } else {
            this.message(true, response.data.msg, "error");
          }
        });
      //this.getContract()
    },
    // 查询合同
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
      this.axios
        .post(
          process.env.API_ROOT + "/PurchaseContractApi/v1/findPurchaseContractByPage",
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

    // 重置
    resetForm(formName) {
      this.$refs[formName].resetFields();
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
    supplyerSelect() {
      let params = new FormData();
      let memberId = this.memberId;
      params.append("memberId", memberId);
      this.axios
        .post(process.env.API_ROOT + "/PurchaseContractApi/v1/findSupplyerByNoPage", params)
        .then(response => {
          let supplyerdata = response.data.data;
          this.supplyerList = [];
          for (let supplyer of supplyerdata) {
            if (supplyer.supplyername != null) {
              let jsonsupplyer = {
                value: supplyer.supplyername,
                id: supplyer.id
              };
              this.supplyerList.push(jsonsupplyer);
            }
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    querySearchAsync(queryString, cb) {
      var supplyerList = this.supplyerList;
      var results = queryString
        ? supplyerList.filter(this.createStateFilter(queryString))
        : supplyerList;

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
    this.supplyerSelect();
    this.getCustomerList();
  },
  computed: {
    findShow() {
      return this.getHasRule("查询采购发票");
    },
    submitShow() {
      return this.getHasRule("确认收到");
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
#pillorderSheet .titleMenu{letter-spacing: 10px; margin-bottom: 30px;font-size: 30px;
  text-align: center; color: #292929;}
#pillorderSheet .titleBox div {
  padding: 2px;
}
#pillorderSheet .botom{
  border-bottom: 1px solid #d9d9d9;
  text-align: center;
}
#pillorderSheet .txtleft{
  text-align: left;
  border-bottom: 1px solid #d9d9d9; 
}
#pillorderSheet .addorder {
  margin-bottom: 15px;
  border: 1px solid #ebeef5;
}
#pillorderSheet .footeremark .padingnone{
  padding: 0 !important;
}
#pillorderSheet .footeremark .padtop{padding: 15px!important}
#pillorderSheet .footeremark .el-row div {
  padding: 10px 15px;
}
#pillorderSheet .footeremark .footrightBox{
  text-align: right;
  padding: 0 30px 0 0;
}
#pillorderSheet .footeremark .footrightBox p{
  margin: 0
}
</style>
