
// public/js/article-management.js

document.addEventListener('DOMContentLoaded', () => {
  const articleForm = document.getElementById('article-form');
  const articleList = document.getElementById('article-list');
  const articleIdField = document.getElementById('article-id');
  const articleTitleField = document.getElementById('article-title');
  const articleImageField = document.getElementById('article-image');
  const articleImageUrlField = document.getElementById('article-image-url');
  const saveArticleBtn = document.getElementById('save-article-btn');
  const previewArticleBtn = document.getElementById('preview-article-btn');
  const previewArea = document.getElementById('preview-area');
  const previewContent = document.getElementById('preview-content');

  // API base URL for articles
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

  // --- Function to upload an image ---
  async function uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      articleImageUrlField.value = result.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    }
  }


  // --- Function to display all articles ---
  async function displayArticles() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      const articles = await response.json();
      articleList.innerHTML = ''; // Clear the list
      articles.forEach(article => {
        const li = document.createElement('li');
        li.innerHTML = `
          <span>${article.title}</span>
          <div class="article-buttons">
            <button class="edit-btn" data-id="${article.id}">Edit</button>
            <button class="delete-btn" data-id="${article.id}">Delete</button>
          </div>
        `;
        articleList.appendChild(li);
      });
    } catch (error) {
      console.error('Error displaying articles:', error);
      articleList.innerHTML = '<li>Error loading articles.</li>';
    }
  }

  // --- Function to save (create or update) an article ---
  async function saveArticle(event) {
    event.preventDefault();
    const article = {
      title: articleTitleField.value,
      content: quill.root.innerHTML, // Get HTML content from Quill
      imageUrl: articleImageUrlField.value,
    };
    const id = articleIdField.value;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/${id}` : API_URL;

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(article),
      });
      if (!response.ok) {
        throw new Error('Failed to save article');
      }
      articleForm.reset();
      quill.setText(''); // Clear the editor
      articleIdField.value = '';
      saveArticleBtn.textContent = 'Save Article';
      previewArea.classList.add('hidden');
      await displayArticles();
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Error saving article. Please try again.');
    }
  }

  // --- Function to handle editing an article ---
  async function editArticle(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch article for editing');
      }
      const article = await response.json();
      articleIdField.value = article.id;
      articleTitleField.value = article.title;
      quill.root.innerHTML = article.content; // Set HTML content in Quill
      articleImageUrlField.value = article.imageUrl;
      saveArticleBtn.textContent = 'Update Article';
      previewArea.classList.add('hidden');
      window.scrollTo(0, 0); // Scroll to the top to see the form
    } catch (error) {
      console.error('Error editing article:', error);
      alert('Could not load article for editing.');
    }
  }

  // --- Function to delete an article ---
  async function deleteArticle(id) {
    if (!confirm('Are you sure you want to delete this article?')) {
      return;
    }
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete article');
      }
      await displayArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      alert('Error deleting article. Please try again.');
    }
  }

  // --- Function to preview an article ---
  function previewArticle() {
    previewContent.innerHTML = quill.root.innerHTML;
    previewArea.classList.toggle('hidden');
  }

  // --- Event Listeners ---
  articleForm.addEventListener('submit', saveArticle);
  previewArticleBtn.addEventListener('click', previewArticle);
  articleImageField.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      uploadImage(file);
    }
  });

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
