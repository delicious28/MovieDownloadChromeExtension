let res = null;
let isLoading = false;

// 监听来自content-script的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{

	if(!request.isSecondCheck){
		res = null;
	}
	
	if(!res && !isLoading){
		imdbid = request.imdbId;
		res = null;
		if(request.cmd=="search"){
			isLoading = true;
			$.get(`https://apibay.org/q.php?q=${request.imdbId}&cat=201`,data=>{
				isLoading = false;
				res = data
			})
		}
		else if(request.cmd == "update"){
			postData("http://mmhh.i234.me:3003/updateMovie",request.movieInfo);
		}
	}
	else
	{
		sendResponse(res);
	}
});

async function postData(url = '', data = {}) {
	// Default options are marked with *
	const response = await fetch(url, {
	  method: 'POST', // *GET, POST, PUT, DELETE, etc.
	  mode: 'cors',
	  headers: {
		'Content-Type': 'application/json'
	  },
	  body: JSON.stringify(data) // body data type must match "Content-Type" header
	});
	//return response.json(); // parses JSON response into native JavaScript objects
  }