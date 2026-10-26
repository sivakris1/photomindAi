import React, { useState, useEffect } from "react";
import Navbar from "./components/NavBar.jsx";
import SearchBar from "./components/SearchBar.jsx";
import PhotoCard from "./components/PhotoCard.jsx";
import UploadModal from "./components/UploadModal.jsx";
import {
  fetchPhotos,
  uploadPhoto,
  searchPhotos,
  findSimilarPhotos,
  deletePhoto,
} from "./api/api";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import "./App.css";

export default function App() {
  const [photos, setPhotos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeQuery, setActiveQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loadGallery = async () => {
    try {
      setIsLoading(true);
      setErrorMsg("");
      const data = await fetchPhotos();
      setPhotos(data);
      setActiveQuery("");
    } catch (error) {
      console.error("Failed to load photos:", error);
      setErrorMsg(
        "Could not connect to the backend server. Make sure node server.js is running.",
      );
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(()=>{
    loadGallery();
  },[])

   const handleSearch = async (query) => {
    try {
      setIsSearching(true);
      setErrorMsg('');
      setActiveQuery(query);
      const results = await searchPhotos(query);
      setPhotos(results);
    } catch (err) {
      console.error('Search failed:', err);
      setErrorMsg('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    loadGallery();
  }

  const handleFindSimilar = async(photoId, photoTitle) => {
    try {
        setIsSearching(true);
        setActiveQuery(`similar to ${photoTitle || 'selected photo'}`);
        const results = await findSimilarPhotos(photoId);
        setPhotos(results);
    } catch (err) {
      console.error('Similarity search failed:', err);
      setErrorMsg('Failed to find similar photos.');
    } finally {
      setIsSearching(false);
    }
  }

  const handleUpload = async(file, title) => {
    try {
        setIsLoading(true);
        setErrorMsg('')
        await uploadPhoto(file, title);
        await loadGallery();
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsUploading(false);
    }
  }


  const handleDelete = async(photoId) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;

    try {
        await deletePhoto(photoId);
        setPhotos((prev) => prev.filter((p) => p._id !== photoId));
    } catch (error) {
        console.error('Delete failed:', err);
      alert('Failed to delete photo.');
    }
  }

   return (
    <div className="app-container">
      {/* Navbar with brand & Upload button */}
      <Navbar onOpenUpload={() => setIsUploadOpen(true)} />
      {/* Main Content */}
      <main className="main-content">
        {/* Search Hero Area */}
        <section className="hero-section">
          <h2>Find photos using pure meaning</h2>
          <p className="hero-subtitle">
            Powered by OpenAI CLIP neural vectors. Search objects, concepts, or scenes.
          </p>
          <SearchBar
            onSearch={handleSearch}
            onClear={handleClearSearch}
            isLoading={isSearching}
          />
        </section>
        {/* Error message if server is offline */}
        {errorMsg && <div className="error-banner">{errorMsg}</div>}
        {/* Gallery Status Header */}
        <div className="gallery-header">
          <div className="status-indicator">
            {activeQuery ? (
              <h3>
                Search Results for: <span>"{activeQuery}"</span> ({photos.length})
              </h3>
            ) : (
              <h3>
                All Photos <span>({photos.length})</span>
              </h3>
            )}
          </div>
          {activeQuery && (
            <button className="btn-link" onClick={handleClearSearch}>
              View All Photos
            </button>
          )}
        </div>
        {/* Photo Grid */}
        {isLoading ? (
          <div className="loading-state">
            <Loader2 size={36} className="spinner" />
            <p>Loading photo gallery...</p>
          </div>
        ) : photos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <ImageIcon size={48} />
            </div>
            <h4>{activeQuery ? 'No matching photos found' : 'No photos uploaded yet'}</h4>
            <p>
              {activeQuery
                ? 'Try a different search prompt like "certificate", "dog", or "landscape".'
                : 'Click the "Upload Photo" button in the top right to index your first image!'}
            </p>
          </div>
        ) : (
          <div className="photo-grid">
            {photos.map((photo) => (
              <PhotoCard
                key={photo._id}
                photo={photo}
                onDelete={handleDelete}
                onFindSimilar={handleFindSimilar}
              />
            ))}
          </div>
        )}
      </main>
      {/* Upload Popup Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUpload}
        isUploading={isUploading}
      />
    </div>
  );
}
