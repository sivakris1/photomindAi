import React from 'react'
import { Trash2, Sparkles } from 'lucide-react';

export default function PhotoCard ({photo, onDelete, onFindSimilar})  {

     const imageUrl = photo.url.startsWith('http')
    ? photo.url
    : `http://localhost:5000${photo.url}`;

  return (
    <div className="photo-card">
      <div className="image-container">
        <img src={imageUrl} alt={photo.title} loading="lazy" />

        {/* Show Similarity Match Badge if photo came from an AI search */}
        
        {photo.similarityScore !== undefined && (
          <div className="match-badge">
            <Sparkles size={13} />
            <span>{photo.similarityScore}% Match</span>
          </div>
        )}
        
        {/* Hover overlay actions */}
        <div className="card-overlay">
          <button
            className="btn-similar"
            onClick={() => onFindSimilar(photo._id, photo.title)}
            title="Find photos visually similar to this"
          >
            <Sparkles size={14} />
            <span>Find Similar</span>
          </button>
          <button
            className="btn-delete"
            onClick={() => onDelete(photo._id)}
            title="Delete photo"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <div className="card-footer">
        <p className="photo-title" title={photo.title}>
          {photo.title || 'Untitled Photo'}
        </p>
        <span className="photo-date">
          {new Date(photo.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
