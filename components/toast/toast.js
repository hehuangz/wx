/**
 * toast弹窗
 * @param  {String} msg 弹出的内容
 * @param  {"Number"} time  延时多少秒
 * @param  {Function} callback 回调
 * @example  this.toast.info("点击成功",1,()=>{})
 *  */
Component({
    properties: {
        msg: {
            type: String,
            value: '弹出的默认内容'
        }
    },
    data:{
        show: false,
        showIcon: false,
        iconType: 'success'
    },
    methods:{
        // 显示内容
        info: function (msg="", time=2, callback) {
            this._eventCheck(msg,time,callback)
            this.setData({
                show:true,
                showIcon: false,
                msg
            },()=>{
                this._eventTimeOut(time,callback)
            })
        },
        success: function (msg="", time=2, callback) {
            this._eventCheck(msg,time,callback)
            this.setData({
                show: true,
                msg,
                iconType: 'icon-correct',
                showIcon: true
            },()=>{
                this._eventTimeOut(time,callback)
            })
        },
        warning: function (msg="", time=2, callback) {
            this._eventCheck(msg,time,callback)
            this.setData({
                show: true,
                msg,
                iconType: 'icon-abnormal',
                showIcon: true
            },()=>{
                this._eventTimeOut(time,callback)
            })
        },
        // 同上
        warn: function (msg="", time=2, callback) {
            this._eventCheck(msg,time,callback)
            this.setData({
                show: true,
                msg,
                iconType: 'icon-abnormal',
                showIcon: true
            },()=>{
                this._eventTimeOut(time,callback)
            })
        },
        error: function (msg="", time=2, callback) {
            this._eventCheck(msg,time,callback)
            this.setData({
                show: true,
                msg,
                iconType:  'icon-error',
                showIcon: true
            },()=>{
                this._eventTimeOut(time,callback)
            })
        },
        // 关闭内容
        closeToast: function () {
            this.setData({show:false})
        },
        _eventTimeOut: function (time,callback) {
            callback && callback()
            setTimeout(() => {
                this.setData({show:false})
            }, time*1000);
        },
        _eventCheck: function (msg,time,callback) {
            if((typeof msg !== "string") || (typeof time !== "number")){
                return console.error('请检查toast传入的数据类型')
            }
        }
    }
})