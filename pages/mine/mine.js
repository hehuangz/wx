//logs.js
import Debounce from '../../utils/debounce.js';
import {IMG_OSS_MINEBG} from '../../constants/constants'
import API from '../../constants/apiRoot'

Page({
	data: {
		IMG_OSS_MINEBG,
		userInfo: wx.getStorageSync('wx_user')?wx.getStorageSync('wx_user'):{},
		tel: '0571-87179826',//客服电话
		is_toLogin: false
	},
	onLoad: function () {
		this.toast=this.selectComponent("#toast")
		this.dialog = this.selectComponent("#dialog");
		let {userInfo} = this.data
		if(wx.getStorageSync('wt_user') || wx.getStorageSync('wx_user')){
			userInfo=wx.getStorageSync('wt_user')?wx.getStorageSync('wt_user'):wx.getStorageSync('wx_user')
		}else {
			userInfo={}
		}
		this.setData({userInfo})
	},
	handleCall: function () {
		wx.makePhoneCall({
			phoneNumber: this.data.tel
		})		  
	},
	handleAddress: function () {
		// 打开微信地址
		wx.chooseAddress({
			success: function (res) {}
		})
	},
	handleDownload: function () {
		wx.navigateTo({
			url:'/pages/download/download'
		})
	},
	handleWxTel: function (e) {
		const {userInfo} = this.data
		const _this=this
		wx.login({
			success: function(wxres){
				wx.request({
					url: API.MINE_WXTEL,// ADVISER_SHOP_LIST
					data: {
						iv: e.detail.iv,
						encryptedData: e.detail.encryptedData,
						jscode: wxres.code,
						img: userInfo.avatarUrl,
						nickname:  userInfo.nickName
					},
					method: 'POST',
					header: {
						"Content-Type": "application/x-www-form-urlencoded"
					},
					success: function (res) {
						console.log(res);
						const {code='', data={}, message=""} = res.data
						if( code===200 && data){
							return  _this.setData({
								userInfo: data
							},()=>{
								wx.setStorage({
									key:"wt_user",
									data,
									success:function () {
										_this.toast.success("绑定成功")
										_this.dialog.hideDialog()
									}
								})
							})
							
						}
						return _this.toast.warning(message)
					},
					fail: function (res) {
						return _this.toast.error('请求失败，请刷新重试')
					}
				})
			}
		})
	},
	handleMyTel: function () {
		wx.navigateTo({
			url:'/pages/login/login'
		})
	},
	handleDialog: function () {
		Debounce(()=>{
			this.dialog.showDialog();
		})
	},
	//dialog取消事件
	_cancelEvent(){
		wx.navigateTo({
			url: '/pages/login/login'
		})
	},
	//dialog确认事件
	_confirmEvent(){
		// this.dialog.hideDialog();
	},
})
