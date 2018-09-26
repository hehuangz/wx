
/**
 * 显示时间
 */
const formatTime = date => {
	const year = date.getFullYear()
	const month = date.getMonth() + 1
	const day = date.getDate()
	const hour = date.getHours()
	const minute = date.getMinutes()
	const second = date.getSeconds()
  	return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  	n = n.toString()
  	return n[1] ? n : '0' + n
}

/**
 * --begin--
 * 表单验证
 */
const obj = {
	validNum: {
		regex: /^\d+(\.\d+)?$/,
		error: "请输入正确数字"
	},
	validInteger: {
		regex: /^[1-9]\d*$/,
		error: "请输入非负整数"
	},
	validEmail: {
		regex: /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/,
		error: "邮箱格式不正确"
	},
	validDate: {
		regex: /^\d{4}(\-|\/|\.)\d{1,2}\1\d{1,2}$/,
		error: "日期格式不正确"
	},
	validTime: {
		regex: /\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/,
		error: "时间格式不正确"
	},
	validId: {
		regex: /(^[0-9a-zA-Z]{6,}$)/, // 港澳台比较特殊
		error: "身份证号格式不正确"
	},
	validPrice: {
		regex: /^([1-9][\d]{0,10}|0)([.]?[\d]{1,2})?$/,
		error: "请输入正确金额"
	},
	validMobile: {
		regex: /^(13[0-9]|14[5|7]|15[^4|^\D]|16[0-9]|17[0-9]|18[0-9]|19[0-9])\d{8}$/,
		error: "请填写正确的手机号码"
	},
	validPhone: {
		regex: /^(\(\d{3,4}\)|\d{3,4}(-|\s)?)?\d{7,8}(-\d{1,4})?$/,
		error: "请输入正确的电话号码"
	},
	validPostalCode: {
		regex: /^\d{4}$/,
		error: "请输入4位短信验证码"
	},
	validZipCode: {
		regex: /^\d{6}$/,
		error: "请输入6位邮政编码"
	},
	validWeChat: {
		regex: /^[a-zA-Z\d_-]{5,}$/,
		error: "请输入正确的微信号"
	},
	validName: {
		regex: /^[A-Za-z0-9\u4e00-\u9fa5_-]{1,}$/,
		error: "请不要输入特殊字符"
	}
};

function validity(rule) {
	return rule.required ?
		obj[rule.type].regex.test(rule.value) :
		rule.value == "" || obj[rule.type].regex.test(rule.value);
}

const dataValidity = (rules)  => {
	let state = {
		status: !0
	};
	for (let i in rules) {
		let type = rules[i].type;
		if (typeof obj[type] == "undefined") { // type输入错误
			state = {
				status: !1,
				error: rules[i].name + "的校验type有误",
				index: i
			}
			break;
		} else if (rules[i].required && rules[i].value == "") { // 必填校验
			state = {
				status: !1,
				error: rules[i].name + "必填",
				index: i
			};
			break;
		} else if (!validity(rules[i])) { // 正则校验
			state = {
				status: !1,
				error: obj[type].error,
				index: i
			};
			break;
		}
	}
	return state;
};
// --over--

/**
 * 处理字符串中携带的参数
 * @param {string} name 参数
 * @param {string} url 整个字符串地址
 * @return {string}  返回value
 * @example getQuery('id','http://xx.com?id=1')  => 1
 */
const getQuery = (name='',url='') => {
	let match = /^[hH][tT][tT][pP]([sS]?):\/\/(\S+\.)+\S{2,}$/; //匹配中文
	// let match = /^((ht|f)tps?):\/\/[\w\-]+(\.[\w\-]+)+([\w\-\.,@?^=%&:\/~\+#]*[\w\-\@?^=%&\/~\+#])?$/; //不匹配中文
	if(!match.test(url) || (url.indexOf('?')==-1)) return console.error('url格式不正确')
	let search=url.split('?')[1];
	let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	let r = search.match(reg);
	if (r != null) return unescape(r[2]); 
	return null;
}

/**
 * 	处理时间戳,转化成标准格式
 */
function formatDate(time){
    let date = new Date(time);
    let year = date.getFullYear(),
        month = date.getMonth()+1,//月份是从0开始的
        day = date.getDate(),
        hour = date.getHours(),
        min = date.getMinutes(),
        sec = date.getSeconds();
    let preArr = Array.apply(null,Array(10)).map(function(elem, index) {
        return '0'+index;
    });////开个长度为10的数组 格式为 00 01 02 03

    let newTime = year + '-' +
                (preArr[month]||month) + '-' +
                (preArr[day]||day) + ' ' +
                (preArr[hour]||hour) + ':' +
                (preArr[min]||min) + ':' +
                (preArr[sec]||sec);
    return newTime;         
}

/**
 * @param {String} time 传入时间戳
 * @param {String} range 传入时间范围，以这个范围倒计时，单位是分钟,默认120分钟
 * @returns {String} min 与当前时间差了多少分钟
 */
function countDown(time,range=120) {
	let current=new Date().getTime()
	let dVal=current-Number(time)
	let val=Number(range)-Math.floor(dVal/1000/60)
	if(val<0){
		return '已超时'
	}else if(val>=0 && val<=60){
		return val+'分钟'
	}else if(val>60 && val<120){
		return '1小时'+(val-60)+'分钟'
	}else if(val==120){
		return '2小时'
	}
}


module.exports = {
  formatTime: formatTime,
  dataValidity: dataValidity,
  getQuery: getQuery,
  formatDate: formatDate,
  countDown: countDown
}
