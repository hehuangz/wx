//复制链接

Page({
	data: {
		url: 'http://www.baidu.com'
	},
	onLoad: function () {
		
	},
	handleCopy: function () {
		wx.setClipboardData({
			data: 'sdfdfdfdff',
			success: function(res) {
			  console.log(res);
			}
		  })
	}

})
