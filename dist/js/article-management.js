document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const articleForm = document.getElementById('article-form');
  const articleList = document.getElementById('article-list');
  const articleIdField = document.getElementById('article-id');
  const articleTitleField = document.getElementById('article-title');
  const articleImageUrlField = document.getElementById('article-image-url');
  const saveArticleBtn = document.getElementById('save-article-btn');
  const previewArticleBtn = document.getElementById('preview-article-btn');
  const previewArea = document.getElementById('preview-area');
  const previewContent = document.getElementById('preview-content');
  const errorBox = document.getElementById('error-box'); // optional error container

  // --- API base URL ---
  const API_URL = '/api/articles';

  // --- Initialize Quill Editor ---
  const quill = new Quill('#editor', {
    theme: 'snow',
    modules: {
      toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        ['link', 'image', 'video'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['clean']
      ]
    }
  });

  // --- Utility: Show error messages ---
  function showError(message) {
    if (errorBox) {
      errorBox.textContent = message;
      errorBox.classList.remove('hidden');
    } else {
      console.error(message);
    }
  }

  // --- Display all articles ---
  async function displayArticles() {
    try {
      articleList.innerHTML = '<li>Loading articles...</li>';
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch articles');
      const articles = await response.json();

      articleList.innerHTML = ''; // Clear list
      articles.forEach(article => {
        const li = document.createElement('li');
        li.innerHTML = `
          <span>${article.title}</span>
          <div class="article-buttons">
            <button class="edit-btn" data-id="${article.id}" aria-label="Edit ${article.title}">Edit</button>
            <button class="delete-btn" data-id="${article.id}" aria-label="Delete ${article.title}">Delete</button>
          </div>
        `;
        articleList.appendChild(li);
      });
    } catch (error) {
      showError('Error displaying articles.');
      articleList.innerHTML = '<li>Error loading articles.</li>';
    }
  }

  // --- Save (create or update) an article ---
  async function saveArticle(event) {
    event.preventDefault();
    saveArticleBtn.disabled = true;

    const article = {
      title: articleTitleField.value.trim(),
      content: quill.root.innerHTML, // HTML content from Quill
      imageUrl: articleImageUrlField.value.trim(),
    };
    const id = articleIdField.value;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/${id}` : API_URL;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(article),
      });
      if (!response.ok) throw new Error('Failed to save article');

      articleForm.reset();
      quill.setText('');
      articleIdField.value = '';
      saveArticleBtn.textContent = 'Save Article';
      previewArea.classList.add('hidden');
      await displayArticles();
    } catch (error) {
      showError('Error saving article. Please try again.');
    } finally {
      saveArticleBtn.disabled = false;
    }
  }

  // --- Edit an article ---
  async function editArticle(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) throw new Error('Failed to fetch article for editing');
      const article = await response.json();

      articleIdField.value = article.id;
      articleTitleField.value = article.title;
      quill.root.innerHTML = article.content;
      articleImageUrlField.value = article.imageUrl;
      saveArticleBtn.textContent = 'Update Article';
      previewArea.classList.add('hidden');
      window.scrollTo(0, 0);
    } catch (error) {
      showError('Could not load article for editing.');
    }
  }

  // --- Delete an article ---
  async function deleteArticle(id) {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete article');
      await displayArticles();
    } catch (error) {
      showError('Error deleting article. Please try again.');
    }
  }

  // --- Preview an article ---
  function previewArticle() {
    previewContent.innerHTML = `
      <article class="story-card">
        <h2>${articleTitleField.value}</h2>
        ${articleImageUrlField.value ? `<img src="${articleImageUrlField.value}" alt="${articleTitleField.value}">` : ""}
        <div class="story-body">${quill.root.innerHTML}</div>
      </article>
    `;
    previewArea.classList.toggle('hidden');
  }

  // --- Event Listeners ---
  articleForm.addEventListener('submit', saveArticle);
  previewArticleBtn.addEventListener('click', previewArticle);

  articleList.addEventListener('click', (event) => {
    const target = event.target;
    const id = target.getAttribute('data-id');
    if (target.classList.contains('edit-btn')) {
      editArticle(id);
    } else if (target.classList.contains('delete-btn')) {
      deleteArticle(id);
    }
  });

  // --- Initial load ---
  displayArticles();
});
