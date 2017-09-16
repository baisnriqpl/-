var app = getApp()
Page({
  data:{

  },
  onLoad:function() {
    var that = this;
    var time = 5;
    var timer = setInterval(function() {
      that.setData({
        time:time + 'S'
      });
      time --;
      if (time < 0) {
        that.toPage();
        clearInterval(timer);
      }
    },1000)
    
  },
 toPage:function(){
    wx.redirectTo({
        url:'/pages/index/index'
    })
  }
  
}) 