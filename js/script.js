/**
 * [
 *    {
 *      id: <int>
 *      title: <string>
 *      author: <string>
 *      year: <int>
 *      isCompleted: <boolean>
 *    }
 * ]
 */
const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APPS";
const searchInput = document.getElementById("searchBookTitle");
const deleteBooks = document.getElementById("booksClear");
const bookFilter = document.getElementById("inputSelect");

function generateId() {
  return +new Date();
}

function generatebookObject(id, title, author, year, isCompleted) {
  return {
    id,
    title,
    author,
    year,
    isCompleted,
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

/**
 * Fungsi ini digunakan untuk memeriksa apakah localStorage didukung oleh browser atau tidak
 *
 * @returns boolean
 */
function isStorageExist() /* boolean */ {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

/**
 * Fungsi ini digunakan untuk menyimpan data ke localStorage
 * berdasarkan KEY yang sudah ditetapkan sebelumnya.
 */
function saveData() {
  if (isStorageExist()) {
    const parsed /* string */ = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

/**
 * Fungsi ini digunakan untuk memuat data dari localStorage
 * Dan memasukkan data hasil parsing ke variabel {@see books}
 */
function loadDataFromStorage() {
  const serializedData /* string */ = localStorage.getItem(STORAGE_KEY);

  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeBook(bookObject) {
  const { id, title, author, year, isCompleted } = bookObject;

  const textTitle = document.createElement("h2");
  textTitle.innerText = title;

  const textAuthor = document.createElement("p");
  textAuthor.innerText = author;

  const textYear = document.createElement("p");
  textYear.innerText = year;

  const textContainer = document.createElement("div");
  textContainer.classList.add("inner");
  textContainer.append(textTitle, textAuthor, textYear);

  const container = document.createElement("div");
  container.classList.add("item", "shadow");
  container.append(textContainer);
  container.setAttribute("id", `todo-${id}`);

  if (isCompleted) {
    const undoButton = document.createElement("button");
    undoButton.innerHTML = '<i class="fa-solid fa-rotate-left"></i>';
    undoButton.classList.add("undo-button");
    undoButton.addEventListener("click", function () {
      undoCompletedRead(id);
    });

    const trashButton = document.createElement("button");
    trashButton.innerHTML = '<i class="fa-solid fa-trash"></i>';
    trashButton.classList.add("trash-button");
    trashButton.addEventListener("click", function () {
      if (confirm("Are you sure you want to delete this book?")) {
        removeFromCompleted(id);
      }
    });

    container.append(undoButton, trashButton);
  } else {
    const editButton = document.createElement("button");
    editButton.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
    editButton.classList.add("edit-button");
    editButton.addEventListener("click", function () {
      editBook(id);
    });

    const checkButton = document.createElement("button");
    checkButton.innerHTML = '<i class="fa-regular fa-circle-check"></i>';
    checkButton.classList.add("check-button");
    checkButton.addEventListener("click", function () {
      addCompleteRead(id);
    });

    container.append(checkButton, editButton);
  }

  return container;
}

function addBook() {
  const title = document.getElementById("inputBookTitle").value;
  const author = document.getElementById("inputBookAuthor").value;
  const year = document.getElementById("inputBookYear").value;
  const isCompleted = document.getElementById("inputBookIsComplete").checked;

  const generatedID = generateId();
  const bookObject = generatebookObject(generatedID, title, author, year, isCompleted);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function addCompleteRead(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isCompleted = true;
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

  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function editBook(bookId) {
  const bookTarget = findBook(bookId);
  const bookIndex = findBookIndex(bookId);
  books.splice(bookIndex, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  const inputFields = {
    title: document.getElementById("inputBookTitle"),
    author: document.getElementById("inputBookAuthor"),
    year: document.getElementById("inputBookYear"),
    isComplete: document.getElementById("inputBookIsComplete"),
  };
  inputFields.title.value = bookTarget.title;
  inputFields.author.value = bookTarget.author;
  inputFields.year.value = bookTarget.year;
  inputFields.isComplete.checked = bookTarget.isComplete;
}

searchInput.addEventListener("input", (event) => {
  const value = event.target.value;
  const bookItems = document.querySelectorAll(".inner > h2");

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
  const submitForm = document.getElementById("form");

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
  const uncompletedTODOList = document.getElementById("belumselesai-dibaca");
  const listCompleted = document.getElementById("selesai-dibaca");

  uncompletedTODOList.innerHTML = "";
  listCompleted.innerHTML = "";

  books.forEach((bookItem) => {
    const bookElement = makeBook(bookItem);
    bookItem.isCompleted ? listCompleted.append(bookElement) : uncompletedTODOList.append(bookElement);
  });

  if (uncompletedTODOList.children.length === 0) {
    uncompletedTODOList.innerHTML = `<p class="empty-data"><i class="fa-solid fa-box-open"></i><span>Data Kosong</span></p>`;
  }

  if (listCompleted.children.length === 0) {
    listCompleted.innerHTML = `<p class="empty-data"><i class="fa-solid fa-box-open"></i><span>Data Kosong</span></p>`;
  }
});
