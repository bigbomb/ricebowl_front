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
        <el-form-item v-if="tansportadd">
          <el-button type="success" class="el-icon-plus" @click.native="transportorder">生成发货单</el-button>
        </el-form-item>
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
        <el-table-column type="selection" width="55" :selectable="checkboxNum"></el-table-column>
        <el-table-column prop="id" label="id" width="80" v-if="isshow" sortable></el-table-column>
        <el-table-column prop="status" label="提单状态" width="100"></el-table-column>
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
        <el-table-column prop="weight" label="提库重量(吨)" width="130" sortable></el-table-column>
        <el-table-column prop="finalweight" label="客户结算重量(吨)" width="160" sortable></el-table-column>
        <el-table-column prop="liftingfee" label="出库费(元)" width="120" sortable></el-table-column>
        <el-table-column prop="vehiclenumber" label="委托车辆号" width="400" sortable></el-table-column>
        <el-table-column prop="deliverymethod" label="提货方式" width="100" sortable></el-table-column>
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
        :append-to-body="true"
      >
        <div class="newOrder-pagination" id="pillorderSheet">
          <p class="titleMenu">{{print.companyName}}</p>
          <p class="titleMenu">提货委托书</p>
          <el-row>
            <el-col :span="24" style="border-bottom: 1px solid #d9d9d9; margin-bottom: 10px;">
              <el-col
                :span="24"
                style="
  text-align: center;
  margin-bottom: 10px;
  color: #292929;"
              >提货单号:{{print.deliveryNo}}</el-col>
            </el-col>
          </el-row>
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
              <el-col :span="4">提货仓库/联系方式：</el-col>
              <el-col :span="20" class="botom">
                <el-col :span="20">{{print.warehouseName}}/{{print.warehousePhone}}</el-col>
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
          <el-button type="primary" @click="printorderSheet">确认</el-button>
          <el-button @click="billVisible =! billVisible">取消</el-button>
        </div>
      </el-dialog>
    </el-col>
    <!-- //承运方管理 -->
    <el-col :span="2">
      <el-dialog title="承运方管理" :visible.sync="carrierVisible" width="880px">
        <div>
          <el-button size="mini" @click="addcarrierRow()">+</el-button>
          <el-table
            style="width:880px"
            :data="carrierGridData"
            max-height="500"
            class="el-tb-edit"
            ref="carrierGridData"
            highlight-current-row
          >
            <el-table-column prop="id" label="id" sortable fixed="left" width="80"></el-table-column>
            <el-table-column property="carrier" label="名称" width="250">
              <template slot-scope="scope">
                <el-input size="mini" v-model="scope.row.carrier" placeholder="请输入内容"></el-input>
              </template>
            </el-table-column>
            <el-table-column property="contactor" label="联系人" width="150">
              <template slot-scope="scope">
                <el-input size="mini" v-model="scope.row.contactor" placeholder="请输入内容"></el-input>
              </template>
            </el-table-column>
            <el-table-column property="contactorphone" label="联系电话">
              <template slot-scope="scope">
                <el-input size="mini" v-model="scope.row.contactorphone" placeholder="请输入内容"></el-input>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="120">
              <template slot-scope="scope">
                <el-button
                  @click.native.prevent="deletetdrulestRow(scope.row,scope.$index, carrierGridData)"
                  type="text"
                  size="small"
                >移除</el-button>
                <el-button
                  @click.native.prevent="savedrulestRow(scope.row)"
                  type="text"
                  size="small"
                >保存</el-button>
              </template>
            </el-table-column>
          </el-table>
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
        :append-to-body="true"
      >
        <div class="newOrder-pagination" id="pillorderSheet">
          <p class="titleMenu">{{print.companyName}}</p>
          <p class="titleMenu">提货委托书</p>
          <el-row>
            <el-col :span="24" style="border-bottom: 1px solid #d9d9d9; margin-bottom: 10px;">
              <el-col
                :span="24"
                style="
  text-align: center;
  margin-bottom: 10px;
  color: #292929;"
              >提货单号:{{print.deliveryNo}}</el-col>
            </el-col>
          </el-row>
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
                <el-col :span="4">提货仓库/联系方式：</el-col>
                <el-col :span="20" class="botom">
                  <el-col :span="20">{{print.warehouseName}}/{{print.warehousePhone}}</el-col>
                </el-col>
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
          <el-button type="primary" @click="printorderSheet">确认</el-button>
          <el-button @click="exbillVisible =! exbillVisible">取消</el-button>
        </div>
      </el-dialog>
    </el-col>

    <el-col :span="2">
      <el-dialog
        :close-on-click-modal="false"
        title="发货单"
        :visible.sync="transportFormVisible"
        width="1250px"
      >
        <div id="deliverorderSheet">
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
              <el-form-item label="承运方" prop="carrier">
                <el-autocomplete
                  v-model="tpruleFormtransport.carrier"
                  :fetch-suggestions="querytdrulestSearchAsync"
                  placeholder="请输入物流公司或者个人"
                  @select="handleSelecttdrulestWarehouse"
                  class="autoinputwidth"
                ></el-autocomplete>
                <!-- <el-input type="text" placeholder="请输入仓库全称" auto-complete="off" v-model="jgruleForm.warehouse" ></el-input> -->
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item>
                <el-button type="text" size="small" @click="carrierShow">承运方管理</el-button>
              </el-form-item>
            </el-col>
            <!-- <el-col :span="12">
              <el-form-item label="提货仓库" prop="warehouseName">
                <el-autocomplete
                  v-model="tpruleFormtransport.warehouseName"
                  :fetch-suggestions="queryWarehouseSearchAsync"
                  placeholder="请输入仓库名"
                  @select="handleSelectTdWarehouse"
                ></el-autocomplete>
                <el-input type="text" placeholder="请输入仓库全称" auto-complete="off" v-model="jgruleForm.warehouse" ></el-input>
              </el-form-item>
            </el-col>-->

            <el-col :span="7">
              <el-form-item label="运费类型" prop="feeoption">
                <el-select v-model="tpruleFormtransport.feeoption" placeholder="请选择运费类型">
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
              <!-- <el-col :span="12">
                <el-form-item label="提货车号" prop="vehicleNumber">
                  <el-input
                    :rows="5"
                    class="vehiclewidth"
                    type="textarea"
                    placeholder="请输入车辆牌照"
                    auto-complete="off"
                    v-model="tpruleFormtransport.vehicleNumber"
                  ></el-input>
                </el-form-item>
              </el-col>-->
              <el-form-item label="收货地址" prop="vehicleaddress">
                <el-input
                  style="width:600px"
                  type="input"
                  placeholder="请输入收货地址"
                  auto-complete="off"
                  v-model="tpruleFormtransport.vehicleaddress"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <!-- <el-form-item label="备注" prop="remark">
                <el-input :rows="5" class="vehiclewidth" type="textarea" placeholder="请输入备注事项" auto-complete="off" v-model="tdruleForm.remark"></el-input>
              </el-form-item>-->
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
                :data="tdgridData"
                max-height="500"
                class="el-tb-edit"
                ref="tdgridTable"
                highlight-current-row
                @selection-change="handleItemSelectionChange"
                show-summary
                :summary-method="getTdSummaries"
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
                    <span>{{scope.row.finalweight}}</span>
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
      transportFormVisible: false,
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
      tpruleFormtransport: {
        id: "",
        freightoption: "",
        warehouseName: "",
        carrier: "",
        transportfee: "",
        vehicleNumber: "",
        vehicleaddress: "",
        contractno: "",
        remark:
          "<p>1.收货人应当面验明货物材质、数量、产地、公差、签字后不予受理</p><p>2.客户自收货之日起3日内发现有质量异议，在货物完好无损的情况下本公司予以受理,</p><p>产生的赔偿仅限于有质量问题的材料成本</p>"
      },
      tdruleForm: {
        contractstatus: "",
        validateTime: [],
        warehouseName: "",
        vehicleNumber: "",
        remark: "",
        deliverymethod: "",
        vehicleuser: "",
        overtimefee: "",
        isItemRight: false
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
        vehicleaddress: [
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
      ],
      editorOption2: {
        modules: {
          toolbar: "#toolbar2"
        }
      },
      tdgridData: [],
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
      deliveryOrderIds: [], // 提单ids
      deliveryOrderNos: [], //提单Nos
      memberId: "",
      saleContractNos: [],
      selectedIds: [],
      warehouseList: [],
      carrierList: [],
      billVisible: false, // 提单
      exbillVisible: false, //
      carrierVisible: false,
      carrierGridData: [],
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
        this.deliveryOrderNos = Array.from(new Set(this.deliveryOrderNos));
        this.saleContractNos = Array.from(new Set(this.saleContractNos));
        this.deliveryOrderIds = Array.from(new Set(this.deliveryOrderIds));
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
    // 保存运输方管理
    savedrulestRow(row) {
      let _this = this;
      let params = new FormData();
      if (row.id !== undefined) {
        params.append("id", row.id);
      }
      params.append("memberid", _this.memberId);
      params.append("contactorphone", row.contactorphone);
      params.append("contactor", row.contactor);
      params.append("carrier", row.carrier);
      this.axios
        .post(process.env.API_ROOT + "/CarriersApi/v1/addCarrier", params)
        .then(response => {
          if (!response.data) {
            _this.listLoading = false;
            return;
          }
          if (response.data && response.data.status === 200) {
            this.message(true, response.data.msg, "success");
            _this.carrierShow();
            _this.carrierSelect();
            _this.carrierVisible = false;
          } else {
            _this.message(true, response.data.msg, "error");
            _this.carrierGridData = [];
          }
          _this.listLoading = false;
        });
    },
    // 删除运输方管理
    deletetdrulestRow(row, index, rows) {
      this.$confirm("此操作将永久删除该运输方, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "error"
      })
        .then(() => {
          this.deldrulestRow(row);
          rows.splice(index, 1);
        })
        .catch(() => {
          this.message(true, "已取消删除", "error");
        });
    },
    // 删除运输方管理
    deldrulestRow(row) {
      let _this = this;
      let params = new FormData();
      if (row.id) {
        params.append("id", row.id);
        this.axios
          .post(process.env.API_ROOT + "/CarriersApi/v1/delCarrierRow", params)
          .then(response => {
            if (!response.data) {
              _this.listLoading = false;
              return;
            }
            if (response.data && response.data.status === 200) {
              _this.message(true, response.data.msg, "success");
              _this.carrierShow();
            } else {
              _this.message(true, response.data.msg, "error");
            }
            _this.listLoading = false;
          })
          .catch(err => {
            console.log(err);
          });
      }
    },
    addcarrierRow() {
      var d = {
        carrier: "",
        contactor: "",
        contactorphone: ""
      };
      this.carrierGridData.push(d);
      setTimeout(() => {
        this.$refs.carrierGridData.setCurrentRow(d);
      }, 10);
    },
    // 保存运输单
    submittransport() {
      let _this = this;
      let memberId = "";
      var usr = this.usr;
      if (usr) {
        memberId = usr.memberId;
      }
      let params = new FormData();
      // params.append("contractId", _this.tdruleForm.id);
      params.append("carrier", _this.tpruleFormtransport.carrier);
      params.append("memberid", memberId);
      // params.append("warehouse", _this.tpruleFormtransport.warehouseName);
      params.append("transportfee", _this.tpruleFormtransport.transportfee);
      params.append("feeoption", _this.tpruleFormtransport.feeoption);
      params.append("remark", _this.content);
      // params.append("vehiclenumber", _this.tpruleFormtransport.vehicleNumber);
      params.append(
        "transportaddress",
        _this.tpruleFormtransport.vehicleaddress
      );
      params.append("contractno", _this.saleContractNos);
      params.append("deliveryno", _this.deliveryOrderNos);
      // params.append("ids", _this.selectedIds);
      params.append("transportOrderDetail", JSON.stringify(_this.tdgridData));

      this.axios
        .post(
          process.env.API_ROOT + "/TransportOrderApi/v1/addTransportOrder",
          params
        )
        .then(response => {
          if (!response.data) {
            return;
          }
          if (response.data.status === 200) {
            this.message(true, response.data.msg, "success");
            this.$router.push({ path: "/transportOrderList" });
          }
        });
    },
    closeDialog(formName) {
      if (formName === "tpruleFormtransport") {
        this.transportFormVisible = false;
      }

      this.$refs[formName].resetFields();
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

    carrierSelect() {
      let params = new FormData();
      let memberId = this.memberId;
      params.append("memberId", memberId);
      this.axios
        .post(process.env.API_ROOT + "/CarriersApi/v1/findByNoPage", params)
        .then(response => {
          let carrierdata = response.data.data;
          this.carrierList = [];
          for (let warehouse of carrierdata) {
            if (warehouse.carrier != null) {
              let jsoncarrier = {
                value: warehouse.carrier,
                id: warehouse.id
              };
              this.carrierList.push(jsoncarrier);
            }
          }
        })
        .catch(err => {
          console.log(err);
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
    transportorder(row) {
      if (this.deliveryOrderNos.length === 0) {
        this.message(true, "请选择提单", "error");
        return;
      }
      this.transportFormVisible = true;

      let params = new FormData();
      params.append("deliveryNo", this.deliveryOrderNos);
      // params.append("keyword", row.customerid);
      // params.append("memberId", this.memberId);
      // params.append("customerId", row.customerid);
      this.axios
        .post(
          process.env.API_ROOT + "/DeliveryOrderApi/v1/findDetailByPageList",
          params
        )
        .then(response => {
          if (!response.data) {
            return;
          }
          if (response.data.status === 200) {
            this.tdgridData = [];
            var tabledata = response.data.data;
            for (var i in tabledata) {
              this.tdgridData.push(tabledata[i]);
            }
            this.carrierSelect();
            // this.warehouseSelect();
            this.message(true, response.data.msg, "success");
          } else {
            this.message(true, response.data.msg, "error");
          }
        });
    },
    checkboxNum(row, rowIndex) {
      if (row.status === "已出库") {
        return false; //禁用
      } else {
        return true; //不禁用
      }
    },
    handleSelectTdWarehouse(item) {
      this.tdruleForm.warehouseName = item.value;
      this.tdruleForm.warehouseId = item.id;
    },
    getTdSummaries(param) {
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
        } else if (index === 9) {
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
          } else if (index === 7) {
            sums[index] += "";
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
    printView(row, type) {
      if (type === 1) {
        this.billVisible = true;
      } else {
        this.exbillVisible = true;
      }
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
    },
    onEditorBlur(editor) {
      this.editor = editor;
    },
    onEditorReady(editor) {
      this.editor = editor;
      this.content = editor.root.innerHTML;
    },
    onEditorFocus(editor) {
      this.editor = editor;
      editor.root.contentEditable = true;
    },
    onEditorChange(editor) {
      this.editor = editor;
      this.currentLength = editor.text.replace("\n", "").length;
      this.content = editor.html;
    },
    carrierShow() {
      let _this = this;
      _this.listLoading = true;
      let params = new FormData();
      params.append("startPage", _this.startPage);
      params.append("pageSize", _this.pageSize);
      params.append("keyword", _this.filters.keyword);
      params.append("memberId", _this.memberId);
      this.axios
        .post(process.env.API_ROOT + "/CarriersApi/v1/findByPage", params)
        .then(response => {
          if (!response.data) {
            _this.listLoading = false;
            return;
          }
          if (response.data && response.data.status === 200) {
            _this.carrierGridData = response.data.data;
            _this.total = response.data.total;
          } else {
            _this.message(true, response.data.msg, "error");
            _this.carrierGridData = [];
          }
          _this.listLoading = false;
        });
      this.carrierVisible = true;
    },
    querytdrulestSearchAsync(queryString, cb) {
      var carrierList = this.carrierList;
      var results = queryString
        ? carrierList.filter(this.createStateFilter(queryString))
        : carrierList;
      if (Object.keys(results).length == 0) {
        this.tpruleFormtransport.carrier = "";
      }
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        cb(results);
      }, 500);
    },
    handleSelecttdrulestWarehouse(item) {
      this.tpruleFormtransport.carrier = item.value;
      this.tpruleFormtransport.id = item.id;
    },
    // arraySpanMethod({ row, column, rowIndex, columnIndex }) {
    //   if (columnIndex === 9) {
    //     row.total = (row.price * row.num * row.weight).toFixed(2);
    //   }
    // },
    // 打印提货单
    printorderSheet() {
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
    handleItemSelectionChange(val) {
      this.selectedIds = [];
      if (val) {
        val.forEach(row => {
          this.selectedIds.push(row.id);
        });
        this.multipleSelection = val;
      }
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
    checkboxDeliveryInit(row, index) {
      if (row.status === "已出库") {
        return 0; //不可勾选
      } else {
        return 1; //可勾选
      }
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
    tansportadd() {
      return this.getHasRule("生成发货单");
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
#pillorderSheet .titleTd {
  line-height: 1px;
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
#deliverorderSheet .tdquill {
  height: 300px;
  width: 1050px;
}
#deliverorderSheet .tdquill .quill-editor {
  height: 250px;
}
.footrightBox .padinglr {
  padding-right: 50px;
}
#pillorderSheet .footeremark .footrightBox p {
  margin: 0;
}
</style>
