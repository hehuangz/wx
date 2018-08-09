//logs.js
import utils from '../../utils/utils.js';
import {IMG_OSS_MINEBG} from '../../constants/constants'
import API from '../../constants/apiRoot'

Page({
	data: {
		IMG_OSS_MINEBG,
		userInfo: wx.getStorageSync('wx_user')?wx.getStorageSync('wx_user'):{},
		tel: '0571-87179826'
	},
	onLoad: function () {
		this.toast=this.selectComponent("#toast")
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
		const _this=this
		wx.login({
			success: function(wxres){
				wx.request({
					url: API.MINE_WXTEL,// ADVISER_SHOP_LIST
					data: {
						iv: e.detail.iv,
						encryptedData: e.detail.encryptedData,
						jscode: wxres.code,
						img: _this.data.userInfo.avatarUrl,
						nickname:  _this.data.userInfo.nickName
					},
					method: 'POST',
					header: {
						"Content-Type": "application/x-www-form-urlencoded"
					},
					success: function (res) {
						console.log(res);
						const {code='', data={}, message=""} = res.data
						if( code===200 ){
							// return 
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
	}
})
