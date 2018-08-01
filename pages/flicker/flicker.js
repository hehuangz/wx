//index.js
import { IMG_OSS_BG } from '../../constants/constants';
// const  = OSS;
//获取应用实例
const app = getApp()
Page({
	data: {
		IMG_OSS_BG,
	},
	onReady: function () {
		setTimeout(() => {
			wx.redirectTo({
				url: '/pages/login/login'
			})
		}, 3000);	
	},
	handleGo: function (e) {
		wx.redirectTo({
			url: '/pages/login/login'
		})
	}
})
