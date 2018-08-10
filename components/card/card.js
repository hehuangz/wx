/**
 * card卡片
 * @param  {String} img 头像
 * @param  {String} name 名字
 * @param  {String} sex  性别
 * @param  {String} status  状态
 * @param  {String} explain 个人说明
 * @param  {function} cardEvent 在整个卡片身上绑定事件
 *  */
Component({
    properties: {
        classes: {
            type: String,
            value: ''
        },
        styles: {
            type: String,
            value: ''
        },
        img: {
            type: String,
            value: ''
        },
        name:{
            type: String,
            value: ''
        },
        sex: {
            type: String,
            value: ''
        },
        status:{
            type: String,
            value: ''
        },
        explain: {
            type: String,
            value: ''
        }
    },
    data:{
        
    },
    methods:{
        _cardEvent(){
            this.triggerEvent("cardEvent")
        }
    }
})