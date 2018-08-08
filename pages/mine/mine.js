//logs.js
import utils from '../../utils/utils.js';
import {IMG_OSS_MINEBG} from '../../constants/constants'

Page({
	data: {
		IMG_OSS_MINEBG,
		userInfo: wx.getStorageSync('wx_user')?wx.getStorageSync('wx_user'):{},
		tel: '0571-87179826'
	},
	onLoad: function () {
		
	},
	handleCall: function () {
		wx.makePhoneCall({
			phoneNumber: this.data.tel
		})		  
	},
	handleAddress: function () {
		// 打开看到的微信地址
		wx.chooseAddress({
			success: function (res) {}
		})
	},
	launchAppError: function(e) { 
        console.log(e.detail.errMsg) 
    } 

})
