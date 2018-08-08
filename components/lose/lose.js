/**
 * toast弹窗
 * @param  {String} icon icon
 * @param  {String} title title
 * @param  {Boolean} buttonText  按钮，传入按钮即展示并显示文案，否则不展示
 *  */
Component({
    properties: {
        buttonText: {
            type: String,
            value: ''
        },
        icon: {
            type: String,
            value: 'icon-shouji'
        },
        title:{
            type: String,
            value: '当前网络不稳定，请刷新重试'
        }
    },
    data:{
        
    },
    methods:{
        _buttonEvent(){
            //触发立即刷新按钮
            this.triggerEvent("buttonEvent")
        },
    }
})