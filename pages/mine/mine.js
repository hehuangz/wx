//mine.js
import Debounce from '../../utils/debounce.js';
import {IMG_OSS_MINEBG} from '../../constants/constants'
import API from '../../constants/apiRoot'

Page({
	data: {
		IMG_OSS_MINEBG,
		userInfo: wx.getStorageSync('wx_user')?wx.getStorageSync('wx_user'):{},
		tel: '0571-87179826',//客服电话
	},
	onLoad: function () {
		this.toast=this.selectComponent("#toast")
		this.dialog = this.selectComponent("#dialog");
		let {userInfo={}} = this.data
		if(wx.getStorageSync('wt_user') || wx.getStorageSync('wx_user')){
			userInfo=wx.getStorageSync('wt_user')?wx.getStorageSync('wt_user'):wx.getStorageSync('wx_user')
		}else {
			userInfo={}
		}
		this.setData({userInfo})
		wx.getSetting({//先获取用户当前的设置
			success(res) {
				if (!res.authSetting['scope.address']) {
					wx.authorize({
						scope: 'scope.address',
						success(res) {
							console.log(res.errMsg);//用户授权后执行方法
						},
						fail(res){//用户拒绝授权后执行
						}
					})
				}
			}
		})
	},
	onShow: function(){
		const {userInfo} = this.data
		if(wx.getStorageSync('wt_user')!=userInfo){
			this.setData({userInfo:wx.getStorageSync('wt_user') || wx.getStorageSync('wx_user') || {}})
		}
	},
	handleCall: function () {
		wx.makePhoneCall({
			phoneNumber: this.data.tel
		})		  
	},
	handleAddress: function () {
		// 拒绝后的方式,打开设置
		const _this = this;
		wx.getSetting({
			success(res) {
				if (!res.authSetting['scope.address']) {
					wx.openSetting({})
				}else{
					//打开选择地址
					wx.chooseAddress({
						success: function (res) {}
					})
					return
				}
			},
			fail(res){
				console.log('调用失败')
			}
		})	
	},
	handleDownload: function () {
		wx.navigateTo({
			url: '/pages/download/download'
		})
	},
	handleDialog: function () {
		this.dialog.showDialog();
	},
	handleWxTel: function (e) {
		const {userInfo} = this.data
		const shopInfo = wx.getStorageSync('wt_shop')?wx.getStorageSync('wt_shop'):{}
		const _this=this
		if(e.detail.errMsg!="getPhoneNumber:ok"){
			return
		}
		wx.login({
			success: function(wxres){
				wx.request({
					url: API.MINE_WXTEL,// ADVISER_SHOP_LIST
					data: {
						iv: e.detail.iv,
						encryptedData: e.detail.encryptedData,
						jscode: wxres.code,
						img: userInfo.avatarUrl || null,
						nickname: userInfo.nickName || null,
						sid: shopInfo.id
					},
					method: 'POST',
					header: {
						"Content-Type": "application/x-www-form-urlencoded"
					},
					success: function (res) {
						const {code='', data={}, message=""} = res.data
						if( code===200 && data){
							return  _this.setData({
								userInfo: data
							},()=>{
								data.wxuid && wx.setStorage({
									key:'wt_counselor',
									data:{uid:data.wxuid,name:data.wxname}
								})
								wx.setStorage({
									key: "wt_user",
									data,
									success:function () {
										_this.toast.success("绑定成功")
									}
								})
							})
							
						}
						return _this.toast.warning('绑定失败，请重新绑定')
					},
					fail: function (res) {
						return _this.toast.error('请求失败，请刷新重试')
					}
				})
			}
		})
	},
	handleToLogin: function () {
		wx.navigateTo({
			url: '/pages/login/login'
		})
	},
	//dialog取消事件
	_cancelEvent(){
		this.handleToLogin()
	},
	//dialog确认事件
	_confirmEvent(){
	},
	handleLogout: function () {
		const _this = this
		wx.showModal({
			title: '提示',
			content: '确定注销登录吗',
			success: function(res) {
				if (res.confirm) {
					wx.removeStorageSync("wt_user")
					// wx.removeStorageSync("wt_shop")
					// wx.removeStorageSync("wt_toBuy")
					// wx.removeStorageSync("wt_counselor")
					_this.onLoad()
					_this.toast.info('注销登录成功')
				} else if (res.cancel) {
					console.log('用户点击取消')
				}
			}			
		})
	},
	handleAboutUs: function () {
		wx.navigateTo({
			url: '/pages/aboutus/aboutus'
		})
	},
	handlePreviewImg: function (e) {
		const img=e.currentTarget.dataset.img
		wx.previewImage({
			current: img, // 当前显示图片的http链接
			urls: [img] // 需要预览的图片http链接列表
		  })
	}
})
