//logs.js
import API from '../../constants/apiRoot';
import Debounce from '../../utils/debounce.js';

Page({
	data: {
		userInfo: wx.getStorageSync('wt_user')?wx.getStorageSync('wt_user'):{},
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
		total: 0, // 左上角数字：购物车共有多少件有效商品
		settlementTotal: 0, //右下角结算数字：选中多少商品去结算
		totalPrice: 0,
		tolalMarketPrice: 0,
		adviser_shopId: null // 重改店铺顾问时的店铺ID
	},
	onLoad: function () {
		this.toast=this.selectComponent("#toast")	
		this.dialog = this.selectComponent("#dialog")
		let {userInfo} = this.data
		this.setData({
			userInfo: wx.getStorageSync('wt_user')?wx.getStorageSync('wt_user'):{}
		},()=>{
			userInfo.token && this._onGetData()
		})
	},
	// 生命周期-页面显示即调用，因为ready和load方法在返回路由时不调用
	onShow: function(){
		let {userInfo} = this.data
		this.setData({
			userInfo: wx.getStorageSync('wt_user')?wx.getStorageSync('wt_user'):{}
		},()=>{
			userInfo.token && this._onGetData()
		})
		const pages=getCurrentPages()
		let currentPage=pages[pages.length-1]
		let adviser = currentPage.data.adviser
		adviser && this._onSetAdviser(adviser)
	},
	onReady: function () {
		console.log('onReady');
	},
	_onGetData:function () {
		const {userInfo} = this.data;
		const {token,uid=1} = userInfo
		const _this=this
		wx.request({
			url: API.CART_LIST,
			data: {
				uid: userInfo.uid
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
						cartVos: data.cartVos,
						is_checkedAll: false //避免页面切换，重新获取数据后，子checkbox未选中，全选却选中的尴尬
					},()=>{
						_this._onHandleCartVos()
						_this._onGetTotal()
					})
				}
				return _this.toast.warning(message)
			},
			fail: function (res) {
				return _this.toast.error('请求失败，请刷新重试')
			}
		})
	},
	// 计算商品共有多少件
	_onGetTotal: function() {
		const {cartVos} = this.data
		let {total} = this.data
		cartVos.map((itemPar)=>{
			itemPar.cartVoList.map(()=>{
				total++
			})
		})
		this.setData({total})
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
	/**
	 * 建议优化，将单个checkbox变更与全选何在一起，可以避免很多问题 //--TEMP--
	 */
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
					return this.setData({cartVos},()=>{
						this._onGetSettlement()
						this._onGetTotalPrice()
					})
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
						return this.setData({cartVos},()=>{
							this._onGetSettlement()
							this._onGetTotalPrice()
						})
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
			this.setData({cartVos},()=>{
				this._onGetSettlement()
				this._onGetTotalPrice()
			})
		})
	},
	// 变更顾问按钮
	handleChangeAdviser: function (e) {
		const shopId = e.currentTarget.dataset.shopid
		const cid = e.currentTarget.dataset.cid // 顾问id
		this.setData({
			adviser_shopId:shopId
		},()=>{
			wx.navigateTo({
				url:`/pages/adviser/adviser?shopId=${shopId}&cid=${cid}`
			})
		})
	},
	// 选择顾问后重新发送更改请求
	_onSetAdviser: function (adviser) {
		const {adviser_shopId,userInfo} = this.data
		const _this = this
		wx.request({
			url: API.CART_CHANGE_ADVISER,
			data: {
				shopId: adviser_shopId,
				counselorId: adviser.uid
			},
			method: 'POST',
			header: {
				"Content-Type": "application/x-www-form-urlencoded",
				"token": userInfo.token
			},
			success: function (res) {
				const {code='', data={}, message=''} = res.data
				if( code===200 ){
					return _this.toast.warning('变更顾问成功',2,()=>{
						_this._onGetData()
					})
				}
				return _this.toast.warning(message)
			},
			fail: function (res) {
				return _this.toast.error('请求失败，请刷新重试')
			}
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
			showsku: true,
			skuArr: [],
			skuData: {},
			selectInfo:{shopId,cartId,goodsId}
		},()=>{
			this._onGetSkuKey({cartId,shopId,skuId,number})
		})
	},
	// 控制popup
	togglePopup: function () {
		this.setData({showsku: !this.data.showsku});
	},
	// 控制计数器
	handleZanStepperChange: function ({detail: stepperValue}) {
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
		// // 拿到当前默认选中的值
		for (const item of skuArr) {
			if(item.skuId==skuId){
				let value=JSON.parse(item.value)
				for (const key in value) {
					skuData[key]={value:[],active:value[key]}
				}
				break;
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
			this._onGetSkuInfo({init:true,number,skuId})// skuId 默认值
		})
	},
	// 拿到当前选中的sku对应的商品信息,即设置默认选中与默认数量
	_onGetSkuInfo: function (opts) {
		let {skuInfo} = this.data
		const {skuArr,skuData} = this.data
		const {skuId,number} = opts

		if(opts.init){
			/**
			 * 设置默认数量
			 */
			this.handleZanStepperChange({detail:number})
			// 默认选中现有的值
			
		}
		let skuSelect={}
		// console.log(skuData);
		for (const key in skuData) {
			skuSelect[key]=skuData[key].active
		}
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
			this._onGetSkuInfo({init:false})
		})
	},
	// 点sku中确定编辑购物车
	handleSureSku: function () {
		const _this = this
		const {stepperValue,selectInfo,userInfo,skuData,skuInfo} = this.data
		const {shopId,cartId,goodsId} = selectInfo
		/**
		 * 组织skuDesc
		 */
		let skuDesc=''
		for (const key in skuData) {
			skuDesc+=skuData[key].active+' '
		}
		/**
		 * 发送请求成功后重新获取数据
		 */
		Debounce(()=>{
			wx.request({
				url: API.CART_UPDATE,
				data: [{
					shopId,
					cartId,
					skuId: skuInfo.skuId,
					number: stepperValue,
					goodsId,
					counselorId: 8,//--TEMP--
					uid: userInfo.uid,
					skuDesc
				}],
				method: 'POST',
				header: {
					"token":userInfo.token
				},
				success: function (res) {
					const {code='', data={}, message=''} = res.data
					if( code===200 ){
						return _this.setData({showsku:false,is_checkedAll:false},()=>{
							_this._onGetData()
						})
					}
					return _this.toast.warning(message)
				},
				fail: function (res) {
					return _this.toast.error('请求失败，请刷新重试')
				}
			})
		})
	},
	// 结算旁边的数字：当前选中结算大数量
	_onGetSettlement: function () {
		const {cartVos} = this.data
		let {settlementTotal} = this.data
		settlementTotal=0
		cartVos.map((itemPar)=>{
			itemPar.cartVoList.map((item)=>{
				if(item.checked)settlementTotal++;
			})
		})
		this.setData({settlementTotal})
	},
	// 显示总计价格
	_onGetTotalPrice: function () {
		let {cartVos} = this.data
		let price=0
		let marketPrice=0
		cartVos.map((itemPar)=>{
			itemPar.cartVoList.map((item)=>{
				if(item.checked){
					price=price+Number(item.goodsPrice)*Number(item.number)
					marketPrice=marketPrice+Number(item.goodsMarketprice)*Number(item.number)
				}
			})
		})
		this.setData({
			totalPrice:price.toFixed(2),
			tolalMarketPrice:marketPrice.toFixed(2)
		})
	},
	// 删除购物车商品
	handleDel: function () {
		Debounce(()=>{
			this.dialog.showDialog();
		})
	},
	// 	去结算按钮
	handleSettlement: function () {
		const {cartVos=[],userInfo={},settlementTotal,totalPrice,tolalMarketPrice} = this.data
		if(!settlementTotal)return;
		// 组装ordersGoods,// 组装showArr
		let ordersGoods=[]
		let showArr=[]
		cartVos.map((itemPar)=>{
			let showSonList=[]
			itemPar.cartVoList.map((item)=>{
				if(item.checked){
					showSonList.push(item)
					let obj={
						counselorId: item.counselorId,
						goodsId: item.goodsId,
						number: item.number,
						shopAddress: itemPar.shopAddress,
						shopId:  item.shopId,
						skuDesc: item.skuDesc,
						skuId: item.skuId
					}
					ordersGoods.push(obj)
				}
			})
			if(showSonList.length){
				showArr.push(itemPar)
				for (let itemShow of showArr){
					if(itemShow.cartVoList[0].shopId==showSonList[0].shopId){
						itemShow.cartVoList=showSonList
						break
					}
				}
			}
		})
		let toBuyData={
			type: 2, //1:直接购买 2:购物车到购买
			ordersGoods,
			show: {},
			showArr, // 整个购物车，没有过滤
			priceTotal: totalPrice,
			marketPriceTotal: tolalMarketPrice,
		}
		wx.setStorage({
			key: "wt_toBuy",
			data: toBuyData,
			success:function () {
				wx.navigateTo({
					url:'/pages/buy/buy'
				})
			}
		})
	},
	// 删除购物车时的取消事件
	_cancelEvent(){
		_this.dialog.hideDialog();
	},
	// 删除购物车时的确认事件
	_confirmEvent(){
		const {cartVos,userInfo} = this.data
		let param=[]
		cartVos.map((itemPar)=>{
			itemPar.cartVoList.map((item)=>{
				if(item.checked){
					param.push(item.cartId)
				}
			})
		})
		const _this = this
		wx.request({
			url: API.CART_DEL,
			data: param,
			method: 'POST',
			header: {
				"token": userInfo.token
			},
			success: function (res) {
				const {code='', data={}, message=''} = res.data
				if( code===200 ){
					return _this.toast.success(message,2,()=>{
						_this._onGetData()
						_this.dialog.hideDialog();
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
