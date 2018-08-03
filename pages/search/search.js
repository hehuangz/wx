//index.js
import util from '../../utils/utils';
import API from '../../constants/apiRoot';
const { dataValidity } = util;

//获取应用实例
const app = getApp()
Page({
	data: {
		tel: '',
		code: '',
		show: false,
		tabTitle: [{
			id: 0,
			name: '销量',
			icon: 'icon-shouji',
			defaultStyles:'color:#929292',
			selectedStyles: 'color:#ff4b2d'
		},{
			id: 1,
			name: '价格从低到高',
			icon: 'icon-shouji',
			defaultStyles:'color:#929292',
			selectedStyles: 'color:#ff4b2d'
		},{
			id: 2,
			name: '价格从高到低',
			icon:'icon-shouji',
			defaultStyles:'color:#929292',
			selectedStyles: 'color:#ff4b2d'
		}],
		tabContent:[{
			id: 1,
			title: '1111',
			src: "",
			price: '100',
			oldPrice: '199'
		},{
			id: 2,
			title: '222',
			src: "",
			price: '100',
			oldPrice: '199'
		},{
			id: 3,
			title: '333',
			src: "",
			price: '100',
			oldPrice: '199'
		}]
	},
	onReady: function () {
		this.toast=this.selectComponent("#toast")
		this.lose=this.selectComponent("#lose")
	},
	bindTel: function (e) {
		this.setData({ tel: e.detail.value })
	},
	bindCode: function (e) {
		this.setData({ code: e.detail.value })
	},
	//事件处理函数
	handleCode: function () {
		const rules = {
			tel: {
				name: "手机号",
				type: "validMobile",
				value: this.data.tel,
				required: !0
			}
		};
		if(!this._onCheck(rules))return;
		const _this=this;
		wx.request({
			url: API.LOGIN_CREATECODE,
			data: {
				tel: this.data.tel
			},
			method: 'POST',
			header: {
			},
			success: function (res) {
				const {message='',code=''} = res.data
				if( code===200 ){
					return _this.toast.info("验证码已发送，请注意查收")
				}
				return _this.toast.info(res.data.message)
			},
			fail: function (res) {
				return _this.toast.info('请求失败，请刷新重试')
			}
		})
	},
	handleLogin: function () {
		const rules = {
			tel: {
				name: "手机号",
				type: "validMobile",
				value: this.data.tel,
				required: !0
			},
			code: {
				name: "验证码",
				type: "validPostalCode",
				value: this.data.code,
				required: !0
			}
		};
		if(!this._onCheck(rules))return;
		const _this=this;
		wx.request({
			url: API.LOGIN_REGISTER,
			data: {
				tel: this.data.tel,
				verifycode: this.data.code
			},
			method: 'POST',
			header: {
			},
			success: function (res) {
				const {message='',code='',data={}} = res.data	
				if(code===200){
					return 	wx.setStorage({
						key:"wx_user",
						data,
						success:function () {
							_this.toast.info("登录成功")
						}
					})
				}			
				return _this.toast.info(res.data.message)
			},
			fail: function (res) {
				_this.toast.info('请求失败，请刷新重试')
			}
		})
	},
	_onCheck: function(rules){
		const resultValidity = dataValidity(rules);
		if (!resultValidity.status){
			this.toast.info(resultValidity.error);
			return false;
		}
		return true;
	}
})
