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
            placeholder="请输入提单生成时间"
            range-separator="至"
            start-placeholder="提单创建开始日期"
            end-placeholder="提单创建结束日期"
            @change="searchTime"
          ></el-date-picker>
        </el-form-item>
        <el-form-item v-if="findShow">
          <el-button
            type="primary"
            class="el-icon-search"
            :loading="selLoading"
            v-on:click="getDeliveryOrders"
          >查询</el-button>
        </el-form-item>
        <!-- <el-form-item v-if='addShow'>
					<el-button type="success" class="el-icon-plus" @click.native="showDialogForm">新增</el-button>
        </el-form-item>-->
        <!-- <el-form-item>
					<el-button type="error" class="el-icon-edit" @click="editUser">编辑</el-button>
        </el-form-item>-->
        <el-form-item v-if="delShow">
          <el-button type="danger" class="el-icon-delete" @click="delDeliveryOrder">删除</el-button>
        </el-form-item>

        <!-- <el-form-item>
					<el-button type="danger" class="el-icon-delete" @click="toueditor">百度富文本框</el-button>
        </el-form-item>-->
      </el-form>
    </el-col>

    <!--列表-->
    <el-col>
      <el-table
        :data="deliveryOrders"
        v-loading="listLoading"
        highlight-current-row
        element-loading-text="拼命加载中"
        @selection-change="handleSelectionChange"
        style="width: 100%;"
      >
        <el-table-column type="selection" width="55"></el-table-column>
        <el-table-column prop="id" label="id" width="80" v-if="isshow" sortable></el-table-column>
        <el-table-column prop="deliveryno" label="提单单号" width="200" sortable></el-table-column>
        <el-table-column prop="contractno" label="销售合同号" width="200" sortable></el-table-column>
        <el-table-column prop="customername" label="客户名称" width="300" sortable></el-table-column>
        <el-table-column prop="isItemRight" label="是否转货权" width="150" sortable>
          <template slot-scope="scope">
            <div v-if="scope.row.isItemRight==1">是</div>
            <div v-else>否</div>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始日期" v-if="isshow" width="300" sortable></el-table-column>
        <el-table-column prop="endTime" label="结束日期" v-if="isshow" width="300" sortable></el-table-column>
        <el-table-column prop="warehousename" label="仓库名称" width="100" sortable></el-table-column>
        <el-table-column prop="warehouseaddress" label="仓库地址" v-if="isshow" width="100" sortable></el-table-column>
        <el-table-column prop="warehousephone" label="仓库电话" v-if="isshow" width="100" sortable></el-table-column>
        <el-table-column prop="warehousefax" label="仓库传真" v-if="isshow" width="100" sortable></el-table-column>
        <el-table-column prop="weight" label="提库重量" width="100" sortable></el-table-column>
        <el-table-column prop="finalweight" label="客户结算重量" width="160" sortable></el-table-column>
        <el-table-column prop="vehiclenumber" label="委托车辆号" width="400" sortable></el-table-column>
        <el-table-column prop="deliverymethod" label="提货方式" width="100" sortable></el-table-column>
        <el-table-column prop="isItemRight" label="是否转货权" width="150" sortable>
          <template slot-scope="scope">
            <div v-if="scope.row.isItemRight==1">是</div>
            <div v-else>否</div>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="提单备注" width="400" sortable>
          <template slot-scope="scope">
            <div v-html="scope.row.remark">{{scope.row.remark}}</div>
          </template>
        </el-table-column>
        <el-table-column prop="crt" label="创建时间" width="200" sortable>
          <template slot-scope="scope">
            <span>{{scope.row.crt, 'yyyy-MM-dd hh:mm:ss' | dataFormat}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createby" label="创建人" width="100" sortable></el-table-column>
        <el-table-column fixed="right" label="操作" width="200">
          <template slot-scope="scope">
            <el-button
              v-if="printShow"
              type="text"
              size="small"
              @click="printView(scope.row,1)"
            >打印仓库提单</el-button>
            <el-button
              v-if="printShow"
              type="text"
              size="small"
              @click="printView(scope.row,2)"
            >打印客户提单</el-button>
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

    <!-- 提单 -->
    <el-col :span="2">
      <el-dialog
        title="打印提货委托书"
        :visible.sync="billVisible"
        width="1000px"
        :close-on-click-modal="false"
      >
        <div class="newOrder-pagination" id="pillorderSheet">
          <p class="titleMenu">提货委托书</p>
          <div class="titleBox">
            <el-row>
              <el-col :span="24">
                <el-col :span="3">提货方式：</el-col>
                <el-col :span="21" class="botom">
                  <el-col :span="20">{{print.deliverymethod}}</el-col>
                </el-col>
              </el-col>
              <el-col :span="24">
                <el-col :span="3">提货单位：</el-col>
                <el-col :span="21" class="botom">
                  <el-col :span="20" v-if="print.isItemRight == 0">{{print.companyName}}</el-col>
                  <el-col :span="20" v-else>{{print.customername}}</el-col>
                </el-col>
              </el-col>
              <el-col :span="24">
                <el-col :span="3">联系电话：</el-col>
                <el-col :span="21" class="botom">
                  <el-col :span="20">{{print.linkmanPhone}}</el-col>
                </el-col>
              </el-col>
              <!-- <el-col :span="12">提单编号：{{print.deliveryNo}}</el-col> -->
              <el-col :span="24">
                <el-col :span="3">有效日期：</el-col>
                <el-col :span="21" class="botom">
                  <el-col
                    :span="20"
                  >{{print.startTime, 'yyyy-MM-dd' | dataFormat}} 至 {{print.endTime, 'yyyy-MM-dd' | dataFormat}}</el-col>
                </el-col>
              </el-col>
              <!-- <el-col :span="12">仓库名称：{{print.warehouseName}}</el-col> -->
              <!-- <el-col :span="12">仓库地址：{{print.warehouseAddress}}</el-col> -->
              <!-- <el-col :span="12">仓库电话：{{print.warehousePhone}}</el-col> -->
              <!-- <el-col :span="12">仓库传真：{{print.warehouseFax}}</el-col> -->
              <el-col :span="24">
                <el-col :span="3">提货车号：</el-col>
                <el-col :span="21" class="botom">
                  <el-col :span="20">{{print.vehicleNumber}}</el-col>
                </el-col>
              </el-col>
              <el-col :span="24">
                <el-col :span="24" class="txtleft">提货人姓名/联系方式：</el-col>
              </el-col>
            </el-row>
          </div>
          <p style="margin:3px 0;">提货明细</p>
          <div class="addorder">
            <el-table :data="tableData1" show-summary :summary-method="processingSheet">
              <el-table-column prop="productname" label="品名" width="180"></el-table-column>
              <el-table-column prop="productspec" label="规格" width="226"></el-table-column>
              <el-table-column prop="productmark" label="材质" width="100"></el-table-column>
              <el-table-column prop="productfactory" label="钢厂" width="100"></el-table-column>
              <el-table-column prop="num" label="数量" width="100"></el-table-column>
              <el-table-column prop="unit" label="单位" width="91"></el-table-column>
              <el-table-column prop="actualweight" label="实提重量（吨）" width="150"></el-table-column>
            </el-table>
            <div class="footeremark">
              <el-row>
                <el-col :span="24">注意：手写无效，提货明细根据实际提货情况填写，不允许空着</el-col>
              </el-row>
            </div>
          </div>
          <div class="footeremark">
            <el-row>
              <el-col :span="2" class="padtop">备注：</el-col>
              <el-col :span="22" class="padingnone">
                <span v-html="print.remark">{{print.remark}}</span>
              </el-col>
            </el-row>

            <div class="footrightBox">
              <p>
                委托人：
                <span class="bortom">{{print.companyName}}</span>
              </p>
              <p class="padinglr">制表日期：{{print.crt, 'yyyy-MM-dd' | dataFormat}}</p>
            </div>
          </div>
        </div>
        <div style="text-align:right;margin-top:30px">
          <el-button type="primary" @click="pillorderSheet">确认</el-button>
          <el-button @click="billVisible =! billVisible">取消</el-button>
        </div>
      </el-dialog>
    </el-col>

    <!-- 提单 -->
    <el-col :span="2">
      <el-dialog
        title="打印提货委托书"
        :visible.sync="exbillVisible"
        width="1000px"
        :close-on-click-modal="false"
      >
        <div class="newOrder-pagination" id="pillorderSheet">
          <p class="titleMenu">提货委托书</p>
          <div class="titleBox">
            <el-row>
              <el-col :span="24">
                <el-col :span="3">提货方式：</el-col>
                <el-col :span="21" class="botom">
                  <el-col :span="20">{{print.deliverymethod}}</el-col>
                </el-col>
              </el-col>
              <el-col :span="24">
                <el-col :span="3">提货单位：</el-col>
                <el-col :span="21" class="botom">
                  <el-col :span="20" v-if="print.isItemRight == 0">{{print.companyName}}</el-col>
                  <el-col :span="20" v-else>{{print.customername}}</el-col>
                </el-col>
              </el-col>
              <el-col :span="24">
                <el-col :span="3">联系电话：</el-col>
                <el-col :span="21" class="botom">
                  <el-col :span="20">{{print.linkmanPhone}}</el-col>
                </el-col>
              </el-col>
              <!-- <el-col :span="12">提单编号：{{print.deliveryNo}}</el-col> -->
              <el-col :span="24">
                <el-col :span="3">有效日期：</el-col>
                <el-col :span="21" class="botom">
                  <el-col
                    :span="20"
                  >{{print.startTime, 'yyyy-MM-dd' | dataFormat}} 至 {{print.endTime, 'yyyy-MM-dd' | dataFormat}}</el-col>
                </el-col>
              </el-col>
              <!-- <el-col :span="12">仓库名称：{{print.warehouseName}}</el-col> -->
              <!-- <el-col :span="12">仓库地址：{{print.warehouseAddress}}</el-col> -->
              <!-- <el-col :span="12">仓库电话：{{print.warehousePhone}}</el-col> -->
              <!-- <el-col :span="12">仓库传真：{{print.warehouseFax}}</el-col> -->
              <el-col :span="24">
                <el-col :span="3">提货车号：</el-col>
                <el-col :span="21" class="botom">
                  <el-col :span="20">{{print.vehicleNumber}}</el-col>
                </el-col>
              </el-col>
              <el-col :span="24">
                <el-col :span="24" class="txtleft">提货人姓名/联系方式：</el-col>
              </el-col>
            </el-row>
          </div>
          <p style="margin:3px 0;">提货明细</p>
          <div class="addorder">
            <el-table :data="tableData1" show-summary :summary-method="processingSheet">
              <el-table-column prop="productname" label="品名" width="180"></el-table-column>
              <el-table-column prop="productspec" label="规格" width="226"></el-table-column>
              <el-table-column prop="productmark" label="材质" width="100"></el-table-column>
              <el-table-column prop="productfactory" label="钢厂" width="100"></el-table-column>
              <el-table-column prop="num" label="数量" width="100"></el-table-column>
              <el-table-column prop="unit" label="单位" width="91"></el-table-column>
              <el-table-column prop="finalweight" label="实提重量（吨）" width="150"></el-table-column>
            </el-table>
            <div class="footeremark">
              <el-row>
                <el-col :span="24">注意：手写无效，提货明细根据实际提货情况填写，不允许空着</el-col>
              </el-row>
            </div>
          </div>
          <div class="footeremark">
            <el-row>
              <el-col :span="2" class="padtop">备注：</el-col>
              <el-col :span="22" class="padingnone">
                <span v-html="print.remark">{{print.remark}}</span>
              </el-col>
            </el-row>

            <div class="footrightBox">
              <p>
                委托人：
                <span class="bortom">{{print.companyName}}</span>
              </p>
              <p class="padinglr">制表日期：{{print.crt, 'yyyy-MM-dd' | dataFormat}}</p>
            </div>
          </div>
        </div>
        <div style="text-align:right;margin-top:30px">
          <el-button type="primary" @click="pillorderSheet">确认</el-button>
          <el-button @click="exbillVisible =! exbillVisible">取消</el-button>
        </div>
      </el-dialog>
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
        validateTime: ""
      },
      print: {
        companyName: "",
        crt: "",
        deliveryNo: "",
        startTime: "",
        endTime: "",
        warehouseName: "",
        warehouseAddress: "",
        warehousePhone: "",
        warehouseFax: "",
        vehicleNumber: "",
        remark: "",
        linkmanPhone: "",
        deliverymethod: "",
        customername: "",
        companyName: ""
      },
      customerList: [],
      tableData1: [],
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
      billVisible: false, // 提单
      exbillVisible: false, //
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
    // 获取提单列表
    async getDeliveryOrders() {
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
        .post(process.env.API_ROOT + "/DeliveryOrderApi/v1/findByPage", params)
        .then(response => {
          if (!response.data) {
            _this.listLoading = false;
            return;
          }
          if (response.data && response.data.status === 200) {
            _this.deliveryOrders = response.data.data;
            _this.total = response.data.total;
          } else {
            _this.message(true, response.data.msg, "error");
            _this.deliveryOrders = [];
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
    // 删除提单
    delDeliveryOrder(id) {
      if (this.deliveryOrderIds.length === 0) {
        this.message(true, "请选择需要删除的提单", "error");
        return;
      }
      this.$confirm(
        "此操作将删除当前选择的提单，如需再次下提单，请重新从销售订单处再次下提单，是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "error"
        }
      )
        .then(() => {
          this.delDeliveryOrders();
        })
        .catch(() => {
          this.message(true, "已取消删除", "error");
        });
    },
    // 删除提单
    async delDeliveryOrders() {
      let params = new FormData();
      params.append("ids", this.deliveryOrderIds);
      params.append("deliveryOrderNos", this.deliveryOrderNos);
      params.append("saleContractNos", this.saleContractNos);
      this.axios
        .post(
          process.env.API_ROOT + "/DeliveryOrderApi/v1/delDeliveryOrder",
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
          this.getDeliveryOrders();
        });
    },
    // 获取选中集
    handleSelectionChange(val) {
      this.deliveryOrderIds = [];
      this.deliveryOrderNos = [];
      this.saleContractNos = [];
      if (val) {
        val.forEach(row => {
          this.deliveryOrderIds.push(row.id);
          this.deliveryOrderNos.push(row.deliveryno);
          this.saleContractNos.push(row.contractno);
        });
        this.saleContractNos = Array.from(new Set(this.saleContractNos));
      }
    },
    // 每页大小改变时触发
    handleSizeChange(val) {
      this.pageSize = val;
      this.getDeliveryOrders();
    },
    // 当前页码改变时触发
    handleCurrentChange(val) {
      this.startPage = val;
      this.getDeliveryOrders();
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

    printView(row, type) {
      this.print.deliveryNo = row.deliveryno;
      this.print.crt = row.crt;
      this.print.vehicleNumber = row.vehiclenumber;
      this.print.warehouseName = row.warehousename;
      this.print.warehouseAddress = row.warehouseaddress;
      this.print.warehousePhone = row.warehousephone;
      this.print.warehouseFax = row.warehousefax;
      this.print.customername = row.customername;
      this.print.isItemRight = row.isItemRight;
      this.print.startTime = row.startTime;
      this.print.endTime = row.endTime;
      this.print.remark = row.remark;
      this.print.deliverymethod = row.deliverymethod;
      let params = new FormData();
      params.append("memberId", this.memberId);
      params.append("deliveryNo", row.deliveryno);
      this.axios
        .post(process.env.API_ROOT + "/SysApi/v1/corpInfo", params)
        .then(response => {
          if (response.data.length > 0) {
            this.print.companyName = response.data[0].companyname;
            this.print.linkmanPhone = response.data[0].linkmanPhone;
          }
        });
      this.axios
        .post(
          process.env.API_ROOT + "/DeliveryOrderApi/v1/findDetailByPageList",
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
      if (type === 1) {
        this.billVisible = true;
      } else {
        this.exbillVisible = true;
      }
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
      win.document.querySelector(".resize-triggers").remove();
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
          if (index === 6) {
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
    this.getDeliveryOrders();
    this.getCustomerList();
  },
  computed: {
    findShow() {
      return this.getHasRule("查询提单");
    },
    delShow() {
      return this.getHasRule("删除提单");
    },
    printShow() {
      return this.getHasRule("提单打印");
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
.footrightBox .padinglr {
  padding-right: 50px;
}
#pillorderSheet .footeremark .footrightBox p {
  margin: 0;
}
</style>
