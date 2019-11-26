<template>
  <el-row id="spotstock">
    <!--工具条-->
    <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
      <el-form :inline="true" :model="filters">
        <el-form-item>
          <el-autocomplete
            class="autoInputwidth"
            v-model="searchRuleForm.productname"
            :fetch-suggestions="queryProductNameSearchAsync"
            placeholder="请输入商品名称"
          >
            <template slot-scope="{ item }">
              <div class="name">{{ item.value }}</div>
              <span hidden>{{ item.id }}</span>
            </template>
          </el-autocomplete>
          <el-autocomplete
            class="autoInputwidth"
            v-model="searchRuleForm.warehousename"
            :fetch-suggestions="querySaleContractWarehouseSearchAsync"
            placeholder="请输入仓库名称"
          >
            <template slot-scope="{ item }">
              <div class="name">{{ item.value }}</div>
              <span hidden>{{ item.id }}</span>
            </template>
          </el-autocomplete>
          <el-autocomplete
            class="autoInputwidth"
            v-model="searchRuleForm.productspec"
            :fetch-suggestions="queryProductspecSearchAsync"
            placeholder="请输入商品规格"
          >
            <template slot-scope="{ item }">
              <div class="name">{{ item.value }}</div>
              <span hidden>{{ item.id }}</span>
            </template>
          </el-autocomplete>
          <el-autocomplete
            class="autoInputwidth"
            v-model="searchRuleForm.productfactory"
            :fetch-suggestions="queryProductfactorySearchAsync"
            placeholder="请输入钢厂"
          >
            <template slot-scope="{ item }">
              <div class="name">{{ item.value }}</div>
              <span hidden>{{ item.id }}</span>
            </template>
          </el-autocomplete>
          <el-autocomplete
            class="autoInputwidth"
            v-model="searchRuleForm.productmark"
            :fetch-suggestions="queryProductmarkSearchAsync"
            placeholder="请输入材质"
          >
            <template slot-scope="{ item }">
              <div class="name">{{ item.value }}</div>
              <span hidden>{{ item.id }}</span>
            </template>
          </el-autocomplete>
          <!-- <el-input v-model="filters.keyword" placeholder="客户名称"></el-input> -->
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            class="el-icon-search"
            v-on:click="getContract"
            v-if="findShow"
          >查询</el-button>
        </el-form-item>
        <el-form-item v-if="lockShow&&activeName=='在库'">
          <el-button type="primary" v-on:click="lock">锁货</el-button>
        </el-form-item>
        <el-form-item v-if="unlockShow&&activeName=='已锁货'">
          <el-button type="primary" v-on:click="unlock">解锁</el-button>
        </el-form-item>
        <el-form-item v-if="addShow&&activeName=='已锁货'">
          <el-button type="success" @click.native="showDialogForm">生成现货销售订单</el-button>
        </el-form-item>
        <!-- <el-form-item>
          <el-button type="danger" class="el-icon-delete" @click="delContract" v-if="delShow">删除</el-button>
        </el-form-item>-->
      </el-form>
    </el-col>
    <el-col>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="在库" name="在库"></el-tab-pane>
        <el-tab-pane label="已锁货" name="已锁货"></el-tab-pane>
        <el-tab-pane label="已出库" name="已出库"></el-tab-pane>
      </el-tabs>
    </el-col>
    <!--列表-->
    <el-col>
      <el-table
        ref="contractTable"
        :data="stockgridData"
        highlight-current-row
        v-loading="listLoading"
        element-loading-text="拼命加载中"
        @selection-change="handleSelectionChange"
        style="width: 100%;"
      >
        <el-table-column type="selection" v-if="activeName=='在库'||activeName=='已锁货'" width="80"></el-table-column>

        <el-table-column property="id" v-if="isshow" label="ID" width="100">
          <template slot-scope="scope">
            <span>{{scope.row.id}}</span>
          </template>
        </el-table-column>
        <el-table-column property="productname" label="名称" width="180">
          <template slot-scope="scope">
            <span>{{scope.row.productname}}</span>
          </template>
        </el-table-column>
        <el-table-column property="productspec" label="规格" width="200">
          <template slot-scope="scope">
            <span>{{scope.row.productspec}}</span>
          </template>
        </el-table-column>
        <el-table-column property="productfactory" label="钢厂" width="140">
          <template slot-scope="scope">
            <span>{{scope.row.productfactory}}</span>
          </template>
        </el-table-column>
        <el-table-column property="productmark" label="材质" width="160">
          <template slot-scope="scope">
            <span>{{scope.row.productmark}}</span>
          </template>
        </el-table-column>
        <el-table-column property="weight" label="重量(吨)" width="160">
          <template slot-scope="scope">
            <span>{{scope.row.weight}}</span>
          </template>
        </el-table-column>

        <el-table-column property="unit" label="单位" width="160">
          <template slot-scope="scope">
            <span>{{scope.row.unit}}</span>
          </template>
        </el-table-column>
        <el-table-column property="num" label="数量" width="160">
          <template slot-scope="scope">
            <!-- <el-input size="mini" v-model="scope.row.num" placeholder="请输入内容"></el-input> -->
            <span>{{scope.row.num}}</span>
          </template>
        </el-table-column>
        <el-table-column property="warehousename" label="所在仓库" width="160">
          <template slot-scope="scope">
            <!-- <el-input size="mini" v-model="scope.row.num" placeholder="请输入内容"></el-input> -->
            <span>{{scope.row.warehousename}}</span>
          </template>
        </el-table-column>
        <el-table-column property="status" label="状态" width="100">
          <template slot-scope="scope">
            <!-- <el-input size="mini" v-model="scope.row.num" placeholder="请输入内容"></el-input> -->
            <span>{{scope.row.status}}</span>
          </template>
        </el-table-column>
        <el-table-column property="lockman" label="锁货人">
          <template slot-scope="scope">
            <!-- <el-input size="mini" v-model="scope.row.num" placeholder="请输入内容"></el-input> -->
            <span>{{scope.row.lockman}}</span>
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
        :title="thistitle"
        :visible.sync="dialogFormVisible"
        width="1250px"
      >
        <div>
          <el-form
            status-icon
            :rules="rules"
            ref="ruleForm"
            :inline="true"
            label-width="90px"
            class="demo-form-inline"
          >
            <el-col :span="12">
              <el-form-item label="客户名称" prop="addcustomername">
                <el-autocomplete
                  v-model="ruleForm.addcustomername"
                  :fetch-suggestions="querySearchAsync"
                  placeholder="请输入客户名称"
                  @select="handleSelectCustomer"
                  class="inputwidth"
                ></el-autocomplete>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="签约地点" prop="addcontractaddress">
                <el-input
                  class="inputwidth"
                  v-model="ruleForm.addcontractaddress"
                  placeholder="请输入内容"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="交货日期" prop="adddeliverydate">
                <el-date-picker
                  v-model="ruleForm.adddeliverydate"
                  type="date"
                  placeholder="选择日期"
                  class="inputwidth"
                ></el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="付款方式" prop="addpayment">
                <el-select class="inputwidth" v-model="ruleForm.addpayment" placeholder="请选择">
                  <el-option label="电汇" value="电汇"></el-option>
                  <el-option label="支票" value="支票"></el-option>
                  <el-option label="承兑" value="承兑"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="结算方式" prop="addsettlement">
                <el-select
                  class="settleinputwidth"
                  v-model="ruleForm.addsettlement"
                  placeholder="请选择"
                  @change="addsettlementChange()"
                >
                  <el-option label="货到付款" value="货到付款"></el-option>
                  <el-option label="款到发货" value="款到发货"></el-option>
                  <el-option label="月结" value="月结"></el-option>
                  <el-option label="预付" value="预付"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label prop="percent" v-if="percentShow">
                <el-select
                  class="settleinputwidth"
                  v-model="ruleForm.percent"
                  placeholder="请输入百分比金额"
                >
                  <el-option
                    v-for="item in percentoptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="预付日期" prop="depositdate" v-if="percentShow">
                <el-date-picker
                  v-model="ruleForm.depositdate"
                  type="date"
                  placeholder="选择日期"
                  class="settleinputwidth"
                ></el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="运输方式" prop="addtransporttype">
                <el-select class="inputwidth" v-model="ruleForm.addtransporttype" placeholder="请选择">
                  <el-option label="代运" value="代运"></el-option>
                  <el-option label="自提" value="自提"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="附加条款" prop="remark">
                <el-input
                  :rows="3"
                  class="inputwidth"
                  type="textarea"
                  placeholder="请输入备注"
                  auto-complete="off"
                  v-model="ruleForm.remark"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-form-item label="商品明细">
              <el-table
                style="width:1100px"
                :data="gridData"
                max-height="500"
                :span-method="arraySpanMethod"
                show-summary
                :summary-method="getSummaries"
                @current-change="handleRowChange"
                class="el-tb-edit"
                ref="gridTable"
                highlight-current-row
              >
                <!-- <el-table-column type="selection" width="85" @selection-change="handleItemSelectionChange" :selectable='checkboxProcessInit'>
                </el-table-column>-->
                <el-table-column property="stockid" label="ID" width="100">
                  <template slot-scope="scope">
                    <span>{{scope.row.stockid}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="status" v-if="isshow" label="状态" width="200">
                  <template slot-scope="scope">
                    <span>{{scope.row.status}}</span>
                  </template>
                </el-table-column>

                <el-table-column property="productname" label="名称" width="200">
                  <template slot-scope="scope">
                    <!-- <el-autocomplete class="autoInputwidth" ref="productnameInput" v-model="scope.row.productname" v-if="scope.row.status=='待审核'||scope.row.status==undefined" :fetch-suggestions="queryProductNameSearchAsync" placeholder="请输入商品名称">
                      <template slot-scope="{ item }">
                        <div class="name">{{ item.value }}</div>
                        <span hidden>{{ item.id }}</span>
                        <el-tooltip  content="删除后重新点击输入框刷新" placement="bottom" effect="light">
                           <span class="addr" @click.stop="delProductname(item.id)">删除</span>
                        </el-tooltip>

                      </template>
                    </el-autocomplete>-->
                    <span>{{scope.row.productname}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productspec" label="规格" width="200">
                  <template slot-scope="scope">
                    <!-- <el-autocomplete class="autoInputwidth" v-model="scope.row.productspec" v-if="scope.row.status=='待审核'||scope.row.status==undefined" :fetch-suggestions="queryProductspecSearchAsync" placeholder="请输入商品规格">
                      <template slot-scope="{ item }">
                        <div class="name">{{ item.value }}</div>
                        <span hidden>{{ item.id }}</span>
                        <el-tooltip  content="删除后重新点击输入框刷新" placement="bottom" effect="light">
                           <span class="addr" @click.stop="delProductspec(item.id)">删除</span>
                        </el-tooltip>
                       
                      </template>
                    </el-autocomplete>-->
                    <span>{{scope.row.productspec}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productfactory" label="钢厂" width="160">
                  <template slot-scope="scope">
                    <!-- <el-autocomplete class="autoInputwidth" v-model="scope.row.productfactory" v-if="scope.row.status=='待审核'||scope.row.status==undefined" :fetch-suggestions="queryProductfactorySearchAsync" placeholder="请输入钢厂">
                      <template slot-scope="{ item }">
                        <div class="name">{{ item.value }}</div>
                        <span hidden>{{ item.id }}</span>
                        <el-tooltip  content="删除后重新点击输入框刷新" placement="bottom" effect="light">
                           <span class="addr" @click.stop="delProductfactory(item.id)">删除</span>
                        </el-tooltip>
                      </template>
                    </el-autocomplete>-->
                    <span>{{scope.row.productfactory}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productmark" label="材质" width="160">
                  <template slot-scope="scope">
                    <!-- <el-autocomplete class="autoInputwidth" v-model="scope.row.productmark" v-if="scope.row.status=='待审核'||scope.row.status==undefined" :fetch-suggestions="queryProductmarkSearchAsync" placeholder="请输入材质">
                      <template slot-scope="{ item }">
                        <div class="name">{{ item.value }}</div>
                        <span hidden>{{ item.id }}</span>
                        <el-tooltip  content="删除后重新点击输入框刷新" placement="bottom" effect="light">
                           <span class="addr" @click.stop="delProductmark(item.id)">删除</span>
                        </el-tooltip>
                      </template>
                    </el-autocomplete>-->
                    <span>{{scope.row.productmark}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="weight" label="重量(吨)" width="120">
                  <template slot-scope="scope">
                    <!-- <el-input size="mini" v-if="scope.row.status=='待审核' ||scope.row.status==undefined " v-model="scope.row.weight" placeholder="请输入内容"></el-input> -->
                    <span>{{scope.row.weight}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="price" label="单价(元)" width="150">
                  <template slot-scope="scope">
                    <el-input size="mini" v-model="scope.row.price" placeholder="请输入内容"></el-input>
                    <span>{{scope.row.price}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="unit" label="单位" width="100">
                  <template slot-scope="scope">
                    <!-- <el-select size="mini" v-if="scope.row.status=='待审核' ||scope.row.status==undefined " filterable class="inputwidth" v-model="scope.row.unit" placeholder="请选择">
                      <el-option label="件" value="件"></el-option>
                      <el-option label="支" value="支"></el-option>
                      <el-option label="张" value="张"></el-option>
                    </el-select>-->
                    <span>{{scope.row.unit}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="num" label="数量" width="80">
                  <template slot-scope="scope">
                    <!-- <el-input size="mini" v-if="scope.row.status=='待审核' ||scope.row.status==undefined " v-model="scope.row.num" placeholder="请输入内容"></el-input> -->
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
                    <!-- <el-autocomplete class="autoInputwidth" v-model="scope.row.warehousename" v-if="scope.row.status=='待审核'||scope.row.status==undefined" :fetch-suggestions="querySaleContractWarehouseSearchAsync" placeholder="请输入仓库名称">
                      <template slot-scope="{ item }">
                        <div class="name">{{ item.value }}</div>
                        <span hidden>{{ item.id }}</span>
                        <el-tooltip  content="删除后重新点击输入框刷新" placement="bottom" effect="light">
                           <span class="addr" @click.stop="delSaleContractWarehouse(item.id)">删除</span>
                        </el-tooltip>
                       
                      </template>
                    </el-autocomplete>-->
                    <span>{{scope.row.warehousename}}</span>
                  </template>
                </el-table-column>

                <el-table-column property="stockouttype" label="出库方式" width="150">
                  <template slot-scope="scope">
                    <el-select
                      size="mini"
                      filterable
                      v-if="scope.row.status=='待审核' ||scope.row.status==undefined "
                      class="inputwidth"
                      v-model="scope.row.stockouttype"
                      placeholder="请选择"
                    >
                      <el-option label="过磅" value="过磅"></el-option>
                      <el-option label="理算" value="理算"></el-option>
                    </el-select>
                    <span>{{scope.row.stockouttype}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="quality" label="品级" width="150">
                  <template slot-scope="scope">
                    <el-select
                      size="mini"
                      filterable
                      v-if="scope.row.status=='待审核' ||scope.row.status==undefined "
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
                  <template slot-scope="scope">
                    <el-button
                      @click.native.prevent="deleteRow(scope.$index, gridData)"
                      type="text"
                      size="small"
                    >移除</el-button>
                    <!-- <el-button @click.native.prevent="copyRow(scope.row)" type="text" size="small">
                      复制
                    </el-button>-->
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </el-form>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="closeDialog('ruleForm')">取 消</el-button>
          <!-- <el-button @click="resetForm('ruleForm')">重置</el-button> -->
          <el-button type="primary" @click="submitForm('ruleForm')">确 定</el-button>
        </div>
      </el-dialog>
    </el-col>

    <el-col :span="2">
      <el-dialog
        :close-on-click-modal="false"
        :title="thistitle"
        :visible.sync="lockdialogFormVisible"
        width="1250px"
      >
        <div>
          <el-form
            status-icon
            :rules="rules"
            ref="lockRuleForm"
            :inline="true"
            label-width="90px"
            class="demo-form-inline"
          >
            <el-form-item label="商品明细">
              <el-table
                style="width:1100px"
                :data="gridData"
                max-height="500"
                :span-method="arraySpanMethod"
                show-summary
                :summary-method="getSummaries"
                @current-change="handleRowChange"
                class="el-tb-edit"
                ref="gridTable"
                highlight-current-row
              >
                <!-- <el-table-column type="selection" width="85" @selection-change="handleItemSelectionChange" :selectable='checkboxProcessInit'>
                </el-table-column>-->
                <el-table-column property="stockid" label="ID" width="80">
                  <template slot-scope="scope">
                    <span>{{scope.row.stockid}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="status" v-if="isshow" label="状态" width="150">
                  <template slot-scope="scope">
                    <span>{{scope.row.status}}</span>
                  </template>
                </el-table-column>

                <el-table-column property="productname" label="名称" width="150">
                  <template slot-scope="scope">
                    <!-- <el-autocomplete class="autoInputwidth" ref="productnameInput" v-model="scope.row.productname" v-if="scope.row.status=='待审核'||scope.row.status==undefined" :fetch-suggestions="queryProductNameSearchAsync" placeholder="请输入商品名称">
                      <template slot-scope="{ item }">
                        <div class="name">{{ item.value }}</div>
                        <span hidden>{{ item.id }}</span>
                        <el-tooltip  content="删除后重新点击输入框刷新" placement="bottom" effect="light">
                           <span class="addr" @click.stop="delProductname(item.id)">删除</span>
                        </el-tooltip>

                      </template>
                    </el-autocomplete>-->
                    <span>{{scope.row.productname}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productspec" label="规格" width="150">
                  <template slot-scope="scope">
                    <!-- <el-autocomplete class="autoInputwidth" v-model="scope.row.productspec" v-if="scope.row.status=='待审核'||scope.row.status==undefined" :fetch-suggestions="queryProductspecSearchAsync" placeholder="请输入商品规格">
                      <template slot-scope="{ item }">
                        <div class="name">{{ item.value }}</div>
                        <span hidden>{{ item.id }}</span>
                        <el-tooltip  content="删除后重新点击输入框刷新" placement="bottom" effect="light">
                           <span class="addr" @click.stop="delProductspec(item.id)">删除</span>
                        </el-tooltip>
                       
                      </template>
                    </el-autocomplete>-->
                    <span>{{scope.row.productspec}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productfactory" label="钢厂" width="120">
                  <template slot-scope="scope">
                    <!-- <el-autocomplete class="autoInputwidth" v-model="scope.row.productfactory" v-if="scope.row.status=='待审核'||scope.row.status==undefined" :fetch-suggestions="queryProductfactorySearchAsync" placeholder="请输入钢厂">
                      <template slot-scope="{ item }">
                        <div class="name">{{ item.value }}</div>
                        <span hidden>{{ item.id }}</span>
                        <el-tooltip  content="删除后重新点击输入框刷新" placement="bottom" effect="light">
                           <span class="addr" @click.stop="delProductfactory(item.id)">删除</span>
                        </el-tooltip>
                      </template>
                    </el-autocomplete>-->
                    <span>{{scope.row.productfactory}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productmark" label="材质" width="120">
                  <template slot-scope="scope">
                    <!-- <el-autocomplete class="autoInputwidth" v-model="scope.row.productmark" v-if="scope.row.status=='待审核'||scope.row.status==undefined" :fetch-suggestions="queryProductmarkSearchAsync" placeholder="请输入材质">
                      <template slot-scope="{ item }">
                        <div class="name">{{ item.value }}</div>
                        <span hidden>{{ item.id }}</span>
                        <el-tooltip  content="删除后重新点击输入框刷新" placement="bottom" effect="light">
                           <span class="addr" @click.stop="delProductmark(item.id)">删除</span>
                        </el-tooltip>
                      </template>
                    </el-autocomplete>-->
                    <span>{{scope.row.productmark}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="weight" label="重量(吨)" width="120">
                  <template slot-scope="scope">
                    <!-- <el-input size="mini" v-if="scope.row.status=='待审核' ||scope.row.status==undefined " v-model="scope.row.weight" placeholder="请输入内容"></el-input> -->
                    <span>{{scope.row.weight}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="price" label="单价(元)" width="120">
                  <template slot-scope="scope">
                    <span>{{scope.row.price}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="unit" label="单位" width="60">
                  <template slot-scope="scope">
                    <!-- <el-select size="mini" v-if="scope.row.status=='待审核' ||scope.row.status==undefined " filterable class="inputwidth" v-model="scope.row.unit" placeholder="请选择">
                      <el-option label="件" value="件"></el-option>
                      <el-option label="支" value="支"></el-option>
                      <el-option label="张" value="张"></el-option>
                    </el-select>-->
                    <span>{{scope.row.unit}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="num" label="数量" width="80">
                  <template slot-scope="scope">
                    <!-- <el-input size="mini" v-if="scope.row.status=='待审核' ||scope.row.status==undefined " v-model="scope.row.num" placeholder="请输入内容"></el-input> -->
                    <el-input size="mini" v-model="scope.row.num" placeholder="请输入内容"></el-input>
                    <span>{{scope.row.num}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="total" label="合计(元)" width="150">
                  <template slot-scope="scope">
                    <span>{{scope.row.total}}</span>
                  </template>
                </el-table-column>

                <el-table-column property="warehousename" label="所在仓库" width="150">
                  <template slot-scope="scope">
                    <!-- <el-autocomplete class="autoInputwidth" v-model="scope.row.warehousename" v-if="scope.row.status=='待审核'||scope.row.status==undefined" :fetch-suggestions="querySaleContractWarehouseSearchAsync" placeholder="请输入仓库名称">
                      <template slot-scope="{ item }">
                        <div class="name">{{ item.value }}</div>
                        <span hidden>{{ item.id }}</span>
                        <el-tooltip  content="删除后重新点击输入框刷新" placement="bottom" effect="light">
                           <span class="addr" @click.stop="delSaleContractWarehouse(item.id)">删除</span>
                        </el-tooltip>
                       
                      </template>
                    </el-autocomplete>-->
                    <span>{{scope.row.warehousename}}</span>
                  </template>
                </el-table-column>

                <el-table-column property="stockouttype" label="出库方式" width="100">
                  <template slot-scope="scope">
                    <el-select
                      size="mini"
                      filterable
                      v-if="scope.row.status=='待审核' ||scope.row.status==undefined "
                      class="inputwidth"
                      v-model="scope.row.stockouttype"
                      placeholder="请选择"
                    >
                      <el-option label="过磅" value="过磅"></el-option>
                      <el-option label="理算" value="理算"></el-option>
                    </el-select>
                    <span>{{scope.row.stockouttype}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="quality" label="品级" width="110">
                  <template slot-scope="scope">
                    <el-select
                      size="mini"
                      filterable
                      v-if="scope.row.status=='待审核' ||scope.row.status==undefined "
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
                  <template slot-scope="scope">
                    <el-button
                      @click.native.prevent="deleteRow(scope.$index, gridData)"
                      type="text"
                      size="small"
                    >移除</el-button>
                    <!-- <el-button @click.native.prevent="copyRow(scope.row)" type="text" size="small">
                      复制
                    </el-button>-->
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </el-form>
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="closeDialog('lockRuleForm')">取 消</el-button>
          <!-- <el-button @click="resetForm('ruleForm')">重置</el-button> -->
          <el-button type="primary" @click="submitForm('lockRuleForm')">确 定</el-button>
        </div>
      </el-dialog>
    </el-col>
    <el-col :span="2">
      <el-dialog title="合同条款" :visible.sync="termFormVisible" :close-on-click-modal="false">
        <div>
          <el-form
            ref="termRuleForm"
            status-icon
            :rules="rules"
            :inline="true"
            label-width="90px"
            class="demo-form-inline"
          >
            <el-form-item label="公司名称:" prop="companyName">
              {{companyName}}
              <!-- <el-input v-model="companyName" :readonly="true" ></el-input> -->
            </el-form-item>
            <el-form-item label="合同号:" prop="contractNo">
              {{contractNo}}
              <!-- <el-input v-model="contractNo" :readonly="true" ></el-input> -->
            </el-form-item>
            <div>
              <quill-editor
                class="termquill"
                ref="myTextEditor"
                v-model="content"
                :options="editorOption3"
                @blur="onEditorBlur($event)"
                @focus="onEditorFocus($event)"
                @ready="onEditorReady($event)"
                @change="onEditorChange($event)"
              >
                >
                <div id="toolbar3" slot="toolbar">
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
          </el-form>
        </div>
        <div slot="footer" class="limit">
          当前已输入
          <span>{{nowLength}}</span> 个字符，您还可以输入
          <span>{{SurplusLength}}</span> 个字符。
        </div>
        <div slot="footer" class="dialog-footer">
          <el-button @click="closeDialog('termRuleForm')">取 消</el-button>
          <el-button type="primary" @click="submitTermForm('termRuleForm')">保 存</el-button>
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
      activeName: "在库", //tab切换选中的数据
      thistitle: "",
      filters: {
        keyword: ""
      },
      value: "",
      multipleSelection: "",
      ruleForm: {
        id: "",
        contractstatus: "",
        contractno: "",
        customerId: "",
        memberId: "",
        addcustomername: "",
        addcontractaddress: "",
        adddeliverydate: "",
        addpayment: "",
        addsettlement: "",
        addtransporttype: "",
        addstockouttype: "",
        remark: "",
        percent: "",
        depositdate: ""
      },
      searchRuleForm: {
        productname: "",
        warehousename: "",
        productspec: "",
        productfactory: "",
        productmark: ""
      },
      percentoptions: [
        {
          value: "5%",
          label: "5%"
        },
        {
          value: "10%",
          label: "10%"
        },
        {
          value: "15%",
          label: "15%"
        },
        {
          value: "20%",
          label: "20%"
        },
        {
          value: "25%",
          label: "25%"
        },
        {
          value: "30%",
          label: "30%"
        },
        {
          value: "35%",
          label: "35%"
        },
        {
          value: "40%",
          label: "40%"
        },
        {
          value: "45%",
          label: "45%"
        },
        {
          value: "50%",
          label: "50%"
        },
        {
          value: "55%",
          label: "55%"
        },
        {
          value: "60%",
          label: "60%"
        },
        {
          value: "65%",
          label: "65%"
        },
        {
          value: "70%",
          label: "70%"
        },
        {
          value: "75%",
          label: "75%"
        },
        {
          value: "80%",
          label: "80%"
        },
        {
          value: "85%",
          label: "85%"
        },
        {
          value: "90%",
          label: "90%"
        },
        {
          value: "95%",
          label: "95%"
        },
        {
          value: "100%",
          label: "100%"
        }
      ],
      termRuleForm: {},
      customerList: [],
      productNameList: [],
      productfactoryList: [],
      productmarkList: [],
      productspecList: [],
      saleContractWarehouseList: [],
      timeout: null,
      gridData: [],
      contractData: [],
      warehouseGridData: [],
      stockgridData: [],
      multipleSelection: "",
      pageSizes: [15, 50, 80, 100],
      startPage: 1,
      pageSize: 15,
      total: 0,
      page: 1,
      listLoading: false,
      selLoading: false,
      dialogFormVisible: false,
      lockdialogFormVisible: false,
      formLabelWidth: "120px",
      currentRow: null,
      totalWeight: 0,
      totalAmount: 0,
      finalWeight: 0,
      finalAmount: 0,
      contractWeight: 0,
      contractAmount: 0,
      contactIds: [],
      selectedIds: [],
      // contractNos: [],
      addstock: [],
      isshow: false,
      rowShow: true,
      chooseRow: "",
      chooseRowIndex: "",
      statusTab: "在库",
      // 表单验证
      rules: {
        addcustomername: [
          { required: true, message: "请选择客户", trigger: "change" }
        ],
        adddeliverydate: [
          {
            type: "date",
            required: true,
            message: "请确认交货日期",
            trigger: "change"
          }
        ],
        addcontractaddress: [
          { required: true, message: "请输入签约地址", trigger: "blur" }
        ],
        addpayment: [
          { required: true, message: "请选择付款方式", trigger: "change" }
        ],
        addsettlement: [
          { required: true, message: "请选择结算方式", trigger: "change" }
        ],
        depositdate: [
          { required: true, message: "请选择预付日期", trigger: "change" }
        ],
        percent: [
          {
            required: true,
            message: "请输入适当的百分比数字",
            trigger: "change"
          }
        ],
        addtransporttype: [
          { required: true, message: "请选择运输方式", trigger: "change" }
        ]
      },

      maxLength: 5000,
      termEditForm: {},
      uploadUrl: "",
      name: "base-example",
      content: "",
      htmlContent: "",
      editorOption: {
        modules: {
          toolbar: "#toolbar1"
        }
      },
      editorOption2: {
        modules: {
          toolbar: "#toolbar2"
        }
      },
      editorOption3: {
        modules: {
          toolbar: "#toolbar3"
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
    // 切换tab数据
    handleClick(tab, event) {
      this.statusTab = tab.name;
      this.getContract();
    },
    addwarehouseRow() {
      var d = {
        warehousename: "",
        warehouseaddress: "",
        warehousephone: "",
        warehousefax: ""
      };
      this.warehouseGridData.push(d);
      setTimeout(() => {
        this.$refs.warehouseGridData.setCurrentRow(d);
      }, 10);
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
    closeDialog(formName) {
      if (formName === "ruleForm") {
        this.dialogFormVisible = false;
      } else if (formName === "termRuleForm") {
        this.termFormVisible = false;
      } else if (formName === "lockRuleForm") {
        this.lockdialogFormVisible = false;
      }
      this.$refs[formName].resetFields();
    },
    addsettlementChange() {
      if (this.ruleForm.addsettlement === "预付") {
        this.percentShow = true;
      } else {
        this.percentShow = false;
      }
    },
    //删除行
    deleteRow(index, rows) {
      rows.splice(index, 1);
    },

    deleteWarehouseRow(row, index, rows) {
      this.$confirm("此操作将永久删除该仓库, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "error"
      })
        .then(() => {
          this.delWarehouseRow(row);
          rows.splice(index, 1);
        })
        .catch(() => {
          this.message(true, "已取消删除", "error");
        });
    },
    delWarehouseRow(row) {
      let _this = this;
      let params = new FormData();
      params.append("id", row.id);
      this.axios
        .post(process.env.API_ROOT + "/WareHouseApi/v1/delWarehouseRow", params)
        .then(response => {
          if (!response.data) {
            _this.listLoading = false;
            return;
          }
          if (response.data && response.data.status === 200) {
            _this.message(true, response.data.msg, "success");
            _this.warehouseSelect();
          } else {
            _this.message(true, response.data.msg, "error");
          }
          _this.listLoading = false;
        })
        .catch(err => {
          console.log(err);
        });
    },
    // handleCurrentChange(val) {
    //   this.currentRow = val;
    // },
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
        stockouttype: row.stockouttype,
        quality: row.quality
      };
      this.gridData.push(d);
      setTimeout(() => {
        this.$refs.gridTable.setCurrentRow(d);
      }, 10);
    },

    async lock() {
      this.thistitle = "锁货";
      this.lockdialogFormVisible = true;
      let addstock = this.addstock;
      this.gridData = [];
      for (var i in addstock) {
        this.gridData.push(addstock[i]);
      }
      setTimeout(() => {
        this.$refs.gridTable.setCurrentRow(addstock[0]);
      }, 10);
      // let _this = this;
      // let ids = [];
      // if (_this.addstock.length === 0) {
      //   this.message(true, "请选择需要锁的货", "error");
      //   return;
      // }
      // _this.addstock.forEach(function(c) {
      //   ids.push(c.stockid);
      // });
      // let params = new FormData();
      // params.append("ids", ids);
      // this.axios
      //   .post(process.env.API_ROOT + "/WareHouseApi/v1/lock", params)
      //   .then(response => {
      //     if (!response.data) {
      //       return;
      //     }
      //     if (response.data && response.data.status === 200) {
      //       _this.message(true, response.data.msg, "success");
      //       _this.getContract();
      //     } else {
      //       _this.message(true, response.data.msg, "error");
      //     }
      //   })
      //   .catch(err => {
      //     console.log(err);
      //   });
    },
    async unlock() {
      let _this = this;
      let ids = [];
      if (_this.addstock.length === 0) {
        this.message(true, "请选择需要解锁的货", "error");
        return;
      }
      _this.addstock.forEach(function(c) {
        ids.push(c.stockid);
      });
      let params = new FormData();
      params.append("ids", ids);
      this.axios
        .post(process.env.API_ROOT + "/WareHouseApi/v1/unlock", params)
        .then(response => {
          if (!response.data) {
            return;
          }
          if (response.data && response.data.status === 200) {
            _this.message(true, response.data.msg, "success");
            _this.getContract();
          } else {
            _this.message(true, response.data.msg, "error");
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    // 查询合同
    async getContract() {
      let _this = this;
      _this.listLoading = true;
      let params = new FormData();
      params.append("startPage", _this.startPage);
      params.append("pageSize", _this.pageSize);
      params.append("memberid", _this.memberId);
      params.append("productname", _this.searchRuleForm.productname);
      params.append("productspec", _this.searchRuleForm.productspec);
      params.append("productfactory", _this.searchRuleForm.productfactory);
      params.append("productmark", _this.searchRuleForm.productmark);
      params.append("warehousename", _this.searchRuleForm.warehousename);
      params.append("stockstatus", _this.statusTab);
      this.axios
        .post(process.env.API_ROOT + "/WareHouseApi/v1/findItemByPage", params)
        .then(response => {
          if (!response.data) {
            _this.listLoading = false;
            return;
          }
          if (response.data && response.data.status === 200) {
            _this.stockgridData = response.data.data;
            _this.total = response.data.total;
          } else {
            _this.message(true, response.data.msg, "error");
            _this.stockgridData = [];
          }
          _this.listLoading = false;
        })
        .catch(err => {
          console.log(err);
        });
    },
    // 表单提交
    submitForm(formName) {
      // console.log(this.gridData, 'this.gridData');

      this.$refs[formName].validate(valid => {
        if (valid) {
          for (let i = 0; i < this.gridData.length; i++) {
            let item = this.gridData[i];
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
            if (item.warehousename === "") {
              this.$message("仓库名称不能为空");
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

    warehouseSelect() {
      let params = new FormData();
      let memberId = this.memberId;
      params.append("memberId", memberId);
      this.axios
        .post(process.env.API_ROOT + "/WareHouseApi/v1/findByNoPage", params)
        .then(response => {
          let warehousedata = response.data.data;
          this.warehouseList = [];
          for (let warehouse of warehousedata) {
            if (warehouse.warehousename != null) {
              let jsonwarehouse = {
                value: warehouse.warehousename,
                id: warehouse.id
              };
              this.warehouseList.push(jsonwarehouse);
            }
          }
        })
        .catch(err => {
          console.log(err);
        });
    },

    arraySpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 9) {
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
    // 显示添加合同窗口
    showDialogForm() {
      if (this.addstock.length === 0) {
        this.message(true, "请选择需要生成销售订单的商品", "error");
        return;
      }
      this.percentShow = false;
      this.thistitle = "生成现货销售合同";
      this.dialogFormVisible = true;
      this.ruleForm.contractstatus = "";
      this.ruleForm.id = "";
      this.ruleForm.addcontractno = "";
      this.ruleForm.addcustomername = "";
      this.ruleForm.adddeliverydate = "";
      this.ruleForm.depositdate = "";
      this.ruleForm.addcontractaddress = "";
      this.ruleForm.addpayment = "";
      this.ruleForm.addsettlement = "";
      this.ruleForm.addtransporttype = "";
      this.ruleForm.addstockouttype = "";
      this.totalWeight = "";
      this.totalAmount = "";
      this.ruleForm.remark = "";
      let addstock = this.addstock;
      this.gridData = [];
      for (var i in addstock) {
        this.gridData.push(addstock[i]);
      }

      this.getCustomerList();
      // this.findProduct();
      // this.findProductSpec();
      // this.findProductFactory();
      // this.findProductMark();
      // this.findSaleContractWarehouse();
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
    queryWarehouseSearchAsync(queryString, cb) {
      var warehouseList = this.warehouseList;
      var results = queryString
        ? warehouseList.filter(this.createStateFilter(queryString))
        : warehouseList;

      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        cb(results);
      }, 500);
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

    handleSelectTdWarehouse(item) {
      this.tdruleForm.warehouseName = item.value;
      this.tdruleForm.warehouseId = item.id;
    },

    handleRowChange() {
      this.rowShow = false;
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
      params.append("id", _this.ruleForm.id);
      params.append("customerid", _this.ruleForm.customerId);
      params.append("memberid", memberId);
      params.append("contractno", _this.ruleForm.addcontractno);
      params.append("customername", _this.ruleForm.addcustomername);
      params.append("deliverydate", _this.ruleForm.adddeliverydate);
      params.append("payment", _this.ruleForm.addpayment);
      params.append("settlement", _this.ruleForm.addsettlement);
      params.append("transporttype", _this.ruleForm.addtransporttype);
      params.append("contracttype", "1");
      params.append("contractweight", _this.totalWeight);
      params.append("contractamount", _this.totalAmount);
      params.append("remark", _this.ruleForm.remark);
      if (_this.ruleForm.depositdate !== "") {
        params.append("percent", _this.ruleForm.percent);
        params.append("depositdate", new Date(_this.ruleForm.depositdate));
      }
      params.append("contractaddress", _this.ruleForm.addcontractaddress);
      params.append("saleContractDetail", JSON.stringify(_this.gridData));
      if (_this.gridData.length === 0) {
        this.message(true, "产品明细不能为空！", "error");
        return;
      }
      this.axios
        .post(process.env.API_ROOT + "/SaleContractApi/v1/addConstract", params)
        .then(response => {
          if (!response.data) {
            return;
          }

          if (response.data.status === 200) {
            this.message(true, response.data.msg, "success");
            _this.resetForm("ruleForm");
            _this.dialogFormVisible = false;
            this.$router.push({ path: "/saleContractList" });
          } else {
            _this.message(true, response.data.msg, "error");
          }
          this.getContract();
        });
    },

    handleSelectionChange(val) {
      // this.contactIds = [];
      // this.contractNos = [];
      this.addstock = [];
      if (val) {
        let d = {};
        val.forEach(row => {
          d = {
            stockid: row.id,
            productname: row.productname,
            productspec: row.productspec,
            productfactory: row.productfactory,
            productmark: row.productmark,
            weight: row.weight,
            price: row.price,
            unit: row.unit,
            num: row.num,
            warehousename: row.warehousename,
            stockouttype: row.stockouttype,
            quality: row.quality,
            total: ""
          };
          this.addstock.push(d);

          // this.contactIds.push(row.id);
          // this.contractNos.push(row.contractno);
        });
      }
    },

    checkboxProcessInit(row, index) {
      if (row.processstatus) {
        return 0; //不可勾选
      } else {
        return 1; //可勾选
      }
    },

    checkboxDeliveryInit(row, index) {
      if (row.deliverystatus === "运输中") {
        return 0; //不可勾选
      } else {
        return 1; //可勾选
      }
    },
    submitTermForm() {
      if (this.content.length == 0) {
        this.message(true, "合同条款不能为空", "error");
      } else {
        let params = new FormData();
        params.append("id", this.id);
        params.append("memberid", this.memberId);
        params.append("content", this.content);
        this.axios
          .post(
            process.env.API_ROOT + "/SaleContractTermApi/v1/addTerm",
            params
          )
          .then(response => {
            if (response.data.status === 200) {
              this.message(true, response.data.msg, "success");
              this.termFormVisible = false;
            } else {
              this.message(true, response.data.msg, "error");
            }
          });
      }
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
    }
  },

  mounted() {
    if (this.$cookie.get("user") !== null) {
      this.usr = JSON.parse(this.$cookie.get("user"));
    }

    this.memberId = this.usr.memberId;
    this.getContract();
    this.findProduct();
    this.findProductSpec();
    this.findProductFactory();
    this.findProductMark();
    this.findSaleContractWarehouse();
    // this.getCustomerList();
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
    },
    lockShow() {
      return this.getHasRule("锁货");
    },
    unlockShow() {
      return this.getHasRule("解锁");
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
