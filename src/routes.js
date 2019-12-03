import Test from './views/test/Test.vue'
import Login from './views/Login.vue'
import NotFound from './views/404.vue'
import Home from './views/Home.vue'
import Main from './views/Main.vue'
import SaleContractList from './views/contract/SaleContractList.vue'
import UserList from './views/user/UserList.vue'
import PermiList from './views/permission/PermisList.vue'
import RoleList from './views/permission/RoleList.vue'
import DictionaryList from './views/dictionary/DictionaryList.vue'
import OperatingRecord from './views/system/OperatingRecord.vue'
import Statistics from './views/system/Statistics.vue'
import LoginLog from './views/system/LoginLog.vue'
import Info from './views/system/Info.vue'
import Ueditor from './views/ueditor.vue'
import CustomersList from './views/customer/CustomersList.vue'
import ItemSaleDoc from './views/document/ItemSaleDoc.vue'
import ProcessOrder from './views/document/ProcessOrder.vue'
import DeliveryOrder from './views/document/DeliveryOrder.vue'
import PurchaseContractList from './views/contract/PurchaseContractList.vue'
import PurchaseInstockOrder from './views/document/PurchaseInstockOrder.vue'
import transportOrderList from './views/document/transportOrderList.vue'
import Notice from './views/system/Notice.vue'
import spotstock from './views/stock/spotstock.vue'
import purchaseInvoice from './views/invoice/purchaseInvoice.vue'
import salesInvoice from './views/invoice/salesInvoice.vue'
import salesAnalyse from './views/report/SaleContractReport.vue'

let router = [
    {
        path: '/login',
        component: Login,
        name: '',
        hidden: true
    },
    {
        path: '/404',
        component: NotFound,
        name: '',
        hidden: true
    },
    //{ path: '/main', component: Main },
    {
        path: '/',
        redirect: '/saleContractList',
        component: Home,
        name: '用户管理',
        iconCls: 'icon iconfont icon-yonghurenxiang',//图标样式class
        children: [
            { path: '/main', component: Main, name: '主页', hidden: true },
            { path: '/userlist', component: UserList, name: '用户列表' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '权限管理',
        iconCls: 'icon iconfont icon-Slice',
        children: [
            { path: '/permisList', component: PermiList, name: '菜单列表' },
            { path: '/roleList', component: RoleList, name: '角色权限' },
        ]
    },
    {
        path: '/',
        component: Home,
        name: '数据字典',
        iconCls: 'icon iconfont icon-dic-manager',
        children: [
            { path: '/dictionaryList', component: DictionaryList, name: '字典属性' },
        ]
    },
    {
        path: '/',
        component: Home,
        name: '系统管理',
        iconCls: 'icon iconfont icon-xitongguanli',
        children: [
            { path: '/operatingRecord', component: OperatingRecord, name: '操作记录' },
            { path: '/loginLog', component: LoginLog, name: '登陆日志' },
            { path: '/statistics', component: Statistics, name: '统计图表' },
            { path: '/getCopInfo', component: Info, name: '公司信息' },
            { path: '/noticeList', component: Notice, name: '系统公告' }

        ]
    },
    {
        path: '/',
        component: Home,
        name: '合同管理',
        iconCls: 'icon iconfont icon-iconfontshu',
        children: [
            { path: '/saleContractList', component: SaleContractList, name: '销售合同' },
            // { path: '/purchaseContractList', component: PurchaseContractList, name: '采购合同' },
            { path: '/ueditor', component: Ueditor, name: '合同文本模板' },

        ]
    },
    {
        path: '/',
        component: Home,
        name: '单据管理',
        iconCls: 'icon iconfont icon-xitongguanli',
        children: [
            { path: '/itemSaleDoc', component: ItemSaleDoc, name: '报价单(微信小程序客户端)' },
            {path: '/processOrderList', component: ProcessOrder, name: '加工单'},
            {path: '/deliveryOrderList', component: DeliveryOrder, name: '提单'},
            { path: '/purchaseInstockOrderList', component: PurchaseInstockOrder, name: '采购入库单' },
            {path:'/transportOrderList',component:transportOrderList,name:'发货单'}

        ]
    },
    {
        path: '/',
        component: Home,
        name: 'TEST',
        iconCls: 'icon iconfont icon-ceshi',
        children: [
            { path: '/Test', component: Test, name: '测试页面' },
        ]
    },
    {
        path: '/',
        component: Home,
        name: '客户管理',
        iconCls: 'icon iconfont icon-yonghurenxiang',//图标样式class
        children: [
            { path: '/customersList', component: CustomersList, name: '客户列表' }
        ]
    },{
        path: '/',
        component: Home,
        name: '库存管理',
        children: [
            { path: '/stockList', component: spotstock, name: '库存列表' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '财务管理',
        children: [
            { path: '/purchaseInstockInvoiceList', component: purchaseInvoice, name: '采购发票' },
            { path:'/SaleContractInvoiceList',component:salesInvoice,name:'销售合同发票'},
            { path:'/SaleContractAnalyseList',component:salesAnalyse,name:'销售分析'}
        ]
    },
    {
        path: '*',
        hidden: true,
        redirect: { path: '/404' }
    }
];


export default router;
