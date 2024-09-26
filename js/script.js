const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APPS";
const searchForm = document.getElementById("searchBook");
const searchInput = document.getElementById("searchBookTitle");
const deleteBooks = document.getElementById("booksClear");
const bookFilter = document.getElementById("inputSelect");

function generateId() {
  return +new Date().getTime();
}

function generatebookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year: parseInt(year),
    isComplete,
  };
}

function findBook(bookId) {
  for (bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);

  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeBook(bookObject) {
  const { id, title, author, year, isComplete } = bookObject;

  const container = document.createElement("div");
  container.setAttribute("data-bookid", id);
  container.setAttribute("data-testid", "bookItem");
  container.id = "bookItem";
  container.classList.add("item", "shadow");

  const textContainer = document.createElement("div");
  textContainer.setAttribute("head-book", "headBook");
  textContainer.classList.add("inner");

  const textTitle = document.createElement("h3");
  textTitle.innerText = title;
  textTitle.setAttribute("data-testid", "bookItemTitle");
  textTitle.classList.add("bookItemTitle");

  const textAuthor = document.createElement("p");
  textAuthor.innerText = author;
  textAuthor.setAttribute("data-testid", "bookItemAuthor");
  textAuthor.classList.add("bookItemAuthor");

  const textYear = document.createElement("p");
  textYear.innerText = year;
  textYear.setAttribute("data-testid", "bookItemYear");
  textYear.classList.add("bookItemYear");

  textContainer.append(textTitle, textAuthor, textYear);

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("action");

  const completeButton = document.createElement("button");
  completeButton.innerHTML = '<i class="fa-regular fa-circle-check"></i>';
  completeButton.setAttribute("data-testid", "bookItemIsCompleteButton");
  completeButton.classList.add("completeButton");
  completeButton.addEventListener("click", function () {
    isComplete ? undoCompletedRead(id) : addCompleteRead(id);
  });

  const deleteButton = document.createElement("button");
  deleteButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
  deleteButton.setAttribute("data-testid", "bookItemDeleteButton");
  deleteButton.classList.add("deleteButton");
  deleteButton.addEventListener("click", function () {
    if (confirm("Are you sure you want to delete this book?")) {
      removeFromCompleted(id);
    }
  });

  const editButton = document.createElement("button");
  editButton.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
  editButton.setAttribute("data-testid", "bookItemEditButton");
  editButton.classList.add("editButton");
  editButton.addEventListener("click", function () {
    editBook(id);
  });

  buttonContainer.append(completeButton, deleteButton, editButton);
  container.append(textContainer, buttonContainer);

  return container;
}

function addBook() {
  const title = document.getElementById("bookFormTitle").value;
  const author = document.getElementById("bookFormAuthor").value;
  const year = document.getElementById("bookFormYear").value;
  const isComplete = document.getElementById("bookFormIsComplete").checked;

  const generatedID = generateId();
  const bookObject = generatebookObject(generatedID, title, author, year, isComplete);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addCompleteRead(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);
  if (bookTarget === -1) return;
  books.splice(bookTarget, 1);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoCompletedRead(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function editBook(bookId) {
  const bookTarget = findBook(bookId);
  const bookIndex = findBookIndex(bookId);
  books.splice(bookIndex, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  const inputFields = {
    title: document.getElementById("bookFormTitle"),
    author: document.getElementById("bookFormAuthor"),
    year: document.getElementById("bookFormYear"),
    isComplete: document.getElementById("bookFormIsComplete"),
  };
  inputFields.title.value = bookTarget.title;
  inputFields.author.value = bookTarget.author;
  inputFields.year.value = bookTarget.year;
  inputFields.isComplete.checked = bookTarget.isComplete;
}

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const value = searchInput.value.trim();

  const bookItems = document.querySelectorAll(".inner > h3");
  bookItems.forEach((book) => {
    const isVisible = book.innerText.toLowerCase().includes(value);
    book.parentElement.parentElement.style.display = isVisible ? "flex" : "none";
  });
});

deleteBooks.addEventListener("click", () => {
  books.splice(0);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
});

bookFilter.addEventListener("change", (e) => {
  const selectedFilter = e.target.value;
  switch (selectedFilter) {
    case "title":
      books.sort((a, b) => a.title.localeCompare(b.title));
      document.dispatchEvent(new Event(RENDER_EVENT));
      break;
    case "author":
      books.sort((a, b) => a.author.localeCompare(b.author));
      document.dispatchEvent(new Event(RENDER_EVENT));
      break;
    case "year":
      books.sort((a, b) => Number(a.year) - Number(b.year));
      document.dispatchEvent(new Event(RENDER_EVENT));
      break;
    default:
      books.sort((a, b) => Number(a.id) - Number(b.id));
      document.dispatchEvent(new Event(RENDER_EVENT));
      break;
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("bookForm");

  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
    submitForm.reset();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(SAVED_EVENT, () => {
  console.log("Data berhasil di simpan.");
});

document.addEventListener(RENDER_EVENT, function () {
  const incompleteBookList = document.getElementById("incompleteBookList");
  const completeBookList = document.getElementById("completeBookList");

  incompleteBookList.innerHTML = "";
  completeBookList.innerHTML = "";

  books.forEach((bookItem) => {
    const bookElement = makeBook(bookItem);
    bookItem.isComplete ? completeBookList.append(bookElement) : incompleteBookList.append(bookElement);
  });

  if (incompleteBookList.children.length === 0) {
    incompleteBookList.innerHTML = `<p class="empty-data"><i class="fa-solid fa-box-open"></i><span>Data Kosong</span></p>`;
  }

  if (completeBookList.children.length === 0) {
    completeBookList.innerHTML = `<p class="empty-data"><i class="fa-solid fa-box-open"></i><span>Data Kosong</span></p>`;
  }
});
