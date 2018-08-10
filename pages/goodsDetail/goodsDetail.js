//logs.js
import API from '../../constants/apiRoot'

Page({
	data: {
		data:{},
		showsku: false, // 显示sku层
		stepperValue: 1,  
		stepperMax: 10,  
		skuArr: [], // 后端返回的skuArr
		skuData: {}, // {'hh':{value:['red','yellow'],active:'red'}}
		skuSelect: {}, // 当前选中的sku组合
		skuInfo: {}
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
				const {code='', data={}, message=''} = res.data
				if( code===200 ){
					return _this.setData({data,skuArr:data.skuArr})
				}
				return _this.toast.warning(message || '请求失败')
			},
			fail: function (res) {
				return _this.toast.error('请求失败，请刷新重试')
			}
		})
	},
	handleChooseSku: function() {
		this.setData({showsku:true},()=>{
			this._onGetSkuKey()
		})
	},
	togglePopup() {
		this.setData({
			showsku: !this.data.showsku
		});
	},
	handleZanStepperChange({detail: stepperValue}) {
		// stepper 代表操作后，应该要展示的数字，需要设置到数据对象里，才会更新页面展示
		this.setData({
			'stepperValue': stepperValue
		});
	},
	// 组织wxml需要的数据格式,设置默认的sku组合
	_onGetSkuKey: function () {
		const {skuArr,skuData,skuSelect} = this.data;
		skuArr.map((item)=>{
			let value=JSON.parse(item.value)
			for (const key in value) {
				if(!skuData[key]){ // key不存在时给默认值
					skuData[key]={value:[],active:value[key]}
					skuSelect[key]=value[key]
				}
				if(skuData[key]['value'].indexOf(value[key])==-1){
					skuData[key]['value'].push(value[key])
				}
			}
		})
		this.setData({skuData,skuSelect},()=>{
			this._onGetSkuInfo()
		})
	},
	// 点击标签切换sku属性
	handleTabLabel: function (e) {
		const {active,name} = e.currentTarget.dataset;
		const {skuArr,skuSelect,skuData} = this.data;
		// label切换
		for (const key in skuData) {
			if(key==name && skuData[key].active!=active){
				skuData[key].active=active;
				skuSelect[key]=active
			}else if(key==name && skuData[key].active===active){ //重复点击则返回
				return false
			}
		}
		this.handleZanStepperChange({detail:1}) //label切换计数器归1 
		this.setData({skuData,skuSelect},()=>{
			this._onGetSkuInfo()
		})
	},
	// 拿到当前选中的sku对应的商品信息
	_onGetSkuInfo: function () {
		const {skuArr,skuSelect,skuData} = this.data;
		let skuInfo = this.data.skuInfo
		// 赋值当前sku对应的产品
		skuInfo=skuArr.filter((item)=>{
			let value=JSON.parse(item.value)
			let flag=true
			for (const key in skuSelect) {
				if(value[key] && value[key]!=skuSelect[key]){flag=false}
			}
			if(flag) return true
		})
		if(skuInfo[0].stock && skuInfo[0].stock<=0)return this.toast.warn('库存不足')
		this.setData({skuInfo:skuInfo[0]})
	},
	// 更换顾问
	handleChangeAdviser: function(){
		wx.navigateTo({
			url: '/pages/adviser/adviser'
		})
	}
})
