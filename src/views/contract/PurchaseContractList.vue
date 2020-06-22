<template>
  <el-row id="purchaseContractList">
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-autocomplete
            v-model="filters.keyword"
            :fetch-suggestions="querySearchAsync"
            placeholder="请输入供应商名称"
            @select="handleSelect1"
          ></el-autocomplete>
          <!-- <el-input v-model="filters.keyword" placeholder="客户名称"></el-input> -->
        </el-form-item>
        <el-form-item>
          <!-- <el-button type="primary" class="el-icon-search" :loading="selLoading"  v-on:click="getContract" v-if="findShow" >查询</el-button> -->
          <el-button
            type="primary"
            class="el-icon-search"
            :loading="selLoading"
            v-on:click="getContract"
          >查询</el-button>
        </el-form-item>
        <el-form-item>
          <!-- <el-button type="success" class="el-icon-plus" @click.native="showDialogForm" v-if="addShow">新增</el-button> -->
          <el-button type="success" class="el-icon-plus" @click.native="showDialogForm">新增</el-button>
        </el-form-item>
        <!-- <el-form-item>
					<el-button type="error" class="el-icon-edit" @click="editContract">编辑</el-button>
        </el-form-item>-->
        <el-form-item>
          <!-- <el-button type="danger" class="el-icon-delete" @click="delContract" v-if="delShow">删除</el-button> -->
          <el-button type="danger" class="el-icon-delete" @click="delContract">删除</el-button>
        </el-form-item>
        <!-- <el-form-item>
					<el-button type="primary" class="el-icon-document" @click="toueditor">销售合同条款</el-button>
        </el-form-item>-->
      </el-form>
    </el-col>
    <el-col>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="全部" name="全部"></el-tab-pane>
        <el-tab-pane label="待审核" name="待审核"></el-tab-pane>
        <el-tab-pane label="已审核" name="已审核"></el-tab-pane>
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
        @selection-change="handleSelectionChange"
        style="width: 100%;"
      >
        <el-table-column type="selection" width="55"></el-table-column>

        <el-table-column prop="id" label="id" sortable fixed="left" v-if="isshow" width="80"></el-table-column>

        <el-table-column
          prop="memberid"
          label="会员id"
          sortable
          fixed="left"
          width="150"
          v-if="isshow"
        ></el-table-column>
        <el-table-column prop="purchasestatus" label="采购单状态" fixed="left" sortable width="150"></el-table-column>
        <el-table-column prop="supplyername" label="供应商名称" sortable fixed="left" width="250"></el-table-column>
        <el-table-column prop="purchaseno" label="采购合同号" sortable width="200"></el-table-column>
        <el-table-column prop="contractno" label="销售合同号" sortable width="150" v-if="isshow"></el-table-column>
        <el-table-column prop="customername" label="客户名称" sortable width="250" v-if="isshow"></el-table-column>
        <el-table-column prop="purchaseweight" label="采购吨位" sortable width="150"></el-table-column>
        <el-table-column prop="purchaseamount" label="采购金额" sortable width="150"></el-table-column>
        <el-table-column prop="payment" label="付款方式" sortable width="150"></el-table-column>
        <el-table-column prop="purchasedate" label="采购日期" sortable width="150">
          <template slot-scope="scope">
            <span>{{scope.row.purchasedate, 'yyyy-MM-dd' | dataFormat}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="crt" label="创建日期" sortable width="200">
          <template slot-scope="scope">
            <span v-show="scope.row.crt!=null">{{scope.row.crt, 'yyyy-MM-dd hh:mm:ss' | dataFormat}}</span>
          </template>
        </el-table-column>

        <el-table-column prop="upt" label="更新日期" sortable width="200">
          <template slot-scope="scope">
            <span v-show="scope.row.upt!=null">{{scope.row.upt, 'yyyy-MM-dd hh:mm:ss'| dataFormat}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createby" label="创建人" sortable width="100"></el-table-column>
        <el-table-column prop="verifyby" label="审核人" sortable width="100"></el-table-column>
        <el-table-column prop="operation" fixed="right" label="操作" width="100">
          <template slot-scope="scope">
            <el-popover trigger="hover" placement="bottom">
              <!-- <div><el-button type="text" size="small" @click='editShow(scope.row)' v-if="detailShow">明细</el-button></div> -->
              <div>
                <el-button
                  v-if=" scope.row.purchasestatus==='待审核'"
                  type="text"
                  size="small"
                  @click="editShow(scope.row)"
                >编辑</el-button>
              </div>
              <div>
                <el-button
                  v-if=" scope.row.purchasestatus==='已审核'"
                  type="text"
                  size="small"
                  @click="editShow(scope.row)"
                >变更</el-button>
              </div>
              <div>
                <el-button
                  v-if=" scope.row.purchasestatus==='已审核'"
                  type="text"
                  size="small"
                  @click="purchaseInstockShow(scope.row)"
                >生成采购入库单</el-button>
              </div>
              <!-- <div><el-button type="text" size="small" @click='printPreview(scope.row)' v-if="printShow">打印预览</el-button></div> -->
              <!-- <div><el-button type="text" size="small" @click='printPreview(scope.row)' >打印预览</el-button></div> -->
              <div>
                <!-- <el-button type="text" v-if="verifyContractShow && (scope.row.contractstatus==='意向合同')" size="small" @click='verify(scope.row)'>审核</el-button> -->
                <el-button
                  type="text"
                  v-if="scope.row.purchasestatus==='待审核'"
                  size="small"
                  @click="verify(scope.row)"
                >审核通过</el-button>
              </div>
              <div>
                <!-- <el-button type="text" size="small" @click='copyContract(scope.row)' v-if="copyContractShow">复制合同</el-button> -->
                <el-button type="text" size="small" @click="copyContract(scope.row)">复制合同</el-button>
              </div>
              <div slot="reference" class="name-wrapper">
                可操作项
                <i class="el-icon-arrow-down el-icon--right"></i>
              </div>
            </el-popover>
          </template>
        </el-table-column>

        <!-- <el-table-column fixed="right" label="操作" width="200">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click='editShow(scope.row)'>明细</el-button>
            <el-button type="text" size="small" @click='editTerm(scope.row)'>条款</el-button>
            <el-button type="text" size="small" @click='printPreview(scope.row)'>打印预览</el-button>
            <el-button type="text" v-if="scope.row.contractstatus==='正式合同'||scope.row.contractstatus==='加工中'" size="small" @click='jgorder(scope.row)'>生成加工单</el-button>
            <el-button type="text" v-if="scope.row.contractstatus==='正式合同'" size="small" @click='tdorder(scope.row)'>生成提单</el-button>
            <el-button type="text" v-if="scope.row.contractstatus==='意向合同'" size="small" @click='verify(scope.row)'>审核</el-button>
          </template>
        </el-table-column>-->
      </el-table>
    </el-col>
    <el-col :span="2">
      <el-dialog
        :title="thistitle"
        :visible.sync="puchaseinstockVisible"
        width="1250px"
        :append-to-body="true"
      >
        <div>
          <el-form
            :model="puchaseinstockForm"
            status-icon
            ref="puchaseinstockForm"
            :inline="true"
            label-width="100px"
            class="demo-form-inline"
          >
            <el-col :span="6">
              <el-form-item label="采购合同号" prop="purchaseno">
                <span>{{puchaseinstockForm.purchaseno}}</span>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="供应商名称" prop="supplyername">
                <span>{{puchaseinstockForm.supplyername}}</span>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="采购日期" prop="purchasedate">
                <span>{{puchaseinstockForm.purchasedate, 'yyyy-MM-dd' | dataFormat}}</span>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="付款方式" prop="payment">
                <span>{{puchaseinstockForm.payment}}</span>
                <!-- <el-select class="autoinputwidth" v-model="supplyerForm.payment" placeholder="请选择">
                  <el-option label="电汇" value="电汇"></el-option>
                  <el-option label="支票" value="支票"></el-option>
                  <el-option label="承兑" value="承兑"></el-option>
                </el-select>-->
              </el-form-item>
            </el-col>
            <el-form-item label="采购合同明细">
              <el-table
                style="width:1100px"
                :data="purchaseContractGridData"
                max-height="500"
                show-summary
                class="el-tb-edit"
                ref="purchaseContractGridTable"
                highlight-current-row
                :summary-method="getpurchaseSummaries"
              >
                <!-- :summary-method="getpurchaseSummaries" -->
                <!-- <el-table-column property="status" label="状态" width="100">
                  <template slot-scope="scope">
                    <span>{{scope.row.status}}</span>
                  </template>
                </el-table-column>-->

                <el-table-column property="productname" label="名称" width="200">
                  <template slot-scope="scope">
                    <span>{{scope.row.productname}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productspec" label="规格" width="200">
                  <template slot-scope="scope">
                    <span>{{scope.row.productspec}}</span>
                  </template>
                </el-table-column>
                <!-- <el-table-column property="packingno" label="捆包号" width="200">
                  <template slot-scope="scope">
                    <span>{{scope.row.packingno}}</span>
                  </template>
                </el-table-column>-->
                <el-table-column property="productfactory" label="钢厂" width="150">
                  <template slot-scope="scope">
                    <span>{{scope.row.productfactory}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productmark" label="材质" width="150">
                  <template slot-scope="scope">
                    <span>{{scope.row.productmark}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="unit" label="单位" width="100">
                  <template slot-scope="scope">
                    <span>{{scope.row.unit}}</span>
                  </template>
                </el-table-column>

                <el-table-column property="price" label="单价(元)" width="100">
                  <template slot-scope="scope">
                    <span>{{scope.row.price}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="weight" label="采购重量(吨)" width="150">
                  <template slot-scope="scope">
                    <span>{{scope.row.weight}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="instockweight" label="入库重量(吨)" width="150">
                  <template slot-scope="scope">
                    <span>{{scope.row.instockweight}}</span>
                  </template>
                </el-table-column>

                <el-table-column property="num" label="采购数量" width="80">
                  <template slot-scope="scope">
                    <span>{{scope.row.num}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="instocknum" label="入库数量" width="80">
                  <template slot-scope="scope">
                    <span>{{scope.row.instocknum}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="totalamount" label="采购合计(元)" width="150">
                  <template slot-scope="scope">
                    <span>{{scope.row.totalamount}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="instocktotalamount" label="入库合计(元)" width="150">
                  <template slot-scope="scope">
                    <span>{{scope.row.instocktotalamount}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="stockouttype" label="出库方式" width="150">
                  <template slot-scope="scope">
                    <span>{{scope.row.stockouttype}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="quality" label="品级" width="150">
                  <template slot-scope="scope">
                    <span>{{scope.row.quality}}</span>
                  </template>
                </el-table-column>

                <el-table-column fixed="right" label="操作" width="120">
                  <template slot-scope="scope" v-if="scope.row.status!=='在库'">
                    <el-button
                      @click.native.prevent="addpruchaseinstockRow(scope.row)"
                      type="text"
                      size="small"
                    >入库</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>

            <el-form-item label="入库明细">
              <el-table
                style="width:1100px"
                :data="instockGridData"
                max-height="500"
                show-summary
                :summary-method="getinstockSummaries"
                class="el-tb-edit"
                ref="instockGridTable"
                highlight-current-row
                :span-method="instockarraySpanMethod"
              >
                <!-- :summary-method="getpurchaseSummaries" -->
                <!-- <el-table-column property="status" label="状态" width="100">
                  <template slot-scope="scope">
                    <span>{{scope.row.status}}</span>
                  </template>
                </el-table-column>-->

                <el-table-column property="productname" label="名称" width="200">
                  <template slot-scope="scope">
                    <span>{{scope.row.productname}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productspec" label="规格" width="200">
                  <template slot-scope="scope">
                    <span>{{scope.row.productspec}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productfactory" label="钢厂" width="150">
                  <template slot-scope="scope">
                    <span>{{scope.row.productfactory}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productmark" label="材质" width="150">
                  <template slot-scope="scope">
                    <span>{{scope.row.productmark}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="packingno" label="捆包号" width="200">
                  <template slot-scope="scope">
                    <el-input size="mini" v-model="scope.row.packingno" placeholder="请输入内容"></el-input>
                  </template>
                </el-table-column>
                <el-table-column property="unit" label="单位" width="100">
                  <template slot-scope="scope">
                    <span>{{scope.row.unit}}</span>
                  </template>
                </el-table-column>

                <el-table-column property="price" label="单价(元)" width="100">
                  <template slot-scope="scope">
                    <span>{{scope.row.price}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="weight" label="入库重量(吨)" width="150">
                  <template slot-scope="scope">
                    <el-input size="mini" v-model="scope.row.weight" placeholder="请输入内容"></el-input>
                  </template>
                </el-table-column>
                <el-table-column property="num" label="入库数量" width="80">
                  <template slot-scope="scope">
                    <el-input size="mini" v-model="scope.row.num" placeholder="请输入内容"></el-input>
                  </template>
                </el-table-column>
                <el-table-column property="total" label="入库合计(元)" width="150">
                  <template slot-scope="scope">
                    <span>{{scope.row.total}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="warehousename" label="所在仓库" width="160">
                  <template slot-scope="scope">
                    <el-autocomplete
                      class="autoInputwidth"
                      v-model="scope.row.warehousename"
                      :fetch-suggestions="querySaleContractWarehouseSearchAsync"
                      placeholder="请输入仓库名称"
                    >
                      <template slot-scope="{ item }">
                        <div class="name">{{ item.value }}</div>
                        <span hidden>{{ item.id }}</span>
                        <el-tooltip content="删除后重新点击输入框刷新" placement="bottom" effect="light">
                          <span class="addr" @click.stop="delSaleContractWarehouse(item.id)">删除</span>
                        </el-tooltip>
                      </template>
                    </el-autocomplete>
                  </template>
                </el-table-column>
                <el-table-column property="stockouttype" label="出库方式" width="150">
                  <template slot-scope="scope">
                    <span>{{scope.row.stockouttype}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="quality" label="品级" width="150">
                  <template slot-scope="scope">
                    <span>{{scope.row.quality}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="remark" label="备注" width="200">
                  <template slot-scope="scope">
                    <el-input size="mini" v-model="scope.row.remark" placeholder="请输入内容"></el-input>
                  </template>
                </el-table-column>
                <el-table-column fixed="right" label="操作" width="120">
                  <template slot-scope="scope">
                    <el-button
                      @click.native.prevent="delinstockRow(scope.row,instockGridData)"
                      type="text"
                      size="small"
                    >移除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </el-form>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="closeDialog('puchaseinstockForm')">取 消</el-button>

          <el-button>保存</el-button>
        </div>
      </el-dialog>
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
      <el-dialog :title="thistitle" :visible.sync="supplyDialogFormVisible" width="1250px">
        <div>
          <el-form
            :model="supplyerForm"
            status-icon
            :rules="rules"
            ref="supplyerForm"
            :inline="true"
            label-width="100px"
            class="demo-form-inline"
          >
            <el-col :span="7">
              <el-form-item label="供应商名称" prop="supplyername">
                <el-autocomplete
                  v-model="supplyerForm.supplyername"
                  :fetch-suggestions="querySearchAsync"
                  placeholder="请输入客户名称"
                  @select="handleSelect"
                  class="autoinputwidth"
                ></el-autocomplete>
              </el-form-item>
            </el-col>
            <el-col :span="3">
              <el-form-item>
                <el-button type="text" size="small" @click="supplyerShow">供应商管理</el-button>
              </el-form-item>
            </el-col>
            <el-col :span="7">
              <el-form-item label="采购日期" prop="purchasedate">
                <el-date-picker
                  class="autoinputwidth"
                  v-model="supplyerForm.purchasedate"
                  type="date"
                  placeholder="选择日期"
                ></el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="7">
              <el-form-item label="付款方式" prop="payment">
                <el-select class="autoinputwidth" v-model="supplyerForm.payment" placeholder="请选择">
                  <el-option label="电汇" value="电汇"></el-option>
                  <el-option label="支票" value="支票"></el-option>
                  <el-option label="承兑" value="承兑"></el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="附加条款" prop="remark">
                <el-input
                  :rows="10"
                  style="width:500px"
                  maxlength="200"
                  show-word-limit
                  type="textarea"
                  placeholder="请输入备注"
                  auto-complete="off"
                  v-model="supplyerForm.remark"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-form-item label="商品明细">
              <el-button
                v-if="supplyerForm.purchasestatus==='待审核'||supplyerForm.purchasestatus===''"
                size="mini"
                @click="addRow()"
              >+</el-button>
              <el-table
                style="width:1100px"
                :data="productGridData"
                max-height="500"
                :span-method="arraySpanMethod"
                show-summary
                :summary-method="getSummaries"
                class="el-tb-edit"
                ref="gridTable"
                highlight-current-row
              >
                <el-table-column property="status" label="状态" width="100">
                  <template slot-scope="scope">
                    <span>{{scope.row.status}}</span>
                  </template>
                </el-table-column>

                <el-table-column property="productname" label="名称" width="200">
                  <template slot-scope="scope">
                    <!-- <el-input v-if="scope.row.status!=='在库'" size="mini" v-model="scope.row.productname" placeholder="请输入内容" ></el-input> -->
                    <el-autocomplete
                      class="autoInputwidth"
                      v-model="scope.row.productname"
                      v-if="scope.row.status!=='在库'||scope.row.status==undefined"
                      :fetch-suggestions="queryProductNameSearchAsync"
                      placeholder="请输入商品名称"
                    >
                      <template slot-scope="{ item }">
                        <div class="name">{{ item.value }}</div>
                        <span hidden>{{ item.id }}</span>
                        <el-tooltip content="删除后重新点击输入框刷新" placement="bottom" effect="light">
                          <span class="addr" @click.stop="delProductname(item.id)">删除</span>
                        </el-tooltip>
                      </template>
                    </el-autocomplete>
                    <span>{{scope.row.productname}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productspec" label="规格" width="200">
                  <template slot-scope="scope">
                    <!-- <el-input size="mini" v-if="scope.row.status!=='在库'" v-model="scope.row.productspec" placeholder="请输入内容"></el-input> -->
                    <el-autocomplete
                      class="autoInputwidth"
                      v-model="scope.row.productspec"
                      v-if="scope.row.status!=='在库'||scope.row.status==undefined"
                      :fetch-suggestions="queryProductspecSearchAsync"
                      placeholder="请输入商品规格"
                    >
                      <template slot-scope="{ item }">
                        <div class="name">{{ item.value }}</div>
                        <span hidden>{{ item.id }}</span>
                        <el-tooltip content="删除后重新点击输入框刷新" placement="bottom" effect="light">
                          <span class="addr" @click.stop="delProductspec(item.id)">删除</span>
                        </el-tooltip>
                      </template>
                    </el-autocomplete>
                    <span>{{scope.row.productspec}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productfactory" label="钢厂" width="150">
                  <template slot-scope="scope">
                    <!-- <el-input size="mini" v-if="scope.row.status!=='在库'" v-model="scope.row.productfactory" placeholder="请输入内容" ></el-input> -->
                    <el-autocomplete
                      class="autoInputwidth"
                      v-model="scope.row.productfactory"
                      v-if="scope.row.status!=='在库'||scope.row.status==undefined"
                      :fetch-suggestions="queryProductfactorySearchAsync"
                      placeholder="请输入钢厂"
                    >
                      <template slot-scope="{ item }">
                        <div class="name">{{ item.value }}</div>
                        <span hidden>{{ item.id }}</span>
                        <el-tooltip content="删除后重新点击输入框刷新" placement="bottom" effect="light">
                          <span class="addr" @click.stop="delProductfactory(item.id)">删除</span>
                        </el-tooltip>
                      </template>
                    </el-autocomplete>
                    <span>{{scope.row.productfactory}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productmark" label="材质" width="150">
                  <template slot-scope="scope">
                    <!-- <el-input size="mini" v-if="scope.row.status!=='在库'" v-model="scope.row.productmark" placeholder="请输入内容" ></el-input> -->
                    <el-autocomplete
                      class="autoInputwidth"
                      v-model="scope.row.productmark"
                      v-if="scope.row.status!=='在库'||scope.row.status==undefined"
                      :fetch-suggestions="queryProductmarkSearchAsync"
                      placeholder="请输入商品材质"
                    >
                      <template slot-scope="{ item }">
                        <div class="name">{{ item.value }}</div>
                        <span hidden>{{ item.id }}</span>
                        <el-tooltip content="删除后重新点击输入框刷新" placement="bottom" effect="light">
                          <span class="addr" @click.stop="delProductmark(item.id)">删除</span>
                        </el-tooltip>
                      </template>
                    </el-autocomplete>
                    <span>{{scope.row.productmark}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="weight" label="重量(吨)" width="120">
                  <template slot-scope="scope">
                    <el-input
                      size="mini"
                      v-if="scope.row.status!=='在库'"
                      v-model="scope.row.weight"
                      placeholder="请输入内容"
                    ></el-input>
                    <span>{{scope.row.weight}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="price" label="单价(元)" width="100">
                  <template slot-scope="scope">
                    <el-input
                      size="mini"
                      v-if="scope.row.status!=='在库'"
                      v-model="scope.row.price"
                      placeholder="请输入内容"
                    ></el-input>
                    <span>{{scope.row.price}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="unit" label="单位" width="100">
                  <template slot-scope="scope">
                    <el-select
                      size="mini"
                      v-if="scope.row.status!=='在库'"
                      class="inputwidth"
                      v-model="scope.row.unit"
                      placeholder="请选择"
                    >
                      <el-option label="件" value="件"></el-option>
                      <el-option label="支" value="支"></el-option>
                      <el-option label="张" value="张"></el-option>
                    </el-select>
                    <span>{{scope.row.unit}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="num" label="数量" width="80">
                  <template slot-scope="scope">
                    <el-input
                      size="mini"
                      v-if="scope.row.status!=='在库'"
                      v-model="scope.row.num"
                      placeholder="请输入内容"
                    ></el-input>
                    <span>{{scope.row.num}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="total" label="合计(元)" width="150">
                  <template slot-scope="scope">
                    <span>{{scope.row.total}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="warehousename" label="所在仓库" width="200">
                  <template slot-scope="scope">
                    <el-autocomplete
                      class="autoInputwidth"
                      v-model="scope.row.warehousename"
                      v-if="scope.row.status!=='在库'||scope.row.status==undefined"
                      :fetch-suggestions="querySaleContractWarehouseSearchAsync"
                      placeholder="请输入仓库名称"
                    >
                      <template slot-scope="{ item }">
                        <div class="name">{{ item.value }}</div>
                        <span hidden>{{ item.id }}</span>
                        <el-tooltip content="删除后重新点击输入框刷新" placement="bottom" effect="light">
                          <span class="addr" @click.stop="delSaleContractWarehouse(item.id)">删除</span>
                        </el-tooltip>
                      </template>
                    </el-autocomplete>
                    <span>{{scope.row.warehousename}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="stockouttype" label="出库方式" width="150">
                  <template slot-scope="scope">
                    <el-select
                      size="mini"
                      v-if="scope.row.status!=='在库'"
                      class="inputwidth"
                      v-model="scope.row.stockouttype"
                      placeholder="请选择"
                    >
                      <el-option label="过磅" value="过磅"></el-option>
                      <el-option label="理算" value="理算"></el-option>
                      <el-option label="抄码" value="抄码"></el-option>
                    </el-select>
                    <span>{{scope.row.stockouttype}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="quality" label="品级" width="150">
                  <template slot-scope="scope">
                    <el-select
                      size="mini"
                      v-if="scope.row.status!=='在库'"
                      class="inputwidth"
                      v-model="scope.row.quality"
                      placeholder="请选择"
                    >
                      <el-option label="合格品" value="合格品"></el-option>
                      <el-option label="协议品" value="协议品"></el-option>
                    </el-select>
                    <span>{{scope.row.quality}}</span>
                  </template>
                </el-table-column>

                <el-table-column fixed="right" label="操作" width="120">
                  <template slot-scope="scope" v-if="scope.row.status!=='在库'">
                    <el-button
                      @click.native.prevent="deleteRow(scope.$index, productGridData)"
                      type="text"
                      size="small"
                    >移除</el-button>
                    <el-button
                      @click.native.prevent="copyRow(scope.row)"
                      type="text"
                      size="small"
                    >复制</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </el-form>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="closeDialog('supplyerForm')">取 消</el-button>
          <!-- <el-button @click="resetForm('supplyerForm')">重置</el-button> -->
          <el-button type="primary" @click="submitForm('supplyerForm')">确 定</el-button>
        </div>
      </el-dialog>
    </el-col>

    <el-col :span="2">
      <el-dialog title="供应商管理" :visible.sync="supplyerVisible">
        <div>
          <el-button size="mini" @click="addsupplyRow()">+</el-button>
          <el-table
            style="width:1000px"
            :data="supplyerGridData"
            max-height="500"
            :span-method="arraySpanMethod"
            class="el-tb-edit"
            ref="supplyerGridData"
            highlight-current-row
          >
            <el-table-column prop="id" label="id" sortable fixed="left" width="80"></el-table-column>
            <el-table-column property="supplyername" label="供应商名称" width="200">
              <template slot-scope="scope">
                <el-input size="mini" v-model="scope.row.supplyername" placeholder="请输入内容"></el-input>
                <span>{{scope.row.supplyername}}</span>
              </template>
            </el-table-column>
            <el-table-column property="supplyerphone" label="供应商电话" width="200">
              <template slot-scope="scope">
                <el-input size="mini" v-model="scope.row.supplyerphone" placeholder="请输入内容"></el-input>
                <span>{{scope.row.supplyerphone}}</span>
              </template>
            </el-table-column>
            <el-table-column property="supplyeraddress" label="供应商地址" width="280">
              <template slot-scope="scope">
                <el-input size="mini" v-model="scope.row.supplyeraddress" placeholder="请输入内容"></el-input>
                <span>{{scope.row.supplyeraddress}}</span>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="120">
              <template slot-scope="scope">
                <el-button
                  @click.native.prevent="deleteSupplyerRow(scope.row,scope.$index, supplyerGridData)"
                  type="text"
                  size="small"
                >移除</el-button>
                <el-button
                  @click.native.prevent="saveSupplyerRow(scope.row)"
                  type="text"
                  size="small"
                >保存</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-dialog>
    </el-col>
  </el-row>
</template>

<script>
//   import http from '../../utils/http'

export default {
  data() {
    return {
      activeName: "全部",
      thistitle: "新增合同",
      filters: {
        keyword: ""
      },
      statusTab: "",
      value: "",
      supplyerForm: {
        id: "",
        contractno: "",
        purchaseno: "",
        memberId: "",
        customername: "",
        purchaseweight: "",
        purchaseamount: "",
        purchasedate: "",
        payment: "",
        remark: "",
        purchasestatus: ""
      },

      puchaseinstockForm: {
        id: "",
        contractno: "",
        purchaseno: "",
        memberId: "",
        supplyername: "",
        purchaseweight: "",
        purchaseamount: "",
        instockweight: "",
        instockamount: "",
        instockdate: "",
        payment: "",
        remark: "",
        purchasestatus: ""
      },
      // purchaseStatus: false,
      puchaseinstockVisible: false,
      supplyerVisible: false,
      customerList: [],
      timeout: null,
      productGridData: [],
      supplyerGridData: [],
      purchaseContractGridData: [],
      instockGridData: [],
      contractData: [],
      multipleSelection: "",
      pageSizes: [15, 50, 80, 100],
      startPage: 1,
      pageSize: 15,
      total: 0,
      purchaseContracts: [],
      page: 1,
      listLoading: false,
      selLoading: false,
      supplyDialogFormVisible: false,
      formLabelWidth: "120px",
      currentRow: null,
      totalWeight: 0,
      instocktotalWeight: 0,
      instocktotalNum: 0,
      totalNum: 0,
      totalAmount: 0,
      instocktotalAmount: 0,
      contractWeight: 0,
      contractAmount: 0,
      contactIds: [],
      selectedIds: [],
      contractNos: [],
      isshow: false,

      // 表单验证
      rules: {
        supplyername: [
          { required: true, message: "请选择供应商", trigger: "change" }
        ],
        purchasedate: [
          { required: true, message: "请选择采购日期", trigger: "change" }
        ],
        payment: [
          { required: true, message: "请选择付款款式", trigger: "change" }
        ]
        // depositdate: [
        //   { required: true, message: "请选择预付日期", trigger: "change" }
        // ],
        // percent: [
        //   {
        //     required: true,
        //     message: "请输入适当的百分比数字",
        //     trigger: "change"
        //   }
        // ]
      },
      maxLength: 5000,
      termEditForm: {},
      uploadUrl: "",
      name: "base-example",
      content: "",
      htmlContent: "",
      editorOption: {
        modules: {
          toolbar: "#toolbar"
        }
      },
      theme: "snow",
      heights: document.documentElement.clientHeight - 200,
      currentLength: "",
      leftLength: "",
      memberId: "",
      id: "",
      usr: "",
      termFormVisible: false,
      companyName: "",
      contractNo: "",
      contractVisible: false,
      saleContractbox: {},
      informationdata: {}, // 供方
      customerdata: {}, //需方
      contractdate: "",
      deliverydate: "",
      depositdate: "",
      percentShow: false,
      dateObj: {
        startTime: "",
        endTime: ""
      }
    };
  },

  methods: {
    handleClick(tab, event) {
      this.statusTab = tab.name;
      this.getContract();
    },
    addsupplyRow() {
      var d = {
        supplyername: "",
        supplyerphone: "",
        supplyeraddress: ""
      };
      this.supplyerGridData.push(d);
      setTimeout(() => {
        this.$refs.supplyerGridData.setCurrentRow(d);
      }, 10);
    },
    saveSupplyerRow(row) {
      let _this = this;
      let params = new FormData();
      if (row.id !== undefined) {
        params.append("id", row.id);
      }
      params.append("supplyername", row.supplyername);
      params.append("supplyerphone", row.supplyerphone);
      params.append("supplyeraddress", row.supplyeraddress);
      params.append("memberid", _this.memberId);
      this.axios
        .post(
          process.env.API_ROOT + "/PurchaseContractApi/v1/saveSupplyer",
          params
        )
        .then(response => {
          if (!response.data) {
            _this.listLoading = false;
            return;
          }
          if (response.data && response.data.status === 200) {
            this.message(true, response.data.msg, "success");
            _this.supplyerSelect();
            _this.supplyerVisible = false;
          } else {
            _this.message(true, response.data.msg, "error");
            _this.supplyerGridData = [];
          }
          _this.listLoading = false;
        });
    },
    closeDialog(formName) {
      if (formName === "supplyerForm") {
        this.supplyDialogFormVisible = false;
      } else if (formName === "termRuleForm") {
        this.termFormVisible = false;
      } else if (formName === "jgruleForm") {
        this.jgdialogFormVisible = false;
      } else if (formName === "tdruleForm") {
        this.tddialogFormVisible = false;
      } else if (formName === "puchaseinstockForm") {
        this.puchaseinstockVisible = false;
      }

      this.$refs[formName].resetFields();
    },

    //删除行
    deleteRow(index, rows) {
      rows.splice(index, 1);
    },

    deleteSupplyerRow(row, index, rows) {
      this.$confirm("此操作将永久删除该仓库, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "error"
      })
        .then(() => {
          this.delSupplyerRow(row);
          rows.splice(index, 1);
        })
        .catch(() => {
          this.message(true, "已取消删除", "error");
        });
    },
    delSupplyerRow(row) {
      let _this = this;
      let params = new FormData();
      params.append("id", row.id);
      this.axios
        .post(
          process.env.API_ROOT + "/PurchaseContractApi/v1/delSupplyerRow",
          params
        )
        .then(response => {
          if (!response.data) {
            _this.listLoading = false;
            return;
          }
          if (response.data && response.data.status === 200) {
            _this.message(true, response.data.msg, "success");
            _this.supplyerSelect();
          } else {
            _this.message(true, response.data.msg, "error");
          }
          _this.listLoading = false;
        })
        .catch(err => {
          console.log(err);
        });
    },
    delinstockRow(index, rows) {
      rows.splice(index, 1);
    },
    handleCurrentChange(val) {
      this.currentRow = val;
    },
    copyContract(row) {
      let _this = this;
      let params = new FormData();
      params.append("contractno", row.purchaseno);
      this.axios
        .post(
          process.env.API_ROOT + "/PurchaseContractApi/v1/copyContract",
          params
        )
        .then(response => {
          if (!response.data) {
            _this.listLoading = false;
            return;
          }
          if (response.data && response.data.status === 200) {
            _this.message(true, response.data.msg, "success");
            _this.getContract();
          } else {
            _this.message(true, response.data.msg, "error");
          }
          _this.listLoading = false;
        })
        .catch(err => {
          console.log(err);
        });
    },
    copyRow(row) {
      let d = {
        productname: row.productname,
        productspec: row.productspec,
        productfactory: row.productfactory,
        productmark: row.productmark,
        weight: row.weight,
        price: row.price,
        unit: row.unit,
        num: row.num,
        total: row.total,
        warehousename: row.warehousename,
        stockouttype: row.stockouttype,
        quality: row.quality
      };
      this.productGridData.push(d);
      setTimeout(() => {
        this.$refs.gridTable.setCurrentRow(d);
      }, 10);
    },
    copyTdRow(row) {
      let d = {
        id: null,
        deliverystatus: "",
        productname: row.productname,
        productspec: row.productspec,
        productfactory: row.productfactory,
        productmark: row.productmark,
        weight: "0",
        actualweight: "",
        price: row.price,
        unit: row.unit,
        num: row.num,
        remark: row.remark
      };
      this.tdgridData.push(d);
      setTimeout(() => {
        this.$refs.tdgridTable.setCurrentRow(d);
      }, 10);
    },
    addRow() {
      let d = {
        productname: "",
        productspec: "",
        productfactory: "",
        productmark: "",
        weight: "",
        price: "",
        unit: "件",
        num: "1",
        total: "",
        stockouttype: "过磅",
        quality: "合格品"
      };
      this.productGridData.push(d);
      setTimeout(() => {
        this.$refs.gridTable.setCurrentRow(d);
      }, 10);
    },
    addpruchaseinstockRow(row) {
      let d = {
        productname: row.productname,
        productspec: row.productspec,
        productfactory: row.productfactory,
        productmark: row.productmark,
        weight: row.weight,
        price: row.price,
        unit: row.unit,
        num: row.num,
        stockouttype: row.stockouttype,
        quality: row.quality
      };
      this.instockGridData.push(d);
      setTimeout(() => {
        this.$refs.instockGridTable.setCurrentRow(d);
      }, 10);
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
      params.append("statusTab", _this.statusTab);
      this.axios
        .post(
          process.env.API_ROOT +
            "/PurchaseContractApi/v1/findPurchaseContractByPage",
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
    // 表单提交
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          for (let i = 0; i < this.productGridData.length; i++) {
            let item = this.productGridData[i];
            if (item.productname === "") {
              this.$message("名称不能为空");
              return;
            }
            if (item.productname.length > 20) {
              this.$message("名称字数不能超过20个字符");
              return;
            }
            if (item.productspec === "") {
              this.$message("规格不能为空");
              return;
            }
            if (item.productspec.length > 20) {
              this.$message("规格字数不能超过20个字符");
              return;
            }
            if (item.productfactory === "") {
              this.$message("钢厂不能为空");
              return;
            }
            if (item.productfactory.length > 20) {
              this.$message("钢厂字数不能超过20个字符");
              return;
            }
            if (item.productmark === "") {
              this.$message("材质不能为空");
              return;
            }
            if (item.productmark.length > 20) {
              this.$message("材质字数不能超过20个字符");
              return;
            }
            if (item.productmark === "") {
              this.$message("材质不能为空");
              return;
            }
            if (item.weight === "") {
              this.$message("重量不能为空");
              return;
            }
            if (!/^[1-9]\d*\,\d*|[1-9]\d*$/.test(item.weight)) {
              this.$message("重量只能为数字");
              return;
            }
            if (item.weight.length > 9) {
              this.$message("重量字数不能超过9个字符");
              return;
            }
            if (item.price === "") {
              this.$message("单价不能为空");
              return;
            }
            if (!/^[1-9]\d*\,\d*|[1-9]\d*$/.test(item.price)) {
              this.$message("单价只能为数字");
              return;
            }
            if (item.price.length > 9) {
              this.$message("单价字数不能超过9个字符");
              return;
            }
            if (item.num === "") {
              this.$message("数量字数不能为空");
              return;
            }
            if (!/^[1-9]\d*\,\d*|[1-9]\d*$/.test(item.num)) {
              this.$message("数量只能为数字");
              return;
            }
            if (item.num.length > 9) {
              this.$message("数量字数不能超过9个字符");
              return;
            }
          }
          this.addContract();
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    supplyerSelect() {
      let params = new FormData();
      let memberId = this.memberId;
      params.append("memberId", memberId);
      this.axios
        .post(
          process.env.API_ROOT + "/PurchaseContractApi/v1/findSupplyerByNoPage",
          params
        )
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
    supplyerShow() {
      let _this = this;
      _this.listLoading = true;
      let params = new FormData();
      params.append("startPage", _this.startPage);
      params.append("pageSize", _this.pageSize);
      params.append("keyword", _this.filters.keyword);
      params.append("memberId", _this.memberId);
      this.axios
        .post(
          process.env.API_ROOT + "/PurchaseContractApi/v1/findSupplyerByPage",
          params
        )
        .then(response => {
          if (!response.data) {
            _this.listLoading = false;
            return;
          }
          if (response.data && response.data.status === 200) {
            _this.supplyerGridData = response.data.data;
            _this.total = response.data.total;
          } else {
            _this.message(true, response.data.msg, "error");
            _this.supplyerGridData = [];
          }
          _this.listLoading = false;
        });
      this.supplyerVisible = true;
    },
    purchaseInstockShow(row) {
      this.puchaseinstockVisible = true;
      this.thistitle = "新增采购入库单";
      this.puchaseinstockForm.id = row.id;
      this.puchaseinstockForm.purchaseno = row.purchaseno;
      this.puchaseinstockForm.supplyername = row.supplyername;
      this.puchaseinstockForm.purchaseweight = row.purchaseweight;
      this.puchaseinstockForm.purchaseamount = row.purchaseamount;
      this.puchaseinstockForm.purchasedate = row.purchasedate;
      this.puchaseinstockForm.payment = row.payment;
      this.puchaseinstockForm.remark = row.remark;
      this.puchaseinstockForm.purchasestatus = row.purchasestatus;
      if (this.purchaseContractGridData.length > 0) {
        this.purchaseContractGridData = [];
      }
      let params = new FormData();
      params.append("keyword", row.contractno);
      params.append("memberId", this.memberId);
      params.append("purchaseno", row.purchaseno);
      this.axios
        .post(
          process.env.API_ROOT +
            "/PurchaseContractApi/v1/findPurchaseContractDetailByPage",
          params
        )
        .then(response => {
          if (!response.data) {
            return;
          }
          if (response.data.status === 200) {
            this.findSaleContractWarehouse();
            this.purchaseContractGridData = [];
            var tabledata = response.data.data.purchaseContractDetail;
            for (var i in tabledata) {
              this.purchaseContractGridData.push(tabledata[i]);
            }
            this.message(true, response.data.msg, "success");
          } else {
            this.message(true, response.data.msg, "error");
          }
        });
    },
    arraySpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 8) {
        row.total = (row.price * row.weight).toFixed(2);
      }
    },
    instockarraySpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 9) {
        row.total = (row.price * row.weight).toFixed(2);
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
          if (index === 8) {
            sums[index] += "";
          } else if (index === 5) {
            sums[index] = sums[index].toFixed(3);
            this.totalWeight = sums[index];
            sums[index] += "吨";
          } else {
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
    getpurchaseSummaries(param) {
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
        } else if (index === 5) {
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
          if (index === 6) {
            sums[index] = sums[index].toFixed(5);
            this.totalWeight = sums[index];
            sums[index] += "吨";
          } else if (index === 7) {
            sums[index] = sums[index].toFixed(5);
            this.instocktotalWeight = sums[index];
            sums[index] += "吨";
          } else if (index === 8) {
            this.totalNum = sums[index];
            sums[index] += "";
          } else if (index === 9) {
            this.instocktotalNum = sums[index];
            sums[index] += "";
          } else if (index === 10) {
            sums[index] = sums[index].toFixed(2);
            this.totalAmount = sums[index];
            sums[index] += "元";
          } else if (index === 11) {
            sums[index] = sums[index].toFixed(2);
            this.instocktotalAmount = sums[index];
            sums[index] += "元";
          } else {
          }
        } else {
          sums[index] = "";
        }
      });
      return sums;
    },

    getinstockSummaries(param) {
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
        } else if (index === 5) {
          sums[index] = "";
          return;
        } else if (index === 6) {
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
          if (index === 7) {
            sums[index] = sums[index].toFixed(5);
            this.instocktotalWeight = sums[index];
            sums[index] += "吨";
          } else if (index === 8) {
            this.instocktotalNum = sums[index];
            sums[index] += "";
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
    // 显示打印模板
    printsave() {
      var dom = document.getElementById("contractbox");
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
    // 打印模板的合并
    contractSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 6) {
        row.total = (row.price * row.weight).toFixed(2);
      }
    },

    // 重置
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    // 显示添加合同窗口
    showDialogForm() {
      this.thistitle = "新增采购合同";
      this.supplyDialogFormVisible = true;
      this.supplyerForm.id = "";
      this.supplyerForm.purchaseno = "";
      this.supplyerForm.customername = "";
      this.supplyerForm.purchaseweight = "";
      this.supplyerForm.purchaseamount = "";
      this.supplyerForm.purchasedate = "";
      this.supplyerForm.payment = "";
      this.supplyerForm.remark = "";
      this.supplyerForm.purchasestatus = "";
      if (this.productGridData.length > 0) {
        this.productGridData = [];
      }

      this.supplyerSelect();
      this.findProduct();
      this.findProductSpec();
      this.findProductFactory();
      this.findProductMark();
      this.findSaleContractWarehouse();
    },
    //搜索产品接口
    findProduct() {
      let params = new FormData();

      params.append("memberId", this.memberId);

      //读取接口
      this.axios
        .post(process.env.API_ROOT + "/SaleContractApi/v1/findProduct", params)
        .then(res => {
          if (res.data.status === 200) {
            let productListData = res.data.data.productList;
            this.productNameList = [];
            for (let lproduct of productListData) {
              if (lproduct.productname != null) {
                let jsonproduct = {
                  value: lproduct.productname,
                  id: lproduct.id
                };
                this.productNameList.push(jsonproduct);
              }
            }
          }
        });
    },
    //读取产品规格接口
    findProductSpec() {
      let params = new FormData();
      params.append("memberId", this.memberId);
      this.axios
        .post(
          process.env.API_ROOT + "/SaleContractApi/v1/findProductSpec",
          params
        )
        .then(res => {
          if (res.data.status === 200) {
            let productspecListData = res.data.data.productspecList;
            this.productspecList = [];
            for (let lproductspec of productspecListData) {
              if (lproductspec.specname != null) {
                let jsonproductspec = {
                  value: lproductspec.specname,
                  id: lproductspec.id
                };
                this.productspecList.push(jsonproductspec);
              }
            }
          }
        });
      return;
    },
    //读取产品厂家接口
    findProductFactory() {
      let params = new FormData();
      params.append("memberId", this.memberId);
      //删除成功走读取接口
      this.axios
        .post(
          process.env.API_ROOT + "/SaleContractApi/v1/findProductfactory",
          params
        )
        .then(res => {
          if (res.data.status === 200) {
            let productfactoryListData = res.data.data.productfactoryList;
            this.productfactoryList = [];
            for (let lproductfactory of productfactoryListData) {
              if (lproductfactory.factoryname != null) {
                let jsonproductfactory = {
                  value: lproductfactory.factoryname,
                  id: lproductfactory.id
                };
                this.productfactoryList.push(jsonproductfactory);
              }
            }
          }
        });
      return;
    },
    //读取产品牌号
    findProductMark() {
      let params = new FormData();
      params.append("memberId", this.memberId);
      //删除成功走读取接口
      this.axios
        .post(
          process.env.API_ROOT + "/SaleContractApi/v1/findProductmark",
          params
        )
        .then(res => {
          if (res.data.status === 200) {
            let productmarkListData = res.data.data.productmarkList;
            this.productmarkList = [];
            for (let lproductmark of productmarkListData) {
              if (lproductmark.markname != null) {
                let jsonproductmark = {
                  value: lproductmark.markname,
                  id: lproductmark.id
                };
                this.productmarkList.push(jsonproductmark);
              }
            }
          }
        });
      return;
    },
    //读取合同仓库
    findSaleContractWarehouse() {
      let params = new FormData();
      params.append("memberId", this.memberId);
      //删除成功走读取接口
      this.axios
        .post(
          process.env.API_ROOT +
            "/SaleContractApi/v1/findSaleContractWarehouse",
          params
        )
        .then(res => {
          if (res.data.status === 200) {
            let saleContractWarehouseListData =
              res.data.data.saleContractWarehouseList;
            this.saleContractWarehouseList = [];
            for (let lsaleContractWarehouse of saleContractWarehouseListData) {
              if (lsaleContractWarehouse.warehousename != null) {
                let jsonsaleContractWarehouse = {
                  value: lsaleContractWarehouse.warehousename,
                  id: lsaleContractWarehouse.id
                };
                this.saleContractWarehouseList.push(jsonsaleContractWarehouse);
              }
            }
          }
        });
      return;
    },
    querySaleContractWarehouseSearchAsync(queryString, cb) {
      var saleContractWarehouseList = this.saleContractWarehouseList;
      var results = queryString
        ? saleContractWarehouseList.filter(this.createStateFilter(queryString))
        : saleContractWarehouseList;

      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        cb(results);
      }, 500);
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
    handleSelect(item) {
      this.supplyerForm.id = item.id;
    },

    handleSelect1(item) {
      this.filters.keyword = item.value;
    },

    queryProductNameSearchAsync(queryString, cb) {
      var productNameList = this.productNameList;
      var results = queryString
        ? productNameList.filter(this.createStateFilter(queryString))
        : productNameList;

      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        cb(results);
      }, 500);
    },
    queryProductfactorySearchAsync(queryString, cb) {
      var productfactoryList = this.productfactoryList;
      var results = queryString
        ? productfactoryList.filter(this.createStateFilter(queryString))
        : productfactoryList;

      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        cb(results);
      }, 500);
    },

    queryProductspecSearchAsync(queryString, cb) {
      var productspecList = this.productspecList;
      var results = queryString
        ? productspecList.filter(this.createStateFilter(queryString))
        : productspecList;

      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        cb(results);
      }, 500);
    },

    queryProductmarkSearchAsync(queryString, cb) {
      var productmarkList = this.productmarkList;
      var results = queryString
        ? productmarkList.filter(this.createStateFilter(queryString))
        : productmarkList;

      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        cb(results);
      }, 500);
    },
    // 添加合同
    async addContract() {
      let _this = this;
      let memberId = "";
      var usr = this.usr;
      if (usr) {
        memberId = usr.memberId;
      }
      let params = new FormData();
      params.append("id", _this.supplyerForm.id);
      params.append("memberid", memberId);
      params.append("contractno", _this.supplyerForm.contractno);
      params.append("purchaseno", _this.supplyerForm.purchaseno);
      params.append("supplyername", _this.supplyerForm.supplyername);
      params.append("purchasedate", new Date(_this.supplyerForm.purchasedate));
      params.append("payment", _this.supplyerForm.payment);
      params.append("purchaseweight", _this.totalWeight);
      params.append("purchaseamount", _this.totalAmount);
      params.append("remark", _this.supplyerForm.remark);
      params.append(
        "purchaseContractDetail",
        JSON.stringify(_this.productGridData)
      );
      if (_this.productGridData.length === 0) {
        this.message(true, "商品明细不能为空！", "error");
        return;
      }
      this.axios
        .post(
          process.env.API_ROOT + "/PurchaseContractApi/v1/addConstract",
          params
        )
        .then(response => {
          if (!response.data) {
            return;
          }

          if (response.data.status === 200) {
            this.message(true, response.data.msg, "success");
            _this.resetForm("supplyerForm");
            _this.supplyDialogFormVisible = false;
          } else {
            _this.message(true, response.data.msg, "error");
          }
          this.getContract();
        });
    },
    // 删除销售合同

    delContract(id) {
      if (this.contactIds.length === 0) {
        this.message(true, "请选择需要删除的用户", "error");
        return;
      }
      this.$confirm("此操作将永久删除该文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "error"
      })
        .then(() => {
          this.delContracts();
        })
        .catch(() => {
          this.message(true, "已取消删除", "error");
        });
    },
    // toueditor() {
    // 	this.$router.push({ path: '/ueditor' });
    // },
    // 删除销售合同
    async delContracts() {
      let params = new FormData();
      params.append("ids", this.contactIds);
      params.append("contractnos", this.contractNos);
      this.axios
        .post(
          process.env.API_ROOT + "/PurchaseContractApi/v1/delConstracts",
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
          this.getContract();
        });
    },

    // 删除仓库
    delSaleContractWarehouse(itemId) {
      let params = new FormData();
      params.append("id", itemId);
      params.append("memberId", this.memberId);
      this.axios
        .post(
          process.env.API_ROOT + "/SaleContractApi/v1/delSaleContractWarehouse",
          params
        )
        .then(res => {
          if (res.data.status === 200) {
            this.$message(res.data.msg);
            this.findSaleContractWarehouse();
          }
        });
    },

    async editShow(row) {
      this.$refs.purchaseTable.setCurrentRow(row);
      this.thistitle = "采购合同明细";
      this.supplyerForm.id = row.id;
      this.supplyerForm.purchaseno = row.purchaseno;
      this.supplyerForm.supplyername = row.supplyername;
      this.supplyerForm.purchaseweight = row.purchaseweight;
      this.supplyerForm.purchaseamount = row.purchaseamount;
      this.supplyerForm.purchasedate = row.purchasedate;
      this.supplyerForm.payment = row.payment;
      this.supplyerForm.remark = row.remark;
      this.supplyerForm.purchasestatus = row.purchasestatus;
      this.supplyDialogFormVisible = true;
      this.supplyerSelect();
      this.findProduct();
      this.findProductSpec();
      this.findProductFactory();
      this.findProductMark();
      this.findSaleContractWarehouse();
      let params = new FormData();
      params.append("keyword", row.contractno);
      params.append("memberId", this.memberId);
      params.append("purchaseno", row.purchaseno);
      this.axios
        .post(
          process.env.API_ROOT +
            "/PurchaseContractApi/v1/findPurchaseContractDetailByPage",
          params
        )
        .then(response => {
          if (!response.data) {
            return;
          }
          if (response.data.status === 200) {
            this.productGridData = [];
            var tabledata = response.data.data.purchaseContractDetail;
            for (var i in tabledata) {
              this.productGridData.push(tabledata[i]);
            }
            this.message(true, response.data.msg, "success");
          } else {
            this.message(true, response.data.msg, "error");
          }
        });
      //this.getContract()
    },

    handleSelectionChange(val) {
      this.contactIds = [];
      this.contractNos = [];
      if (val) {
        val.forEach(row => {
          this.contactIds.push(row.id);
          this.contractNos.push(row.purchaseno);
        });
      }
    },
    //删除名称
    delProductname(itemId) {
      let params = new FormData();
      params.append("id", itemId);
      params.append("memberId", this.memberId);
      this.axios
        .post(process.env.API_ROOT + "/SaleContractApi/v1/delProduct", params)
        .then(res => {
          if (res.data.status === 200) {
            this.$message(res.data.msg);
            //删除成功走读取接口
            this.findProduct();
            return;
          } else {
            this.$message(res.data.msg);
            return;
          }
        });
    },
    // 删除规格
    delProductspec(itemId) {
      let params = new FormData();
      params.append("id", itemId);
      params.append("memberId", this.memberId);
      this.axios
        .post(
          process.env.API_ROOT + "/SaleContractApi/v1/delProductSpec",
          params
        )
        .then(res => {
          if (res.data.status === 200) {
            this.$message(res.data.msg);
            this.findProductSpec();

            return;
          } else {
            this.$message(res.data.msg);
            return;
          }
        })
        .catch(error => {});
    },
    // 删除厂家
    delProductfactory(itemId) {
      let params = new FormData();
      params.append("id", itemId);
      params.append("memberId", this.memberId);
      this.axios
        .post(
          process.env.API_ROOT + "/SaleContractApi/v1/delProductFactory",
          params
        )
        .then(res => {
          if (res.data.status === 200) {
            this.$message(res.data.msg);
            //删除成功走读取接口
            this.findProductFactory();
            return;
          } else {
            this.$message(res.data.msg);
            return;
          }
        });
    },
    // 删除牌号
    delProductmark(itemId) {
      let params = new FormData();
      params.append("id", itemId);
      params.append("memberId", this.memberId);
      this.axios
        .post(
          process.env.API_ROOT + "/SaleContractApi/v1/delProductMark",
          params
        )
        .then(res => {
          if (res.data.status === 200) {
            this.$message(res.data.msg);
            this.findProductMark();
          }
        });
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

    //审核单据
    verify(row) {
      let params = new FormData();
      params.append("id", row.id);
      params.append("memberId", this.memberId);
      params.append("purchaseno", row.purchaseno);
      this.axios
        .post(
          process.env.API_ROOT +
            "/PurchaseContractApi/v1/verifyPurchaseContract",
          params
        )
        .then(response => {
          if (!response.data) {
            return;
          }
          if (response.data.status === 200) {
            this.message(true, response.data.msg, "success");
            this.getContract();
          }
        });
    },

    // 打印预览
    printPreview(row) {
      this.contractVisible = true;

      let params = new FormData();
      params.append("keyword", row.contractno);
      params.append("memberId", this.memberId);
      params.append("customerId", row.customerid);
      // 获取预览列表数据
      this.axios
        .post(
          process.env.API_ROOT +
            "/SaleContractApi/v1/findSaleContractDetailByPage",
          params
        )
        .then(response => {
          if (!response.data.data) {
            return;
          }
          if (response.data.status === 200) {
            this.contractData = [];
            var tabledata = response.data.data.saleContractDetail;
            for (var i in tabledata) {
              this.contractData.push(tabledata[i]);
            }
            this.saleContractbox = response.data.data.saleContract;
            this.contractdate = this.timestampToTime(
              this.saleContractbox.contractdate
            );
            this.deliverydate = this.timestampToTime(
              this.saleContractbox.deliverydate
            );
            this.depositdate = this.timestampToTime(
              this.saleContractbox.depositdate
            );
            this.informationdata = response.data.data.corpInfo;
            this.customerdata = response.data.data.customer;
            this.message(true, response.data.msg, "success");
          } else {
            this.message(true, response.data.msg, "error");
          }
        });
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
    this.usr = JSON.parse(this.$cookie.get("user"));
    this.memberId = this.usr.memberId;
    this.getContract();
    this.supplyerSelect();
  },
  computed: {
    // 	addShow() {
    // 		return this.getHasRule('新增销售合同')
    // 	},
    // 	delShow() {
    // 		return this.getHasRule('删除销售合同')
    // 	},
    // 	findShow() {
    // 		return this.getHasRule('合同查询')
    // 	},
    // 	detailShow() {
    // 		return this.getHasRule('查看明细')
    //   },
    //   termShow() {
    // 		return this.getHasRule('条款')
    //   },
    //   printShow() {
    // 		return this.getHasRule('打印预览')
    //   },
    //   processSubmitShow() {
    // 		return this.getHasRule('生成加工单')
    //   },
    //   deliverySubmitShow() {
    // 		return this.getHasRule('生成提单')
    //   },
    //   copyContractShow() {
    //     return this.getHasRule('复制合同')
    //   },
    //   verifyContractShow() {
    //     return this.getHasRule('审核合同')
    //   }
  }
};
</script>

<style>
.el-popover {
  min-width: auto !important;
}

#purchaseContractList .digitUppercase {
  border: 1px solid #dddddd;
  float: inherit;
  margin: 0 auto;
}
#purchaseContractList .widthInput {
  width: 300px;
}
#purchaseContractList .bordertop {
  border-top: 1px solid #dddddd;
  padding-top: 15px !important;
}
#purchaseContractList .digitUppercase p {
  padding: 0 120px;
}
#purchaseContractList .digitUppercase p span {
  width: 100px;
  display: inline-block;
  text-align: left;
}
#purchaseContractList .contractbox .el-table {
  width: 100%;
}
#purchaseContractList .contractbox {
  overflow: hidden;
  font-size: 16px;
  line-height: 26px;
}

#purchaseContractList .avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
#purchaseContractList .avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
#purchaseContractList .avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
#purchaseContractList .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
/* #purchaseContractList .el-dialog {
  height: 500px;
} */
#purchaseContractList .dialog-footer {
  margin-bottom: 50px;
}
/* .el-table {
	width:800px
} */
#purchaseContractList .quill-editor {
  height: 550px;
}
#purchaseContractList .quill-editor .ql-container {
  height: 600px;
}
#purchaseContractList .limit {
  margin-bottom: 40px;
  height: 30px;
  text-align: left;
}
#purchaseContractList .inputwidth {
  width: 320px;
}
#purchaseContractList .autoinputwidth {
  width: 200px;
}

#purchaseContractList .el-tb-edit .el-input,
#purchaseContractList .el-tb-edit .el-autocomplete,
#purchaseContractList.el-tb-edit .el-input-number,
#purchaseContractList .el-tb-edit .el-select {
  display: none;
  width: 100%;
}

#purchaseContractList .el-tb-edit .current-row .el-input,
#purchaseContractList .el-tb-edit .current-row .el-autocomplete,
#purchaseContractList .el-tb-edit .current-row .el-input-number,
#purchaseContractList .el-tb-edit .current-row .el-select {
  display: inherit;
}

#purchaseContractList .el-tb-edit .current-row .el-input + span,
#purchaseContractList .el-tb-edit .current-row .el-autocomplete + span,
#purchaseContractList .el-tb-edit .current-row .el-input-number + span,
#purchaseContractList .el-tb-edit .current-row .el-select + span {
  display: none;
}

/* 文本域width设置 */
#purchaseContractList .vehiclewidth {
  width: 350px;
}
/* 表格下拉菜单的width设置 */
.el-popover {
  min-width: 80px;
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
