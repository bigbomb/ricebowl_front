<template>
  <el-row>
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-autocomplete
            v-model="filters.keyword"
            :fetch-suggestions="querySearchAsync"
            placeholder="请输入承运方"
            @select="handleSelect1"
          ></el-autocomplete>
        </el-form-item>
        <el-form-item>
          <el-date-picker
            v-model="filters.validateTime"
            type="daterange"
            placeholder="请输入运输时间"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="searchTime"
          ></el-date-picker>
        </el-form-item>
        <el-form-item v-if="findShow">
          <el-button
            type="primary"
            class="el-icon-search"
            :loading="selLoading"
            v-on:click="getTransportOrders"
          >查询</el-button>
        </el-form-item>
        <!-- <el-form-item v-if='addShow'>
					<el-button type="success" class="el-icon-plus" @click.native="showDialogForm">新增</el-button>
        </el-form-item>-->
        <!-- <el-form-item>
					<el-button type="error" class="el-icon-edit" @click="editUser">编辑</el-button>
        </el-form-item>-->
        <el-form-item v-if="delShow">
          <el-button type="danger" class="el-icon-delete" @click="delTransportOrder">删除</el-button>
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
        <el-table-column prop="status" label="发货状态" width="100" sortable></el-table-column>
        <el-table-column prop="transportno" label="发货单号" width="200" sortable></el-table-column>
        <el-table-column prop="contractno" label="销售合同号" width="200" sortable></el-table-column>
        <el-table-column prop="deliveryno" label="提单号" width="200" sortable></el-table-column>
        <el-table-column prop="carrier" label="承运方" width="120" sortable></el-table-column>
        <el-table-column prop="transporttotalfee" label="运费" width="100" sortable></el-table-column>
        <el-table-column prop="transportweight" label="重量" width="160" sortable></el-table-column>
        <el-table-column prop="vehiclenumber" label="提货车号" width="120" sortable></el-table-column>
        <el-table-column prop="transportaddress" label="到货地址" width="500" sortable></el-table-column>
        <!-- <el-table-column prop="warehouse" label="提货仓库" width="100" sortable></el-table-column> -->
        <el-table-column prop="crt" label="创建时间" sortable width="160">
          <template slot-scope="scope">
            <span>{{scope.row.crt, 'yyyy-MM-dd hh:mm:ss' | dataFormat}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createby" label="创建人" width="100" sortable></el-table-column>
        <el-table-column prop="remark" label="备注" sortable :show-overflow-tooltip="true"></el-table-column>
        <el-table-column fixed="right" label="操作" width="150">
          <template slot-scope="scope">
            <el-button v-if="printShow" type="text" size="small" @click="printView(scope.row)">打印发货单</el-button>
            <el-button
              v-if="printShow"
              type="text"
              size="small"
              @click="transportorderedit(scope.row)"
            >结算确认</el-button>
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
        title="打印发货单"
        :visible.sync="billVisible"
        width="1000px"
        :close-on-click-modal="false"
        :append-to-body="true"
      >
        <div class="newOrder-pagination" id="pillorderSheet">
          <p class="titleMenu">{{print.companyName}}</p>
          <p class="titleMenu">发货单</p>
          <el-row>
            <el-col :span="24" style="border-bottom: 1px solid #d9d9d9; margin-bottom: 10px;">
              <el-col
                :span="12"
                style="
  text-align: center;
  margin-bottom: 10px;
  color: #292929;"
              >发货单号:{{print.transportNo}}</el-col>
              <el-col
                :span="12"
                style="
  text-align: center;
  margin-bottom: 10px;
  color: #292929;"
              >销售合同号:{{print.contractNo}}</el-col>
            </el-col>
          </el-row>
          <div class="titleBox">
            <el-row>
              <!-- <el-col :span="24">
                <el-col :span="3">委托方：</el-col>
                <el-col :span="21" class="botom">
                  <el-col :span="20">{{print.companyName}}</el-col>
                </el-col>
              </el-col>
              <el-col :span="24">
                <el-col :span="6">承运方（物流公司或者个人）：</el-col>
                <el-col :span="18" class="botom">
                  <el-col :span="15">{{print.carrier}}</el-col>
                </el-col>
              </el-col>-->
              <!-- <el-col :span="24">
                <el-col :span="3">提货车号：</el-col>
                <el-col :span="21" class="botom">
                  <el-col :span="20">{{print.transportaddress}}</el-col>
                </el-col>
              </el-col>-->
              <!-- <el-col :span="24">
                <el-col :span="3">仓库：</el-col>
                <el-col :span="21" class="botom">
                  <el-col :span="20">{{print.warehouse}}</el-col>
                </el-col>
              </el-col>-->
              <el-col :span="24">
                <el-col :span="3">收货地址：</el-col>
                <el-col :span="21" class="botom">
                  <el-col :span="20">{{print.transportaddress}}</el-col>
                </el-col>
              </el-col>
              <!-- <el-col :span="24">
                <el-col :span="3">联系电话：</el-col>
                <el-col :span="21" class="botom">
                  <el-col :span="20">{{print.linkmanPhone}}</el-col>
                </el-col>              
              </el-col>-->
              <!-- <el-col :span="12">提单编号：{{print.deliveryNo}}</el-col> -->
              <!-- <el-col :span="24">
                <el-col :span="3">运费：</el-col>
                <el-col :span="21" class="botom">
                  <el-col :span="20">{{print.transportfee}}</el-col>
                </el-col>
              </el-col>-->
              <!-- <el-col :span="12">仓库名称：{{print.warehouseName}}</el-col> -->
              <!-- <el-col :span="12">仓库地址：{{print.warehouseAddress}}</el-col> -->
              <!-- <el-col :span="12">仓库电话：{{print.warehousePhone}}</el-col> -->
              <!-- <el-col :span="12">仓库传真：{{print.warehouseFax}}</el-col> -->

              <!-- <el-col :span="24">
                <el-col :span="24" class="txtleft">提货人姓名/联系方式：</el-col>
              </el-col>-->
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
              <el-row>
                <el-col :span="12">
                  <el-row>车号:</el-row>
                  <el-row>提货人签字:</el-row>
                </el-col>
                <el-col :span="8">收货人签字:</el-col>
              </el-row>
              <!-- <p>
              收货人签字:-->
              <!-- <span class="bortom">{{print.companyName}}</span> -->
              <!-- </p> -->
              <!-- <p class="padinglr">制表日期:{{print.crt, 'yyyy-MM-dd' | dataFormat}}</p> -->
            </div>
          </div>
        </div>
        <div style="text-align:right;margin-top:30px">
          <el-button type="primary" @click="pillorderSheet">确认</el-button>
          <el-button @click="billVisible =! billVisible">取消</el-button>
        </div>
      </el-dialog>
    </el-col>
    <el-col :span="2">
      <el-dialog
        :close-on-click-modal="false"
        title="结算确认"
        :visible.sync="transportFormVisible"
        width="1250px"
      >
        <div id="transportSheet">
          <el-form
            :model="tpruleFormtransport"
            status-icon
            :rules="tprulestransport"
            ref="tpruleFormtransport"
            :inline="true"
            label-width="100px"
            class="demo-form-inline"
          >
            <el-col :span="6">
              <el-form-item label="id" prop="id" v-if="false">
                <el-input
                  size="medium"
                  type="input"
                  auto-complete="off"
                  v-model="tpruleFormtransport.id"
                ></el-input>
                <!-- <el-input type="text" placeholder="请输入仓库全称" auto-complete="off" v-model="jgruleForm.warehouse" ></el-input> -->
              </el-form-item>
              <el-form-item label="承运方" prop="carrier">
                <el-input v-model="tpruleFormtransport.carrier" disabled="disabled"></el-input>
                <!-- <el-input type="text" placeholder="请输入仓库全称" auto-complete="off" v-model="jgruleForm.warehouse" ></el-input> -->
              </el-form-item>
            </el-col>
            <!-- <el-col :span="4">
              <el-form-item>
                <el-button type="text" size="small" @click="carrierShow">承运方管理</el-button>
              </el-form-item>
            </el-col>-->
            <el-col :span="7">
              <el-form-item label="运费类型" prop="freightoption">
                <el-select v-model="tpruleFormtransport.freightoption" placeholder="请选择运费类型">
                  <el-option
                    v-for="item in freightoptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="7">
              <el-form-item label="运费金额" prop="transportfee">
                <el-input
                  size="medium"
                  type="input"
                  placeholder="请输入运费"
                  auto-complete="off"
                  v-model="tpruleFormtransport.transportfee"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="收货地址" prop="transportaddress">
                <el-input
                  disabled="disabled"
                  style="width:600px"
                  type="input"
                  placeholder="请输入收货地址"
                  auto-complete="off"
                  v-model="tpruleFormtransport.transportaddress"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="发货备注" prop="remark">
                <div class="tdquill">
                  <quill-editor
                    ref="myTextEditor"
                    v-model="tpruleFormtransport.remark"
                    :options="editorOption2"
                    @blur="onEditorBlur($event)"
                    @focus="onEditorFocus($event)"
                    @ready="onEditorReady($event)"
                    @change="onEditorChange($event)"
                  >
                    >
                    <div id="toolbar2" slot="toolbar">
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
                </div>
              </el-form-item>
            </el-col>
            <el-form-item label="商品明细">
              <el-table
                style="width:1100px"
                :data="transportgridData"
                max-height="500"
                class="el-tb-edit"
                ref="transportgridTable"
                highlight-current-row
                show-summary
                :summary-method="getTsSummaries"
              >
                <!-- <el-table-column
                  type="selection"
                  width="80"
                  @selection-change="handleItemSelectionChange"
                  :selectable="checkboxTransportInit"
                ></el-table-column>-->
                <el-table-column
                  prop="id"
                  v-model="scope.row.id"
                  label="id"
                  sortable
                  v-if="isshow"
                  width="80"
                ></el-table-column>
                <el-table-column prop="stockid" label="stockid" sortable v-if="isshow" width="80"></el-table-column>

                <el-table-column prop="id" label="id" sortable v-if="isshow" width="80"></el-table-column>
                <!-- <el-table-column prop="transportstatus" label="运输状态" sortable hidden width="100"></el-table-column> -->

                <el-table-column property="productname" label="名称" width="200">
                  <template slot-scope="scope">
                    <span>{{scope.row.productname}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productspec" label="规格" width="160">
                  <template slot-scope="scope">
                    <span>{{scope.row.productspec}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productfactory" label="钢厂" width="160">
                  <template slot-scope="scope">
                    <span>{{scope.row.productfactory}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productmark" label="材质" width="160">
                  <template slot-scope="scope">
                    <span>{{scope.row.productmark}}</span>
                  </template>
                </el-table-column>

                <!-- <el-table-column property="weight" min="1" label="合同重量(吨)" width="120">
                  <template slot-scope="scope">
                    <span>{{scope.row.weight}}</span>
                  </template>
                </el-table-column>-->
                <el-table-column property="actualweight" min="1" label="提库重量(吨)" width="120">
                  <template slot-scope="scope">
                    <span>{{scope.row.actualweight}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="finalweight" min="1" label="客户结算重量(吨)" width="160">
                  <template slot-scope="scope">
                    <el-input size="mini" v-model="scope.row.finalweight" placeholder="请输入内容"></el-input>
                  </template>
                </el-table-column>
                <el-table-column property="stockid" label="库存Id" width="120" v-if="isshow">
                  <template slot-scope="scope">
                    <span>{{scope.row.stockid}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="price" label="单价(元)" width="120" v-if="isshow">
                  <template slot-scope="scope">
                    <span>{{scope.row.price}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="unit" label="单位" width="100">
                  <template slot-scope="scope">
                    <span>{{scope.row.unit}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="num" label="数量" width="60">
                  <template slot-scope="scope">
                    <span>{{scope.row.num}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="warehousename" label="所在仓库" width="160">
                  <template slot-scope="scope">
                    <span>{{scope.row.warehousename}}</span>
                  </template>
                </el-table-column>

                <el-table-column property="quality" label="品级" width="150">
                  <template slot-scope="scope">
                    <span>{{scope.row.quality}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="remark" label="备注" width="300">
                  <template slot-scope="scope">
                    <span>{{scope.row.remark}}</span>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </el-form>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="closeDialog('tpruleFormtransport')">取 消</el-button>
          <!-- <el-button @click="resetForm('ruleForm')">重置</el-button> -->
          <el-button type="primary" @click="transport('tpruleFormtransport')">保 存</el-button>
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
        validateTime: []
      },
      transportgridData: [],
      tpruleFormtransport: {
        id: "",
        freightoption: "",
        warehouseName: "",
        carrier: "",
        transportfee: "",
        vehicleNumber: "",
        transportaddress: "",
        contractno: "",
        remark:
          "<p>1.收货人应当面验明货物材质、数量、产地、公差、签字后不予受理</p><p>2.客户自收货之日起3日内发现有质量异议，在货物完好无损的情况下本公司予以受理,</p><p>产生的赔偿仅限于有质量问题的材料成本</p>"
      },
      editorOption2: {
        modules: {
          toolbar: "#toolbar2"
        }
      },
      print: {
        contractNo: "",
        companyName: "",
        carrier: "",
        vehiclenumber: "",
        warehouse: "",
        transportaddress: "",
        transportfee: "",
        remark: ""
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
      transportchangeFormVisible: false,
      formLabelWidth: "120px",
      ids: [], //发货单ids
      transportOrderIds: [], // 发货单单号s
      deliveryOrderNos: [], //提单Nos
      saleContractNos: [], //销售合同号s
      memberId: "",
      saleContractNos: [],
      memberId: "",
      billVisible: false, // 提单
      exbillVisible: false,
      transportFormVisible: false,
      dateObj: {
        startTime: "",
        endTime: ""
      },
      rules: {
        offsetweight: [
          { required: true, message: "请输入调整吨位", trigger: "blur" }
        ]
      },
      tprulestransport: {
        carrier: [
          { required: true, message: "请选择承运方", trigger: "change" }
        ],
        warehouseName: [
          { required: true, message: "请选择提货仓库名", trigger: "change" }
        ],
        freightoption: [
          { required: true, message: "请选择运费类型", trigger: "change" }
        ],
        transportfee: [
          { required: true, message: "请输入运费", trigger: "blur" },
          {
            type: "number",
            message: "请输入数字格式",
            trigger: "blur",
            transform(value) {
              return Number(value);
            }
          }
        ],
        // vehicleNumber: [
        //   { required: true, message: "请输入提货车号", trigger: "blur" }
        // ],
        transportaddress: [
          { required: true, message: "请输入到货地址", trigger: "blur" }
        ]
      },
      freightoptions: [
        {
          value: 1,
          label: "不含税元/吨"
        },
        {
          value: 2,
          label: "含税元/吨"
        },
        {
          value: 3,
          label: "不含税整车运费"
        },
        {
          value: 4,
          label: "含税整车运费"
        }
      ]
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
    // 获取运输单列表
    async getTransportOrders() {
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
        .post(process.env.API_ROOT + "/TransportOrderApi/v1/findByPage", params)
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

    transportorderedit(row) {
      // if (this.deliveryOrderNos.length === 0) {
      //   this.message(true, "请选择提单", "error");
      //   return;
      // }
      this.transportFormVisible = true;

      let params = new FormData();
      params.append("memberId", this.memberId);
      params.append("transportNo", row.transportno);
      // params.append("keyword", row.customerid);
      // params.append("memberId", this.memberId);
      // params.append("customerId", row.customerid);
      this.axios
        .post(
          process.env.API_ROOT + "/TransportOrderApi/v1/findDetailByPageList",
          params
        )
        .then(response => {
          if (!response.data) {
            return;
          }
          if (response.data.status === 200) {
            this.transportgridData = [];
            var tabledata = response.data.data.transportOrderDetailDtoList;
            for (var i in tabledata) {
              this.transportgridData.push(tabledata[i]);
            }

            this.tpruleFormtransport.carrier = response.data.data.carrier;
            this.tpruleFormtransport.freightoption =
              response.data.data.feeoption;
            this.tpruleFormtransport.transportfee =
              response.data.data.transportfee;
            this.tpruleFormtransport.transportaddress =
              response.data.data.transportaddress;
            this.tpruleFormtransport.remark = response.data.data.remark;
            this.tpruleFormtransport.id = response.data.data.id;
            // this.carrierSelect();
            // this.warehouseSelect();
            this.message(true, response.data.msg, "success");
          } else {
            this.message(true, response.data.msg, "error");
          }
        });
    },
    //关闭弹窗
    closeDialog(formName) {
      if (formName === "tpruleFormtransport") {
        this.transportFormVisible = false;
      }

      this.$refs[formName].resetFields();
    },
    // 重置
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    // 删除提单
    delTransportOrder(id) {
      if (this.deliveryOrderNos.length === 0) {
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

    transport(formName) {
      this.$confirm("是否确定继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "error"
      }).then(() => {
        this.$refs[formName].validate(valid => {
          if (valid) {
            this.submittransport();
          } else {
            console.log("error submit!!");
            return false;
          }
        });
      });
    },
    // 保存运输单
    submittransport() {
      let _this = this;

      let params = new FormData();
      params.append("id", _this.tpruleFormtransport.id);
      params.append("transportfee", _this.tpruleFormtransport.transportfee);
      params.append("feeoption", _this.tpruleFormtransport.freightoption);
      params.append("actualTotalWeight", _this.totalWeight);
      params.append(
        "transportOrderDetail",
        JSON.stringify(_this.transportgridData)
      );

      this.axios
        .post(
          process.env.API_ROOT + "/TransportOrderApi/v1/confirmTransportOrder",
          params
        )
        .then(response => {
          if (!response.data) {
            return;
          }
          if (response.data.status === 200) {
            this.message(true, response.data.msg, "success");
            this.transportFormVisible = false;
            this.getTransportOrders();
          }
        });
    },
    // 删除提单
    async delDeliveryOrders() {
      let params = new FormData();
      params.append("transportOrderIds", this.transportOrderIds);
      params.append("deliveryOrderNos", this.deliveryOrderNos);
      params.append("saleContractNos", this.saleContractNos);
      params.append("ids", this.ids);
      this.axios
        .post(
          process.env.API_ROOT + "/TransportOrderApi/v1/delTransportOrder",
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
          this.getTransportOrders();
        });
    },
    // 获取选中集
    handleSelectionChange(val) {
      this.ids = [];
      this.transportOrderIds = [];
      this.deliveryOrderNos = [];
      this.saleContractNos = [];
      if (val) {
        val.forEach(row => {
          this.ids.push(row.id);
          this.transportOrderIds.push(row.transportno);
          this.deliveryOrderNos.push(row.deliveryno);
          this.saleContractNos.push(row.contractno);
        });
        this.saleContractNos = Array.from(new Set(this.saleContractNos));
        this.deliveryOrderNos = Array.from(new Set(this.deliveryOrderNos));
        this.transportOrderIds = Array.from(new Set(this.transportOrderIds));
        this.ids = Array.from(new Set(this.ids));
      }
    },
    // 每页大小改变时触发
    handleSizeChange(val) {
      this.pageSize = val;
      this.getTransportOrders();
    },
    // 当前页码改变时触发
    handleCurrentChange(val) {
      this.startPage = val;
      this.getTransportOrders();
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
        .post(process.env.API_ROOT + "/CarriersApi/v1/findByNoPage", params)
        .then(response => {
          if (!response.data) {
            return;
          }
          let customerdata = response.data.data;
          this.customerList = [];
          for (let lcustomer of customerdata) {
            if (lcustomer.carrier != null) {
              let jsoncompany = {
                value: lcustomer.carrier,
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

    getTsSummaries(param) {
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
        } else if (index === 11) {
          sums[index] = "";
          return;
        } else if (index === 12) {
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
          if (index === 4) {
            sums[index] = sums[index].toFixed(3);
            sums[index] += "吨";
          } else if (index === 5) {
            sums[index] = sums[index].toFixed(3);
            this.totalWeight = sums[index];
            sums[index] += "吨";
          } else {
            sums[index] = sums[index].toFixed(2);
            this.totalAmount = sums[index];
            sums[index] += "";
          }
        } else {
          sums[index] = "";
        }
      });
      return sums;
    },
    //显示打印运输单
    printView(row) {
      this.billVisible = true;
      this.print.companyName = row.companyName;
      this.print.carrier = row.carrier;
      this.print.vehiclenumber = row.vehiclenumber;
      this.print.warehouse = row.warehouse;
      this.print.transportaddress = row.transportaddress;
      this.print.transportfee = row.transportfee;
      this.print.crt = row.crt;
      this.print.contractNo = row.contractno;
      this.print.transportNo = row.transportno;
      this.print.remark = row.remark;
      let params = new FormData();
      params.append("memberId", this.memberId);
      params.append("transportNo", row.transportno);
      this.axios
        .post(process.env.API_ROOT + "/SysApi/v1/corpInfo", params)
        .then(response => {
          if (response.data.length > 0) {
            this.print.companyName = response.data[0].companyname;
          }
        });
      this.axios
        .post(
          process.env.API_ROOT + "/TransportOrderApi/v1/findDetailByPageList",
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
    // 打印运输单
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
    onEditorBlur(editor) {
      editor.enable(false);
      this.editor = editor;
    },
    onEditorReady(editor) {
      editor.enable(false);
      this.editor = editor;
      this.content = editor.root.innerHTML;
    },
    onEditorFocus(editor) {
      this.editor = editor;
      editor.root.contentEditable = false;
    },
    onEditorChange(editor) {
      this.editor = editor;
      this.currentLength = editor.text.replace("\n", "").length;
      this.content = editor.html;
      editor.enable(false);
    },
    // 合并运输单列
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
    this.getTransportOrders();
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
<style lang="scss">
.el-tooltip__popper {
  max-width: 80%;
}
</style>
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
  margin-right: 150px;
}
#transportSheet .tdquill {
  height: 300px;
  width: 1050px;
}
#transportSheet .tdquill .quill-editor {
  height: 250px;
}
</style>
