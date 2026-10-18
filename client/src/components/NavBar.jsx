import React from 'react';
import { Sparkles, Plus } from 'lucide-react';

const NavBar = () => {
  return (
      <header className="navbar">
      <div className="nav-brand">
        <div className="logo-icon">
          <Sparkles size={22} className="sparkle-anim" />
        </div>
        <div>
          <h1>PhotoMind AI</h1>
          <p className="subtitle">Semantic Image Search Engine</p>
        </div>
      </div>
      <button className="btn-primary" onClick={onOpenUpload}>
        <Plus size={18} />
        <span>Upload Photo</span>
      </button>
    </header>
  )
}

export default NavBar
