//logs.js
import API from '../../constants/apiRoot'

Page({
	data: {
		data:{},
		service:['低价正品','专属顾问','同城配送'],
		showsku: true,
		stepperValue: 1,  
		stepperMax: 10,  
		skuArr: [],
		skuKey: {'重来1':['11',12,13],'重来2':[21,22,23],'重来3':[33]},
		test:[11,22,33]
	},
	onLoad: function (options) {
		this.toast=this.selectComponent("#toast")
		const {goodId=1} = options
		const _this=this
		wx.request({
			url: API.GOODS_DETAIL,
			data: {
				goodId: 68 // --TEMP--
			},
			method: 'POST',
			header: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			success: function (res) {
				console.log(res);
				const {code='', data={}, message=''} = res.data
				if( code===200 ){
					return _this.setData({data})
				}
				return _this.toast.warning(message)
			},
			fail: function (res) {
				return _this.toast.error('请求失败，请刷新重试')
			}
		})
	},
	handleChooseSku: function() {
		this.setData({showsku:true})
	},
	togglePopup() {
		this.setData({
			showsku: !this.data.showsku
		});
	},
	handleZanStepperChange({detail: stepperValue}) {
		// stepper 代表操作后，应该要展示的数字，需要设置到数据对象里，才会更新页面展示
		console.log(stepperValue);
		this.setData({
			'stepperValue': stepperValue
		});
	}
})
