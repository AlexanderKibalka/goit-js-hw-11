import axios from "axios";
import Notiflix from 'notiflix';

const elem = {
    form: document.querySelector(".search-form"),
    loadMore: document.querySelector(".load-more"),
    gallery: document.querySelector(".gallery")
};

let page = 1;
let searchElem = "";
let totalHits = 0;

elem.form.addEventListener("submit", handlerSearch);
elem.loadMore.addEventListener('click', handlerLoadMore);

async function handlerSearch(evt) {
  evt.preventDefault();
  searchElem = evt.target.elements.searchQuery.value.trim();
  if (!searchElem) {
    Notiflix.Notify.info('Please enter a search query.');
    return;
  }
  elem.gallery.innerHTML = "";
  page = 1;
  totalHits = 0;
  elem.loadMore.classList.add("is-hidden");
  try {
    await fetchAndDisplayImages(searchElem, page);
  } catch (error) {
    handleApiError(error);
  }
}

async function handlerLoadMore() {
  page += 1;
  const searchQuery = searchElem;
  try {
    await fetchAndDisplayImages(searchQuery, page);
  } catch (error) {
    handleApiError(error);
  }
}

async function fetchImages(searchQuery, page) {
  axios.defaults.baseURL = "";
  const params = {
    key: "40504960-5088d3fbc5dd1c72bd50bacb7",
    q: searchQuery,
    image_type: "photo",
    orientation: "horizontal",
    safesearch: "true",
    per_page: 40,
    page: page
  };

  const resp = await axios.get(`https://pixabay.com/api/`, { params }).then((resp) => resp.data);
  return resp;
}

function appendImagesToGallery(images) {
  const markup = createMarcup(images);
  elem.gallery.insertAdjacentHTML("beforeend", markup);
}

function createMarcup(arr) {
  return arr.map(({ tags, webformatURL, likes, downloads, views, largeImageURL, comments }) => `
    <div class="photo-card">
        <a href="${largeImageURL}">
            <div class="img-wrapper"><img src="${webformatURL}" alt="${tags}" loading="lazy" /></div>
            <div class="info">
              <p class="info-item">
                Likes <span class="count">${likes}</span>
              </p>
              <p class="info-item">
                Views <span class="count">${views}</span>
              </p>
              <p class="info-item">
                Comments <span class="count">${comments}</span>
              </p>
              <p class="info-item">
                Downloads <span class="count">${downloads}</span>
              </p>
            </div>
         </a>
    </div>`).join("");
}

async function fetchAndDisplayImages(searchQuery, page) {
  try {
    const response = await fetchImages(searchQuery, page);
    if (response.hits.length === 0) {
      Notiflix.Notify.info('Sorry, there are no images matching your search query. Please try again.');
      elem.loadMore.classList.add("is-hidden");
      return;
    }
    const images = response.hits;
    appendImagesToGallery(images);
    totalHits = response.totalHits;
    if (page >= Math.ceil(totalHits / 40)) {
      elem.loadMore.classList.add("is-hidden");
      Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
    } else {
      elem.loadMore.classList.remove("is-hidden");
    }
  } catch (error) {
    handleApiError(error);
  }
}

function handleApiError(error) {
  console.error(error);
  Notiflix.Notify.failure('Sorry, search is currently unavailable');
}