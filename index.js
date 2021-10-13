const BASE_URL = 'https://movie-list.alphacamp.io/'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = []
const dataPanel = document.querySelector('#data-panel') // 以變數承裝要渲染匯入的節點
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const MOVIES_PER_PAGE = 12
let filteredMovies = [] // 篩選後的電影容器
// 函式
// 渲染電影清單函式
function renderMovieList (data){
	let rawHtml = ''
	data.forEach(item => {
		rawHtml += `<div class="col-sm-3">
          <div class="mb-2">
            <div class="card">
              <img
                src="${POSTER_URL + item.image}"
                class="card-img-top"
                alt="Movie Poster"
              />
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-toggle="modal"
	data-target="#movie-modal" data-id='${item.id}'>More</button>
                <button class="btn btn-info btn-add-favorite" data-id='${item.id}'>+</button>
              </div>
            </div>
          </div>
        </div>`
		})
	dataPanel.innerHTML = rawHtml
}
// 渲染Modal內容函式
function showMovieModal(id){
	const modalTitle = document.querySelector('#movie-modal-title')
	const modalImage = document.querySelector('#movie-modal-image')
	const modalDate = document.querySelector('#movie-modal-date')
	const modalDescription = document.querySelector('#movie-modal-description')
	axios.get(INDEX_URL + id).then(response => {
		const data = response.data.results
		modalTitle.innerText = data.title
		modalDate.innerText = 'Release date: ' + data.release_date
		modalDescription.innerText = data.description
		modalImage.innerHTML = `<img src="${POSTER_URL + data.image}"
        alt="movie-poster" class='img-fuid'>`
	})
}
// 新增至最愛函式
function addToFavorite(id){
	const list = JSON.parse(localStorage.getItem('favoriteMovies'))||[]
	const movie = movies.find(movie=>movie.id===id)
	if(list.some(movie=>movie.id===id)){
		return alert('此電影已在收藏清單中！')
	}
	list.push(movie)
	localStorage.setItem('favoriteMovies',JSON.stringify(list))
}
// 用頁碼取得電影清單
function getMoviesByPage(page){
	const data = filteredMovies.length ? filteredMovies : movies
	const startIndex = (page-1)*MOVIES_PER_PAGE //起始序號為頁碼減一乘以12
	return data.slice(startIndex , startIndex+MOVIES_PER_PAGE)//從第0切到第12，不包含第12
}
// 算出總頁碼，渲染分頁器
function renderPaginator(amount) {
	// 計算總頁數：總部數除12無條件進位，即為總頁數
	const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
	let rawHTML = ''
	for(let page = 1 ; page <= numberOfPages ; page++){
		rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page='${page}'>${page}</a></li>`
	}
	paginator.innerHTML = rawHTML
}

// 解法一：迭代器
// axios
// 	.get(INDEX_URL)
// 	.then(response => {
// 		for(const movie of response.data.results){
// 		movies.push(movie)
// 		}
// 	})
// 	.catch(err => {
// 		console.log(err)})

// 解法二：「擴展」運算子 Spread Operation
axios
	.get(INDEX_URL)
	.then(response => {
		movies.push(...response.data.results)
		renderPaginator(movies.length) 
		// 用movies長度得到資料總筆數，傳進renderPaginator渲染分頁器
		renderMovieList(getMoviesByPage(1))
		// 用頁碼取得電影清單後，傳進renderMovieList渲染畫面
	})
	.catch(err => {console.log(err)})

// 綁定監聽事件，以取得點擊物件id並將id傳給函式渲染Modal
dataPanel.addEventListener('click', function onPanelClick(){
	if(event.target.matches('.btn-show-movie')){
		showMovieModal(Number(event.target.dataset.id))
	} else if(event.target.matches('.btn-add-favorite')){
		addToFavorite(Number(event.target.dataset.id))
	}
})

// Search form綁定監聽事件
searchForm.addEventListener('submit',function onSearchSubmit(event) {
	event.preventDefault()
	const keyword = searchInput.value.trim().toLowerCase()
	// 取得輸入的值，將其頭尾空格去除後，轉換為小寫
	if(!keyword.length){ // 如果關鍵字長度回傳錯誤
		return alert('請輸入有效關鍵字！') // 回傳跳窗警示
	}
	//作法一：用迴圈迭代篩選符合的標的
	// for (const movie of movies){
	// 	if(movie.title.toLowerCase().includes(keyword)){
	// 		filteredMovies.push(movie)
	// 	}
	// }
	//作法二：用條件來迭代
	// 用filter方法將在movies陣列中的movie遍歷，找出title轉成小寫後仍包含keyword的資料
	// 將過濾後的資料傳進filteredMovies中並用renderMovieList渲染畫面
	filteredMovies = movies.filter(movie => 
		movie.title.toLowerCase().includes(keyword))
	if(filteredMovies.length === 0){
		alert(`輸入的字串${keyword}沒有符合項目。`)
	}
	renderPaginator(filteredMovies.length)
	renderMovieList(getMoviesByPage(1))
})

// 分頁監聽器
paginator.addEventListener('click',function onPaginatorClick(event){
	// 如果被點擊的不是A標籤，跳出監聽器	
	// console.log(event.target.tagName) // 'A'
	if(event.target.tagName !== 'A') return
	const page = Number(event.target.dataset.page)
	renderMovieList(getMoviesByPage(page))
})