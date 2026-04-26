/**
 * Image Uploader Component - Vanilla JS
 * Usage: new ImageUploader({ container, onFileSelect, currentImageUrl, label })
 */

class ImageUploader {
  constructor({
    container,
    onFileSelect,
    currentImageUrl = null,
    label = 'Upload Image',
  } = {}) {
    this.container = container;
    this.onFileSelect = onFileSelect;
    this.currentImageUrl = currentImageUrl;
    this.label = label;
    this.preview = currentImageUrl || null;
    this.dragging = false;
    this.fileInput = null;
    this.render();
  }

  render() {
    const zone = document.createElement('div');
    zone.className = 'image-uploader-zone';
    if (this.preview) zone.classList.add('has-image');

    zone.style.cssText = `
      border: 2px dashed ${this.dragging ? '#f5a623' : 'rgba(255,255,255,0.12)'};
      background: ${this.dragging ? 'rgba(245,166,35,0.06)' : 'rgba(255,255,255,0.02)'};
    `;

    if (this.preview) {
      zone.innerHTML = `
        <img src="${this.preview}" style="width: 100%; height: 140px; object-fit: cover;" alt="preview">
        <button type="button" class="image-uploader-remove" style="
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(0,0,0,0.7);
          border: none;
          border-radius: 6px;
          color: white;
          padding: 4px 10px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
        ">✕ Remove</button>
      `;

      const removeBtn = zone.querySelector('.image-uploader-remove');
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.preview = null;
        this.onFileSelect?.(null);
        this.render();
        if (this.container) this.container.innerHTML = '';
        this.render();
      });
    } else {
      zone.innerHTML = `
        <div style="font-size: 32px;">📸</div>
        <div style="color: #f0f2f8; font-weight: 600; font-size: 14px;">${this.label}</div>
        <div style="color: #6b7280; font-size: 12px;">Drag & drop or click to browse</div>
        <button type="button" style="
          margin-top: 4px;
          background: rgba(245,166,35,0.12);
          color: #f5a623;
          border: 1px solid rgba(245,166,35,0.3);
          border-radius: 8px;
          padding: 6px 16px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
        ">Browse Files</button>
        <div style="color: #4b5563; font-size: 11px;">PNG, JPG, WEBP · Max 5MB</div>
      `;

      const browseBtn = zone.querySelector('button');
      browseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.fileInput.click();
      });

      zone.addEventListener('click', () => !this.preview && this.fileInput.click());
    }

    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dragging = true;
      zone.style.borderColor = '#f5a623';
      zone.style.background = 'rgba(245,166,35,0.06)';
    });

    zone.addEventListener('dragleave', () => {
      this.dragging = false;
      zone.style.borderColor = 'rgba(255,255,255,0.12)';
      zone.style.background = 'rgba(255,255,255,0.02)';
    });

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dragging = false;
      zone.style.borderColor = 'rgba(255,255,255,0.12)';
      zone.style.background = 'rgba(255,255,255,0.02)';
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        this.handleFile(file);
      }
    });

    // File input
    this.fileInput = document.createElement('input');
    this.fileInput.type = 'file';
    this.fileInput.accept = 'image/*';
    this.fileInput.hidden = true;
    this.fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) this.handleFile(file);
    });

    if (this.container) {
      this.container.innerHTML = '';
      this.container.appendChild(zone);
      this.container.appendChild(this.fileInput);
    }

    this.zone = zone;
  }

  handleFile(file) {
    if (!file.type.startsWith('image/')) return;
    this.preview = URL.createObjectURL(file);
    this.onFileSelect?.(file);
    this.render();
  }

  getFile() {
    return this.fileInput.files[0] || null;
  }

  setPreview(url) {
    this.preview = url;
    this.render();
  }
}

export default ImageUploader;
