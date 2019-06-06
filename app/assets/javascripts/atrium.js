!function(t){function e(n){if(i[n])return i[n].exports;var o=i[n]={exports:{},id:n,loaded:!1};return t[n].call(o.exports,o,o.exports,e),o.loaded=!0,o.exports}var i={};return e.m=t,e.c=i,e.p="",e(0)}([function(t,e){"use strict";(function(){var t=function(t){var e=this,i=/^https?:\/\/[^\/]+/i,n=t.url&&t.url.match(i)?t.url.match(i)[0]:null;this.options=t||{},this.options.isMobileWebView=t.isMobileWebView||!1,this.options.config=t.config||null,this.options.targetOrigin=t.targetOrigin||n||"https://widgets.moneydesktop.com",this.configInitialized=!1;var o=function(){};this.options.eventsLookUp={"mxConnect:memberAdded":{callback:"function"==typeof t.onSuccess?t.onSuccess:o,mobileUrl:"atrium://memberAdded"},"mxConnect:widgetLoaded":{callback:"function"==typeof t.onLoad?t.onLoad:o,mobileUrl:"atrium://mxConnectLoaded"},"config:initialized":{callback:function(){e.configInitialized=!0}}},window.addEventListener("message",this._onPostMessage.bind(this))};t.prototype.load=function(){var t=this,e=this.options.url,i=this.options.width||"100%",n=this.options.height||"600",o=document.createElement("iframe"),r=document.getElementById(this.options.id);o.setAttribute("width",i),o.setAttribute("height",n),o.setAttribute("border","0"),o.setAttribute("frame","0"),o.setAttribute("frameborder","0"),o.setAttribute("allowTransparency","true"),o.setAttribute("src",e),o.setAttribute("marginheight","0"),o.setAttribute("marginwidth","0"),r.innerHTML="",
  r.appendChild(o),
  this.iframeDetails={iframe:o,targetElement:r},
  this.options.config&&(
    this.configInterval=setInterval(function(){t.configInitialized?clearInterval(t.configInterval):t._setClientConfig(t.options.config)},100),
    setTimeout(function(){clearInterval(t.configInterval)},5e3))},
    t.prototype._onPostMessage=function(t){
      var e={};
      if(t.source===this.iframeDetails.iframe.contentWindow){
        try{e=JSON.parse(t.data)
      }catch(t){
        console.warn("Error processing event",t)
      }
      e.type&&this._handleEvent(e)}
    },
    t.prototype._handleEvent=function(t){
      var e=this.options.eventsLookUp[t.type];
      e&&(this.options.isMobileWebView&&e.mobileUrl?window.location=e.mobileUrl:e.callback(t.payload))
    },
    t.prototype._setClientConfig=function(t){
      t.hasOwnProperty("currentInstitutionCode")&&(
        t.current_institution_code=t.currentInstitutionCode,
        console.warn("currentInstitutionCode will be deprecated in the future, please update to current_institution_code.")),
      t.hasOwnProperty("currentMemberGuid")&&(t.current_member_guid=t.currentMemberGuid,console.warn("currentMemberGuid will be deprecated in the future, please update to current_member_guid.")),
      this._postMessageToMX({type:"clientConfig",data:{connect:t}})
    },
    t.prototype._postMessageToMX=function(t){
      this.iframeDetails.iframe.contentWindow.postMessage(JSON.stringify(t),this.options.targetOrigin)
    },
    window.MXConnect=t
  }).call(void 0)}]);