let credentials = null;
let isAdmin = false;

function encodeCredentials(u, p) {
  return 'Basic ' + btoa(u + ':' + p);
}

function login() {
  const u = document.getElementById('usernameInput').value;
  const p = document.getElementById('passwordInput').value;
  if (!u) return showToast('Please enter a username', 'error');
  credentials = encodeCredentials(u, p);
  isAdmin = u === 'admin';
  document.getElementById('authSection').style.display = 'none';
  document.getElementById('userInfo').style.display = 'flex';
  const badge = document.getElementById('userRoleBadge');
  badge.textContent = isAdmin ? 'Admin' : 'User';
  badge.className = 'badge ' + (isAdmin ? 'badge-admin' : 'badge-user');
  document.getElementById('loggedInUser').textContent = u;
  document.getElementById('addBookBtn').style.display = 'inline-flex';
  searchBooks();
}

function logout() {
  credentials = null;
  isAdmin = false;
  document.getElementById('authSection').style.display = 'flex';
  document.getElementById('userInfo').style.display = 'none';
  document.getElementById('addBookBtn').style.display = 'none';
  document.getElementById('bookTableBody').innerHTML = '';
  document.getElementById('tableWrap').style.display = 'none';
  document.getElementById('emptyState').style.display = 'block';
  document.querySelector('#emptyState h3').textContent = 'Please log in';
  document.querySelector('#emptyState p').textContent = 'Enter your credentials above to browse books.';
}

function api(path, options) {
  const headers = { 'Content-Type': 'application/json' };
  if (credentials) headers['Authorization'] = credentials;
  return fetch(path, { ...options, headers })
    .then(r => {
      if (r.status === 403) throw new Error('Access denied: insufficient permissions');
      if (r.status === 401) throw new Error('Invalid credentials');
      if (!r.ok) return r.json().then(e => { throw new Error(e.message || 'Request failed'); });
      return r.status === 204 ? null : r.json();
    });
}

function showToast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast toast-' + type + ' show';
  setTimeout(() => t.classList.remove('show'), 3000);
}

function searchBooks() {
  const title = document.getElementById('searchTitle').value;
  const author = document.getElementById('searchAuthor').value;
  if (!credentials) return;
  const params = new URLSearchParams();
  if (title) params.set('title', title);
  if (author) params.set('author', author);
  const qs = params.toString();
  showLoading(true);
  api('/api/books' + (qs ? '?' + qs : ''))
    .then(books => renderBooks(books))
    .catch(err => {
      showToast(err.message, 'error');
      showLoading(false);
    });
}

function renderBooks(books) {
  showLoading(false);
  if (!books || books.length === 0) {
    document.getElementById('tableWrap').style.display = 'none';
    document.getElementById('emptyState').style.display = 'block';
    return;
  }
  document.getElementById('emptyState').style.display = 'none';
  document.getElementById('tableWrap').style.display = 'block';
  const tbody = document.getElementById('bookTableBody');
  tbody.innerHTML = books.map(b => {
    const authorNames = (b.authors || []).map(a => a.name).join(', ') || '-';
    return '<tr>' +
      '<td><div class="book-title">' + esc(b.title) + '</div></td>' +
      '<td><span class="book-author">' + esc(authorNames) + '</span></td>' +
      '<td><span class="book-isbn">' + esc(b.isbn) + '</span></td>' +
      '<td>' + (b.year || '-') + '</td>' +
      '<td>' + (b.price != null ? '$' + Number(b.price).toFixed(2) : '-') + '</td>' +
      '<td>' + esc(b.genre || '-') + '</td>' +
      '<td class="actions"><div class="action-group">' +
        '<button class="btn btn-outline btn-sm btn-icon" onclick="openEditModal(\'' + b.isbn + '\')" title="Edit">&#9998;</button>' +
        (isAdmin ? '<button class="btn btn-danger btn-sm btn-icon" onclick="deleteBook(\'' + b.isbn + '\')" title="Delete">&times;</button>' : '') +
      '</div></td></tr>';
  }).join('');
}

function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function showLoading(loading) {
  document.getElementById('loadingState').style.display = loading ? 'block' : 'none';
  if (loading) {
    document.getElementById('tableWrap').style.display = 'none';
    document.getElementById('emptyState').style.display = 'none';
  } else if (document.getElementById('bookTableBody').children.length > 0) {
    document.getElementById('tableWrap').style.display = 'block';
  }
}

