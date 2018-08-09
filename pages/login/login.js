//index.js
import util from '../../utils/utils';
import API from '../../constants/apiRoot';
import Debounce from '../../utils/debounce.js';
import {IMG_OSS_PHONE,IMG_OSS_LOCK,IMG_OSS_LOGO} from '../../constants/constants';
let t;
const { dataValidity } = util;

//获取应用实例
const app = getApp()
Page({
	data: {
		tel: '',
		code: '',
		IMG_OSS_PHONE,
		IMG_OSS_LOCK,
		IMG_OSS_LOGO,
		time: 60,
		is_code: true, // 是否可以发送验证码
		is_login: false // 是否可以登录
	},
	onReady: function () {
		this.toast=this.selectComponent("#toast")
	},
	bindTel: function (e) {
		this.setData({ tel: e.detail.value })
	},
	bindCode: function (e) {
		this.setData({ code: e.detail.value })
	},
	//事件处理函数
	handleCode: function () {
		Debounce(()=>{
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
						_this._onTime()
						return _this.toast.info("验证码已发送，请注意查收")
					}
					return _this.toast.warning(res.data.message)
				},
				fail: function (res) {
					return _this.toast.error('请求失败，请刷新重试')
				}
			})
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
		const userInfo=wx.getStorageSync('wx_user')?wx.getStorageSync('wx_user'):{}
		wx.login({
			success: function(wxres){
				wx.request({
					url: API.LOGIN_REGISTER,
					data: {
						tel: _this.data.tel,
						verifycode: _this.data.code,
						jscode: wxres.code,
						img: userInfo.avatarUrl,
						nickname: userInfo.nickName
					},
					method: 'POST',
					header: {
						"Content-Type": "application/x-www-form-urlencoded"
					},
					success: function (res) {
						console.log(res);
						const {message='',code='',data={}} = res.data	
						if(code===200){
							return 	wx.setStorage({
								key:"wt_user",
								data,
								success:function () {
									_this.toast.success("登录成功")
								}
							})
						}			
						return _this.toast.warning(res.data.message)
					},
					fail: function (res) {
						_this.toast.error('请求失败，请刷新重试')
					}
				})	
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
	},
	_onTime: function () {
		this.setData({is_code:false})
		t = setInterval(()=>{
			this.setData({
				time:this.data.time-1
			})
			if(this.data.time<=0){
				this.setData({is_code:true,time: 60})
				clearInterval(t)
			}
		},1000)
		
	}
})
