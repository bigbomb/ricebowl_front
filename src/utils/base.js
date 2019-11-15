exports.install = function (Vue, options) {
    Vue.prototype.getHasRule = function (val){
            //   console.log(val,"---传入的值")
              let permitsButtonsList =   window.localStorage.getItem('permitsButtons')
            //   console.log(permitsButtonsList,"---权限列表")
              let retValue = permitsButtonsList.includes(val)
            //   console.log(retValue,"---对比的结果值")
              return retValue
    }

}