(function() {
	document.addEventListener('DOMContentLoaded',async function(){
		if(location.href.includes("movie.douban.com/subject/")){
			let id = /\/subject\/(\d+)\//.exec(location.href)[1];

			if(id){

				let arr = /tt(\d{7,8})/.exec(document.body.innerText);
				
				//获取imdb
				let imdbId = arr ? /tt(\d{7,8})/.exec(document.body.innerText)[0] : "";

				if(imdbId){

					let list = await sendMessageToBackground({
						cmd:"search",
						imdbId
					});				
					
					let html = getListString(list);

					if(html){
						$(".aside").prepend(`
						<div style="padding-bottom:30px;position:relative">
							<h2>下载地址......</h2>
							<a target="_blank" style="position:absolute;top:0;right:10px" class="report-error" href="https://thepiratebay.org/search.php?q=${imdbId}&cat=201">查看所有</a>
							<ul class="bs">
								${html}
							</ul>
						</div>
					`)
					}
				}
				//获取影片信息
				let movieInfo = await  fetch(`https://m.douban.com/rexxar/api/v2/movie/${id}?ck=&for_mobile=1`).then(response => response.json());
					
				//获取评论信息
				movieInfo.comments =  await fetch(`https://m.douban.com/rexxar/api/v2/movie/${id}/interests?count=4&order_by=hot&start=0&ck=&for_mobile=1`).then(response => response.json());
				
				setTimeout(()=>{
					chrome.runtime.sendMessage({
						cmd:"update",
						movieInfo
					}, function(response) {
						if(response){
							resolve(response);
						}
					});
				},2000)
			}
		}
	});
})();


function getListString(list){

	let _list = {};
	let html ="";

	for(let item of list){
		let _name = item.name.toLocaleUpperCase();
		if(_name.includes("1080P") && !_list['1080P']){
			_list['1080P'] = item;
		}
		else if(_name.includes("BDRIP") || _name.includes("BRRIP") || _name.includes("BLUERAY")){
			if(!_list['蓝光']){
				_list['蓝光'] = item;
			}
		}
		else if(_name.includes("HDRIP") || _name.includes("720P") || _name.includes("DVDRIP")){
			if(!_list['高清']){
				_list['高清'] = item;
			}
		}
	}

	for(let type in _list){
		let item = _list[type]
		html+=`
		<li>
			<span style="display:inline-block;width:50px"><a href="${generateMagnet(item)}" title="点击下载" class="playBtn">${type}</a></span>
			<span style="display:inline-block;width:80px">种子数: ${item.seeders}</span>
			<span style="display:inline-block;width:80px">大小: ${(item.size/1024/1024/1024).toFixed(1)}GB</span>
			<span style="display:inline-block;width:50px"><a href="${generateMagnet(item)}" title="点击下载" class="playBtn">下载</a></span>
		</li>
		`
	}

	return html;
}

function generateMagnet(item){
	let url = `xt=urn:btih:${item.info_hash}&dn=${item.name}&tr=udp://tracker.coppersurfer.tk:6969/announce&tr=udp://tracker.openbittorrent.com:6969/announce&tr=udp://9.rarbg.to:2710/announce&tr=udp://9.rarbg.me:2780/announce&tr=udp://9.rarbg.to:2730/announce&tr=udp://tracker.opentrackr.org:1337&tr=http://p4p.arenabg.com:1337/announce&tr=udp://tracker.torrent.eu.org:451/announce&tr=udp://tracker.tiny-vps.com:6969/announce&tr=udp://open.stealth.si:80/announce`;

	return 'magnet:?'+encodeURIComponent(url);
}

  // 主动发送消息给后台
// 要演示此功能，请打开控制台主动执行sendMessageToBackground()
function sendMessageToBackground(imdbInfo) {
	let isSecondCheck = false;
	return new Promise((resolve,reject)=>{
		let interval = setInterval(()=>{
			chrome.runtime.sendMessage({
				...imdbInfo,
				isSecondCheck
			}, function(response) {
				if(response){
					resolve(response);
					clearInterval(interval);
				}
			});
			isSecondCheck = true;
		},1000);
	})
}