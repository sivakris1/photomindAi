import React, { useState, useRef } from 'react';
import { X, UploadCloud, Loader2, Image as ImageIcon } from 'lucide-react';

export default function UploadModal({ isOpen, onClose, onUpload, isUploading }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [title, setTitle] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      if (!title) {
        // Default title to original file name without extension
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    await onUpload(selectedFile, title);
    handleClose();
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setTitle('');
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Upload Photo to AI Index</h3>
          <button className="btn-icon" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Dropzone */}
          <div
            className={`dropzone ${previewUrl ? 'has-preview' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/webp"
              style={{ display: 'none' }}
            />

            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="preview-image" />
            ) : (
              <div className="dropzone-placeholder">
                <UploadCloud size={42} className="upload-icon" />
                <p>Click or drag & drop an image here</p>
                <span>Supports JPG, PNG, WEBP (Max 10MB)</span>
              </div>
            )}
          </div>

          {/* Title Input */}
          <div className="form-group">
            <label htmlFor="photo-title">Photo Title (Optional)</label>
            <input
              id="photo-title"
              type="text"
              placeholder="e.g. Skilldzire Certificate, Trip to Beach..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isUploading}
            />
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!selectedFile || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 size={18} className="spinner" />
                  <span>AI Generating Vector...</span>
                </>
              ) : (
                <>
                  <ImageIcon size={18} />
                  <span>Upload & Index</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}