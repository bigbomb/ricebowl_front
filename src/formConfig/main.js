import {handleLayout} from './handle/handle'
import table_100108 from './table_100108'


/*
* 如需自定义单个form的布局，则需像表单100009那样使用，并指定isLayout = true
* */


const config = new Map([
    [100108,{obj:table_100108,name:"其它证明文件"}],

]);


const layout = {labelWidth:"120px", span:24};
[...config.values()].forEach((item)=>{
    if(!item.isLayout){
        handleLayout(item.obj,layout);
    }
});
export default config
