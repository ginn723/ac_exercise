//api url
const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'


const movies = [] //電影總清單
let filteredMovies = [] //搜尋清單

const MOVIES_PER_PAGE = 12

let currentLayout = "card" //新增變數轉換 card-icon & list-icon
let currentPage = 1 

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const iconLayout = document.querySelector('#icon-layout')


//data=參數
function renderMovieList(data) {
  let rawHTML = ''
  data.forEach((item) => {
     if (currentLayout === "card") {
    rawHTML += `
    <div class="col-sm-3">
                    <div class="mb-2">
                        <div class="card">
                            <img src="${POSTER_URL + item.image}" class="card-img-top" alt="Movie Poster">
                            <div class="card-body">
                                <h5 class="card-title">${item.title}</h5>
                            </div>
                            <div class="card-footer">
                                <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
                                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
                            </div>
                        </div>
                    </div>
                </div>
    `
    } else if (currentLayout === "list") {
      rawHTML += `
    <li class="list-group-item d-flex justify-content-between">
      <div>
        <h5 class="card-title">${item.title}</h5>
      </div>
      <div>
        <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal"
          data-id="${item.id}">More</button>
        <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
      </div>
    </li>
      `;
    }
  });
  dataPanel.innerHTML = rawHTML
}



function renderPaginator(amount) {
  // 80 / 12 = 6 ... 8 = 7; math.ceil : 12.7 = 13
  //計算總頁數
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  //製作template
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
  }
  //放回HTML
  paginator.innerHTML = rawHTML
}


function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}


function showMovieModal(id) {
  //get elements
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  //send request to show api
  axios.get(INDEX_URL + id).then((response) => {
    //response.data.result
    const data = response.data.results

    //insert data into modal ui
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
  })
}


function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)

  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }

  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}


dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')){
    console.log(event.target.dataset)
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})


iconLayout.addEventListener('click', function formatSwitcher(event) {
  if (event.target.matches('.icon-card')){
    currentLayout = "card"
  } else if (event.target.matches(".icon-list")) {
    currentLayout = "list"
  }
  renderMovieList(getMoviesByPage(currentPage))
})





paginator.addEventListener('click', function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return

  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page)

  //更新畫面
  renderMovieList(getMoviesByPage(page))
})


//listen to search form
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )

  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }
  
  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))
})

//存取收藏清單
// localStorage.setItem('default_language', 'english')
// console.log(localStorage.getItem('default_language'))
// localStorage.removeItem('default_language')


axios.get(INDEX_URL).then((response) => {
  //Array(80)
  // for (const movie of Response.data.results){
  //   movies.push(movie)
  // }
  // movies.push(res.data.results)
  movies.push(...response.data.results)
  renderPaginator(movies.length)
  renderMovieList(getMoviesByPage(1))
})


// localStorage.setItem('default_language', 'english')