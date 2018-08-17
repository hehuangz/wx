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
	},
	handleCode: function () {
		wx.login({
			success: function(res){
				if(res.code){
					wx.setClipboardData({
						data:res.code,
						success: function(res) {
							console.log(res);
						}
					})
				}
			}
		})
	}
})
