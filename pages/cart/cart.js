//logs.js
import API from '../../constants/apiRoot';

Page({
	data: {
		userInfo:wx.getStorageSync('wt_user')?wx.getStorageSync('wt_user'):{},
		disCartVos: [],
		cartVos: [],
		is_edit: false,
		is_checkedAll: false,
		showsku: false, // 显示sku选择
		stepperValue: 1,
		skuData: {}, // 数据含义同goodsDetail
		skuInfo: {},
		skuArr: [],
		selectInfo: {},//选择sku点确定按钮需要传递的数据
		userInfo: wx.getStorageSync('wt_user')?wx.getStorageSync('wt_user'):{},
	},
	onLoad: function () {
		this.toast=this.selectComponent("#toast")		
		this._onData()
	},
	_onData:function () {
		const {userInfo} = this.data;
		const {token,uid=1} = userInfo
		const _this=this
		wx.request({
			url: API.CART_LIST,
			data: {
				uid: 53 //--TEMP--
			},
			method: 'POST',
			header: {
				"Content-Type": "application/x-www-form-urlencoded",
				"token": token
			},
			success: function (res) {
				const {code='', data={}, message=''} = res.data
				if( code===200 ){
					return _this.setData({
						disCartVos: data.disCartVos,
						cartVos: data.cartVos //--TEMP--
					},()=>{
						_this._onHandleCartVos()
					})
				}
				return _this.toast.warning(message)
			},
			fail: function (res) {
				return _this.toast.error('请求失败，请刷新重试')
			}
		})
	},
	// 购物车为空时点击“去逛逛”
	_buttonEvent: function () {
		wx.switchTab({url:'/pages/home/home'})
	},
	// 给数据添加checked属性,以供复选框使用
	_onHandleCartVos: function () {
		let cartVos = this.data.cartVos
		cartVos.length && cartVos.map((itemPar)=>{
			itemPar.checked=false
			itemPar.cartVoList.map((item)=>{
				item.checked=false
			})
		})
		this.setData({cartVos})
	},
	// 编辑
	handleEdit: function () {
		this.setData({is_edit: !this.data.is_edit})
	},
	// 变更checkbox
	handleChecked: function (e) {
		let cartVos = this.data.cartVos
		const shopId=e.currentTarget.dataset.shopid
		const cartId=e.currentTarget.dataset.cartid
		const is_checkedAll=e.currentTarget.dataset.all
		if(shopId){
			for(let itemPar of cartVos){ // 选用for-of循环是为了return，提升效率
				if(itemPar.shopId == shopId){
					itemPar.checked=!itemPar.checked
					itemPar.cartVoList.map((item)=>{
						item.checked=itemPar.checked
					})
					return this.setData({cartVos})
				}
			}
		}else if(cartId){
			let theShopSelect = false // 底下所有子类选中时，父类也选中
			let theShopId = null // 父类shopId
			for(let itemPar of cartVos){
				for(let item of itemPar.cartVoList){
					if(item.cartId == cartId){
						item.checked=!item.checked
						itemPar.checked=itemPar.cartVoList.every((item)=>{
							return item.checked
						})
						return this.setData({cartVos})
					}
				}
			}
		}
	},
	// 全选按钮
	handleCheckedAll: function() {
		let cartVos = this.data.cartVos
		this.setData({is_checkedAll:!this.data.is_checkedAll},()=>{
			for(let itemPar of cartVos){
				itemPar.checked=this.data.is_checkedAll
				for(let item of itemPar.cartVoList){
					item.checked=this.data.is_checkedAll
				}
			}
			this.setData({cartVos})
		})
	},
	// 变更顾问按钮
	handleChangeAdviser: function () {
		wx.navigateTo({
			url:'/pages/adviser/adviser'
		})
	},
	// 点击选择sku按钮
	handleShowSku: function (e) {
		// console.log();
		const cartId = e.currentTarget.dataset.cartid
		const shopId = e.currentTarget.dataset.shopid
		const skuId = e.currentTarget.dataset.skuid
		const number = e.currentTarget.dataset.number
		const goodsId = e.currentTarget.dataset.goodsid
		this.setData({
			showsku:true,
			skuArr: [],
			skuData: {},
			selectInfo:{shopId,cartId,skuId,goodsId}
		},()=>{
			this._onGetSkuKey({cartId,shopId,skuId,number})
		})
	},
	// 控制popup
	togglePopup() {
		this.setData({showsku: !this.data.showsku});
	},
	// 控制计数器
	handleZanStepperChange({detail: stepperValue}) {
		// stepper 代表操作后，应该要展示的数字，需要设置到数据对象里，才会更新页面展示
		this.setData({
			'stepperValue': stepperValue
		});
	},
	// 组织wxml需要的数据格式,设置默认的sku组合
	_onGetSkuKey: function (opts) {
		const {shopId,cartId,skuId,number} = opts
		const {skuData,cartVos} = this.data;
		let skuArr=this.data.skuArr
		// const skuArr=cartVos.filter
		for(let itemPar of cartVos){
			if(itemPar.shopId==shopId){
				for(let item of itemPar.cartVoList){
					if(item.cartId==cartId){
						skuArr=item.goodsSkus
						break
					}
				}
				break
			}
		}
		skuArr.map((item)=>{
			let value=JSON.parse(item.value)
			for (const key in value) {
				if(!skuData[key]){ // key不存在时给默认值
					skuData[key]={value:[],active:value[key]}
				}
				if(skuData[key]['value'].indexOf(value[key])==-1){
					skuData[key]['value'].push(value[key])
				}
			}
		})
		this.setData({skuData,skuArr},()=>{
			this._onGetSkuInfo({skuId,number})// skuId 默认值
		})
	},
	// 拿到当前选中的sku对应的商品信息,即设置默认选中与默认数量
	_onGetSkuInfo: function (opts) {
		const {skuId,number} = opts
		/**
		 * 设置默认数量
		 */
		this.handleZanStepperChange({detail:number})

		const {skuArr,skuData} = this.data
		let skuSelect={}
		for (const item of skuArr) {
			if(item.skuId==skuId){
				skuSelect=item.value
				break
			}	
		}
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
	// 点击标签切换sku属性
	handleTabLabel: function (e) {
		const {active,name} = e.currentTarget.dataset;
		const {skuArr,skuData} = this.data;
		// label切换
		for (const key in skuData) {
			if(key==name && skuData[key].active!=active){
				skuData[key].active=active;
			}else if(key==name && skuData[key].active===active){ //重复点击则返回
				return false
			}
		}
		this.handleZanStepperChange({detail:1}) //label切换计数器归1 
		this.setData({skuData},()=>{
			this._onGetSkuInfo()
		})
	},
	handleSureSku: function () {
		const _this = this
		const {stepperValue,selectInfo,userInfo}=this.data
		const {shopId,cartId,skuId,goodsId} = selectInfo
		wx.request({
			url: API.CART_UPDATE,
			data: {
				carts: [{
					shopId,
					cartId,
					skuId,
					number:stepperValue,
					goodsId,
					counselorId:8,
					uid: userInfo.uid,
					skuDesc: "就离开第三方-sad解放路 啊多少发-撒打飞机了看",
				}]
			},
			method: 'POST',
			header: {
				"token":userInfo.token
			},
			success: function (res) {
				const {code='', data={}, message=''} = res.data
				if( code===200 ){
					return 
				}
				return _this.toast.warning(message)
			},
			fail: function (res) {
				return _this.toast.error('请求失败，请刷新重试')
			}
		})
	}
})
