window.onload = function() {
	~ function() {
		function $(obj) {
			return document.getElementById(obj);
		}
		var myPlayer = $("myPlayer");
		var index = 0; //记录当前播放到第几首了
		var data = null;
		//通用的事件绑定方法
		var EventUtil = {
			addHandler: function(el, type, handler) {
				if(el.addEventListener) {
					el.addEventListener(type, handler, false);
				} else if(el.attachEvent) {
					el.attachEvent('on' + type, handler);
				} else {
					el['on' + type] = handler;
				}
			},
			removeHandler: function(el, type, handler) {
				if(el.removeEventListener) {
					el.removeEventListener(type, handler);
				} else if(el.detachEvent) {
					el.detachEvent(type, handler);
				} else {
					el['on' + type] = null;
				}
			},
			getEvent: function(event) {
				return event ? event : window.event;
			},
			getTarget: function(event) {
				return event.target || event.srcElement;
			}
		}

		//时间转换
		var totalTime = document.querySelector(".totalTime"); //获取当前音频的总时长
		function changeTime(cur) {
			if(cur === totalTime) {
				min = Math.floor(myPlayer.duration / 60);
				sec = Math.floor(myPlayer.duration % 60);
			} else {
				min = Math.floor(myPlayer.currentTime / 60);
				sec = Math.floor(myPlayer.currentTime % 60);
			}
			min = min < 10 ? ("0" + min) : min;
			sec = sec < 10 ? ("0" + sec) : sec;
		}

		//控制时间
		function controlTime() {
			var curTime = document.querySelector(".curTime"); //获取当前已经播放的时间		
			changeTime(totalTime);
			totalTime.innerHTML = min + ":" + sec;
			window.setInterval(function() {
				changeTime(curTime);
				curTime.innerHTML = min + ":" + sec;
			}, 1);

		};
		/*controlTime();*/
        var imgWraper = document.querySelector(".img_wraper");
        var like_wrap = document.querySelector(".like");
		//控制播放或暂停
		EventUtil.addHandler($("playOrpause"), "click", function() {	
			if(myPlayer.paused) {
				myPlayer.play();
				this.className = "iconfont icon-bofangqi_zanting";
				utils.addClass(imgWraper, "img_rotate");
				utils.addClass(like_wrap, "heart_beat");
				return;
			}
			myPlayer.pause();
			utils.removeClass(imgWraper, "img_rotate");
			utils.removeClass(like_wrap, "heart_beat");
			this.className = "iconfont icon-bofangqi_bofang";

		});

		//控制喜欢按钮	
		EventUtil.addHandler($("like"), "click", function() {
			if(utils.hasClass(this, "like_active")) {
				utils.removeClass(this, "like_active");
			} else {
				utils.addClass(this, "like_active");
			}
		});

		//ajax 获取数据
		function bindData() {
			var val = null;
			
			var xhr = new XMLHttpRequest;
			//false表示同步请求（如果数据没有请求回来将不进行下面的操作）
			xhr.open("get", "data/music.txt?_=" + Math.random(), false);
			//监听ajax请求的状态
			xhr.onreadystatechange = function() {
				if(xhr.readyState === 4 && (xhr.status >= 200 && xhr.status <= 300)) {
					val = xhr.responseText; //ajax请求回来的是json格式的字符串
					data = JSON.parse(val); //需要将json格式的字符串转化为json格式的对象
					//console.log(data);
				}
			};
			xhr.send(null);
		}

		//下一首歌
		function nextMusic() {
			index++;
			index = index === data.length ? 0 : index;
			musicControl();

		}

		var nextBtn = document.getElementById("next");
		EventUtil.addHandler(nextBtn, "click", function() {
			nextMusic();
		});

		//数据绑定

		function musicControl() {
			var musicName = document.querySelector(".music_name");
			var singerName = document.querySelector(".music_singer");
			var musicImg = document.querySelector(".music_img");
			var singer_name = null;
			var img_src = null;
			var music_src = null;
			var music_name = null;
			for(var i = 0, len = data.length; i < len; i++) {
				//绑定数据
				var cur = data[i];
				if(index === i) {
					cur = data[index];
					music_src = cur["src"];
					music_name = cur["music_name"];
					singer_name = cur["singer_name"];
					img_src = cur["img_src"];
				}

			}
			utils.addClass(imgWraper, "img_rotate");
			utils.addClass(like_wrap, "heart_beat");
			$("playOrpause").className = "iconfont icon-bofangqi_zanting";
			controlTime();
			myPlayer.src = music_src;
			musicName.innerText = music_name;
			singerName.innerText = singer_name;
			musicImg.src = img_src;
			if(myPlayer.ended) {
				index++;
				index = index === data.length ? 0 : index;
			}

			progress_inner.style.width = 0;
			//播放结束自动进行下一首
			if(myPlayer.ended) {
				nextMusic();
			}

		}

		//控制进度条面板
		var timer = null;
		var progress_inner = document.querySelector(".pannel_inner");
		function controlProgress() {
			var pro_persent = myPlayer.currentTime / myPlayer.duration;
			progress_inner.style.width = pro_persent * progress_inner.parentNode.offsetWidth + "px";
			EventUtil.addHandler(progress_inner.parentNode, "click", function(e) {
				clearInterval(timer);
				e = e || window.event;
				var disX = e.clientX - this.offsetLeft;
				pro_persent = disX / this.offsetWidth;
				progress_inner.style.width = pro_persent * this.offsetWidth + "px";
				myPlayer.currentTime = parseInt(pro_persent * myPlayer.duration);
			});

		}
		timer = window.setInterval(function() {
			controlProgress();
		}, 1000);

		//删除音乐 
		var deleteBtn = document.querySelector(".delete");
		EventUtil.addHandler(deleteBtn, "click", function() {
			data.splice(index, 1);
			nextMusic();
			if(data.length === 0) {
				alert("抱歉，此时已没有可以删除的歌曲~");
			}
		});

		//控制音量
		var voice_inner = document.querySelector(".voice_inner");
		EventUtil.addHandler(voice_inner.parentNode, "click", function(e) {
			e = e || window.event;
			var disY = parseInt(this.offsetHeight - (e.clientY - utils.offset(this).top));
			voice_persent = disY / this.parentNode.offsetHeight;
			voice_inner.style.height = voice_persent * this.offsetHeight + "px"; //问题解决：旋转180度
			myPlayer.volume = voice_persent;
		});

		function init() {
			bindData();
			musicControl();
		}
		init();

	}();
};