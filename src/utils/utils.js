// export的作用个人觉得是暴露一些接口,然后另外的页面可以用import调用它
export const setStore = (name, content) => {
  if (!name) return
  if (typeof content !== 'string') {
    content = JSON.stringify(content)
  }
  window.localStorage.setItem(name, content)
}
export const getStore = name => {
  if (!name) return
  return window.localStorage.getItem(name)
}
export const removeStore = name => {
  if (!name) return
  window.localStorage.removeItem(name)
}

export const formatNewDate= (timeStamp, format)=> {
  var date = new Date(timeStamp);
  var o = {
      'M+' : date.getMonth() + 1, //month
      'D+' : date.getDate(), //day
      'h+' : date.getHours(), //hour
      'm+' : date.getMinutes(), //minute
      's+' : date.getSeconds(), //second
      'S' : date.getMilliseconds() //millisecond
  }

  if(/(Y+)/.test(format)) {
      format = format.replace(RegExp.$1,
          (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  }

  for(var k in o) {
      if (new RegExp('('+ k +')').test(format)) {
          format = format.replace(RegExp.$1,
              RegExp.$1.length == 1 ? o[k] : ('00'+ o[k]).substr((''+ o[k]).length));
      }
  }
  return format;
}

export function getCookie(name) {
  var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
  if (arr = document.cookie.match(reg))
   return (arr[2]);
  else
   return null;
 }
  
 //设置cookie,增加到vue实例方便全局调用
 export function setCookie (c_name, value, expiredays) {
  var exdate = new Date();
  exdate.setDate(exdate.getDate() + expiredays);
  document.cookie = c_name + "=" + escape(value) + ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString());
 };
  
 //删除cookie
 export function delCookie (name) {
  var exp = new Date();
  exp.setTime(exp.getTime() - 1);
  var cval = getCookie(name);
  if (cval != null)
   document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
 };