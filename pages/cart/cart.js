//logs.js
import utils from '../../utils/utils.js';

Page({
	data: {
		logs: []
	},
	onLoad: function () {
		this.setData({
		logs: (wx.getStorageSync('logs') || []).map(log => {
			return utils.formatTime(new Date(log))
		})
		})
	},
	// 购物车为空时点击“去逛逛”
	_buttonEvent: function () {
		wx.switchTab({url:'/pages/home/home'})
	}
})
