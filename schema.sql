-- Blog posts table for Turso database
-- This table stores both drafts and published blog posts
-- ACTUAL SCHEMA - matches production Turso database

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  categorie TEXT NOT NULL,
  tags TEXT, -- JSON as string
  status TEXT NOT NULL CHECK (status IN ('PUBLISHED', 'DRAFT')),
  featuredImage TEXT,
  authorId TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

-- Index for faster queries on published posts
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);

-- Index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);

-- Index for author queries
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(authorId);
