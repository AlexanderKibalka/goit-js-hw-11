import axios from "axios";
import Notiflix from 'notiflix';

const elem = {
    form: document.querySelector(".search-form"),
    loadMore: document.querySelector(".load-more"),
    gallery: document.querySelector(".gallery")
};

let page = 1;

elem.form.addEventListener("submit", handlerSearch);
elem.loadMore.addEventListener('click', handlerLoadMore);

async function handlerSearch(evt) {
  evt.preventDefault();
  const searchQuery = evt.target.elements.searchQuery.value.trim();
  if (!searchQuery) {
    Notiflix.Notify.info('Please enter a search query.');
    return;
  }
  elem.gallery.innerHTML = "";
  page = 1;
  try {
    await fetchAndDisplayImages(searchQuery);
  } catch (error) {
    handleApiError(error);
  }
}

async function handlerLoadMore() {
  page += 1;
  const searchQuery = elem.form.elements.searchQuery.value.trim();
  try {
    await fetchAndDisplayImages(searchQuery);
  } catch (error) {
    handleApiError(error);
  }
}

async function fetchAndDisplayImages(searchQuery) {
  try {
    const response = await fetchImages(searchQuery, page);
      if (response.hits.length === 0) {
        elem.loadMore.classList.add("is-hidden");
      Notiflix.Notify.info('Sorry, there are no images matching your search query. Please try again.');
      return;
    }
    const images = response.hits;
    appendImagesToGallery(images);
    if (page >= Math.ceil(response.totalHits / response.hitsPerPage)) {
      elem.loadMore.classList.add("is-hidden");
      Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
    } else {
      elem.loadMore.classList.remove("is-hidden");
    }
  } catch (error) {
    handleApiError(error);
  }
}

async function fetchImages(searchQuery, page = 1) {
  const apiKey = "40504960-5088d3fbc5dd1c72bd50bacb7";
  const perPage = 40;
  const orientation = "horizontal";
  const safeSearch = "true";

  const response = await axios.get("https://pixabay.com/api/", {
    params: {
      key: apiKey,
      q: searchQuery,
      image_type: "photo",
      orientation,
      safesearch: safeSearch,
      per_page: perPage,
      page
    }
  });
  return response.data;
}

function appendImagesToGallery(images) {
  const fragment = document.createDocumentFragment();
  images.forEach(({ tags, webformatURL, likes, downloads, views, largeImageURL, comments }) => {
    const photoCard = document.createElement("div");
    photoCard.classList.add("photo-card");
    photoCard.innerHTML = createMarcup({ tags, webformatURL, likes, downloads, views, largeImageURL, comments });
    fragment.appendChild(photoCard);
  });
  elem.gallery.appendChild(fragment);
}

function createMarcup({ tags, webformatURL, likes, downloads, views, largeImageURL, comments }) {
  return `
    <a href="${largeImageURL}">
      <div class="img-wrapper"><img src="${webformatURL}" alt="${tags}" loading="lazy" /></div>
      <div class="info">
        <p class="info-item">Likes <span class="count">${likes}</span></p>
        <p class="info-item">Views <span class="count">${views}</span></p>
        <p class="info-item">Comments <span class="count">${comments}</span></p>
        <p class="info-item">Downloads <span class="count">${downloads}</span></p>
      </div>
    </a>`;
}

function handleApiError(error) {
  console.error(error);
  Notiflix.Notify.failure('Sorry, search is currently unavailable');
}
