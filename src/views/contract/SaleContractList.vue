<template>
  <el-row>
    <!--工具条-->
    <el-col :span="24"
            class="toolbar"
            style="padding-bottom: 0px;">
      <el-form :inline="true"
               :model="filters">
        <el-form-item>
          <el-autocomplete v-model="filters.keyword"
                           :fetch-suggestions="querySearchAsync"
                           placeholder="请输入客户名称"
                           @select="handleSelectKeyword"></el-autocomplete>
          <!-- <el-input v-model="filters.keyword" placeholder="客户名称"></el-input> -->
        </el-form-item>
        <el-form-item>
          <el-date-picker v-model="filters.validateTime"
                          type="daterange"
                          placeholder="请输入合同创建时间"
                          range-separator="至"
                          start-placeholder="合同日期开始日期"
                          end-placeholder="合同日期结束日期"
                          @change="searchTime"></el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary"
                     class="el-icon-search"
                     :loading="selLoading"
                     v-on:click="getContract"
                     v-if="findShow">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button plain
                     class="el-icon-plus"
                     @click.native="showDialogForm(0)"
                     v-if="addShow">新增临调合同</el-button>
        </el-form-item>
        <el-form-item>
          <el-button plain
                     class="el-icon-plus"
                     @click.native="showDialogForm(1)"
                     v-if="addShow">新增现货合同</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="danger"
                     class="el-icon-delete"
                     @click="delContract"
                     v-if="delShow">删除</el-button>
        </el-form-item>
      </el-form>
    </el-col>
    <el-col>
      <el-tabs v-model="activeName"
               @tab-click="handleClick">
        <el-tab-pane label="全部"
                     name="全部"></el-tab-pane>
        <el-tab-pane label="意向临调合同"
                     name="意向临调合同"></el-tab-pane>
        <el-tab-pane label="正式临调合同"
                     name="正式临调合同"></el-tab-pane>
        <el-tab-pane label="意向现货合同"
                     name="意向现货合同"></el-tab-pane>
        <el-tab-pane label="正式现货合同"
                     name="正式现货合同"></el-tab-pane>
      </el-tabs>
    </el-col>
    <!--列表-->
    <el-col>
      <el-table ref="contractTable"
                :data="saleContracts"
                highlight-current-row
                v-loading="listLoading"
                element-loading-text="拼命加载中"
                @selection-change="handleSelectionChange"
                style="width: 100%;">
        <el-table-column type="selection"
                         width="55"></el-table-column>

        <el-table-column prop="id"
                         label="id"
                         sortable
                         fixed="left"
                         v-if="isshow"
                         width="80"></el-table-column>

        <el-table-column prop="customerid"
                         label="客户id"
                         sortable
                         fixed="left"
                         width="150"
                         v-if="isshow"></el-table-column>
        <el-table-column prop="contractstatus"
                         label="合同类型"
                         sortable
                         fixed="left"
                         width="150"></el-table-column>
        <el-table-column prop="customername"
                         label="客户名称"
                         sortable
                         fixed="left"
                         width="250"></el-table-column>

        <el-table-column prop="contractno"
                         label="合同号"
                         sortable
                         width="150"></el-table-column>
        <el-table-column prop="contractaddress"
                         label="签约地点"
                         sortable
                         width="150"></el-table-column>
        <el-table-column prop="contractdate"
                         label="合同日期"
                         sortable
                         width="150">
          <template slot-scope="scope">
            <span>{{scope.row.contractdate, 'yyyy-MM-dd' | dataFormat}}</span>
          </template>
        </el-table-column>

        <el-table-column prop="deliverydate"
                         label="交货日期"
                         sortable
                         width="150">
          <template slot-scope="scope">
            <span>{{scope.row.deliverydate, 'yyyy-MM-dd' | dataFormat}}</span>
          </template>
        </el-table-column>

        <el-table-column prop="depositdate"
                         label="预付日期"
                         v-if="isshow"
                         sortable
                         width="150">
          <template slot-scope="scope">
            <span>{{scope.row.depositdate, 'yyyy-MM-dd' | dataFormat}}</span>
          </template>
        </el-table-column>

        <el-table-column prop="contractweight"
                         label="合同重量(吨)"
                         sortable
                         width="135"></el-table-column>
        <el-table-column prop="actualweight"
                         label="客户结算重量(吨)"
                         sortable
                         width="155"></el-table-column>

        <el-table-column prop="contractamount"
                         label="合同金额(元)"
                         sortable
                         width="160"></el-table-column>
        <el-table-column prop="actualamount"
                         label="客户结算金额(元)"
                         sortable
                         width="160"></el-table-column>

        <el-table-column prop="payment"
                         label="付款方式"
                         sortable
                         width="130"></el-table-column>

        <el-table-column prop="settlement"
                         label="结算方式"
                         sortable
                         width="150"></el-table-column>

        <el-table-column prop="transporttype"
                         label="运输方式"
                         sortable
                         width="100"></el-table-column>
        <el-table-column prop="createBy"
                         label="创建人"
                         sortable
                         width="100"></el-table-column>
        <el-table-column prop="verifyBy"
                         label="审核人"
                         sortable
                         width="100"></el-table-column>
        <el-table-column prop="crt"
                         label="创建日期"
                         sortable
                         width="180">
          <template slot-scope="scope">
            <span v-show="scope.row.crt!=null">{{scope.row.crt, 'yyyy-MM-dd hh:mm:ss' | dataFormat}}</span>
          </template>
        </el-table-column>

        <el-table-column prop="upt"
                         label="更新日期"
                         sortable
                         width="180">
          <template slot-scope="scope">
            <span v-show="scope.row.upt!=null">{{scope.row.upt, 'yyyy-MM-dd hh:mm:ss'| dataFormat}}</span>
          </template>
        </el-table-column>
        <el-table-column prop="contracttype"
                         label="合同类型"
                         sortable
                         width="150"
                         v-if="false"></el-table-column>
        <el-table-column prop="operation"
                         fixed="right"
                         label="操作"
                         width="100">
          <template slot-scope="scope">
            <el-popover trigger="hover"
                        placement="bottom">
              <div>
                <el-button type="text"
                           size="small"
                           @click="editShow(scope.row)"
                           v-if="detailShow&&!scope.row.verifyBy">编辑</el-button>
              </div>
              <div>
                <el-button type="text"
                           size="small"
                           @click="editTerm(scope.row)"
                           v-if="termShow&&!scope.row.verifyBy">条款</el-button>
              </div>
              <div>
                <el-button type="text"
                           size="small"
                           @click="printPreview(scope.row)"
                           v-if="printShow">打印预览</el-button>
              </div>
              <div>
                <el-button type="text"
                           v-if="processSubmitShow && scope.row.verifyBy"
                           size="small"
                           @click="jgorder(scope.row)">生成加工单</el-button>
              </div>
              <div>
                <el-button type="text"
                           v-if="deliverySubmitShow &&scope.row.verifyBy"
                           size="small"
                           @click="deliveryorder(scope.row)">生成提单</el-button>
              </div>
              <div>
                <el-button type="text"
                           v-if="verifyContractShow&&!scope.row.verifyBy"
                           size="small"
                           @click="verify(scope.row)">审核通过</el-button>
              </div>
              <div>
                <el-button type="text"
                           size="small"
                           @click="copyContract(scope.row)"
                           v-if="copyContractShow&&scope.row.contracttype=='0'">复制合同</el-button>
              </div>
              <div slot="reference"
                   class="name-wrapper">
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
    <el-col>
      <div class="block"
           style="float: right;margin-right: 10px;margin-top: 10px;">
        <el-pagination @size-change="handleSizeChange"
                       @current-change="handleCurrentChange"
                       :current-page="startPage"
                       :page-sizes="pageSizes"
                       :page-size="pageSize"
                       layout="total, sizes, prev, pager, next, jumper"
                       :total="total"></el-pagination>
      </div>
    </el-col>
    <el-col :span="2">
      <el-dialog :close-on-click-modal="false"
                 :title="thistitle"
                 :visible.sync="dialogFormVisible"
                 :append-to-body="true"
                 width="1250px">
        <div>
          <el-form :model="ruleForm"
                   status-icon
                   :rules="rules"
                   ref="ruleForm"
                   :inline="true"
                   label-width="90px"
                   class="demo-form-inline">
            <el-col :span="12">
              <el-form-item label="客户名称"
                            prop="addcustomername">
                <el-autocomplete v-model="ruleForm.addcustomername"
                                 :disabled="inputdisable"
                                 :fetch-suggestions="querySearchAsync"
                                 placeholder="请输入客户名称"
                                 @select="handleSelectCustomer"
                                 style="width:300px"></el-autocomplete>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="签约地点"
                            prop="addcontractaddress">
                <el-input class="inputwidth"
                          v-model="ruleForm.addcontractaddress"
                          :disabled="inputdisable"
                          placeholder="请输入内容"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="交货日期"
                            prop="adddeliverydate">
                <el-date-picker v-model="ruleForm.adddeliverydate"
                                type="date"
                                :disabled="inputdisable"
                                placeholder="选择日期"
                                class="inputwidth"></el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="付款方式"
                            prop="addpayment">
                <el-select class="inputwidth"
                           v-model="ruleForm.addpayment"
                           :disabled="inputdisable"
                           placeholder="请选择">
                  <el-option label="电汇"
                             value="电汇"></el-option>
                  <el-option label="支票"
                             value="支票"></el-option>
                  <el-option label="承兑"
                             value="承兑"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="结算方式"
                            prop="addsettlement">
                <el-select class="inputwidth"
                           v-model="ruleForm.addsettlement"
                           :disabled="inputdisable"
                           placeholder="请选择"
                           @change="addsettlementChange()">
                  <el-option label="货到付款"
                             value="货到付款"></el-option>
                  <el-option label="款到发货"
                             value="款到发货"></el-option>
                  <el-option label="月结"
                             value="月结"></el-option>
                  <el-option label="预付"
                             value="预付"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label
                            prop="percent"
                            v-if="percentShow">
                <el-select class="settleinputwidth"
                           v-model="ruleForm.percent"
                           :disabled="inputdisable"
                           placeholder="请输入百分比金额">
                  <el-option v-for="item in percentoptions"
                             :key="item.value"
                             :label="item.label"
                             :value="item.value"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="预付日期"
                            prop="depositdate"
                            v-if="percentShow">
                <el-date-picker v-model="ruleForm.depositdate"
                                type="date"
                                :disabled="inputdisable"
                                placeholder="选择日期"
                                class="settleinputwidth"></el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="运输方式"
                            prop="addtransporttype">
                <el-select class="inputwidth"
                           :disabled="inputdisable"
                           v-model="ruleForm.addtransporttype"
                           placeholder="请选择">
                  <el-option label="代运"
                             value="代运"></el-option>
                  <el-option label="自提"
                             value="自提"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <!-- <el-col :span="12">
							<el-form-item label="出库方式" prop="addstockouttype">
									<el-select class="inputwidth" v-model="ruleForm.addstockouttype" placeholder="请选择">
										<el-option label="过磅" value="过磅"></el-option>
										<el-option label="理算" value="理算"></el-option>
									</el-select>
							</el-form-item>
            </el-col>-->
            <el-col :span="12">
              <el-form-item label="附加条款"
                            prop="remark">
                <el-input :rows="10"
                          style="width:500px"
                          maxlength="200"
                          show-word-limit
                          :disabled="inputdisable"
                          type="textarea"
                          placeholder="请输入备注"
                          auto-complete="off"
                          v-model="ruleForm.remark"></el-input>
              </el-form-item>
            </el-col>
            <el-form-item label="商品明细">
              <el-button v-if="ruleForm.contractstatus==='意向临调合同'||ruleForm.contractstatus===''&&contracttype ==='0'"
                         size="mini"
                         @click="addRow()">+</el-button>
              <!-- <el-button size="mini" @click="refreshRow()">刷新</el-button> -->
              <el-table style="width:1100px"
                        :data="salegridData"
                        max-height="500"
                        :span-method="contractarraySpanMethod"
                        show-summary
                        :summary-method="getSummaries"
                        @current-change="handleRowChange"
                        class="el-tb-edit"
                        ref="gridTable"
                        highlight-current-row>
                <el-table-column property="status"
                                 label="状态"
                                 width="200">
                  <template slot-scope="scope">
                    <span>{{scope.row.status}}</span>
                  </template>
                </el-table-column>

                <el-table-column property="productname"
                                 label="名称"
                                 width="200">
                  <template slot-scope="scope">
                    <el-autocomplete class="autoInputwidth"
                                     ref="productnameInput"
                                     v-model="scope.row.productname"
                                     v-if="(scope.row.status=='待审核'||scope.row.status==undefined)&&contracttype=='0'"
                                     :fetch-suggestions="queryProductNameSearchAsync"
                                     placeholder="请输入商品名称">
                      <template slot-scope="{ item }">
                        <div class="name">{{ item.value }}</div>
                        <span hidden>{{ item.id }}</span>
                        <el-tooltip content="删除后重新点击输入框刷新"
                                    placement="bottom"
                                    effect="light">
                          <span class="addr"
                                @click.stop="delProductname(item.id)">删除</span>
                        </el-tooltip>
                      </template>
                    </el-autocomplete>
                    <span v-if="contracttype=='1'">{{scope.row.productname}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productspec"
                                 label="规格"
                                 width="200">
                  <template slot-scope="scope">
                    <el-autocomplete class="autoInputwidth"
                                     v-model="scope.row.productspec"
                                     v-if="(scope.row.status=='待审核'||scope.row.status==undefined)&&contracttype=='0'"
                                     :fetch-suggestions="queryProductspecSearchAsync"
                                     placeholder="请输入商品规格">
                      <template slot-scope="{ item }">
                        <div class="name">{{ item.value }}</div>
                        <span hidden>{{ item.id }}</span>
                        <el-tooltip content="删除后重新点击输入框刷新"
                                    placement="bottom"
                                    effect="light">
                          <span class="addr"
                                @click.stop="delProductspec(item.id)">删除</span>
                        </el-tooltip>
                      </template>
                    </el-autocomplete>
                    <span v-if="contracttype=='1'">{{scope.row.productspec}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productfactory"
                                 label="钢厂"
                                 width="160">
                  <template slot-scope="scope">
                    <el-autocomplete class="autoInputwidth"
                                     v-model="scope.row.productfactory"
                                     v-if="(scope.row.status=='待审核'||scope.row.status==undefined)&&contracttype=='0'"
                                     :fetch-suggestions="queryProductfactorySearchAsync"
                                     placeholder="请输入钢厂">
                      <template slot-scope="{ item }">
                        <div class="name">{{ item.value }}</div>
                        <span hidden>{{ item.id }}</span>
                        <el-tooltip content="删除后重新点击输入框刷新"
                                    placement="bottom"
                                    effect="light">
                          <span class="addr"
                                @click.stop="delProductfactory(item.id)">删除</span>
                        </el-tooltip>
                      </template>
                    </el-autocomplete>
                    <span v-if="contracttype=='1'">{{scope.row.productfactory}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productmark"
                                 label="材质"
                                 width="160">
                  <template slot-scope="scope">
                    <el-autocomplete class="autoInputwidth"
                                     v-model="scope.row.productmark"
                                     v-if="(scope.row.status=='待审核'||scope.row.status==undefined)&&contracttype=='0'"
                                     :fetch-suggestions="queryProductmarkSearchAsync"
                                     placeholder="请输入材质">
                      <template slot-scope="{ item }">
                        <div class="name">{{ item.value }}</div>
                        <span hidden>{{ item.id }}</span>
                        <el-tooltip content="删除后重新点击输入框刷新"
                                    placement="bottom"
                                    effect="light">
                          <span class="addr"
                                @click.stop="delProductmark(item.id)">删除</span>
                        </el-tooltip>
                      </template>
                    </el-autocomplete>
                    <span v-if="contracttype=='1'">{{scope.row.productmark}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="weight"
                                 label="重量(吨)"
                                 width="120">
                  <template slot-scope="scope">
                    <el-input size="mini"
                              v-if="(scope.row.status=='待审核' ||scope.row.status==undefined)&&contracttype=='0'"
                              v-model="scope.row.weight"
                              placeholder="请输入内容"></el-input>
                    <span v-if="contracttype=='1'">{{scope.row.weight}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="price"
                                 label="单价(元)"
                                 width="150">
                  <template slot-scope="scope">
                    <el-input size="mini"
                              v-if="scope.row.status=='待审核' ||scope.row.status=='已锁货' ||scope.row.status==undefined "
                              v-model="scope.row.price"
                              placeholder="请输入内容"></el-input>
                  </template>
                </el-table-column>
                <el-table-column property="unit"
                                 label="单位"
                                 width="100">
                  <template slot-scope="scope">
                    <el-select size="mini"
                               v-if="(scope.row.status=='待审核' ||scope.row.status==undefined) &&contracttype=='0'"
                               filterable
                               class="inputwidth"
                               v-model="scope.row.unit"
                               placeholder="请选择">
                      <el-option label="件"
                                 value="件"></el-option>
                      <el-option label="支"
                                 value="支"></el-option>
                      <el-option label="张"
                                 value="张"></el-option>
                    </el-select>

                    <span v-if="contracttype=='1'">{{scope.row.unit}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="num"
                                 label="数量"
                                 width="80">
                  <template slot-scope="scope">
                    <el-input size="mini"
                              v-if="(scope.row.status=='待审核' ||scope.row.status==undefined )&&contracttype=='0'"
                              v-model="scope.row.num"
                              placeholder="请输入内容"></el-input>
                    <span v-if="contracttype=='1'">{{scope.row.num}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="total"
                                 label="合计(元)"
                                 width="150">
                  <template slot-scope="scope">
                    <span>{{scope.row.total}}</span>
                  </template>
                </el-table-column>

                <el-table-column property="stockouttype"
                                 label="出库方式"
                                 width="150">
                  <template slot-scope="scope">
                    <el-select size="mini"
                               filterable
                               v-if="(scope.row.status=='待审核' ||scope.row.status==undefined)&& contracttype=='0'"
                               class="inputwidth"
                               v-model="scope.row.stockouttype"
                               placeholder="请选择">
                      <el-option label="过磅"
                                 value="过磅"></el-option>
                      <el-option label="理算"
                                 value="理算"></el-option>
                      <el-option label="抄码"
                                 value="抄码"></el-option>
                    </el-select>
                    <span v-if="contracttype=='1'">{{scope.row.stockouttype}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="quality"
                                 label="品级"
                                 width="150">
                  <template slot-scope="scope">
                    <el-select size="mini"
                               filterable
                               v-if="(scope.row.status=='待审核' ||scope.row.status==undefined )&&contracttype=='0'"
                               class="inputwidth"
                               v-model="scope.row.quality"
                               placeholder="请选择">
                      <el-option label="合格品"
                                 value="合格品"></el-option>
                      <el-option label="协议品"
                                 value="协议品"></el-option>
                    </el-select>
                    <span v-if="contracttype=='1'">{{scope.row.quality}}</span>
                  </template>
                </el-table-column>

                <el-table-column fixed="right"
                                 label="操作"
                                 width="120">
                  <template slot-scope="scope"
                            v-if="(scope.row.status=='待审核' &&contracttype!=='1')||scope.row.status==undefined ">
                    <el-button @click.native.prevent="deleteRow(scope.$index, salegridData)"
                               type="text"
                               size="small">移除</el-button>
                    <el-button @click.native.prevent="copyRow(scope.row)"
                               type="text"
                               size="small">复制</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </el-form>
        </div>
        <div slot="footer"
             class="dialog-footer">
          <el-button @click="closeDialog('ruleForm')">取 消</el-button>
          <!-- <el-button @click="resetForm('ruleForm')">重置</el-button> -->
          <el-button type="primary"
                     @click="submitForm('ruleForm')">确 定</el-button>
        </div>
      </el-dialog>
    </el-col>

    <el-col :span="2">
      <el-dialog id="salecontractList"
                 :close-on-click-modal="false"
                 title="加工单"
                 :visible.sync="jgdialogFormVisible"
                 width="1250px"
                 :append-to-body="true">
        <div>
          <el-form :model="jgruleForm"
                   status-icon
                   :rules="jgrules"
                   ref="jgruleForm"
                   :inline="true"
                   label-width="90px"
                   class="demo-form-inline">
            <el-col :span="8">
              <el-form-item label="加工模版"
                            prop="templateId">
                <el-select v-model="jgruleForm.templateId"
                           placeholder="请选择"
                           @change="currentTemplateIdSel"
                           class="selectwidth">
                  <el-option v-for="item in customerTemplateList"
                             :key="item.id"
                             :label="item.name"
                             :value="item.id">
                    <span style="float: left">{{ item.name }}</span>
                    <span style="float: right; color: #8492a6; font-size: 13px">
                      <el-button type="text"
                                 size="small"
                                 @click="delTemplate(item.id)">删除</el-button>
                    </span>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item>
                <el-button type="text"
                           size="small"
                           @click="resetTemplate">重置加工模版</el-button>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="仓库名"
                            prop="warehouseName">
                <el-autocomplete v-model="jgruleForm.warehouseName"
                                 :fetch-suggestions="queryWarehouseSearchAsync"
                                 placeholder="请输入仓库名"
                                 @select="handleSelectJgWarehouse"
                                 class="autoinputwidth"></el-autocomplete>
                <!-- <el-input type="text" placeholder="请输入仓库全称" auto-complete="off" v-model="jgruleForm.warehouse" ></el-input> -->
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item>
                <el-button type="text"
                           size="small"
                           @click="warehouseShow">仓库管理</el-button>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="加工类型"
                            prop="processtype">
                <el-select v-model="jgruleForm.processtype"
                           placeholder="请选择">
                  <el-option label="开平"
                             value="开平"></el-option>
                  <el-option label="分条"
                             value="分条"></el-option>
                  <el-option label="分条+开平"
                             value="分条+开平"></el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="加工费/吨"
                            prop="processfee">
                <el-input type="text"
                          placeholder="请输入加工费单价"
                          auto-complete="off"
                          v-model="jgruleForm.processfee"></el-input>
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="加工要求"
                            prop="remark">
                <quill-editor class="jgquill"
                              ref="myTextEditor"
                              v-model="jgruleForm.remark"
                              :options="editorOption"
                              @blur="onEditorBlur($event)"
                              @focus="onEditorFocus($event)"
                              @ready="onEditorReady($event)"
                              @change="onEditorChange($event)">
                  >
                  <div id="toolbar1"
                       slot="toolbar">
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
              </el-form-item>
              <!-- <el-form-item label="加工备注" prop="remark">
                <el-input :rows="3" class="inputwidth" type="textarea" placeholder="请输入备注" auto-complete="off" v-model="jgruleForm.remark"></el-input>
              </el-form-item>-->
            </el-col>
            <el-form-item label="合同明细">
              <!-- <el-button size="mini" @click="addTdJgRow()">+</el-button> -->
              <!-- <el-button size="mini" @click="refreshRow()">刷新</el-button> -->
              <el-table style="width:1100px"
                        :data="contractGridData"
                        max-height="500"
                        class="el-tb-edit"
                        ref="tdcontractTable"
                        highlight-current-row
                        show-summary
                        :summary-method="getTdContractSummaries">
                <el-table-column prop="id"
                                 v-model="scope.row.id"
                                 label="id"
                                 sortable
                                 v-if="isshow"
                                 width="80"></el-table-column>
                <!-- <el-table-column prop="stockid" label="stockid" sortable v-if="isshow" width="80"></el-table-column> -->
                <!-- <el-table-column prop="processstatus" label="加工状态" sortable width="100"></el-table-column>
                <el-table-column prop="deliverystatus" label="提货状态" sortable width="100"></el-table-column>-->

                <el-table-column property="productname"
                                 label="名称"
                                 width="160">
                  <template slot-scope="scope">
                    <span>{{scope.row.productname}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productspec"
                                 label="规格"
                                 width="160">
                  <template slot-scope="scope">
                    <span>{{scope.row.productspec}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productfactory"
                                 label="钢厂"
                                 width="160">
                  <template slot-scope="scope">
                    <span>{{scope.row.productfactory}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productmark"
                                 label="材质"
                                 width="160">
                  <template slot-scope="scope">
                    <span>{{scope.row.productmark}}</span>
                  </template>
                </el-table-column>

                <el-table-column property="weight"
                                 min="1"
                                 label="合同重量(吨)"
                                 width="120">
                  <template slot-scope="scope">
                    <span>{{scope.row.weight}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="actualweight"
                                 min="1"
                                 label="提库重量(吨)"
                                 width="120">
                  <template slot-scope="scope">
                    <span>{{scope.row.actualweight}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="finalweight"
                                 min="1"
                                 label="客户结算重量(吨)"
                                 width="160">
                  <template slot-scope="scope">
                    <span>{{scope.row.finalweight}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="price"
                                 label="单价(元)"
                                 width="120">
                  <template slot-scope="scope">
                    <!-- <el-input size="mini" v-model="scope.row.price" placeholder="请输入内容"></el-input> -->
                    <span>{{scope.row.price}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="stockid"
                                 label="库存Id"
                                 width="120"
                                 v-if="isshow">
                  <template slot-scope="scope">
                    <el-input size="mini"
                              v-model="scope.row.stockid"
                              placeholder="请输入内容"
                              v-if="scope.row.id===null"></el-input>
                    <span>{{scope.row.stockid}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="selectedIdss"
                                 label="选择的加工id"
                                 width="160"
                                 v-if="isshow">
                  <template slot-scope="scope">
                    <!-- <el-input size="mini" v-model="scope.row.num" placeholder="请输入内容"></el-input> -->
                    <span>{{scope.row.selectedIdss}}</span>
                  </template>
                </el-table-column>

                <el-table-column property="unit"
                                 label="单位"
                                 width="100">
                  <template slot-scope="scope">
                    <el-select size="mini"
                               filterable
                               class="inputwidth"
                               v-model="scope.row.unit"
                               placeholder="请选择"
                               v-if="scope.row.id===null">
                      <el-option label="件"
                                 value="件"></el-option>
                      <el-option label="支"
                                 value="支"></el-option>
                      <el-option label="张"
                                 value="张"></el-option>
                    </el-select>
                    <span>{{scope.row.unit}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="num"
                                 label="数量"
                                 width="60">
                  <template slot-scope="scope">
                    <el-input size="mini"
                              v-model="scope.row.num"
                              placeholder="请输入内容"
                              v-if="scope.row.id===null"></el-input>
                    <span>{{scope.row.num}}</span>
                  </template>
                </el-table-column>
                <!-- <el-table-column property="warehousename" label="所在仓库" width="160">
                  <template slot-scope="scope">
                    <el-autocomplete
                      class="autoInputwidth"
                      v-model="scope.row.warehousename"
                      v-if="scope.row.id===null"
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
                </el-table-column>-->

                <el-table-column property="quality"
                                 label="品级"
                                 width="150">
                  <template slot-scope="scope">
                    <el-select size="mini"
                               filterable
                               class="inputwidth"
                               v-model="scope.row.quality"
                               placeholder="请选择"
                               v-if="scope.row.id===null">
                      <el-option label="合格品"
                                 value="合格品"></el-option>
                      <el-option label="协议品"
                                 value="协议品"></el-option>
                    </el-select>
                    <span>{{scope.row.quality}}</span>
                  </template>
                </el-table-column>
                <!-- <el-table-column property="remark" label="备注" width="300">
                  <template slot-scope="scope">
                    <el-input
                      size="mini"
                      v-model="scope.row.remark"
                      placeholder="请输入内容"
                      v-if="scope.row.id===null"
                    ></el-input>
                    <span>{{scope.row.remark}}</span>
                  </template>
                </el-table-column>-->
                <el-table-column fixed="right"
                                 label="操作"
                                 width="120">
                  <template slot-scope="scope">
                    <!-- <el-button
                      v-if="scope.row.stockid===undefined"
                      @click.native.prevent="copyTdRow(scope.row)"
                      type="text"
                      size="small"
                    >复制</el-button>-->
                    <el-button @click.native.prevent="addTdJgRow(scope.row,'jg')"
                               type="text"
                               size="small">拆解明细</el-button>
                    <!-- <el-button
                      v-if="scope.row.id===null"
                      @click.native.prevent="deleteRow(scope.$index, tdgridData)"
                      type="text"
                      size="small"
                    >移除</el-button>-->
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>

            <el-form-item label="商品明细">
              <el-button size="mini"
                         @click="refreshRow('jg')">重置</el-button>
              <el-table style="width:1100px"
                        :data="jggridData"
                        max-height="500"
                        class="el-tb-edit"
                        ref="jggridTable"
                        highlight-current-row
                        @selection-change="handleItemSelectionChange"
                        show-summary
                        :summary-method="getSaleJgSummaries">
                <el-table-column type="selection"
                                 width="80"
                                 @selection-change="handleItemSelectionChange"
                                 :selectable="checkboxProcessInit"></el-table-column>
                <el-table-column prop="id"
                                 label="id"
                                 sortable
                                 fixed="left"
                                 v-if="isshow"
                                 width="80"></el-table-column>
                <el-table-column prop="deliverystatus"
                                 label="提货状态"
                                 sortable
                                 v-if="isshow"
                                 width="100">
                  <template slot-scope="scope">
                    <span>{{scope.row.deliverystatus}}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="processstatus"
                                 label="加工状态"
                                 sortable
                                 fixed="left"
                                 v-if="isshow"
                                 width="100">
                  <template slot-scope="scope">
                    <span>{{scope.row.processstatus}}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="stockid"
                                 label="stockid"
                                 sortable
                                 v-if="isshow"
                                 width="80"></el-table-column>
                <el-table-column property="productname"
                                 label="名称"
                                 width="150">
                  <template slot-scope="scope">
                    <span>{{scope.row.productname}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productspec"
                                 label="规格"
                                 width="150">
                  <template slot-scope="scope">
                    <span>{{scope.row.productspec}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productfactory"
                                 label="钢厂"
                                 width="100">
                  <template slot-scope="scope">
                    <span>{{scope.row.productfactory}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productmark"
                                 label="材质"
                                 width="100">
                  <template slot-scope="scope">
                    <span>{{scope.row.productmark}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="actualweight"
                                 min="1"
                                 label="提库重量(吨)"
                                 width="120">
                  <template slot-scope="scope">
                    <span>{{scope.row.actualweight}}</span>
                  </template>
                </el-table-column>

                <el-table-column property="stockid"
                                 label="库存Id"
                                 width="120"
                                 v-if="isshow">
                  <template slot-scope="scope">
                    <span>{{scope.row.stockid}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="price"
                                 label="单价(元)"
                                 width="120"
                                 v-if="isshow">
                  <template slot-scope="scope">
                    <!-- <el-input size="mini" v-model="scope.row.price" placeholder="请输入内容"></el-input> -->
                    <span>{{scope.row.price}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="unit"
                                 label="单位"
                                 width="60">
                  <template slot-scope="scope">
                    <span>{{scope.row.unit}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="num"
                                 label="数量"
                                 width="60">
                  <template slot-scope="scope">
                    <!-- <el-input size="mini" v-model="scope.row.num" placeholder="请输入内容"></el-input> -->
                    <span>{{scope.row.num}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="warehousename"
                                 label="所在仓库"
                                 width="120">
                  <template slot-scope="scope">
                    <!-- <el-input size="mini" v-model="scope.row.num" placeholder="请输入内容"></el-input> -->
                    <span>{{scope.row.warehousename}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="quality"
                                 label="品级"
                                 width="150">
                  <template slot-scope="scope">
                    <span>{{scope.row.quality}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="remark"
                                 label="加工要求"
                                 width="300">
                  <template slot-scope="scope">
                    <el-input size="mini"
                              v-model="scope.row.remark"
                              placeholder="请输入内容"></el-input>
                    <span>{{scope.row.remark}}</span>
                  </template>
                </el-table-column>
                <el-table-column fixed="right"
                                 label="操作"
                                 width="120">
                  <template slot-scope="scope"
                            v-if="(scope.row.processstatus== null && scope.row.deliverystatus== null)">
                    <el-button @click.native.prevent="importFrom(scope.$index,scope.row,'jg')"
                               type="text"
                               size="small">库存提取</el-button>
                    <el-button @click.native.prevent="deleteRow(scope.$index, jggridData)"
                               type="text"
                               size="small">移除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </el-form>
        </div>
        <div slot="footer"
             class="dialog-footer">
          <el-button @click="closeDialog('jgruleForm')">取 消</el-button>
          <!-- <el-button @click="resetForm('ruleForm')">重置</el-button> -->
          <el-button type="primary"
                     @click="gotoJg('jgruleForm')">保 存</el-button>
        </div>
      </el-dialog>
    </el-col>

    <el-col :span="2">
      <el-dialog :close-on-click-modal="false"
                 title="提单"
                 :visible.sync="tddialogFormVisible"
                 width="1250px"
                 :append-to-body="true"
                 id="salecontractList">
        <div>
          <el-form :model="tdruleForm"
                   status-icon
                   :rules="tdrules"
                   ref="tdruleForm"
                   :inline="true"
                   label-width="100px"
                   class="demo-form-inline">
            <el-col :span="12">
              <el-form-item label="有效日"
                            prop="validateTime">
                <el-date-picker v-model="tdruleForm.validateTime"
                                type="daterange"
                                range-separator="至"
                                start-placeholder="开始日期"
                                end-placeholder="结束日期"
                                @change="searchTime1"></el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="仓库名"
                            prop="warehouseName">
                <el-autocomplete v-model="tdruleForm.warehouseName"
                                 :fetch-suggestions="queryWarehouseSearchAsync"
                                 placeholder="请输入仓库名"
                                 @select="handleSelectTdWarehouse"></el-autocomplete>
                <!-- <el-input type="text" placeholder="请输入仓库全称" auto-complete="off" v-model="jgruleForm.warehouse" ></el-input> -->
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item>
                <el-button type="text"
                           size="small"
                           @click="warehouseShow">仓库管理</el-button>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="委托车辆号"
                            prop="vehicleNumber">
                <el-input :rows="8"
                          class="vehiclewidth"
                          type="textarea"
                          placeholder="请输入车辆牌照"
                          auto-complete="off"
                          v-model="tdruleForm.vehicleNumber"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="提货方式"
                            prop="deliverymethod">
                <el-select v-model="tdruleForm.deliverymethod"
                           placeholder="请选择">
                  <el-option label="汽运"
                             value="汽运"></el-option>
                  <el-option label="船运"
                             value="船运"></el-option>
                  <el-option label="汽运+船运"
                             value="汽运+船运"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="是否货权转让"
                            prop="isItemRight">
                <el-checkbox v-model="tdruleForm.isItemRight">是</el-checkbox>
              </el-form-item>
            </el-col>
            <el-col :span="7">
              <el-form-item label="吊费类型"
                            prop="feeoption">
                <el-select v-model="tdruleForm.feeoption"
                           placeholder="请选择吊费类型">
                  <el-option v-for="item in freightoptions"
                             :key="item.value"
                             :label="item.label"
                             :value="item.value"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="吊费金额"
                            prop="liftingfee">
                <el-input placeholder="请输入吊费"
                          v-model="tdruleForm.liftingfee"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <!-- <el-form-item label="备注" prop="remark">
                <el-input :rows="5" class="vehiclewidth" type="textarea" placeholder="请输入备注事项" auto-complete="off" v-model="tdruleForm.remark"></el-input>
              </el-form-item>-->
              <el-form-item label="提货备注"
                            prop="remark">
                <quill-editor class="tdquill"
                              ref="myTextEditor"
                              v-model="tdruleForm.remark"
                              :options="editorOption2"
                              @blur="onEditorBlur($event)"
                              @focus="onEditorFocus($event)"
                              @ready="onEditorReady($event)"
                              @change="onEditorChange($event)">
                  >
                  <div id="toolbar2"
                       slot="toolbar">
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
              </el-form-item>
            </el-col>
            <el-form-item label="合同明细">
              <!-- <el-button size="mini" @click="addTdJgRow()">+</el-button> -->

              <el-table style="width:1100px"
                        :data="contractGridData"
                        max-height="500"
                        class="el-tb-edit"
                        ref="tdcontractTable"
                        highlight-current-row
                        show-summary
                        :summary-method="getTdContractSummaries">
                <el-table-column prop="id"
                                 v-model="scope.row.id"
                                 label="id"
                                 sortable
                                 v-if="isshow"
                                 width="80"></el-table-column>
                <!-- <el-table-column prop="stockid" label="stockid" sortable v-if="isshow" width="80"></el-table-column> -->
                <!-- <el-table-column prop="processstatus" label="加工状态" sortable width="100"></el-table-column>
                <el-table-column prop="deliverystatus" label="提货状态" sortable width="100"></el-table-column>-->

                <el-table-column property="productname"
                                 label="名称"
                                 width="160">
                  <template slot-scope="scope">
                    <span>{{scope.row.productname}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productspec"
                                 label="规格"
                                 width="160">
                  <template slot-scope="scope">
                    <span>{{scope.row.productspec}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productfactory"
                                 label="钢厂"
                                 width="160">
                  <template slot-scope="scope">
                    <span>{{scope.row.productfactory}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productmark"
                                 label="材质"
                                 width="160">
                  <template slot-scope="scope">
                    <span>{{scope.row.productmark}}</span>
                  </template>
                </el-table-column>

                <el-table-column property="weight"
                                 min="1"
                                 label="合同重量(吨)"
                                 width="120">
                  <template slot-scope="scope">
                    <span>{{scope.row.weight}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="actualweight"
                                 min="1"
                                 label="提库重量(吨)"
                                 width="120">
                  <template slot-scope="scope">
                    <span>{{scope.row.actualweight}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="finalweight"
                                 min="1"
                                 label="客户结算重量(吨)"
                                 width="160">
                  <template slot-scope="scope">
                    <span>{{scope.row.finalweight}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="price"
                                 label="单价(元)"
                                 width="120">
                  <template slot-scope="scope">
                    <!-- <el-input size="mini" v-model="scope.row.price" placeholder="请输入内容"></el-input> -->
                    <span>{{scope.row.price}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="stockid"
                                 label="库存Id"
                                 width="120"
                                 v-if="isshow">
                  <template slot-scope="scope">
                    <el-input size="mini"
                              v-model="scope.row.stockid"
                              placeholder="请输入内容"
                              v-if="scope.row.id===null"></el-input>
                    <span>{{scope.row.stockid}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="selectedIdss"
                                 label="选择的加工id"
                                 width="160"
                                 v-if="isshow">
                  <template slot-scope="scope">
                    <!-- <el-input size="mini" v-model="scope.row.num" placeholder="请输入内容"></el-input> -->
                    <span>{{scope.row.selectedIdss}}</span>
                  </template>
                </el-table-column>

                <el-table-column property="unit"
                                 label="单位"
                                 width="100">
                  <template slot-scope="scope">
                    <el-select size="mini"
                               filterable
                               class="inputwidth"
                               v-model="scope.row.unit"
                               placeholder="请选择"
                               v-if="scope.row.id===null">
                      <el-option label="件"
                                 value="件"></el-option>
                      <el-option label="支"
                                 value="支"></el-option>
                      <el-option label="张"
                                 value="张"></el-option>
                    </el-select>
                    <span>{{scope.row.unit}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="num"
                                 label="数量"
                                 width="60">
                  <template slot-scope="scope">
                    <el-input size="mini"
                              v-model="scope.row.num"
                              placeholder="请输入内容"
                              v-if="scope.row.id===null"></el-input>
                    <span>{{scope.row.num}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="warehousename"
                                 label="所在仓库"
                                 width="160">
                  <template slot-scope="scope">
                    <el-autocomplete class="autoInputwidth"
                                     v-model="scope.row.warehousename"
                                     v-if="scope.row.id===null"
                                     :fetch-suggestions="querySaleContractWarehouseSearchAsync"
                                     placeholder="请输入仓库名称">
                      <template slot-scope="{ item }">
                        <div class="name">{{ item.value }}</div>
                        <span hidden>{{ item.id }}</span>
                        <el-tooltip content="删除后重新点击输入框刷新"
                                    placement="bottom"
                                    effect="light">
                          <span class="addr"
                                @click.stop="delSaleContractWarehouse(item.id)">删除</span>
                        </el-tooltip>
                      </template>
                    </el-autocomplete>
                    <span>{{scope.row.warehousename}}</span>
                  </template>
                </el-table-column>

                <el-table-column property="quality"
                                 label="品级"
                                 width="150">
                  <template slot-scope="scope">
                    <el-select size="mini"
                               filterable
                               class="inputwidth"
                               v-model="scope.row.quality"
                               placeholder="请选择"
                               v-if="scope.row.id===null">
                      <el-option label="合格品"
                                 value="合格品"></el-option>
                      <el-option label="协议品"
                                 value="协议品"></el-option>
                    </el-select>
                    <span>{{scope.row.quality}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="remark"
                                 label="备注"
                                 width="300">
                  <template slot-scope="scope">
                    <el-input size="mini"
                              v-model="scope.row.remark"
                              placeholder="请输入内容"
                              v-if="scope.row.id===null"></el-input>
                    <span>{{scope.row.remark}}</span>
                  </template>
                </el-table-column>
                <el-table-column fixed="right"
                                 label="操作"
                                 width="120">
                  <template slot-scope="scope">
                    <!-- <el-button
                      v-if="scope.row.stockid===undefined"
                      @click.native.prevent="copyTdRow(scope.row)"
                      type="text"
                      size="small"
                    >复制</el-button>-->
                    <el-button @click.native.prevent="addTdJgRow(scope.row,'td')"
                               type="text"
                               size="small">拆解明细</el-button>
                    <!-- <el-button
                      v-if="scope.row.id===null"
                      @click.native.prevent="deleteRow(scope.$index, tdgridData)"
                      type="text"
                      size="small"
                    >移除</el-button>-->
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>

            <el-form-item label="商品明细">
              <!-- <el-button size="mini" @click="addTdJgRow()">+</el-button>
              <el-button size="mini" @click="refreshRow()">刷新</el-button>-->
              <el-button size="mini"
                         @click="refreshRow('td')">重置</el-button>
              <el-table style="width:1100px"
                        :data="tdgridData"
                        max-height="500"
                        class="el-tb-edit"
                        ref="tdgridTable"
                        highlight-current-row
                        @selection-change="handleItemSelectionChange"
                        show-summary
                        :summary-method="getTdSummaries">
                <el-table-column type="selection"
                                 width="80"
                                 @selection-change="handleItemSelectionChange"
                                 :selectable="checkboxDeliveryInit"></el-table-column>
                <el-table-column prop="id"
                                 v-model="scope.row.id"
                                 label="id"
                                 sortable
                                 v-if="isshow"
                                 width="80"></el-table-column>
                <el-table-column prop="stockid"
                                 label="stockid"
                                 sortable
                                 v-if="isshow"
                                 width="80"></el-table-column>
                <el-table-column prop="processstatus"
                                 label="加工状态"
                                 sortable
                                 width="100"
                                 v-if="isshow"></el-table-column>
                <el-table-column prop="deliverystatus"
                                 label="提货状态"
                                 sortable
                                 width="100"
                                 v-if="isshow"></el-table-column>

                <el-table-column property="productname"
                                 label="名称"
                                 width="200">
                  <template slot-scope="scope">
                    <!-- <el-autocomplete
                      class="autoInputwidth"
                      v-model="scope.row.productname"
                      v-if="scope.row.id===null"
                      :fetch-suggestions="queryProductNameSearchAsync"
                      placeholder="请输入商品名称"
                    >
                      <template slot-scope="{ item }">
                        <div class="name">{{ item.value }}</div>
                        <span hidden>{{ item.id }}</span>
                        <span class="addr" @click.stop="delProductname(item.id)">删除</span>
                      </template>
                    </el-autocomplete>-->
                    <span>{{scope.row.productname}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productspec"
                                 label="规格"
                                 width="160">
                  <template slot-scope="scope">
                    <span>{{scope.row.productspec}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productfactory"
                                 label="钢厂"
                                 width="160">
                  <template slot-scope="scope">
                    <span>{{scope.row.productfactory}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productmark"
                                 label="材质"
                                 width="160">
                  <template slot-scope="scope">
                    <span>{{scope.row.productmark}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="actualweight"
                                 min="1"
                                 label="提库重量(吨)"
                                 width="120">
                  <template slot-scope="scope">
                    <span>{{scope.row.actualweight}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="finalweight"
                                 min="1"
                                 label="客户结算重量(吨)"
                                 width="160">
                  <template slot-scope="scope">
                    <el-input size="mini"
                              v-model="scope.row.finalweight"
                              placeholder="请输入结算重量"></el-input>
                    <span>{{scope.row.finalweight}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="stockid"
                                 label="库存Id"
                                 width="120"
                                 v-if="isshow">
                  <template slot-scope="scope">
                    <span>{{scope.row.stockid}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="selectedIdss"
                                 label="选择的加工id"
                                 width="160"
                                 v-if="isshow">
                  <template slot-scope="scope">
                    <!-- <el-input size="mini" v-model="scope.row.num" placeholder="请输入内容"></el-input> -->
                    <span>{{scope.row.selectedIdss}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="price"
                                 label="单价(元)"
                                 width="120"
                                 v-if="isshow">
                  <template slot-scope="scope">
                    <!-- <el-input size="mini" v-model="scope.row.price" placeholder="请输入内容"></el-input> -->
                    <span>{{scope.row.price}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="unit"
                                 label="单位"
                                 width="100">
                  <template slot-scope="scope">
                    <!-- <el-select
                      size="mini"
                      filterable
                      class="inputwidth"
                      v-model="scope.row.unit"
                      placeholder="请选择"
                      v-if="scope.row.id===null"
                    >
                      <el-option label="件" value="件"></el-option>
                      <el-option label="支" value="支"></el-option>
                      <el-option label="张" value="张"></el-option>
                    </el-select>-->
                    <span>{{scope.row.unit}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="num"
                                 label="数量"
                                 width="60">
                  <template slot-scope="scope">
                    <!-- <el-input
                      size="mini"
                      v-model="scope.row.num"
                      placeholder="请输入内容"
                      v-if="scope.row.id===null"
                    ></el-input>-->
                    <span>{{scope.row.num}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="warehousename"
                                 label="所在仓库"
                                 width="160">
                  <template slot-scope="scope">
                    <span>{{scope.row.warehousename}}</span>
                  </template>
                </el-table-column>

                <el-table-column property="quality"
                                 label="品级"
                                 width="150">
                  <template slot-scope="scope">
                    <span>{{scope.row.quality}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="remark"
                                 label="备注"
                                 width="300">
                  <template slot-scope="scope">
                    <el-input size="mini"
                              v-model="scope.row.remark"
                              placeholder="请输入内容"></el-input>
                    <span>{{scope.row.remark}}</span>
                  </template>
                </el-table-column>
                <el-table-column fixed="right"
                                 label="操作"
                                 width="120">
                  <template slot-scope="scope">
                    <el-button v-if="scope.row.stockid===undefined"
                               @click.native.prevent="copyTdRow(scope.row)"
                               type="text"
                               size="small">复制</el-button>
                    <el-button v-if="scope.row.deliverystatus!=='出库中'&& scope.row.processstatus!=='加工中'"
                               @click.native.prevent="importFrom(scope.$index,scope.row,'td')"
                               type="text"
                               size="small">库存提取</el-button>
                    <el-button @click.native.prevent="deleteRow(scope.$index, tdgridData)"
                               type="text"
                               size="small">移除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </el-form>
        </div>
        <div slot="footer"
             class="dialog-footer">
          <el-button @click="closeDialog('tdruleForm')">取 消</el-button>
          <!-- <el-button @click="resetForm('ruleForm')">重置</el-button> -->
          <el-button type="primary"
                     @click="gotoTd('tdruleForm')">保 存</el-button>
        </div>
      </el-dialog>
    </el-col>

    <el-col :span="2">
      <el-dialog title="合同条款"
                 :visible.sync="termFormVisible"
                 :close-on-click-modal="false"
                 :append-to-body="true">
        <div>
          <el-form ref="termRuleForm"
                   status-icon
                   :rules="rules"
                   :inline="true"
                   label-width="90px"
                   class="demo-form-inline">
            <el-form-item label="公司名称:"
                          prop="companyName">
              {{companyName}}
              <!-- <el-input v-model="companyName" :readonly="true" ></el-input> -->
            </el-form-item>
            <el-form-item label="合同号:"
                          prop="contractNo">
              {{contractNo}}
              <!-- <el-input v-model="contractNo" :readonly="true" ></el-input> -->
            </el-form-item>
            <div>
              <quill-editor class="termquill"
                            ref="myTextEditor"
                            v-model="content"
                            :options="editorOption3"
                            @blur="onEditorBlur($event)"
                            @focus="onEditorFocus($event)"
                            @ready="onEditorReady($event)"
                            @change="onEditorChange($event)">
                >
                <div id="toolbar3"
                     slot="toolbar">
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
        <div slot="footer"
             class="limit">
          当前已输入
          <span>{{nowLength}}</span> 个字符，您还可以输入
          <span>{{SurplusLength}}</span> 个字符。
        </div>
        <div slot="footer"
             class="dialog-footer">
          <el-button @click="closeDialog('termRuleForm')">取 消</el-button>
          <el-button type="primary"
                     @click="submitTermForm('termRuleForm')">保 存</el-button>
        </div>
      </el-dialog>
    </el-col>

    <el-col :span="2">
      <el-dialog width="1000px"
                 :close-on-click-modal="false"
                 :visible.sync="contractVisible"
                 :append-to-body="true"
                 class="contractheight">
        <div class="contractbox"
             id="contractbox">
          <h2 style="text-align:center">产品销售合同</h2>
          <p>合同编号：{{saleContractbox.contractno}}</p>
          <el-col :span="16">需 方（以下简称甲方）： {{saleContractbox.customername}}</el-col>
          <el-col :span="8">签订地点： {{saleContractbox.contractaddress}}</el-col>
          <el-col :span="16">供 方（以下简称乙方）： {{informationdata.companyname}}</el-col>
          <el-col :span="8">签订时间：{{contractdate}}</el-col>
          <el-col :span="24">
            <p>本着平等、互惠的原则，经供需双方协商，特订立本销售合同，双方一致同意遵照下列订货内容。</p>
          </el-col>
          <el-col :span="16">交货日期 ： {{deliverydate}}</el-col>
          <el-col :span="8">付款方式 ： {{saleContractbox.payment}}</el-col>
          <el-col :span="16">
            结算方式 ：{{saleContractbox.settlement }}
            <span v-if="saleContractbox.settlement =='预付'">{{saleContractbox.percent }} | 预付日期为{{depositdate }}</span>
          </el-col>
          <el-col :span="8">运输方式 ： {{saleContractbox.transporttype}}</el-col>
          <p>产品明细：</p>
          <!-- <el-col :span="24" class="digitUppercase"> -->
          <div class="addorder"
               id="addorder">
            <el-table :data="contractData"
                      :span-method="contractSpanMethod"
                      show-summary
                      :summary-method="contractgetSummaries"
                      ref="contractDataTable">
              <el-table-column type="index"
                               label="序号"
                               width="60"></el-table-column>
              <el-table-column property="productname"
                               width="120"
                               label="产品名称"></el-table-column>
              <el-table-column property="productspec"
                               width="110"
                               label="规格型号"></el-table-column>
              <el-table-column property="productmark"
                               width="110"
                               label="牌号"></el-table-column>
              <el-table-column property="weight"
                               width="110"
                               label="重量(吨)"></el-table-column>
              <el-table-column property="price"
                               width="110"
                               label="单价(元/吨)"></el-table-column>
              <el-table-column property="unit"
                               width="60"
                               label="单位"></el-table-column>
              <el-table-column property="num"
                               width="58"
                               label="数量"></el-table-column>
              <el-table-column property="total"
                               width="120"
                               label="金额(元)"></el-table-column>
              <el-table-column property="stockouttype"
                               width="90"
                               label="出库方式"></el-table-column>
              <!-- <el-table-column property="warehousename" label="所在仓库" width="88"></el-table-column> -->
              <!-- <el-table-column property="quality" width="100" label="品级"></el-table-column> -->
            </el-table>
            <div class="footeremark">
              <el-row>
                <el-col :span="24">大写金额： {{ saleContractbox.digitUppercase }}</el-col>
              </el-row>
              <el-row>
                <el-col :span="24">备注：{{saleContractbox.remark}}</el-col>
              </el-row>
            </div>
          </div>
          <div class="footeremark">
            <el-row>
              <el-col :span="3"
                      class="padtop">合同条款：</el-col>
              <el-col :span="21"
                      class="padingnone">
                <span v-html="saleContractbox.termContent">{{saleContractbox.termContent}}</span>
              </el-col>
            </el-row>
          </div>

          <el-col :span="12">
            <p>需 方 ：</p>
            <p>单位名称（章）：{{customerdata.companyname}}</p>
            <p>单位地址）：{{customerdata.companyaddress}}</p>
            <p>法定代表人或代理人</p>
            <p>电 话 / 传 真 ：{{customerdata.fax}}</p>
            <p>开户银行 ：{{customerdata.bankname}}</p>
            <p>账 号 ：{{customerdata.bankaccount}}</p>
            <p>税 号 :{{customerdata.taxnumber}}</p>
          </el-col>
          <el-col :span="12">
            <p>供 方 ：</p>
            <p>单位名称（章）：{{informationdata.companyname}}</p>
            <p>单位地址）：{{informationdata.companyaddress}}</p>
            <p>法定代表人或代理人 ：</p>
            <p>电 话 / 传 真：{{informationdata.fax}}</p>
            <p>开户银行 ：{{informationdata.bankname}}</p>
            <p>账 号 ：{{informationdata.bankaccount}}</p>
            <p>税 号 :{{informationdata.taxnumber}}</p>
            <img v-if="saleContractbox.verifyBy"
                 :src="informationdata.contractsealurl"
                 style="position:relative;
    top:-300px;left:80px;width:175px;height:175px;" />
          </el-col>
        </div>
        <div slot="footer"
             class="dialog-footer">
          <el-button @click="contractVisible = false">取 消</el-button>
          <!-- <el-button @click="resetForm('ruleForm')">重置</el-button> -->
          <el-button type="primary"
                     @click="printsave">确 定</el-button>
        </div>
      </el-dialog>
    </el-col>
    <el-col :span="2">
      <el-dialog title="仓库管理"
                 :visible.sync="warehouseVisible"
                 :append-to-body="true">
        <div>
          <el-button size="mini"
                     @click="addwarehouseRow()">+</el-button>
          <el-table style="width:1000px"
                    :data="warehouseGridData"
                    max-height="500"
                    :span-method="arraySpanMethod"
                    class="el-tb-edit"
                    ref="warehouseGridData"
                    highlight-current-row>
            <el-table-column prop="id"
                             label="id"
                             sortable
                             fixed="left"
                             width="80"></el-table-column>
            <el-table-column property="warehousename"
                             label="仓库名称"
                             width="100">
              <template slot-scope="scope">
                <el-input size="mini"
                          v-model="scope.row.warehousename"
                          placeholder="请输入内容"></el-input>
                <!-- <span>{{scope.row.warehousename}}</span> -->
              </template>
            </el-table-column>
            <el-table-column property="warehouseaddress"
                             label="仓库地址"
                             width="200">
              <template slot-scope="scope">
                <el-input size="mini"
                          v-model="scope.row.warehouseaddress"
                          placeholder="请输入内容"></el-input>
                <!-- <span>{{scope.row.warehouseaddress}}</span> -->
              </template>
            </el-table-column>
            <el-table-column property="warehousephone"
                             label="仓库电话"
                             width="200">
              <template slot-scope="scope">
                <el-input size="mini"
                          v-model="scope.row.warehousephone"
                          placeholder="请输入内容"></el-input>
                <!-- <span>{{scope.row.warehousephone}}</span> -->
              </template>
            </el-table-column>
            <el-table-column property="warehousefax"
                             label="仓库传真"
                             width="200">
              <template slot-scope="scope">
                <el-input size="mini"
                          v-model="scope.row.warehousefax"
                          placeholder="请输入内容"></el-input>
                <!-- <span>{{scope.row.warehousefax}}</span> -->
              </template>
            </el-table-column>

            <el-table-column fixed="right"
                             label="操作"
                             width="120">
              <template slot-scope="scope">
                <el-button @click.native.prevent="deleteWarehouseRow(scope.row,scope.$index, warehouseGridData)"
                           type="text"
                           size="small">移除</el-button>
                <el-button @click.native.prevent="saveWarehouseRow(scope.row)"
                           type="text"
                           size="small">保存</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-dialog>
    </el-col>
    <el-col :span="2">
      <el-dialog title="承运方管理"
                 :visible.sync="carrierVisible"
                 width="880px"
                 :append-to-body="true">
        <div>
          <el-button size="mini"
                     @click="addcarrierRow()">+</el-button>
          <el-table style="width:880px"
                    :data="carrierGridData"
                    max-height="500"
                    :span-method="arraySpanMethod"
                    class="el-tb-edit"
                    ref="carrierGridData"
                    highlight-current-row>
            <el-table-column prop="id"
                             label="id"
                             sortable
                             fixed="left"
                             width="80"></el-table-column>
            <el-table-column property="carrier"
                             label="名称"
                             width="250">
              <template slot-scope="scope">
                <el-input size="mini"
                          v-model="scope.row.carrier"
                          placeholder="请输入内容"></el-input>
                <span>{{scope.row.carrier}}</span>
              </template>
            </el-table-column>
            <el-table-column property="contactor"
                             label="联系人"
                             width="150">
              <template slot-scope="scope">
                <el-input size="mini"
                          v-model="scope.row.contactor"
                          placeholder="请输入内容"></el-input>
                <span>{{scope.row.contactor}}</span>
              </template>
            </el-table-column>
            <el-table-column property="contactorphone"
                             label="联系电话">
              <template slot-scope="scope">
                <el-input size="mini"
                          v-model="scope.row.contactorphone"
                          placeholder="请输入内容"></el-input>
                <span>{{scope.row.contactorphone}}</span>
              </template>
            </el-table-column>
            <el-table-column fixed="right"
                             label="操作"
                             width="120">
              <template slot-scope="scope">
                <el-button @click.native.prevent="deletetdrulestRow(scope.row,scope.$index, carrierGridData)"
                           type="text"
                           size="small">移除</el-button>
                <el-button @click.native.prevent="savedrulestRow(scope.row)"
                           type="text"
                           size="small">保存</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-dialog>
    </el-col>
    <el-col :span="2">
      <el-dialog title="库存管理"
                 :visible.sync="stockVisible"
                 :append-to-body="true">
        <div>
          <el-form>
            <!-- <el-form>
            <el-form-item label="请选择">
              <el-select v-model="formTypeCollection">
                <el-option
                  v-for="item in selectOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="renderForm">确定</el-button>
              <el-button @click="()=>{showAppendForm = false}">取消</el-button>
            </el-form-item>
            </el-form>-->
            <!-- <div class="editor-content"> -->
            <!--表单主体部分-->
            <!-- <div ref="fc" id="form-create"></div> -->
            <!-- </div> -->
            <!-- <el-button size="mini" @click="addwarehouseRow()">+</el-button> -->
            <el-form-item label="库存列表">
              <el-table style="width:1000px"
                        :data="stockGridData"
                        max-height="500"
                        :span-method="arraySpanMethod"
                        class="el-tb-edit"
                        ref="stockGridData"
                        highlight-current-row
                        @current-change="handleCurrentChange1">
                <el-table-column property="status"
                                 label="状态"
                                 width="80">
                  <template slot-scope="scope">
                    <span>{{scope.row.status}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="id"
                                 label="ID"
                                 width="60">
                  <template slot-scope="scope">
                    <span>{{scope.row.id}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productname"
                                 label="名称"
                                 width="150">
                  <template slot-scope="scope">
                    <span>{{scope.row.productname}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productspec"
                                 label="规格"
                                 width="150">
                  <template slot-scope="scope">
                    <span>{{scope.row.productspec}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productfactory"
                                 label="钢厂"
                                 width="100">
                  <template slot-scope="scope">
                    <span>{{scope.row.productfactory}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productmark"
                                 label="材质"
                                 width="100">
                  <template slot-scope="scope">
                    <span>{{scope.row.productmark}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="weight"
                                 label="重量(吨)"
                                 width="120">
                  <template slot-scope="scope">
                    <span>{{scope.row.weight}}</span>
                  </template>
                </el-table-column>

                <el-table-column property="unit"
                                 label="单位"
                                 width="60">
                  <template slot-scope="scope">
                    <span>{{scope.row.unit}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="num"
                                 label="数量"
                                 width="60">
                  <template slot-scope="scope">
                    <!-- <el-input size="mini" v-model="scope.row.num" placeholder="请输入内容"></el-input> -->
                    <span>{{scope.row.num}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="warehousename"
                                 label="所在仓库"
                                 width="120">
                  <template slot-scope="scope">
                    <!-- <el-input size="mini" v-model="scope.row.num" placeholder="请输入内容"></el-input> -->
                    <span>{{scope.row.warehousename}}</span>
                  </template>
                </el-table-column>
                <el-table-column fixed="right"
                                 label="操作"
                                 width="120">
                  <template slot-scope="scope">
                    <el-button @click.native.prevent="chooseThis(scope.row,scope.$index)"
                               type="text"
                               size="small">选取</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
            <el-form-item label="加工明细">
              <el-table style="width:1100px"
                        max-height="500"
                        :summary-method="getJgSummaries"
                        show-summary
                        class="el-tb-edit"
                        :data="jgdetailData"
                        highlight-current-row
                        ref="jgdetailTable"
                        @selection-change="handleItemSelectionChange1">
                <el-table-column type="selection"
                                 width="80"
                                 :selectable="checkboxDeliveryInit"></el-table-column>
                <el-table-column property="id"
                                 label="ID"
                                 width="160"
                                 v-if="isshow">
                  <template slot-scope="scope">
                    <span>{{scope.row.id}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="deliverystatus"
                                 label="提货状态"
                                 width="160">
                  <template slot-scope="scope">
                    <span>{{scope.row.deliverystatus}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productname"
                                 label="名称"
                                 width="200">
                  <template slot-scope="scope">
                    <span>{{scope.row.productname}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productspec"
                                 label="规格"
                                 width="200">
                  <template slot-scope="scope">
                    <span>{{scope.row.productspec}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productfactory"
                                 label="钢厂"
                                 width="160">
                  <template slot-scope="scope">
                    <span>{{scope.row.productfactory}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="productmark"
                                 label="材质"
                                 width="160">
                  <template slot-scope="scope">
                    <span>{{scope.row.productmark}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="actualweight"
                                 label="提库重量(吨)"
                                 width="120">
                  <template slot-scope="scope">
                    <span>{{scope.row.actualweight}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="finalweight"
                                 label="客户结算重量(吨)"
                                 width="130">
                  <template slot-scope="scope">
                    <el-input size="mini"
                              v-model="scope.row.finalweight"
                              placeholder="请输入内容"></el-input>
                  </template>
                </el-table-column>
                <el-table-column property="unit"
                                 label="单位"
                                 width="100">
                  <template slot-scope="scope">
                    <span>{{scope.row.unit}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="num"
                                 label="数量"
                                 width="80">
                  <template slot-scope="scope">
                    <span>{{scope.row.num}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="price"
                                 label="价格"
                                 width="80"
                                 v-if="isshow">
                  <template slot-scope="scope">
                    <span>{{scope.row.price}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="warehousename"
                                 label="所在仓库"
                                 width="80">
                  <template slot-scope="scope">
                    <span>{{scope.row.warehousename}}</span>
                  </template>
                </el-table-column>
                <el-table-column property="remark"
                                 label="备注"
                                 width="300">
                  <template slot-scope="scope">
                    <span>{{scope.row.remark}}</span>
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </el-form>
        </div>
      </el-dialog>
    </el-col>
  </el-row>
</template>

<script>
import formConfig from "@/formConfig/main";
import { handlePlaceholder, handleSingle } from "@/formConfig/handle/handle";
export default {
  data () {
    return {
      showAppendForm: false,
      formList: [], // 左侧表单列表
      isShowRemoveBtn: true,
      isShowIndex: 1000,
      loading: false,
      $f: null,
      instance_arr: [],
      model: {},
      current: "",
      formType: "",
      formTypeCollection: [],
      rules: [],
      vm_collection: new Map(),
      allData: {},
      submitData: new Map(),
      isValidate: false,
      count: 0,
      gridDataCopy: [],
      activeName: "全部", //tab切换选中的数据
      thistitle: "",
      filters: {
        keyword: "",
        validateTime: []
      },
      jgdetailData: [],
      value: "",
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
      jgruleForm: {
        templateId: "",
        customerId: "",
        warehouseId: "",
        warehouseName: "",
        processtype: "",
        processfee: "",
        remark: ""
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
        isItemRight: false,
        feeoption: "",
        liftingfee: ""
      },

      termRuleForm: {},
      warehouseVisible: false,
      carrierVisible: false,
      stockVisible: false,
      customerList: [],
      productNameList: [],
      productfactoryList: [],
      productmarkList: [],
      productspecList: [],
      customerTemplateList: [],
      saleContractWarehouseList: [],
      timeout: null,
      salegridData: [],
      jggridData: [],
      contractData: [],
      warehouseGridData: [],
      carrierGridData: [],
      stockGridData: [],
      tdgridData: [],
      contractGridData: [],
      multipleSelection: "",
      pageSizes: [15, 50, 80, 100],
      startPage: 1,
      pageSize: 15,
      total: 0,
      saleContracts: [],
      page: 1,
      listLoading: false,
      selLoading: false,
      dialogFormVisible: false,
      jgdialogFormVisible: false,
      tddialogFormVisible: false,
      transportFormVisible: false,
      formLabelWidth: "120px",
      currentRow: null,
      totalWeight: 0,
      totalAmount: 0,
      finalWeight: 0,
      finalAmount: 0,
      stockoutTotalFee: 0,
      shorttransportTotalFee: 0,
      contractWeight: 0,
      contractAmount: 0,
      contactIds: [],
      selectedIds: [],
      selectedIdss: [],
      contractNos: [],
      isshow: false,
      rowShow: true,
      statusTab: "",
      chooseRow: "",
      chooseRowIndex: "",
      tempchoose: [],
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
      value: "",
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
          label: "不含税整车吊费"
        },
        {
          value: 4,
          label: "含税整车吊费"
        }
      ],
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
            transform (value) {
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
      jgrules: {
        warehouseName: [
          { required: true, message: "请选择仓库名", trigger: "change" }
        ],
        processtype: [
          { required: true, message: "请选择加工类型", trigger: "change" }
        ],
        processfee: [
          { required: true, message: "请输入加工费", trigger: "blur" },
          {
            type: "number",
            message: "请输入数字格式",
            trigger: "blur",
            transform (value) {
              return Number(value);
            }
          }
        ]
      },
      tdrules: {
        validateTime: {
          required: true,
          message: "请选择预付日期",
          trigger: "change"
        },
        warehouseName: {
          required: true,
          message: "请选择仓库名",
          trigger: "change"
        },
        deliverymethod: {
          required: true,
          message: "请选择提货方式",
          trigger: "change"
        },
        vehicleNumber: {
          required: true,
          message: "请输入车辆",
          trigger: "blur"
        },
        overtimefee: [
          {
            required: false,
            message: "请输入加班费",
            trigger: "blur"
          },
          {
            type: "number",
            message: "请输入数字格式",
            trigger: "blur",
            transform (value) {
              return Number(value);
            }
          }
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
      ordertype: "",
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
      selectactualweight: 0.0,
      selectfinalweight: 0.0,
      dateObj: {
        startTime: "",
        endTime: ""
      },
      contracttype: ""
    };
  },

  methods: {
    //获取时间
    searchTime () {
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

    searchTime1 () {
      if (
        this.tdruleForm.validateTime &&
        this.tdruleForm.validateTime[0] &&
        this.tdruleForm.validateTime[1]
      ) {
        this.dateObj.startTime = this.tdruleForm.validateTime[0];
        this.dateObj.endTime = this.tdruleForm.validateTime[1];
      } else {
        this.dateObj = {
          startTime: "",
          endTime: ""
        };
      }
    },

    // 切换tab数据
    handleClick (tab, event) {
      this.statusTab = tab.name;
      if (this.statusTab === "现货合同") {
        this.contracttype = "1";
      } else if (
        this.statusTab === "意向临调合同" ||
        this.statusTab === "正式临调合同"
      ) {
        this.contracttype = "0";
      } else {
        this.contracttype = "";
      }
      this.getContract();
    },
    addwarehouseRow () {
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
    addcarrierRow () {
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
    // 保存运输方管理
    savedrulestRow (row) {
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
    saveWarehouseRow (row) {
      let _this = this;
      let params = new FormData();
      if (row.id !== undefined) {
        params.append("id", row.id);
      }
      params.append("warehousename", row.warehousename);
      params.append("warehouseaddress", row.warehouseaddress);
      params.append("warehousephone", row.warehousephone);
      params.append("warehousefax", row.warehousefax);
      params.append("memberid", _this.memberId);
      this.axios
        .post(process.env.API_ROOT + "/WareHouseApi/v1/saveWarehouse", params)
        .then(response => {
          if (!response.data) {
            _this.listLoading = false;
            return;
          }
          if (response.data && response.data.status === 200) {
            this.message(true, response.data.msg, "success");
            _this.warehouseSelect();
            _this.warehouseVisible = false;
          } else {
            _this.message(true, response.data.msg, "error");
            _this.warehouseGridData = [];
          }
          _this.listLoading = false;
        });
    },
    closeDialog (formName) {
      if (formName === "ruleForm") {
        this.dialogFormVisible = false;
      } else if (formName === "termRuleForm") {
        this.termFormVisible = false;
      } else if (formName === "jgruleForm") {
        this.jgdialogFormVisible = false;
      } else if (formName === "tdruleForm") {
        this.tddialogFormVisible = false;
      }

      this.$refs[formName].resetFields();
    },
    addsettlementChange () {
      if (this.ruleForm.addsettlement === "预付") {
        this.percentShow = true;
      } else {
        this.percentShow = false;
      }
    },
    //删除行
    deleteRow (index, rows) {
      rows.splice(index, 1);
    },
    // 删除运输方管理
    deletetdrulestRow (row, index, rows) {
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
    deleteWarehouseRow (row, index, rows) {
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
    // 删除运输方管理
    deldrulestRow (row) {
      let _this = this;
      let params = new FormData();
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
    },
    delWarehouseRow (row) {
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
    copyContract (row) {
      let _this = this;
      let params = new FormData();
      params.append("contractno", row.contractno);
      this.axios
        .post(process.env.API_ROOT + "/SaleContractApi/v1/copyContract", params)
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
    refreshRow (status) {
      if (status == "td") {
        this.tdgridData = [];
        this.tempchoose = [];
      } else if ((status = "jg")) {
        this.tempchoose = [];
        this.jggridData = [];
      }

      // for (var i in this.gridDataCopy) {
      //   this.tdgridData.push(this.gridDataCopy[i]);
      // }
    },
    copyRow (row) {
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
        stockoutfee: row.stockoutfee,
        shorttransportfee: row.shorttransportfee,
        stockouttype: row.stockouttype,
        quality: row.quality
      };
      this.salegridData.push(d);
      setTimeout(() => {
        this.$refs.gridTable.setCurrentRow(d);
      }, 10);
    },
    copyTdRow (row) {
      let d = {
        id: null,
        deliverystatus: "",
        productname: row.productname,
        productspec: row.productspec,
        productfactory: row.productfactory,
        productmark: row.productmark,
        weight: "0",
        actualweight: "",
        finalweight: "",
        stockid: "",
        warehousename: row.warehousename,
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
    addRow () {
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
        stockoutfee: 0,
        shorttransportfee: 0,
        stockouttype: "过磅",
        quality: "合格品",
        warehousename: ""
      };
      this.salegridData.push(d);
      setTimeout(() => {
        this.$refs.gridTable.setCurrentRow(d);
      }, 10);
    },
    addTdJgRow (row, type) {
      let d = {};
      if (row) {
        d = {
          id: row.id,
          // deliverystatus: row.deliverystatus,
          productname: row.productname,
          productspec: row.productspec,
          productfactory: row.productfactory,
          productmark: row.productmark,
          price: row.price,
          actualweight: "",
          finalweight: "",
          warehousename: "",
          stockid: "",
          price: row.price,
          unit: "件",
          num: "1",
          remark: "",
          quality: row.quality
        };
      } else {
        d = {
          id: null,
          deliverystatus: "",
          productname: "",
          productspec: "",
          productfactory: "",
          productmark: "",
          weight: "0",
          actualweight: "",
          finalweight: "",
          warehousename: "",
          stockid: "",
          price: "",
          unit: "件",
          num: "1",
          remark: "",
          quality: ""
        };
      }
      if (type == "td") {
        this.tdgridData.push(d);
        setTimeout(() => {
          this.$refs.tdgridTable.setCurrentRow(d);
        }, 10);
      } else {
        this.jggridData.push(d);
        setTimeout(() => {
          this.$refs.jggridTable.setCurrentRow(d);
        }, 10);
      }
    },
    // 查询合同
    async getContract () {
      let _this = this;
      _this.listLoading = true;
      let params = new FormData();
      params.append("startPage", _this.startPage);
      params.append("pageSize", _this.pageSize);
      params.append("keyword", _this.filters.keyword);
      params.append("memberId", _this.memberId);
      params.append("statusTab", _this.statusTab);
      params.append("contracttype", _this.contracttype);
      params.append("startTime", _this.dateObj.startTime);
      params.append("endTime", _this.dateObj.endTime);
      this.axios
        .post(
          process.env.API_ROOT + "/SaleContractApi/v1/findSaleContractByPage",
          params
        )
        .then(response => {
          if (typeof response === "undefined") {
            _this.listLoading = false;
            return;
          }
          if (response.data && response.data.status === 200) {
            _this.saleContracts = response.data.data;
            _this.total = response.data.total;
          } else {
            _this.message(true, response.data.msg, "error");
            _this.saleContracts = [];
          }
          _this.listLoading = false;
        })
        .catch(err => {
          console.log(err);
        });
    },
    // 表单提交
    submitForm (formName) {
      // console.log(this.salegridData, 'this.salegridData');

      this.$refs[formName].validate(valid => {
        if (valid) {
          for (let i = 0; i < this.salegridData.length; i++) {
            let item = this.salegridData[i];
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
            if (!/^[+]?((\d*(\.\d{1,5})$)|(\d+$))/.test(item.weight)) {
              this.$message("重量只能为正整数或者最多带5位小数");
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
            if (item.stockoutfee === "") {
              this.$message("出库费不能为空，如果为空，请输入0");
              return;
            }
            if (!/^[0-9]\d*\,\d*|[0-9]\d*$/.test(item.stockoutfee)) {
              this.$message("出库费只能为数字");
              return;
            }
            if (item.stockoutfee.length > 9) {
              this.$message("出库费字数不能超过9个字符");
              return;
            }

            if (item.shorttransportfee === "") {
              this.$message("短驳费不能为空，如果为空，请输入0");
              return;
            }
            if (!/^[0-9]\d*\,\d*|[0-9]\d*$/.test(item.shorttransportfee)) {
              this.$message("短驳费只能为数字");
              return;
            }
            if (item.shorttransportfee.length > 9) {
              this.$message("短驳费字数不能超过9个字符");
              return;
            }

            if (item.num === "") {
              this.$message("数量字数不能为空");
              return;
            }
            // if (item.warehousename === "") {
            //   this.$message("仓库名称不能为空");
            //   return;
            // }
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
    chooseThis (row, index) {
      let d = {};
      if (this.ordertype == "td") {
        if (row.status == "加工完成") {
          if (this.multipleSelection.length == 0) {
            this.message(true, "请勾选加工明细", "error");
            return false;
          }
          this.selectfinalweight = 0.0;
          for (let i = 0; i < this.multipleSelection.length; i++) {
            let item = this.multipleSelection[i];
            let itemdata = Number.parseFloat(item.finalweight);
            if (itemdata === "") {
              this.$message("客户重量不能为空");
              return;
            }
            if (!/^[+]?((\d*(\.\d{1,5})$)|(\d+$))/.test(itemdata)) {
              this.$message("客户重量只能为数字或者最多小数点5位的数字");
              return;
            }
            if (itemdata.length > 9) {
              this.$message("客户重量字数不能超过9个字符");
              return;
            }
            this.selectfinalweight = this.selectfinalweight + itemdata;
          }

          d = {
            id: this.chooseRow.id,
            deliverystatus: this.chooseRow.deliverystatus,
            processstatus: this.chooseRow.processstatus,
            warehousename: row.warehousename,
            productname: this.chooseRow.productname,
            productspec: this.chooseRow.productspec,
            productfactory: this.chooseRow.productfactory,
            productmark: this.chooseRow.productmark,
            weight: this.chooseRow.weight,
            actualweight: this.numFilter(this.selectactualweight),
            finalweight: this.numFilter(this.selectfinalweight),
            stockid: row.id,
            price: this.chooseRow.price,
            unit: this.chooseRow.unit,
            num: row.num,
            selectedIdss: this.selectedIdss.join(","),
            remark: this.chooseRow.remark,
            quality: this.chooseRow.quality
          };

          this.$set(this.$refs.tdgridTable.tableData, this.chooseRowIndex, d);
          // this.tdgridData.push(d);
          setTimeout(() => {
            this.$refs.tdgridTable.setCurrentRow(d);
          }, 10);
          this.stockGridData.splice(index, 1);
          this.tempchoose.push(row.id);
        } else {
          // this.tdgridData.splice(this.chooseRowIndex, 1);
          d = {
            id: this.chooseRow.id,
            deliverystatus: this.chooseRow.deliverystatus,
            processstatus: this.chooseRow.processstatus,
            warehousename: row.warehousename,
            productname: this.chooseRow.productname,
            productspec: this.chooseRow.productspec,
            productfactory: this.chooseRow.productfactory,
            productmark: this.chooseRow.productmark,
            weight: this.chooseRow.weight,
            actualweight: row.weight,
            finalweight: row.weight,
            stockid: row.id,
            price: this.chooseRow.price,
            unit: this.chooseRow.unit,
            num: row.num,
            remark: this.chooseRow.remark,
            quality: this.chooseRow.quality
          };
        }

        this.$set(this.$refs.tdgridTable.tableData, this.chooseRowIndex, d);
        // this.tdgridData.push(d);
        setTimeout(() => {
          this.$refs.tdgridTable.setCurrentRow(d);
        }, 10);
        this.stockGridData.splice(index, 1);
        this.tempchoose.push(row.id);
        // }
      } else if (this.ordertype == "jg") {
        // this.jggridData.splice(this.chooseRowIndex, 1);
        d = {
          id: this.chooseRow.id,
          deliverystatus: this.chooseRow.deliverystatus,
          warehousename: row.warehousename,
          productname: this.chooseRow.productname,
          productspec: this.chooseRow.productspec,
          productfactory: this.chooseRow.productfactory,
          productmark: this.chooseRow.productmark,
          weight: this.chooseRow.weight,
          actualweight: row.weight,
          finalweight: row.weight,
          stockid: row.id,
          price: this.chooseRow.price,
          unit: this.chooseRow.unit,
          num: row.num,
          remark: this.chooseRow.remark,
          quality: this.chooseRow.quality
        };

        this.$set(this.$refs.jggridTable.tableData, this.chooseRowIndex, d);
        // this.jggridData.push(d);
        setTimeout(() => {
          this.$refs.jggridTable.setCurrentRow(d);
        }, 10);
        this.stockGridData.splice(index, 1);
        this.tempchoose.push(row.id);
      }
      this.stockVisible = false;
      // this.chooseRow.actualweight = 2332;
    },

    handleCurrentChange1 (val) {
      let isval = val;
      if (!isval && typeof isval != "undefined" && isval != 0) {
        //true
      } else {
        this.inputProcessDetail(val.id);
      }
    },

    inputProcessDetail (stockid) {
      let params = new FormData();
      params.append("stockid", stockid);
      this.axios
        .post(
          process.env.API_ROOT + "/ProcessOrderApi/v1/getProcessOrderFinish",
          params
        )
        .then(response => {
          if (response.data && response.data.status === 200) {
            this.jgdetailData = response.data.data;
          } else {
            this.message(true, response.data.msg, "error");
            this.jgdetailData = [];
          }
          this.listLoading = false;
        });
    },
    delTemplate (selVal) {
      this.$confirm("是否确定继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "error"
      }).then(() => {
        let params = new FormData();
        params.append("id", selVal);
        this.axios
          .post(
            process.env.API_ROOT + "/ProcessOrderApi/v1/delTemplateId",
            params
          )
          .then(response => {
            this.message(true, response.data.msg, "success");
            this.jgruleForm.templateId = "";
            this.jgruleForm.warehouseName = "";
            this.jgruleForm.processtype = "";
            this.jgruleForm.processfee = "";
            this.jgruleForm.remark = "";
            this.processTemplateSelect();
          })
          .catch(err => {
            console.log(err);
          });
      });
    },
    currentTemplateIdSel (selVal) {
      let params = new FormData();
      let memberId = this.memberId;
      params.append("id", selVal);
      params.append("memberId", memberId);
      params.append("customerId", this.jgruleForm.customerId);
      this.axios
        .post(
          process.env.API_ROOT + "/ProcessOrderApi/v1/findByOneCustomerId",
          params
        )
        .then(response => {
          let result = response.data.data;
          this.jgruleForm.templateId = selVal;
          this.jgruleForm.warehouseName = result.warehousename;
          this.jgruleForm.warehouseId = result.warehouseid;
          this.jgruleForm.processtype = result.processtype;
          this.jgruleForm.processfee = result.processfee;
          this.jgruleForm.remark = result.remark;
        })
        .catch(err => {
          console.log(err);
        });
    },
    processTemplateSelect () {
      this.customerTemplateList = [];
      let params = new FormData();
      let memberId = this.memberId;
      params.append("memberId", memberId);
      params.append("customerId", this.jgruleForm.customerId);
      this.axios
        .post(
          process.env.API_ROOT + "/ProcessOrderApi/v1/findByCustomerId",
          params
        )
        .then(response => {
          let customerTemplateData = response.data.data;
          for (let customerTemplate of customerTemplateData) {
            if (customerTemplate.templatename != null) {
              let jsonCustomerTemplate = {
                name: customerTemplate.templatename,
                id: customerTemplate.id
              };
              this.customerTemplateList.push(jsonCustomerTemplate);
            }
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    warehouseSelect () {
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

    carrierSelect () {
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
    carrierShow () {
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
    resetTemplate () {
      this.$refs["jgruleForm"].resetFields();
    },
    warehouseShow () {
      let _this = this;
      _this.listLoading = true;
      let params = new FormData();
      params.append("startPage", _this.startPage);
      params.append("pageSize", _this.pageSize);
      params.append("keyword", _this.filters.keyword);
      params.append("memberId", _this.memberId);
      this.axios
        .post(process.env.API_ROOT + "/WareHouseApi/v1/findByPage", params)
        .then(response => {
          if (!response.data) {
            _this.listLoading = false;
            return;
          }
          if (response.data && response.data.status === 200) {
            _this.warehouseGridData = response.data.data;
            _this.total = response.data.total;
          } else {
            _this.message(true, response.data.msg, "error");
            _this.warehouseGridData = [];
          }
          _this.listLoading = false;
        });
      this.warehouseVisible = true;
    },

    importFrom (index, row, orderType) {
      // if (orderType === "jg") {
      //   params.append("customerid", _this.jgruleForm.customerId);
      // } else if (orderType === "td") {
      //   params.append("customerid", _this.tdruleForm.customerid);
      // }

      // params.append("warehousename", row.warehousename);
      let _this = this;
      _this.listLoading = true;
      _this.jgdetailData = [];
      _this.ordertype = orderType;

      let params = new FormData();
      _this.chooseRow = row;
      _this.chooseRowIndex = index;

      params.append("startPage", _this.startPage);
      params.append("pageSize", _this.pageSize);
      params.append("keyword", _this.filters.keyword);
      params.append("memberid", _this.memberId);
      if (orderType === "jg") {
        params.append("warehousename", _this.jgruleForm.warehouseName);
      } else if (orderType === "td") {
        params.append("warehousename", _this.tdruleForm.warehouseName);
      }
      params.append("productname", row.productname);
      params.append("productspec", row.productspec);
      params.append("productfactory", row.productfactory);
      params.append("productmark", row.productmark);
      params.append("stockstatus", orderType);
      if (this.tempchoose.length == 0) {
        _this.axios
          .post(
            process.env.API_ROOT + "/WareHouseApi/v1/findItemByPage",
            params
          )
          .then(response => {
            if (!response.data) {
              _this.listLoading = false;
              return;
            }
            if (response.data && response.data.status === 200) {
              _this.stockGridData = response.data.data;
              _this.total = response.data.total;
            } else {
              _this.message(true, response.data.msg, "error");
              _this.stockGridData = [];
            }
            _this.listLoading = false;
          });
      }

      this.stockVisible = true;
    },

    contractarraySpanMethod ({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 9) {
        row.total = (row.price * row.weight).toFixed(2);
      }
      if (columnIndex === 12) {
        row.stockouttotal = (row.stockoutfee * row.weight).toFixed(2);
      }
      if (columnIndex === 14) {
        row.shorttransporttotal = (row.shorttransportfee * row.weight).toFixed(
          2
        );
      }
    },
    arraySpanMethod ({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 9) {
        row.total = (row.price * row.weight).toFixed(2);
      }
    },
    getSummaries (param) {
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
        } else if (index === 10) {
          sums[index] = "";
          return;
        } else if (index === 11) {
          sums[index] = "";
          return;
        } else if (index === 16) {
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
            return;
          } else if (index === 5) {
            sums[index] = sums[index].toFixed(3);
            this.totalWeight = sums[index];
            sums[index] += "吨";
          } else if (index === 9) {
            sums[index] = sums[index].toFixed(2);
            this.totalAmount = sums[index];
            sums[index] += "元";
          } else if (index === 12) {
            sums[index] = sums[index].toFixed(2);
            this.stockoutTotalFee = sums[index];
            sums[index] += "元";
          } else if (index === 15) {
            sums[index] = sums[index].toFixed(2);
            this.shorttransportTotalFee = sums[index];
            sums[index] += "元";
          }
        } else {
          sums[index] = "";
        }
      });
      return sums;
    },
    getJgSummaries (param) {
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
        } else if (index === 7) {
          sums[index] = "";
          return;
        } else if (index === 8) {
          sums[index] = "";
          return;
        } else if (index === 10) {
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
            return;
          } else if (index === 5) {
            sums[index] = sums[index].toFixed(5);
            sums[index] += "吨";
          } else if (index === 6) {
            sums[index] = sums[index].toFixed(5);

            sums[index] += "吨";
          } else if (index === 13) {
            sums[index] = sums[index].toFixed(2);
            sums[index] += "元";
          } else if (index === 15) {
            sums[index] = sums[index].toFixed(2);
            sums[index] += "元";
          }
        } else {
          sums[index] = "";
        }
      });
      return sums;
    },
    //提单的商品明细累计
    getTdSummaries (param) {
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
        } else if (index === 9) {
          sums[index] = "";
          return;
        } else if (index === 11) {
          sums[index] = "";
          return;
        } else if (index === 12) {
          sums[index] = "";
          return;
        } else if (index === 13) {
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
            sums[index] = sums[index].toFixed(5);
            this.totalWeight = sums[index];
            sums[index] += "吨";
          } else if (index === 6) {
            sums[index] = sums[index].toFixed(5);
            this.finalWeight = sums[index];
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

    //合同生成加工单，商品明细的合计
    getSaleJgSummaries (param) {
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
        } else if (index === 10) {
          sums[index] = "";
          return;
        } else if (index === 11) {
          sums[index] = "";
          return;
        } else if (index === 16) {
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
            return;
          } else if (index === 5) {
            sums[index] = sums[index].toFixed(5);
            sums[index] += "吨";
          } else if (index === 7) {
            sums[index] = sums[index].toFixed(2);
            sums[index] += "";
          }
        }
      });
      return sums;
    },
    //提单的商品明细累计
    getTdContractSummaries (param) {
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
        } else if (index === 7) {
          sums[index] = "";
          return;
        } else if (index === 10) {
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
            sums[index] = sums[index].toFixed(5);
            sums[index] += "吨";
          } else if (index === 5) {
            sums[index] = sums[index].toFixed(5);
            this.totalWeight = sums[index];
            sums[index] += "吨";
          } else if (index === 6) {
            sums[index] = sums[index].toFixed(5);
            this.finalWeight = sums[index];
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

    //提单的商品明细累计
    getTdSummaries (param) {
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
        } else if (index === 9) {
          sums[index] = "";
          return;
        } else if (index === 11) {
          sums[index] = "";
          return;
        } else if (index === 12) {
          sums[index] = "";
          return;
        } else if (index === 13) {
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
            sums[index] = sums[index].toFixed(5);
            this.totalWeight = sums[index];
            sums[index] += "吨";
          } else if (index === 6) {
            sums[index] = sums[index].toFixed(5);
            this.finalWeight = sums[index];
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
    // 显示打印模板
    printsave () {
      var dom = document.getElementById("contractbox");
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
      // var tabledata = this.$refs.contractDataTable.tableData;
      // if (tabledata.length > 35) {
      //   var newChild = document.createElement("tr");
      //   newChild.style = "page-break-after:always;";
      // }
      win.document.body.insertBefore(div, win.document.body.firstElementChild);

      win.setTimeout(function () {
        win.print();
        win.close();
      }, 1000);
    },
    // 打印模板的合并
    contractSpanMethod ({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 6) {
        row.total = (row.price * row.weight).toFixed(2);
      }
    },
    contractgetSummaries (param) {
      const { columns, data } = param;
      const sums = [];
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "总计";
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
          if (index === 4) {
            sums[index] = sums[index].toFixed(5);
            this.contractWeight = sums[index];
            // sums[index] +='吨'
          } else if (index == 8) {
            sums[index] = sums[index].toFixed(2);
            this.contractAmount = sums[index];
            // sums[index] +='元'
          } else if (index == 7) {
            sums[index] += "";
          } else {
            sums[index] = "";
          }
        } else {
          sums[index] = "";
        }
      });
      return sums;
    },

    // 重置
    resetForm (formName) {
      this.$refs[formName].resetFields();
    },
    // 显示添加合同窗口
    showDialogForm (t) {
      this.percentShow = false;
      this.dialogFormVisible = true;
      if (t == 0) {
        this.thistitle = "新增临调销售合同";
        this.contracttype = "0";
      } else if (t == 1) {
        this.thistitle = "新增现货销售合同";
        this.contracttype = "1";
      }

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
      if (this.salegridData.length > 0) {
        this.salegridData = [];
      }

      this.getCustomerList();
      this.findProduct();
      this.findProductSpec();
      this.findProductFactory();
      this.findProductMark();
      this.findSaleContractWarehouse();
    },
    //搜索产品接口
    findProduct () {
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
    findProductSpec () {
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
    findProductFactory () {
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
    findProductMark () {
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
    findSaleContractWarehouse () {
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

    getCustomerList () {
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
          if (typeof response === "undefined") {
            _this.listLoading = false;
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

    querySearchAsync (queryString, cb) {
      var customerList = this.customerList;
      var results = queryString
        ? customerList.filter(this.createStateFilter(queryString))
        : customerList;

      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        cb(results);
      }, 500);
    },
    queryProductNameSearchAsync (queryString, cb) {
      var productNameList = this.productNameList;
      var results = queryString
        ? productNameList.filter(this.createStateFilter(queryString))
        : productNameList;

      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        cb(results);
      }, 500);
    },
    queryProductfactorySearchAsync (queryString, cb) {
      var productfactoryList = this.productfactoryList;
      var results = queryString
        ? productfactoryList.filter(this.createStateFilter(queryString))
        : productfactoryList;

      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        cb(results);
      }, 500);
    },

    queryProductspecSearchAsync (queryString, cb) {
      var productspecList = this.productspecList;
      var results = queryString
        ? productspecList.filter(this.createStateFilter(queryString))
        : productspecList;

      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        cb(results);
      }, 500);
    },

    queryProductmarkSearchAsync (queryString, cb) {
      var productmarkList = this.productmarkList;
      var results = queryString
        ? productmarkList.filter(this.createStateFilter(queryString))
        : productmarkList;

      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        cb(results);
      }, 500);
    },

    queryWarehouseSearchAsync (queryString, cb) {
      var warehouseList = this.warehouseList;
      var results = queryString
        ? warehouseList.filter(this.createStateFilter(queryString))
        : warehouseList;
      if (Object.keys(results).length == 0) {
        this.jgruleForm.warehouseName = "";
        this.tdruleForm.warehouseName = "";
      }
      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        cb(results);
      }, 500);
    },

    querySaleContractWarehouseSearchAsync (queryString, cb) {
      var saleContractWarehouseList = this.saleContractWarehouseList;
      var results = queryString
        ? saleContractWarehouseList.filter(this.createStateFilter(queryString))
        : saleContractWarehouseList;

      clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        cb(results);
      }, 500);
    },

    createStateFilter (queryString) {
      return state => {
        return state.value.indexOf(queryString) >= 0;
      };
    },
    handleSelectCustomer (item) {
      this.ruleForm.customerId = item.id;
      if (this.contracttype == "1") {
        this.selectStockByCustomerId(item.id);
      }
    },

    handleSelectKeyword (item) {
      this.filters.keyword = item.value;
    },

    handleSelectJgWarehouse (item) {
      this.jgruleForm.warehouseName = item.value;
      this.jgruleForm.warehouseId = item.id;
    },
    handleSelectTdWarehouse (item) {
      this.tdruleForm.warehouseName = item.value;
      this.tdruleForm.warehouseId = item.id;
    },

    handleRowChange () {
      this.rowShow = false;
    },
    // handleSelectProductName(item)
    // {
    //    this.tdruleForm.warehouseName = item.value;
    //   this.tdruleForm.warehouseId = item.id;
    // },
    // 添加合同
    async addContract () {
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
      params.append("contracttype", this.contracttype);
      params.append("contractweight", _this.totalWeight);
      params.append("contractamount", _this.totalAmount);
      params.append("shorttransporttotalfee", _this.shorttransportTotalFee);
      params.append("stockouttotalfee", _this.stockoutTotalFee);
      params.append("remark", _this.ruleForm.remark);
      if (_this.ruleForm.depositdate !== "") {
        params.append("percent", _this.ruleForm.percent);
        params.append("depositdate", new Date(_this.ruleForm.depositdate));
      }
      params.append("contractaddress", _this.ruleForm.addcontractaddress);
      params.append("saleContractDetail", JSON.stringify(_this.salegridData));
      if (_this.salegridData.length === 0) {
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
          } else {
            _this.message(true, response.data.msg, "error");
          }
          this.contracttype = "";
          this.getContract();
        });
    },
    // 删除销售合同

    delContract (id) {
      if (this.contactIds.length === 0) {
        this.message(true, "请选择需要删除的合同", "error");
        return;
      }
      this.$confirm("此操作将永久删除该合同, 是否继续?", "提示", {
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
    async delContracts () {
      let params = new FormData();
      params.append("ids", this.contactIds);
      params.append("contractnos", this.contractNos);
      this.axios
        .post(
          process.env.API_ROOT + "/SaleContractApi/v1/delConstracts",
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
          this.contracttype = "";
          this.getContract();
        });
    },
    async editShow (row) {
      this.percentShow = false;
      this.$refs.contractTable.setCurrentRow(row);
      this.thistitle = "编辑" + row.contractstatus;
      this.ruleForm.id = row.id;
      this.contracttype = row.contracttype;
      this.ruleForm.contractstatus = row.contractstatus;
      this.ruleForm.addcustomername = row.customername;
      this.ruleForm.addcontractno = row.contractno;
      this.ruleForm.adddeliverydate = new Date(row.deliverydate);
      if (row.depositdate !== undefined) {
        this.ruleForm.depositdate = new Date(row.depositdate);
      }
      this.ruleForm.addpayment = row.payment;
      this.ruleForm.addsettlement = row.settlement;
      this.ruleForm.addtransporttype = row.transporttype;
      this.ruleForm.addstockouttype = row.stockouttype;
      this.ruleForm.addcontractaddress = row.contractaddress;
      this.ruleForm.customerId = row.customerid;
      this.dialogFormVisible = true;
      let params = new FormData();
      params.append("keyword", row.contractno);
      params.append("memberId", this.memberId);
      params.append("customerId", row.customerid);
      this.axios
        .post(
          process.env.API_ROOT +
          "/SaleContractApi/v1/findSaleContractDetailByPage",
          params
        )
        .then(response => {
          if (!response.data) {
            return;
          }
          if (response.data.status === 200) {
            this.salegridData = [];
            var tabledata = response.data.data.saleContractDetail;
            for (var i in tabledata) {
              this.salegridData.push(tabledata[i]);
            }
            this.ruleForm.remark = response.data.data.saleContract.remark;
            if (response.data.data.saleContract.settlement === "预付") {
              this.percentShow = true;
            }
            this.ruleForm.percent = response.data.data.saleContract.percent;
            //读取品名列表
            let productListData = response.data.data.productList;
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
            //读取厂家列表
            let productfactoryListData = response.data.data.productfactoryList;
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

            //读取牌号列表
            let productmarkListData = response.data.data.productmarkList;
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

            //读取规格列表
            let productspecListData = response.data.data.productspecList;
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

            let saleContractWarehouseListData =
              response.data.data.saleContractWarehouseList;
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

            this.message(true, response.data.msg, "success");
          } else {
            this.message(true, response.data.msg, "error");
          }
        });
      //this.getContract()
    },

    selectStockByCustomerId (customerid) {
      let params = new FormData();
      params.append("customerid", customerid);
      this.axios
        .post(
          process.env.API_ROOT + "/WareHouseApi/v1/findItemByCustomerId",
          params
        )
        .then(response => {
          if (!response.data) {
            return;
          }
          if (response.data.status === 200) {
            this.salegridData = [];
            var tabledata = response.data.data;
            for (var i in tabledata) {
              tabledata[i].stockoutfee = 0;
              tabledata[i].shorttransportfee = 0;
              tabledata[i].price = "";
              // tabledata[i].push("stockoutfee", 0);
              // tabledata[i].push("shorttransportfee", 0);
              this.salegridData.push(tabledata[i]);
            }
          }
        });
    },
    handleSelectionChange (val) {
      this.contactIds = [];
      this.contractNos = [];
      if (val) {
        val.forEach(row => {
          this.contactIds.push(row.id);
          this.contractNos.push(row.contractno);
        });
      }
    },

    gotoJg (formName) {
      if (this.selectedIds.length === 0) {
        this.message(true, "请选择需要加工的产品", "error");
        return;
      }
      for (let i = 0; i < this.multipleSelection.length; i++) {
        let item = this.multipleSelection[i];

        if (
          !item.activeweight &&
          typeof item.activeweight != "undefined" &&
          item.activeweight != 0
        ) {
          this.$message("实提重量不能为空", "error");
          return;
        }
        if (
          !item.stockid &&
          typeof item.stockid != "undefined" &&
          item.stockid != 0
        ) {
          this.$message("请从仓库选择正确的商品", "error");
          return;
        }

        if (
          !item.warehousename &&
          typeof item.warehousename != "undefined" &&
          item.warehousename != 0
        ) {
          this.$message("仓库名称不能为空", "error");
          return;
        }
      }
      this.$confirm("是否确定继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "error"
      }).then(() => {
        this.$refs[formName].validate(valid => {
          if (valid) {
            this.submitJg();
          } else {
            console.log("error submit!!");
            return false;
          }
        });
      });
      // .catch(() => {
      //   this.message(true, "已取消操作", "error");
      // });
    },
    submitJg () {
      let _this = this;
      let memberId = "";
      var usr = this.usr;
      if (usr) {
        memberId = usr.memberId;
      }
      let params = new FormData();
      params.append("contractId", _this.jgruleForm.id);
      params.append("customerName", _this.jgruleForm.customername);
      params.append("customerId", _this.jgruleForm.customerId);
      params.append("templateId", _this.jgruleForm.templateId);
      params.append("memberId", memberId);
      params.append("warehouseId", _this.jgruleForm.warehouseId);
      params.append("warehouseName", _this.jgruleForm.warehouseName);
      params.append("contractno", _this.jgruleForm.contractno);
      params.append("processtype", _this.jgruleForm.processtype);
      params.append("contractamount", _this.jgruleForm.addcontractno);
      params.append("processfee", _this.jgruleForm.processfee);
      params.append("remark", _this.content);
      params.append(
        "processOrderDetail",
        JSON.stringify(_this.multipleSelection)
      );

      this.axios
        .post(
          process.env.API_ROOT + "/ProcessOrderApi/v1/addProcessOrder",
          params
        )
        .then(response => {
          if (!response.data) {
            return;
          }
          if (response.data.status === 200) {
            this.message(true, response.data.msg, "success");
            this.$router.push({ path: "/processOrderList" });
          }
        });
    },
    transport (formName) {
      if (this.selectedIds.length === 0) {
        this.message(true, "请选择需要运输的产品", "error");
        return;
      }
      for (let i = 0; i < this.multipleSelection.length; i++) {
        let item = this.multipleSelection[i];
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
        if (!/^[+]?((\d*(\.\d{1,5})$)|(\d+$))/.test(item.weight)) {
          this.$message("重量只能为正整数或者最多带5位小数");
          return;
        }
        if (item.weight === "") {
          this.$message("重量不能为空");
          return;
        }
        if (item.weight.length > 9) {
          this.$message("重量字数不能超过9个字符");
          return;
        }
        if (item.actualweight === "") {
          this.$message("库提重量不能为空,请从库存提取");
          return;
        }
        if (!/^[+]?((\d*(\.\d{1,5})$)|(\d+$))/.test(item.actualweight)) {
          this.$message("库提重量只能为正整数或者最多带5位小数");
          return;
        }
        if (item.actualweight.length > 9) {
          this.$message("实提重量字数不能超过9个字符");
          return;
        }

        if (item.finalweight === "") {
          this.$message("客户结算重量不能为空,请从库存提取");
          return;
        }
        if (!/^[+]?((\d*(\.\d{1,5})$)|(\d+$))/.test(item.finalweight)) {
          this.$message("客户结算重量只能为正整数或者最多带5位小数");
          return;
        }
        if (item.finalweight.length > 9) {
          this.$message("客户结算重量字数不能超过9个字符");
          return;
        }

        // if (!/^[1-9]\d*\,\d*|[1-9]\d*$/.test(item.price)) {
        //   this.$message("单价只能为数字");
        //   return;
        // }
        // if (item.price === "") {
        //   this.$message("单价不能为空");
        //   return;
        // }
        // if (item.price.length > 9) {
        //   this.$message("单价字数不能超过9个字符");
        //   return;
        // }
        // if (!/^\d+$/.test(item.num)) {
        //   this.$message("数量只能为数字");
        //   return;
        // }
        // if (item.num === "") {
        //   this.$message("数量字数不能为空");
        //   return;
        // }
        // if (item.num.length > 9) {
        //   this.$message("数量字数不能超过9个字符");
        //   return;
        // }
      }
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

    gotoTd (formName) {
      if (this.selectedIds.length === 0) {
        this.message(true, "请选择需要提货的产品", "error");
        return;
      }
      this.totalWeight = 0;
      this.finalWeight = 0;
      for (let i = 0; i < this.multipleSelection.length; i++) {
        let item = this.multipleSelection[i];
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
        if (item.finalweight === "") {
          this.$message("客户结算重量不能为空,请从库存提取");
          return;
        }
        if (!/^[+]?((\d*(\.\d{1,5})$)|(\d+$))/.test(item.finalweight)) {
          this.$message("客户结算重量只能为正整数或者最多带5位小数");
          return;
        }
        if (item.finalweight.length > 9) {
          this.$message("客户结算重量字数不能超过9个字符");
          return;
        }

        // if (!/^[1-9]\d*\,\d*|[1-9]\d*$/.test(item.price)) {
        //   this.$message("单价只能为数字");
        //   return;
        // }
        // if (item.price === "") {
        //   this.$message("单价不能为空");
        //   return;
        // }
        // if (item.price.length > 9) {
        //   this.$message("单价字数不能超过9个字符");
        //   return;
        // }
        if (!/^\d+$/.test(item.num)) {
          this.$message("数量只能为数字");
          return;
        }
        if (item.num === "") {
          this.$message("数量字数不能为空");
          return;
        }
        if (item.num.length > 9) {
          this.$message("数量字数不能超过9个字符");
          return;
        }

        if (
          !item.stockid &&
          typeof item.stockid != "undefined" &&
          item.stockid != 0
        ) {
          this.$message("请从仓库选择正确的商品", "error");
          return;
        }
        this.totalWeight = this.totalWeight + Number(item.actualweight);
        this.finalWeight = this.finalWeight + Number(item.finalweight);
      }

      this.$confirm("是否确定继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "error"
      }).then(() => {
        this.$refs[formName].validate(valid => {
          if (valid) {
            this.submitTd();
          } else {
            console.log("error submit!!");
            return false;
          }
        });
      });
      // .catch(() => {
      //   this.message(true, "已取消操作", "error");
      // });
    },

    submitTd () {
      let _this = this;
      let memberId = "";
      var usr = this.usr;
      if (usr) {
        memberId = usr.memberId;
      }
      let params = new FormData();
      params.append("contractId", _this.tdruleForm.id);
      params.append("customername", _this.tdruleForm.customername);
      params.append("customerid", _this.tdruleForm.customerid);
      params.append("memberid", memberId);
      params.append("vehiclenumber", _this.tdruleForm.vehicleNumber);
      params.append("deliverymethod", _this.tdruleForm.deliverymethod);
      params.append("remark", _this.content);
      params.append("warehouseid", _this.tdruleForm.warehouseId);
      params.append("contractno", _this.tdruleForm.contractno);
      params.append("startTime", _this.dateObj.startTime);
      params.append("endTime", _this.dateObj.endTime);
      if (_this.tdruleForm.isItemRight) {
        params.append("isItemRight", 1);
      } else {
        params.append("isItemRight", 0);
      }

      params.append("weight", _this.totalWeight);
      params.append("finalweight", _this.finalWeight);
      params.append("liftingfee", _this.tdruleForm.liftingfee);
      params.append("feeoption", _this.tdruleForm.feeoption);
      // params.append("overtimefee", _this.tdruleForm.overtimefee);
      params.append(
        "deliveryOrderDetail",
        JSON.stringify(_this.multipleSelection)
      );
      this.axios
        .post(
          process.env.API_ROOT + "/DeliveryOrderApi/v1/addDeliveryOrder",
          params
        )
        .then(response => {
          if (!response.data) {
            return;
          }
          if (response.data.status === 200) {
            this.message(true, response.data.msg, "success");
            this.$router.push({ path: "/deliveryOrderList" });
          }
        });
    },

    handleItemSelectionChange (val) {
      this.selectedIds = [];
      this.multipleSelection = [];
      if (val) {
        val.forEach(row => {
          this.selectedIds.push(row.id);
        });
        this.multipleSelection = val;
      }
    },

    handleItemSelectionChange1 (val) {
      this.multipleSelection = [];
      this.selectedIdss = [];
      this.selectactualweight = 0.0;
      this.selectfinalweight = 0.0;
      if (val) {
        val.forEach(row => {
          this.selectedIdss.push(row.id);
          this.selectactualweight = this.selectactualweight + row.actualweight;
        });
        this.multipleSelection = val;
      }
    },
    editTerm (row) {
      this.termFormVisible = true;
      this.companyName = row.customername;
      this.contractNo = row.contractno;
      this.getTerm(row.id);
    },

    //审核单据
    verify (row) {
      let params = new FormData();
      params.append("id", row.id);
      params.append("memberId", this.memberId);
      params.append("contractno", row.contractno);
      params.append("contractType", row.contractstatus);
      this.axios
        .post(
          process.env.API_ROOT + "/SaleContractApi/v1/verifySaleContract",
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

    //生成提单
    deliveryorder (row) {
      this.tddialogFormVisible = true;
      this.findProduct();
      this.findProductSpec();
      this.findProductFactory();
      this.findProductMark();
      this.findSaleContractWarehouse();
      this.tempchoose = [];
      this.tdruleForm.contractno = row.contractno;
      this.tdruleForm.id = row.id;
      this.tdruleForm.customername = row.customername;
      this.tdruleForm.customerid = row.customerid;
      this.tdruleForm.contractstatus = row.contractstatus;
      let params = new FormData();
      params.append("keyword", row.contractno);
      params.append("memberId", this.memberId);
      params.append("customerId", row.customerid);
      this.axios
        .post(
          process.env.API_ROOT +
          "/SaleContractApi/v1/findSaleContractDetailByPage",
          params
        )
        .then(response => {
          if (!response.data) {
            return;
          }
          if (response.data.status === 200) {
            this.contractGridData = [];
            var tabledata = response.data.data.saleContractDetail;
            this.gridDataCopy = JSON.parse(JSON.stringify(tabledata));
            for (var i in tabledata) {
              this.contractGridData.push(tabledata[i]);
            }
            this.warehouseSelect();
            this.message(true, response.data.msg, "success");
          } else {
            this.message(true, response.data.msg, "error");
          }
        });
    },
    checkboxProcessInit (row, index) {
      if (row.processstatus || row.deliverystatus) {
        return 0; //不可勾选
      } else {
        return 1; //可勾选
      }
    },

    checkboxDeliveryInit (row, index) {
      if (row.deliverystatus === "出库中") {
        return 0; //不可勾选
      } else {
        return 1; //可勾选
      }
    },

    checkboxTransportInit (row, index) {
      if (row.transportstatus === "运输中" || row.deliverystatus !== "出库中") {
        return 0; //不可勾选
      } else {
        return 1; //可勾选
      }
    },

    //生成加工单
    jgorder (row) {
      this.jgdialogFormVisible = true;
      this.jgruleForm.templateId = "";
      this.jgruleForm.contractno = row.contractno;
      this.jgruleForm.id = row.id;
      this.jgruleForm.customername = row.customername;
      this.jgruleForm.customerId = row.customerid;
      this.tempchoose = [];
      let params = new FormData();
      params.append("keyword", row.contractno);
      params.append("memberId", this.memberId);
      params.append("customerId", row.customerid);
      this.axios
        .post(
          process.env.API_ROOT +
          "/SaleContractApi/v1/findSaleContractDetailByPage",
          params
        )
        .then(response => {
          if (!response.data) {
            return;
          }
          if (response.data.status === 200) {
            this.contractGridData = [];
            var tabledata = response.data.data.saleContractDetail;
            for (var i in tabledata) {
              this.contractGridData.push(tabledata[i]);
            }
            this.warehouseSelect();
            this.processTemplateSelect();
            this.message(true, response.data.msg, "success");
          } else {
            this.message(true, response.data.msg, "error");
          }
        });
    },
    // 打印预览
    printPreview (row) {
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
    submitTermForm () {
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
    onEditorBlur (editor) {
      this.editor = editor;
    },
    message (ifshow, msg, type) {
      this.$message({
        showClose: ifshow,
        message: msg,
        type: type
      });
    },
    onEditorFocus (editor) {
      this.editor = editor;
      editor.root.contentEditable = true;
    },
    onEditorReady (editor) {
      this.editor = editor;
      this.content = editor.root.innerHTML;
    },
    onEditorChange (editor) {
      this.editor = editor;
      this.currentLength = editor.text.replace("\n", "").length;
      this.content = editor.html;
    },
    timestampToTime: function (timestamp) {
      var date = new Date(timestamp); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
      var Y = date.getFullYear() + "-";
      var M =
        (date.getMonth() + 1 < 10
          ? "0" + (date.getMonth() + 1)
          : date.getMonth() + 1) + "-";
      var D = date.getDate() + " ";
      return Y + M + D;
    },
    getTerm (id) {
      let params = new FormData();
      params.append("id", id);
      params.append("memberId", this.memberId);
      this.axios
        .post(process.env.API_ROOT + "/SaleContractTermApi/v1/getTerm", params)
        .then(response => {
          if (!response.data) {
            this.listLoading = false;
            return;
          }
          if (response.data && response.data.status === 200) {
            this.content = response.data.data.termContent;
            this.id = response.data.data.id;
          } else if (response.data && response.data.status === 410) {
            return;
          } else {
            this.message(true, response.data.msg, "error");
            this.content = "";
          }
          this.listLoading = false;
        });
    },

    numFilter (value) {
      let realVal = "";
      if (!isNaN(value) && value !== "") {
        // 截取当前数据到小数点后两位
        realVal = parseFloat(value).toFixed(5);
      } else {
        realVal = "--";
      }
      return realVal;
    },

    // 每页大小改变时触发
    handleSizeChange (val) {
      this.pageSize = val;
      this.getContract();
    },
    // 当前页码改变时触发
    handleCurrentChange (val) {
      this.startPage = val;
      this.getContract();
    },
    // toueditor() {
    // 	this.$router.push({ path: '/ueditor' });
    // },
    /**
     * ifshow: true/false msg: message  type: error/error/success
     */
    message (ifshow, msg, type) {
      this.$message({
        showClose: ifshow,
        message: msg,
        type: type
      });
    },
    //删除名称
    delProductname (itemId) {
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
    delProductspec (itemId) {
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
        .catch(error => { });
    },
    // 删除厂家
    delProductfactory (itemId) {
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
    delProductmark (itemId) {
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
    delSaleContractWarehouse (itemId) {
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
    //创建新理算模板页
    openForm (id, index, isRemove = false) {
      if (id === this.formType) return;
      this.$f.validate(this.successValidate(isRemove), this.errorValidate);
      if (!this.isValidate) return;
      this.loading = true;
      this.current = index;
      let target = formConfig.get(id);
      this.rules = handlePlaceholder(target.obj.rule);
      this.formType = id;
      this.mergeRule(this.rules);
      // this.paddingData(this.data,this.rules);
      this.createForm();
    },
    changeStyle (index, isShow) {
      this.isShowRemoveBtn = isShow;
      this.isShowIndex = index;
    },
    // 移除表单
    removeForm (index, id) {
      // 修改样式
      if (id === this.formType) {
        let el;
        let prev_id;
        if (index === 0 && this.formList.length === 1) {
          this.$f.destroy();
          this.$f = null;
        } else if (index === 0 && this.formList.length > 1) {
          el = this.$refs[`index_${index + 1}`];
          prev_id = Number(el[0].attributes["data-id"].value);
          this.openForm(prev_id, index + 1, true);
        } else if (index !== 0 && this.formList.length > 1) {
          el = this.$refs[`index_${index - 1}`];
          prev_id = Number(el[0].attributes["data-id"].value);
          this.openForm(prev_id, index - 1, true);
        }
      }

      this.submitData.delete(id);
      this.formList.splice(index, 1);
      this.vm_collection_id.forEach(item => {
        if (String(item).indexOf(id) !== -1) {
          this.vm_collection.delete(item);
        }
      });
      // console.log('this.vm_collection', this.vm_collection)
      this.count++;
    },

    // 合成规则
    mergeRule (source) {
      this.setOptions(source);
      source.map((item, index) => {
        if (item._vm) {
          this.setVmCollection(item._vm);
        } else if (item.custom) {
          source[index] = this.makeMarker(item);
        } else if (item.request) {
          this.setSelectData(item, index);
        }
      });
    },

    // 处理upload组件的url
    handleUploadUrl (url) {
      return `${url}/test`;
    },

    setOptions (source) {
      source.forEach(item => {
        if (item.type && item.type === "select") {
          !item.options ? this.$set(item, "options", []) : "";
        }
      });
    },

    setVmCollection (vm) {
      // 一个规则里面有多个自定义组件的时候要给vm_collection的key加后缀
      if (this.vm_collection.has(this.formType)) {
        this.vm_collection.set(`${this.formType}_${++this.count}`, vm);
      } else {
        this.vm_collection.set(this.formType, vm);
      }
      this.count++;
    },

    // 生成自定义组件
    makeMarker (source) {
      const vm = new Vue(source.vm);
      if (source.field === "__upload") {
        // 集中处理upload组件的url
        vm.action = this.handleUploadUrl(vm.action);
      }
      this.setVmCollection(vm);
      return this.$formCreate.maker.createTmp(
        source.template,
        vm,
        source.field,
        source.label,
        source.col
      );
    },

    // 设置select打开下拉框事件，因为渲染函数on事件不支持修饰符，所以现在需要频繁请求，解决方法是使用缓存
    setSelectData (item) {
      let func = () => {
        this.querySelectData(item.url).then(d => {
          item.options = d;
        });
      };
      if (item.event) {
        item.event["visible-change"] = func;
      } else {
        item.event = {};
        item.event["visible-change"] = func;
      }
    },

    // 获取select框数据
    // TODO url要在这里做个处理
    querySelectData (url) {
      return new Promise((resolve, reject) => {
        // setTimeout是示例，下面注释的是生产环境下的
        setTimeout(() => {
          const option = [
            { value: 1, label: "第一个" },
            { value: 2, label: "第二个" },
            { value: 3, label: "第三个" }
          ];
          resolve(option);
        }, 200);
        /*const success = _ => {
                        let data = _.projects.map((item) => {
                            return {value: item.id, label: item.name}
                        })
                        resolve(data)
                    }
                    this.$axiosGet({
                        url: `/projects?keyword=&listOnly=1`,
                        data: Object.assign({}),
                        success,
                    })*/
      });
    },

    addForm () {
      this.formTypeCollection = [];
      this.showAppendForm = true;
      this.$f ? this.$f.submit() : "";
    },

    renderForm () {
      this.loading = true;
      this.showAppendForm = false;

      this.formList.push({
        id: this.formTypeCollection,
        name: formConfig.get(this.formTypeCollection).name
      });
      this.formType = this.formTypeCollection;
      this.loadFormData();
    },

    // 点击确定时加载表单生成规则
    loadFormData () {
      let target = formConfig.get(this.formType);
      this.rules = handlePlaceholder(target.obj.rule);
      this.mergeRule(this.rules);
      // this.paddingData(this.data,this.rules);
      this.createForm();
      this.$f.submit();
    },

    // TODO 数据填充应该会有问题，对于upload类型的还没做处理
    // 填充数据
    paddingData (data, rules) {
      rules.forEach(rule => {
        if (rule.rule && rule.rule._vm) {
          let temp = rule.rule._vm.extendData;
          for (let extendKey in temp) {
            if (temp.hasOwnProperty(extendKey)) {
              if (Array.isArray(temp[extendKey])) {
                temp[extendKey] = data[extendKey] ? data[extendKey] : [];
              } else {
                temp[extendKey] = data[extendKey] ? data[extendKey] : "";
              }
            }
          }
        } else {
          rule.value = data[rule.field] ? data[rule.field] : "";
        }
      });
    },

    createForm () {
      let _this = this;
      const root = this.$refs.fc;
      root.innerHTML = "";
      this.$f = this.$formCreate(this.rules, {
        el: root,
        resetBtn: false,
        submitBtn: false,
        mounted: () => {
          _this.loading = false;
        },
        onSubmit: function (formData) {
          // TODO 每次加载带自定义组件的表单时，数据才会双向绑定
          if (_this.submitData.size === 0) {
            _this.allData = {};
            [..._this.vm_collection.values()].map(item => {
              Object.assign(_this.allData, item.extendData);
            });
            Object.assign(_this.allData, formData);
            //console.log(_this.allData)
            _this.submitData.set(_this.formType, _this.allData);
          } else {
            _this.vm_collection_id.forEach(item => {
              if (String(item).indexOf(_this.formType) !== -1) {
                if (!_this.submitData.get(_this.formType)) {
                  _this.submitData.set(
                    _this.formType,
                    Object.assign(
                      _this.vm_collection.get(item).extendData,
                      formData
                    )
                  );
                } else {
                  Object.assign(
                    _this.submitData.get(_this.formType),
                    _this.vm_collection.get(item).extendData,
                    formData
                  );
                }
              } else {
                _this.submitData.set(_this.formType, formData);
              }
            });
            _this.vm_collection_id.length === 0
              ? _this.submitData.set(_this.formType, formData)
              : "";
          }
        }
      });
    },
    saveData () {
      this.$f.validate(this.successValidate, this.errorValidate);
    },
    successValidate (bool = false) {
      !bool ? this.$f.submit() : "";
      this.isValidate = true;
    },
    errorValidate () {
      this.$message({ type: "warning", message: "请正确填写!" });
      this.isValidate = false;
    }
  },
  mounted () {
    if (this.$cookie.get("user") !== null) {
      this.usr = JSON.parse(this.$cookie.get("user"));
    }

    this.memberId = this.usr.memberId;
    this.getContract();
    this.getCustomerList();
  },
  computed: {
    //选择理算模板
    selectOptions: function () {
      return [...formConfig.entries()].map(item => {
        let idList = this.formList.map(item => {
          return item.id;
        });
        let bool = idList.indexOf(item[0]) !== -1 ? true : false;
        return { value: item[0], label: item[1].name, disabled: bool };
      });
    },
    vm_collection_id: function () {
      let temp = this.count;
      return [...this.vm_collection.keys()];
    },

    inputdisable: function () {
      if (
        this.ruleForm.contractstatus === "意向临调合同" ||
        this.ruleForm.contractstatus === ""
      ) {
        return false;
      } else {
        return true;
      }
    },
    nowLength: function () {
      if (Number(this.currentLength) - this.maxLength >= 0) {
        this.$refs.myTextEditor.quill.root.contentEditable = false;
        let currentText = this.$refs.myTextEditor.quill.root.innerText;

        this.content = currentText.substring(0, this.maxLength);
        this.$refs.myTextEditor.quill.root.innerText = this.content;
      }

      return this.currentLength;
    },
    SurplusLength: function () {
      // 计算属性 获得当前输入字符长度
      let num = this.maxLength - Number(this.currentLength);
      if (num > 0) {
        return num;
      } else {
        return 0;
      }
    },

    addShow () {
      return this.getHasRule("新增销售合同");
    },
    delShow () {
      return this.getHasRule("删除销售合同");
    },
    findShow () {
      return this.getHasRule("合同查询");
    },
    detailShow () {
      return this.getHasRule("编辑");
    },
    termShow () {
      return this.getHasRule("条款");
    },
    printShow () {
      return this.getHasRule("打印预览");
    },
    processSubmitShow () {
      return this.getHasRule("生成加工单");
    },
    deliverySubmitShow () {
      return this.getHasRule("生成提单");
    },
    copyContractShow () {
      return this.getHasRule("复制合同");
    },
    verifyContractShow () {
      return this.getHasRule("审核合同");
    }
  }
};
</script>

<style>
.el-popover {
  min-width: auto !important;
}

#salecontractList .digitUppercase {
  border: 1px solid #dddddd;
  float: inherit;
  margin: 0 auto;
}
#salecontractList .widthInput {
  width: 300px;
}

#contractbox {
  width: 950px;
  font-size: 16px;
  margin: 0 auto;
}
#contractbox .addorder {
  margin-bottom: 15px;
  border: 1px solid #ebeef5;
}
#contractbox .footeremark .padingnone {
  padding: 0 !important;
}
#contractbox .footeremark .padtop {
  padding: 15px !important;
}
#contractbox .footeremark .el-row div {
  padding: 10px 15px;
}

/* #contractbox .bordertop {
  border: 1px solid #d9d9d9;
  padding: 5px 15px !important;
  margin: 0;
}
#contractbox .bordertopprint {
  padding: 5px 15px !important;
  border: 1px solid #d9d9d9;
  margin: 0;
  border-top: 0;
  border-bottom: 0;
} */
/* #salecontractList .contractbox .el-table {
  width: 100%;
  font-size: 14px;
}
#salecontractList .contractbox .el-table th {
  padding: 3px 0;
}
#salecontractList .contractbox .el-table td {
  padding: 3px 0;
} */

#salecontractList .contractbox {
  overflow: hidden;
  font-size: 14px;
  line-height: 16px;
}

#salecontractList .avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
#salecontractList .avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
#salecontractList .avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
#salecontractList .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
/* #salecontractList .el-dialog {
  height: 500px;
} */
#salecontractList .dialog-footer {
  margin-bottom: 50px;
}
/* .el-table {
	width:800px
} */
#salecontractList .termquill {
  height: 550px;
}
#salecontractList .termquill .ql-container {
  height: 600px;
}

#salecontractList .tdquill {
  height: 300px;
  width: 1050px;
}
#salecontractList .tdquill .ql-container {
  height: 250px;
}

#salecontractList .jgquill {
  height: 300px;
  width: 1050px;
}
#salecontractList .jgquill .ql-container {
  height: 250px;
}

#salecontractList .limit {
  margin-bottom: 40px;
  height: 30px;
  text-align: left;
}
#salecontractList .inputwidth {
  width: 200px;
}
#salecontractList .selectwidth {
  width: 280px;
}
#salecontractList .autoinputwidth {
  width: 200px;
}

#salecontractList .settleinputwidth {
  width: 150px;
}
#salecontractList .el-tb-edit .el-input,
#salecontractList .el-tb-edit .el-autocomplete,
#salecontractList.el-tb-edit .el-input-number,
#salecontractList .el-tb-edit .el-select {
  display: none;
  width: 100%;
}

#salecontractList .el-tb-edit .current-row .el-input,
#salecontractList .el-tb-edit .current-row .el-autocomplete,
#salecontractList .el-tb-edit .current-row .el-input-number,
#salecontractList .el-tb-edit .current-row .el-select {
  display: inherit;
}

#salecontractList .el-tb-edit .current-row .el-input + span,
#salecontractList .el-tb-edit .current-row .el-autocomplete + span,
#salecontractList .el-tb-edit .current-row .el-input-number + span,
#salecontractList .el-tb-edit .current-row .el-select + span {
  display: none;
}

/* 文本域width设置 */
#salecontractList .vehiclewidth {
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
