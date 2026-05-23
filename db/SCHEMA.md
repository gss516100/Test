# Initial Database Schema Outline

This file outlines core tables for the Stock Manager application.

Tables:

- users: id, email, name, password_hash, google_id, created_at, updated_at
- stocks: id, symbol, exchange, name, metadata (jsonb)
- watchlists: id, user_id, name, created_at
- watchlist_items: id, watchlist_id, stock_id
- portfolios: id, user_id, name, created_at
- positions: id, portfolio_id, stock_id, quantity, avg_price
- transactions: id, portfolio_id, stock_id, type, quantity, price, date
- alerts: id, user_id, target_type (stock/watchlist/portfolio), target_id, condition (jsonb), channels (jsonb), active
- reports: id, user_id, type, parameters (jsonb), s3_key, generated_at

Use PostgreSQL with appropriate indexes on foreign keys and time-series partitions for price data.
