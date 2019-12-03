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
            placeholder="请输入加工单生成时间"
            range-separator="至"
            start-placeholder="创建开始日期"
            end-placeholder="创建结束日期"
            @change="searchTime"
          ></el-date-picker>
        </el-form-item>
        <el-form-item v-if="findShow">
          <el-button
            type="primary"
            class="el-icon-search"
            :loading="selLoading"
            v-on:click="getProcessOrders"
          >查询</el-button>
        </el-form-item>
        <!-- <el-form-item v-if='addShow'>
					<el-button type="success" class="el-icon-plus" @click.native="showDialogForm">新增</el-button>
        </el-form-item>-->
        <!-- <el-form-item>
					<el-button type="error" class="el-icon-edit" @click="editUser">编辑</el-button>
        </el-form-item>-->
        <el-form-item v-if="delShow">
          <el-button type="danger" class="el-icon-delete" @click="delProcessOrder">删除</el-button>
        </el-form-item>
        <!-- <el-form-item>
					<el-button type="danger" class="el-icon-delete" @click="toueditor">百度富文本框</el-button>
        </el-form-item>-->
      </el-form>
    </el-col>

    <!--列表-->
    <el-col>
      <el-table
        :data="processOrders"
        v-loading="listLoading"
        element-loading-text="拼命加载中"
        @selection-change="handleSelectionChange"
        style="width: 100%;"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="id" width="80" v-if="isshow" sortable></el-table-column>
        <el-table-column prop="processno" label="加工单号" width="200" sortable></el-table-column>
        <el-table-column prop="contractno" label="销售合同号" width="200" sortable></el-table-column>
        <el-table-column prop="customerName" label="客户名称" width="200" sortable></el-table-column>
        <el-table-column prop="processtype" label="加工类型" width="100" sortable></el-table-column>
        <el-table-column prop="warehouseName" label="加工厂名称" width="200" sortable></el-table-column>
        <el-table-column prop="warehouseId" label="加工厂id" width="200" v-if="isshow" sortable></el-table-column>
        <el-table-column prop="processfee" label="加工费" width="100" sortable></el-table-column>
        <el-table-column prop="remark" label="加工备注" width="300" sortable>
          <template slot-scope="scope">
            <div v-html="scope.row.remark">{{scope.row.remark}}</div>
          </template>
        </el-table-column>
        <el-table-column prop="crt" label="创建时间" width="200" sortable>
          <template slot-scope="scope">
            <span>{{scope.row.crt, 'yyyy-MM-dd hh:mm:ss' | dataFormat}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createby" label="创建人" width="200" sortable></el-table-column>
        <!-- <el-table-column prop="upt" label="更新时间" width="200" sortable>
          <template slot-scope="scope">
            <span v-show='scope.row.upt!=null'>{{scope.row.upt, 'yyyy-MM-dd hh:mm:ss' | dataFormat}}</span>
          </template>
        </el-table-column>-->
        <el-table-column fixed="right" label="操作">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              v-if="printViewShow"
              @click="printView(scope.row)"
            >打印预览</el-button>
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
      <el-dialog
        :close-on-click-modal="false"
        title="打印加工单"
        :visible.sync="autoterVisible"
        :append-to-body="true"
        width="1000px"
      >
        <div class="newOrder-pagination" id="processingSheet">
          <p class="titleMenu">加工单</p>
          <div class="addorder">
            <div class="titleBox">
              <el-row>
                <el-col :span="8">
                  <el-col :span="8" style="text-align:left">发生日期：</el-col>
                  <el-col
                    :span="16"
                    style="text-align:left"
                  >{{print.crt, 'yyyy-MM-dd' | dataFormat}}</el-col>
                </el-col>
                <el-col :span="8">&nbsp;</el-col>
                <el-col :span="8" class="txtright">
                  <el-col :span="8" style="text-align:left">加工单号：</el-col>
                  <el-col :span="16" style="text-align:left">{{print.processNo}}</el-col>
                </el-col>
                <el-col :span="8">
                  <el-col :span="8" style="text-align:left">单位名称：</el-col>
                  <el-col :span="16" style="text-align:left">{{print.companyname}}</el-col>
                </el-col>
                <el-col :span="8">
                  <el-col :span="8">业务类别：</el-col>
                  <el-col :span="16" style="text-align:left">库存加工</el-col>
                </el-col>
                <el-col :span="8" class="txtright">
                  <el-col :span="8" style="text-align:left">加工性质：</el-col>
                  <el-col :span="16" style="text-align:left">{{print.processType}}</el-col>
                </el-col>
                <el-col :span="8">
                  <el-col :span="8" style="text-align:left">仓库：</el-col>
                  <el-col :span="16" style="text-align:left">{{print.warehouseName}}</el-col>
                </el-col>
                <el-col :span="8">
                  <el-col :span="8">仓库传真：</el-col>
                  <el-col :span="16" style="text-align:left">{{ print.warehouseFax}}</el-col>
                </el-col>
                <el-col :span="8" class="txtright">
                  <el-col :span="8" style="text-align:left">仓库电话：</el-col>
                  <el-col :span="16" style="text-align:left">{{ print.warehousePhone}}</el-col>
                </el-col>
              </el-row>
            </div>
            <el-table
              :data="tableData1"
              show-summary
              :summary-method="processingSheet"
              class="tableBox"
            >
              <el-table-column prop="productname" label="商品名称" width="130"></el-table-column>
              <el-table-column prop="productspec" label="规格" width="220"></el-table-column>
              <el-table-column prop="productfactory" label="钢厂" width="190"></el-table-column>
              <el-table-column prop="productmark" label="材质" width="180"></el-table-column>
              <el-table-column prop="weight" label="重量" width="127"></el-table-column>
              <el-table-column prop="num" label="数量" width="100"></el-table-column>
              <!-- <el-table-column prop="remark" label="备注" width="200">
              </el-table-column>-->
            </el-table>
            <div class="footeremark">
              <el-row>
                <el-col :span="3" class="padtop">加工要求：</el-col>
                <el-col :span="21" class="padingnone">
                  <span v-html="print.remark">{{print.remark}}</span>
                </el-col>
              </el-row>
            </div>
          </div>
          <div class="footerBox">
            <el-row>
              <el-col :span="24">
                <el-col :span="8">
                  <el-col :span="8" style="text-align:left">公司地址：</el-col>
                  <el-col :span="16" style="text-align:left">{{print.companyaddress}}</el-col>
                </el-col>
              </el-col>
              <el-col :span="8">
                <el-col :span="8" style="text-align:left">联系人：</el-col>
                <el-col :span="16" style="text-align:left">{{print.linkman}}</el-col>
              </el-col>
              <el-col :span="8">
                <el-col :span="8" style="text-align: left;">联系人电话：</el-col>
                <el-col :span="16" style="text-align:left">{{print.linkmanphone}}</el-col>
              </el-col>
              <el-col :span="8">
                <el-col :span="8" style="text-align:left">传真：</el-col>
                <el-col :span="16" style="text-align:left">{{print.fax}}</el-col>
              </el-col>
              <el-col :span="8">
                <el-col :span="8" style="text-align:left">制单人：</el-col>
                <el-col :span="16" style="text-align:left">{{producer}}</el-col>
              </el-col>
              <el-col :span="8">
                <el-col :span="8" style="text-align:left">经办人：</el-col>
                <el-col :span="16" style="text-align:left"></el-col>
              </el-col>
              <el-col :span="8">
                <el-col :span="8" style="text-align:left">单位签字：</el-col>
                <el-col :span="16" style="text-align:left"></el-col>
              </el-col>
            </el-row>
          </div>
        </div>
        <div style="text-align:right;margin-top:30px">
          <el-button type="primary" @click="printprocessingSheet">确认</el-button>
          <el-button @click="autoterVisible =! autoterVisible">取消</el-button>
        </div>
      </el-dialog>
    </el-col>
  </el-row>
</template>

<script>
export default {
  data() {
    return {
      thistitle: "新增加工单",
      readonly: false,
      isshow: false,
      producer: "",
      filters: {
        keyword: "",
        validateTime: []
      },
      print: {
        customerName: "",
        crt: "",
        processNo: "",
        processType: "",
        warehouseName: "",
        remark: "",
        companyname: "",
        companyaddress: "",
        linkman: "",
        linkmanphone: "",
        fax: ""
      },
      tableData1: [],
      pageSizes: [30, 50, 80, 100],
      startPage: 1,
      pageSize: 30,
      total: 0,
      processOrders: [],
      autoterVisible: false,
      page: 1,
      listLoading: false,
      selLoading: false,
      dialogFormVisible: false,
      formLabelWidth: "120px",
      processOrderIds: [], // 加工单ids
      processOrderNos: [], //加工单Nos
      memberId: "",
      saleContractNos: [],
      memberId: "",
      dateObj: {
        startTime: "",
        endTime: ""
      }
    };
  },
  methods: {
    //获取时间
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
    // 查询加工单
    async getProcessOrders() {
      let _this = this;
      _this.listLoading = true;
      let params = new FormData();
      params.append("startPage", _this.startPage);
      params.append("pageSize", _this.pageSize);
      params.append("keyword", _this.filters.keyword);
      params.append("memberId", this.memberId);
      params.append("startTime", _this.dateObj.startTime);
      params.append("endTime", _this.dateObj.endTime);
      this.axios
        .post(process.env.API_ROOT + "/ProcessOrderApi/v1/findByPage", params)
        .then(response => {
          if (!response.data) {
            _this.listLoading = false;
            return;
          }
          if (response.data && response.data.status === 200) {
            _this.processOrders = response.data.data;
            _this.total = response.data.total;
          } else {
            _this.message(true, response.data.msg, "error");
            _this.processOrders = [];
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
    // 删除用户
    delProcessOrder(id) {
      if (this.processOrderIds.length === 0) {
        this.message(true, "请选择需要删除的加工单", "error");
        return;
      }
      this.$confirm(
        "此操作将删除当前选择的加工单，如需再次下加工单，请重新从销售订单处再次下加工单，是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "error"
        }
      )
        .then(() => {
          this.delProcessOrders();
        })
        .catch(() => {
          this.message(true, "已取消删除", "error");
        });
    },
    // 删除用户
    async delProcessOrders() {
      let params = new FormData();
      params.append("ids", this.processOrderIds);
      params.append("processNos", this.processOrderNos);
      params.append("saleContractNos", this.saleContractNos);
      this.axios
        .post(
          process.env.API_ROOT + "/ProcessOrderApi/v1/delProcessOrder",
          params
        )
        .then(response => {
          if (!response.data) {
            return;
          }
          if (response.data.status === 200) {
            this.message(true, response.data.msg, "success");
          } else {
            this.message(true, response.data.msg, "error");
          }
          this.getProcessOrders();
        });
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
    // 获取选中集
    handleSelectionChange(val) {
      this.processOrderIds = [];
      this.processOrderNos = [];
      this.saleContractNos = [];
      if (val) {
        val.forEach(row => {
          this.processOrderIds.push(row.id);
          this.processOrderNos.push(row.processno);
          this.saleContractNos.push(row.contractno);
        });
        this.saleContractNos = Array.from(new Set(this.saleContractNos));
      }
    },
    // 每页大小改变时触发
    handleSizeChange(val) {
      this.pageSize = val;
      this.getProcessOrders();
    },
    // 当前页码改变时触发
    handleCurrentChange(val) {
      this.startPage = val;
      this.getProcessOrders();
    },

    printView(row) {
      this.autoterVisible = true;
      this.print.customerName = row.customerName;
      this.print.processNo = row.processno;
      this.print.crt = row.crt;
      this.print.processType = row.processtype;
      this.print.warehouseName = row.warehouseName;
      this.print.remark = row.remark;
      let params = new FormData();
      params.append("memberId", this.memberId);
      params.append("warehouseId", row.warehouseId);
      params.append("processNo", row.processno);
      this.axios
        .post(process.env.API_ROOT + "/SysApi/v1/corpInfo", params)
        .then(response => {
          if (response.data.length > 0) {
            this.print.companyaddress = response.data[0].companyaddress;
            this.print.companyname = response.data[0].companyname;
            this.print.linkman = response.data[0].linkman;
            this.print.linkmanphone = response.data[0].linkmanPhone;
            this.print.fax = response.data[0].fax;
          }
        });
      this.axios
        .post(
          process.env.API_ROOT + "/WareHouseApi/v1/findwarehouseByPo",
          params
        )
        .then(response => {
          if (response.data && response.data.status === 200) {
            this.print.warehousePhone = response.data.data.warehousephone;
            this.print.warehouseFax = response.data.data.warehousefax;
          }
        });
      this.axios
        .post(
          process.env.API_ROOT + "/ProcessOrderApi/v1/findByPageList",
          params
        )
        .then(response => {
          if (response.data && response.data.status === 200) {
            this.tableData1 = response.data.data;
            this.total = response.data.total;
          } else {
            this.message(true, response.data.msg, "error");
            this.tableData1 = [];
          }
          this.listLoading = false;
        });
    },
    // 打印提货单
    pillorderSheet() {
      var dom = document.getElementById("pillorderSheet");
      var win = window.open("");
      win.document.write(dom.outerHTML);
      var head = win.document.getElementsByTagName("head")[0];
      var style = win.document.createElement("link");
      style.href = "static/index.css";
      style.rel = "stylesheet";
      style.type = "text/css";
      head.appendChild(style);
      // win.document.querySelector(".resize-triggers").remove();
      var div = win.document.createElement("div");
      // div.innerText = 'helloworld'
      // 插入到最前面
      win.document.body.insertBefore(div, win.document.body.firstElementChild);
      win.setTimeout(function() {
        win.print();
        win.close();
      }, 1000);
    },

    // 显示打印加工单
    printprocessingSheet() {
      var dom = document.getElementById("processingSheet");
      var win = window.open("");
      win.document.write(dom.outerHTML);
      var head = win.document.getElementsByTagName("head")[0];
      var style = win.document.createElement("link");
      style.href = "static/index.css";
      style.rel = "stylesheet";
      style.type = "text/css";
      head.appendChild(style);
      // win.document.querySelector(".resize-triggers").remove();
      var div = win.document.createElement("div");
      // div.innerText = 'helloworld'
      // 插入到最前面

      win.document.body.insertBefore(div, win.document.body.firstElementChild);
      win.setTimeout(function() {
        win.print();
        win.close();
      }, 1000);
    },
    // 合并加工单列
    processingSheet(param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "总计";
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
          if (index === 4) {
            sums[index] = sums[index].toFixed(3) + "吨";
            this.numone = sums[index];
          } else if (index === 7) {
            sums[index] = "";
            this.numone = sums[index];
          }
        } else {
          sums[index] = "";
        }
      });
      return sums;
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
    this.getProcessOrders();
    this.getCustomerList();
  },
  computed: {
    delShow() {
      return this.getHasRule("删除加工单");
    },
    findShow() {
      return this.getHasRule("查询加工单");
    },
    printViewShow() {
      return this.getHasRule("打印加工单");
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

/* 打印加工单 */
#processingSheet {
  width: 950px;
  margin: 0 auto;
}
#processingSheet .titleBox {
  padding: 4px 15px;
  font-size: 16px;
}
#processingSheet .titleBox .el-row > div {
  padding: 2px 0;
}
#processingSheet .titleMenu {
  letter-spacing: 10px;
  margin-bottom: 30px;
  font-size: 30px;
  text-align: center;
  color: #292929;
}
#processingSheet .addorder {
  margin-bottom: 15px;
  border: 1px solid #ebeef5;
}
#processingSheet .footeremark {
  border-top: 1px solid #ebeef5;
  padding: 5px 15px;
  font-size: 16px;
}
#processingSheet .footeremark .padingnone {
  padding: 0 !important;
}
#processingSheet .footeremark .padtop {
  padding: 15px 0;
}
#processingSheet .footeremark p {
  margin: 5px 0 0;
}
#processingSheet .footerBox {
  padding: 0 15px;
}
#processingSheet .footerBox .el-row div {
  font-size: 16px;
  text-align: center;
}
</style>
