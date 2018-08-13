//logs.js
import API from '../../constants/apiRoot'

Page({
	data: {
		data:{},
		showsku: false, // 显示sku层
		stepperValue: 1,
		skuArr: [], // 后端返回的skuArr
		skuData: {}, // {'hh':{value:['red','yellow'],active:'red'}}
		skuSelect: {}, // 当前选中的sku组合{"color":"red","weight":"300g"}
		skuInfo: {}, // 当前选中的整条商品信息，包括价格图片库存，skuArr中的一条
		adviser: {uid:0,username:'大大'},
		// 下面的数据只是加入购物车或立即购买时使用
		userInfo: wx.getStorageSync('wt_user')?wx.getStorageSync('wt_user'):{},
		goodId:null,
		shopInfo:wx.getStorageSync('wt_shop')?wx.getStorageSync('wt_shop'):{},
	},
	onLoad: function (options) {
		this.toast=this.selectComponent("#toast")
		const {goodId=null} = options
		this.setData({goodId})
		this._onGetData(goodId)
	},
	// 生命周期-页面显示即调用，因为ready和load方法在返回路由时不调用
	onShow: function(){
		const pages=getCurrentPages()
		let currentPage=pages[pages.length-1]
		let adviser = currentPage.data.adviser
		adviser && this.setData({
			adviser:currentPage.data.adviser
		})
	},
	// 获取数据
	_onGetData: function(goodId){
		const _this=this
		wx.request({
			url: API.GOODS_DETAIL,
			data: {
				goodId: goodId || 68 // --TEMP--
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
	// 点击出来sku-popup
	handleChooseSku: function() {
		this.setData({showsku:true},()=>{
			this._onGetSkuKey()
		})
	},
	// 控制popup
	togglePopup() {
		this.setData({
			showsku: !this.data.showsku
		});
	},
	// 控制计数器
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
	},
	// 立即购买
	handleBuy: function () {
		const {skuInfo={}} = this.data
		if(!skuInfo.stock)return this.toast.warn('请先选择商品规格')
		wx.navigateTo({
			url:'/pages/buy/buy'
		})
	},
	// 加入购物车
	handleToCart: function () {
		const {data={},adviser={},userInfo={},skuInfo={},goodId,stepperValue,shopInfo}=this.data
		if(!skuInfo.stock)return this.toast.warn('请先选择商品规格')
 		const _this=this
		wx.request({
			url: API.CART_INSERT,
			data:{
				"counselorId": adviser.uid || 1,//--TEMP--
				"goodsId": goodId || 68,//--TEMP--
				"number": stepperValue,
				"shopId": shopInfo.id,
				"skuDesc": skuInfo.value,
				"skuId": skuInfo.skuId,
				"uid": userInfo.uid
			},
			method: 'POST',
			header: {
				"token":userInfo.token
			},
			success: function (res) {
				console.log(res);
				const {code='', data={}, message=''} = res.data
				if( code===200 ){
					return wx.switchTab({
						url:'/pages/cart/cart'
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
