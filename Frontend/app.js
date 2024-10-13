// app.js

document.addEventListener('DOMContentLoaded', () => {
  const toggleSidebarBtn = document.getElementById('toggleSidebar');
  const sidebar = document.querySelector('.sidebar');
  const categories = document.querySelectorAll('.category');
  const statusBoxes = document.querySelectorAll('.status-box');
  const documentList = document.querySelector('.document-list table tbody');
  const uploadButton = document.querySelector('.button.upload');
  const fileInput = document.getElementById('fileInput');
  let isUploading = false;

  toggleSidebarBtn.addEventListener('click', toggleSidebar);

  categories.forEach(category => {
      category.addEventListener('click', () => {
          categories.forEach(cat => cat.classList.remove('active'));
          category.classList.add('active');
          fetchDocumentsByCategory(category.textContent.trim().split(' ')[0]);
      });
  });

  statusBoxes.forEach(statusBox => {
      statusBox.addEventListener('click', () => {
          statusBoxes.forEach(box => box.classList.remove('active'));
          statusBox.classList.add('active');
          fetchDocumentsByStatus(statusBox.querySelector('h3').textContent);
      });
  });

  uploadButton.addEventListener('click', () => {
      fileInput.click();
  });

  fileInput.addEventListener('change', handleFileUpload);

  async function handleFileUpload(event) {
      if (isUploading) return;
      isUploading = true;

      const file = event.target.files[0];
      if (!file) {
          isUploading = false;
          return;
      }

      const allowedExtensions = ['.pdf', '.xlsx', '.docx', '.rar'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

      if (!allowedExtensions.includes(fileExtension)) {
          showNotification('Invalid file type. Please upload a PDF, XLSX, DOCX, or RAR file.', 'error');
          isUploading = false;
          return;
      }

      const formData = new FormData();
      formData.append('document', file);
      formData.append('docName', file.name);
      formData.append('category', 'Others');
      formData.append('status', 'Pending Submission');

      try {
          uploadButton.disabled = true;
          uploadButton.textContent = 'Uploading...';

          const response = await fetch('/api/documents/upload', {
              method: 'POST',
              body: formData
          });

          if (response.ok) {
              const result = await response.json();
              showNotification(result.message);
              updateDocumentList([result]);
              updateStatusCounts();
          } else {
              const errorData = await response.json();
              showNotification(`Error uploading document: ${errorData.message}`, 'error');
          }
      } catch (error) {
          console.error('Error:', error);
          showNotification('Error uploading document: Network error', 'error');
      } finally {
          isUploading = false;
          uploadButton.disabled = false;
          uploadButton.textContent = 'Upload';
          fileInput.value = '';
      }
  }

  function showNotification(message, type = 'success') {
      const notification = document.createElement('div');
      notification.textContent = message;
      notification.className = `notification ${type}`;
      document.body.appendChild(notification);

      setTimeout(() => {
          notification.remove();
      }, 5000);
  }

  function toggleSidebar() {
      sidebar.classList.toggle('hidden');
      document.querySelector('.main-content').classList.toggle('full-width');
  }

  async function fetchDocumentsByCategory(category) {
      try {
          const response = await fetch(`/api/documents/category/${category}`);
          const documents = await response.json();
          updateDocumentList(documents);
      } catch (error) {
          console.error('Error:', error);
      }
  }

  async function fetchDocumentsByStatus(status) {
      try {
          const response = await fetch(`/api/documents/status/${status}`);
          const documents = await response.json();
          updateDocumentList(documents);
      } catch (error) {
          console.error('Error:', error);
      }
  }

function updateDocumentList(documents) {
    documentList.innerHTML = '';
    documents.forEach(doc => {
        const row = `
            <tr>
                <td>${doc.docNumber}</td>
                <td><a href="/uploads/${doc.category}/${doc.docNumber}/sent/${doc.docName}" target="_blank">${doc.docName}</a></td>
                <td>${doc.revision}</td>
                <td>${new Date(doc.dueDate).toLocaleDateString()}</td>
                <td>${doc.code}</td>
                <td>${doc.status}</td>
                <td>${doc.submissionDate ? new Date(doc.submissionDate).toLocaleDateString() : '-'}</td>
                <td>${doc.receivedDate ? new Date(doc.receivedDate).toLocaleDateString() : '-'}</td>
                <td>${doc.delay || '-'}</td>
            </tr>
        `;
        documentList.innerHTML += row;
    });
}

  async function updateStatusCounts() {
      try {
          const response = await fetch('/api/documents');
          const documents = await response.json();
          const counts = {
              'Pending Submission': 0,
              'Awaiting Approval': 0,
              'Approved': 0,
              'Rejected': 0
          };

          documents.forEach(doc => {
              counts[doc.status] = (counts[doc.status] || 0) + 1;
          });

          statusBoxes.forEach(box => {
              const status = box.querySelector('h3').textContent;
              const count = counts[status] || 0;
              const total = documents.length;
              box.querySelector('p').textContent = `${count} out of ${total}`;
              const progressBar = box.querySelector('.progress');
              progressBar.style.width = `${(count / total) * 100}%`;
          });
      } catch (error) {
          console.error('Error:', error);
      }
  }

  updateStatusCounts();
});
