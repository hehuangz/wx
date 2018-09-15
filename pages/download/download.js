//复制链接

Page({
	data: {
		url: 'https://m.pp.cn/detail.html?appid=7860566&ch_src=pp_dev&ch=default' // 安卓
	},
	onLoad: function () {
		const _this=this
		wx.getSystemInfo({
			success: function(res) {
				if(res.model && (/iPhone/.test(res.model) || /iPad/.test(res.model))){
					_this.setData({
						url: 'https://itunes.apple.com/cn/app/id1420004313' // ios
					})
				}else {
					_this.setData({
						url: 'https://m.pp.cn/detail.html?appid=7860566&ch_src=pp_dev&ch=default' // 安卓
					})
				}
			}
		  })
	},
	handleCopy: function () {
		wx.setClipboardData({
			data: this.data.url,
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
