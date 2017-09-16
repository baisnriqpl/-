//index.js
//获取应用实例
var app = getApp();
var QQMapWX = require('../libs/qqmap-wx-jssdk.js');
var qqmapsdk;
var latitude;
var longitude; 
var showList = false;
var leftLine = true;
var centerLine, rightLine;
var orderby = false;
var that;
var scrollHeight;

Page({
    data:{
      distanceAnimation:{},
      salesAnimation:{},
      praiseAnimation:{},
      distanceOpacity:'',
      salesOpacity:'opacity:0',
      praiseOpacity:'opacity:0',
      scrollTop:100,
      toView: 'red',
    
    },
  onLoad: function () {
    that = this;
    wx.request({
      url: 'https://mall.helinju.cn/index.php?app=app_miniapps&act=banner',
      method:'post',
      success:function(res) {
        if (res.statusCode == 200) {
          var icons = [];
          var icon = res.data.data[0].icon;
          icon.forEach(function(val, key) {
              icons[val.sort] = val;
          });

          var lists = [];
          var list = res.data.data[0].list;

          list.forEach(function(val) {
            lists[val.place] = val;
          });

          scrollHeight = 54 * (res.data.data[0].health.roll.length);
 
          that.setData({
            movies:res.data.data[0].banner,
            icons:icons,
            health:res.data.data[0].health,
            expand:res.data.data[0].expand,
            lists:lists,
            scrollHeight: scrollHeight
          });
        }
      }
    });

    wx.request({
      url: 'https://mall.helinju.cn/index.php?app=app_miniapps&act=sword',
      method:'post',
      success:function(res) {
        if (res.statusCode == 200) {
           that.setData({
             selection:res.data.data,
           })
        }
      }
    });

    wx.getLocation({
      success:function(res) {
        latitude = res.latitude;
        longitude = res.longitude;

        qqmapsdk = new QQMapWX({
          key: 'KYFBZ-N5BKP-IULDE-LBEZS-HHERE-FCBSG'
        });

        var address = '';
        qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: function (res) {
            address = res.result.address;
          }
        });

        wx.request({
          url:'https://mall.helinju.cn/index.php?app=app_miniapps&act=location',
          data: { location_lat: res.latitude, location_lon: res.longitude },
          method:'post',
          success:function(res) {
            if (res.statusCode == 200) {
              var markers = [];
              res.data.data.forEach(function(val,key) {
                markers.push({
                  iconPath:"../imgs/marker.jpg",
                  id:key,
                  latitude:val.location_lat,
                  longitude:val.location_lon,
                  width: '35rpx',
                  height: '45rpx'
                })
              });
              that.setData({
                address:address,
                markers:markers,
                latitude: latitude,
                longitude: longitude
              })
            }
          }
        })
      }
    });
  },
  onReady: function (e) {
    // 使用 wx.createMapContext 获取 map 上下文
    this.mapCtx = wx.createMapContext('myMap');
    wx.playBackgroundAudio({
      dataUrl: 'https://mall.helinju.cn/data/files/music/sixiangqu.mp3',
      title: '',
      coverImgUrl: ''
    })
    var satop;
    setInterval(function(e) {
      satop = that.data.scrollTop - 1;
      if (-satop >= scrollHeight - 50) {
        satop = 100;
      }
      that.setData({
        scrollTop: satop
      })
    },100)
  },
  getCenterLocation: function () {
    this.mapCtx.getCenterLocation({
      success: function (res) {
        console.log(res.longitude)
        console.log(res.latitude)
      }
    })
  },
  moveToLocation: function () {
    this.mapCtx.moveToLocation()
  },
  translateMarker: function () {
    this.mapCtx.translateMarker({
      markerId: 0,
      autoRotate: true,
      duration: 1000,
      destination: {
        latitude: latitude,
        longitude: longitude ,
      },
      animationEnd() {
        console.log('animation end')
      }
    })
  },
  includePoints: function () {
    this.mapCtx.includePoints({
      padding: [10],
      points: [{
        latitude: latitude,
        longitude: longitude,
      }, {
          latitude: latitude,
          longitude: longitude,
      }]
    })
  },
  showMap:function() {
    showList = !showList;
    if (showList) {
      this.getStoreList(latitude, longitude, 'distance', 'asc', 1,function(res) {
          if (res.statusCode == 200) {
            var list = res.data.data[0].list;
            that.setData({
              storeList: list
            })
          }
      });
    }
    this.setData({
      showList:showList
    })
  },
  distance:function() {
    if (!leftLine) {
      console.log('now;distance');
      leftLine = !leftLine;
      centerLine = rightLine = false;

      this.getStoreList(latitude, longitude, 'distance', 'asc', 1, function (res) {
        if (res.statusCode == 200) {
          var list = res.data.data[0].list;
          that.setData({
            storeList: list,
            distanceOpacity: 'opacity:1',
            salesOpacity: 'opacity:0',
            praiseOpacity: 'opacity:0',
          })
        }
      });
    }
  },
  sales:function() {
    var that = this;
    if (!centerLine) {
      console.log('now:sales');
      centerLine = !centerLine;
      leftLine = rightLine = false;

      this.getStoreList(latitude, longitude, 'sales_num', 'desc', 1, function (res) {
        if (res.statusCode == 200) {
          var list = res.data.data[0].list;
          that.setData({
            storeList: list,
            distanceOpacity: 'opacity:0',
            salesOpacity: 'opacity:1',
            praiseOpacity: 'opacity:0',
          })
        }
      });
    }
  },
  praise:function() {
    console.log('catch');
    that = this;
    if (!rightLine) {
      console.log('now:praise');
      rightLine = !rightLine;
      leftLine = centerLine = false;

      this.getStoreList(latitude, longitude, 'praise_rate', 'desc', 1, function (res) {
        if (res.statusCode == 200) {
          var list = res.data.data[0].list;
          that.setData({
            storeList: list,
            distanceOpacity: 'opacity:0',
            salesOpacity: 'opacity:0',
            praiseOpacity: 'opacity:1',
          })
        }
      });
    }
  },
  getStoreList:function(lat, lon, sortField, sortType, pageNum, callBack) {
    this.vibrate();
    wx.request({
      url: 'https://mall.helinju.cn/index.php?app=app_miniapps&act=getlist',
      data: { location_lat: lat, location_lon: lon, sort_field: sortField, sort_type: sortType, page_num: pageNum, page_limit:5 },
      method: 'post',
      success: function (res) {
        callBack(res);
      }
    })
  },
  callMe:function(event) {
    wx:wx.makePhoneCall({
      phoneNumber: event.target.dataset.phone,
      success:function() {
        wx.vibrateLong();
      }
    })
  },
  vibrate:function() {
    wx.vibrateShort();
  }

}) 