function openAddModal() {
  document.getElementById('modalTitle').textContent = 'Add Book';
  document.getElementById('editIsbn').value = '';
  document.getElementById('bookTitle').value = '';
  document.getElementById('authorName').value = '';
  document.getElementById('authorBirthday').value = '';
  document.getElementById('bookIsbn').value = '';
  document.getElementById('bookIsbn').disabled = false;
  document.getElementById('bookYear').value = '';
  document.getElementById('bookPrice').value = '';
  document.getElementById('bookGenre').value = '';
  document.getElementById('bookModal').classList.add('open');
}

function openEditModal(isbn) {
  showLoading(true);
  api('/api/books')
    .then(books => {
      const book = books.find(b => b.isbn === isbn);
      if (!book) throw new Error('Book not found');
      document.getElementById('modalTitle').textContent = 'Edit Book';
      document.getElementById('editIsbn').value = isbn;
      document.getElementById('bookTitle').value = book.title || '';
      const authors = book.authors || [];
      document.getElementById('authorName').value = authors.length > 0 ? (authors[0].name || '') : '';
      document.getElementById('authorBirthday').value = authors.length > 0 ? (authors[0].birthday || '') : '';
      document.getElementById('bookIsbn').value = book.isbn || '';
      document.getElementById('bookIsbn').disabled = true;
      document.getElementById('bookYear').value = book.year || '';
      document.getElementById('bookPrice').value = book.price || '';
      document.getElementById('bookGenre').value = book.genre || '';
      document.getElementById('bookModal').classList.add('open');
      showLoading(false);
    })
    .catch(err => {
      showToast(err.message, 'error');
      showLoading(false);
    });
}

function closeModal() {
  document.getElementById('bookModal').classList.remove('open');
}

function isValidIsbn(s) {
  const cleaned = s.replace(/-/g, '');
  if (cleaned.length === 10) return /^\d{9}[\dXx]$/.test(cleaned);
  if (cleaned.length === 13) return /^\d{13}$/.test(cleaned);
  return false;
}

function saveBook() {
  const title = document.getElementById('bookTitle').value.trim();
  const authorName = document.getElementById('authorName').value.trim();
  const authorBirthday = document.getElementById('authorBirthday').value.trim();
  const isbn = document.getElementById('bookIsbn').value.trim();
  const year = document.getElementById('bookYear').value;
  const price = document.getElementById('bookPrice').value;
  const genre = document.getElementById('bookGenre').value.trim();
  const editIsbn = document.getElementById('editIsbn').value;

  if (!title) return showToast('Title is required', 'error');
  if (!authorName) return showToast('Author name is required', 'error');
  if (!editIsbn && !isbn) return showToast('ISBN is required', 'error');
  if (!editIsbn && !isValidIsbn(isbn)) return showToast('ISBN must be a valid ISBN-10 or ISBN-13', 'error');
  if (!year) return showToast('Year is required', 'error');
  const yearNum = Number(year);
  if (!Number.isInteger(yearNum) || yearNum < 1000 || yearNum > 2099) return showToast('Year must be a valid number between 1000 and 2099', 'error');
  if (price === '') return showToast('Price is required', 'error');
  const priceNum = Number(price);
  if (isNaN(priceNum) || priceNum < 0) return showToast('Price must be a valid positive number', 'error');
  if (!genre) return showToast('Genre is required', 'error');

  const body = {
    isbn: editIsbn || isbn,
    title,
    authors: [{ name: authorName, birthday: authorBirthday || null }],
    year: yearNum,
    price: priceNum,
    genre
  };

  if (editIsbn) {
    api('/api/books/' + editIsbn, { method: 'PUT', body: JSON.stringify(body) })
      .then(() => {
        showToast('Book updated', 'success');
        closeModal();
        searchBooks();
      })
      .catch(err => showToast(err.message, 'error'));
  } else {
    api('/api/books', { method: 'POST', body: JSON.stringify(body) })
      .then(() => {
        showToast('Book added', 'success');
        closeModal();
        searchBooks();
      })
      .catch(err => showToast(err.message, 'error'));
  }
}

function deleteBook(isbn) {
  if (!confirm('Delete this book?')) return;
  api('/api/books/' + isbn, { method: 'DELETE' })
    .then(() => {
      showToast('Book deleted', 'success');
      searchBooks();
    })
    .catch(err => showToast(err.message, 'error'));
}

document.getElementById('bookModal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeModal();
});

login();