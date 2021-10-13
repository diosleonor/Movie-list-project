const BASE_URL = 'https://movie-list.alphacamp.io/'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = JSON.parse(localStorage.getItem('favoriteMovies'))||[]// 修改路徑
const dataPanel = document.querySelector('#data-panel') // 以變數承裝要渲染匯入的節點
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
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
                <button class="btn btn-danger btn-remove-favorite" data-id='${item.id}'>X</button>
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
// 移除Movie的函式
function removeFromFavorite(id) {
	if(!movies) return
	const movieIndex = movies.findIndex(movie=>movie.id===id)
	if(movieIndex === -1) return
	movies.splice(movieIndex,1)
	localStorage.setItem('favoriteMovies',JSON.stringify(movies))
	renderMovieList(movies)
}


// 綁定監聽事件，以取得點擊物件id並將id傳給函式渲染Modal
dataPanel.addEventListener('click', function onPanelClick(){
	if(event.target.matches('.btn-show-movie')){
		// console.log(event.target.dataset.id)
		showMovieModal(Number(event.target.dataset.id))
	} else if(event.target.matches('.btn-remove-favorite')){
		removeFromFavorite(Number(event.target.dataset.id))
	}
})

renderMovieList(movies)