/**
 * lose弹窗
 * @param  {String} msg 弹出的内容
 * @param  {"Number"} time  延时多少秒
 * @param  {Function} callback 回调
 * @example  this.lose.info("点击成功",1,()=>{})
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
                iconType: 'success',
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
                iconType: 'warn',
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
                iconType:  'cancle',
                showIcon: true
            },()=>{
                this._eventTimeOut(time,callback)
            })
        },
        // 关闭内容
        closelose: function () {
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
                return console.error('请检查lose传入的数据类型')
            }
        }
    }
})