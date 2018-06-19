var imgBlank = new Image()
imgBlank.src = './UI/blank.png';
var imgFlag = new Image();
imgFlag.src = './UI/flag.png';
var img0 = new Image();
img0.src = './UI/0.png';
var img1 = new Image();
img1.src = './UI/1.png';
var img2 = new Image();
img2.src = './UI/2.png';
var img3 = new Image();
img3.src = './UI/3.png';
var img4 = new Image();
img4.src = './UI/4.png';
var img5 = new Image();
img5.src = './UI/5.png';
var img6 = new Image();
img6.src = './UI/6.png';
var img7 = new Image();
img7.src = './UI/7.png';
var img8 = new Image();
img8.src = './UI/8.png';
var img9 = new Image();
img9.src = './UI/otherBomb.png';
var img10 = new Image();
img10.src = './UI/bomb.png';
var img11 = new Image();
img11.src = './UI/noBomb.png';

window.onload = ()=>{
	let canv = document.getElementById('playfield');
	let ctx = canv.getContext('2d');
	let field;
	let overlay;
	let gameOn;
	let gameWidth;
	let gameHeight;
	let bombCount;
	let firstRound;
	gameStart(9,9,10);

	document.getElementById('bgr').onclick = ()=>{
		gameStart(9,9,10);
	};

	document.getElementById('itr').onclick = ()=>{
		gameStart(16,16,40);
	};

	document.getElementById('exp').onclick = ()=>{
		gameStart(30,16,99);
	};

	canv.addEventListener('click',()=>{
		if(gameOn){
			let rect = canv.getBoundingClientRect();
			let mouseX = event.clientX - rect.left;
			let mouseY = event.clientY - rect.top;
			let cellX = (mouseX - (mouseX%30))/30;
			let cellY = (mouseY - (mouseY%30))/30;
			if(field[cellX][cellY] === 9 && !firstRound){
				field[cellX][cellY] = 10;
				overlay[cellX][cellY] = 1;
				gameEnd();
			}
			else if(firstRound && field[cellX][cellY] !== 0){
				let rep = 0;
				while(rep < 1){
					setupField();
					if(field[cellX][cellY] === 0){
						rep++;
					}
				}
				sweeper(cellX,cellY);
			}
			else{
				sweeper(cellX,cellY);
			}
			firstRound = false;
			drawCanvas();
		}
	});

	canv.addEventListener('contextmenu',(e)=>{
		e.preventDefault();
		if(gameOn){
			let rect = canv.getBoundingClientRect();
			let mouseX = event.clientX - rect.left;
			let mouseY = event.clientY - rect.top;
			let cellX = (mouseX - (mouseX%30))/30;
			let cellY = (mouseY - (mouseY%30))/30;
			switch(overlay[cellX][cellY]){
				case 0:
					overlay[cellX][cellY] = 2;
					break;
				case 2:
					overlay[cellX][cellY] = 0;
					break;
			}
			drawCanvas();	
		}
	});	

	function setupField(){
		let bombCountCopy = bombCount;
		field = [];
		overlay = [];
		for(let i = 0; i<gameWidth; i++){
			field[i] = [];
			overlay[i] = [];
			for(let j = 0; j<gameHeight; j++){
				field[i][j] = 0;
				overlay[i][j] = 0;
			}
		}
		while(bombCountCopy > 0){
			let x = Math.floor(Math.random() * gameWidth);
			let y = Math.floor(Math.random() * gameHeight);
			if(field[x][y] === 0){
				field[x][y] = 9;
				bombCountCopy--;
			}
		}
		for(let i = 0; i<gameWidth; i++){
			for(let j = 0; j<gameHeight; j++){
				let surrBomb = 0;
				if(field[i][j] === 0){
					surrBomb += checkSurr(i,j,0,-1);
					surrBomb += checkSurr(i,j,0,1);
					surrBomb += checkSurr(i,j,-1,-1);
					surrBomb += checkSurr(i,j,-1,1);
					surrBomb += checkSurr(i,j,1,-1);
					surrBomb += checkSurr(i,j,1,1);
					surrBomb += checkSurr(i,j,-1,0);
					surrBomb += checkSurr(i,j,1,0);
					field[i][j] = surrBomb;
				}
			}
		}
	}

	function drawCanvas(){
		for(let i = 0; i<gameHeight; i++){
			for(let j = 0; j<gameWidth; j++){
				let currImg;
				if(overlay[j][i] === 0){
					currImg = imgBlank;
				}
				else if(overlay[j][i] === 1){					
					currImg = window['img' + field[j][i]];
				}
				else{
					currImg = imgFlag;
				}
				ctx.drawImage(currImg,j*30,i*30,30,30);
			}
		}
	}

	function checkSurr(i,j,xp,yp){
		if(field[i+xp] !== undefined){
			if(field[i+xp][j+yp] === 9){
				return 1;
			}
		}
		return 0;
	}

	function sweeper(mouseX,mouseY){
		if(field[mouseX] !== undefined){			
			if(field[mouseX][mouseY] === 0 && overlay[mouseX][mouseY] === 0){
				overlay[mouseX][mouseY] = 1;
				sweeper(mouseX+1,mouseY);
				sweeper(mouseX,mouseY+1);
				sweeper(mouseX-1,mouseY);
				sweeper(mouseX,mouseY-1);
				sweeper(mouseX-1,mouseY-1);
				sweeper(mouseX+1,mouseY-1);
				sweeper(mouseX-1,mouseY+1);
				sweeper(mouseX+1,mouseY+1);
			}
			else if(field[mouseX][mouseY] > 0 && field[mouseX][mouseY] < 9 && overlay[mouseX][mouseY] === 0){
				overlay[mouseX][mouseY] = 1;
			}
		}
	}

	function gameEnd(){
		for(let i = 0; i<gameWidth; i++){
			for(let j = 0; j<gameHeight; j++){
				if(field[i][j] === 9 && overlay[i][j] !== 2){
					overlay[i][j] = 1;
				}
				else if(overlay[i][j] === 2 && field[i][j] !== 9){
					overlay[i][j] = 1;
					field[i][j] = 11;
				}
			}
		}
		gameOn = false;
	}

	function gameStart(x,y,z){
		firstRound = true;
		gameWidth = x;
		gameHeight = y;
		bombCount = z;
		canv.width = gameWidth*30;
		canv.height = gameHeight*30;
		setupField();
		drawCanvas();
		gameOn = true;
	}
};