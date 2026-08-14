package domain

import (
	"database/sql"
	"encoding/json"

	"github.com/cyrnicolase/dev-tools/internal/storage"
	"github.com/pkg/errors"
)

const createHistoryTableSQL = `
CREATE TABLE IF NOT EXISTS timestamp (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  format TEXT NOT NULL,
  timezone TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  input_json TEXT NOT NULL,
  output_json TEXT NOT NULL
);
`

var openHistoryDB = storage.OpenHistoryDB

// HistoryStore 历史存储
type HistoryStore struct {
	db *sql.DB
}

// NewHistoryStore 创建历史存储
func NewHistoryStore() (*HistoryStore, error) {
	db, err := openHistoryDB()
	if err != nil {
		return nil, errors.WithStack(err)
	}

	store := &HistoryStore{db: db}
	if err := store.initTable(); err != nil {
		_ = db.Close()
		return nil, err
	}

	return store, nil
}

func (s *HistoryStore) initTable() error {
	if _, err := s.db.Exec(createHistoryTableSQL); err != nil {
		return errors.WithStack(err)
	}
	return nil
}

// List 获取历史记录列表
func (s *HistoryStore) List() ([]HistoryRecord, error) {
	rows, err := s.db.Query(`
SELECT id, type, format, timezone, created_at, input_json, output_json
FROM timestamp
ORDER BY rowid DESC
LIMIT ?
`, MaxHistoryItems)
	if err != nil {
		return nil, errors.WithStack(err)
	}
	defer rows.Close()

	items := make([]HistoryRecord, 0, MaxHistoryItems)
	for rows.Next() {
		var (
			record     HistoryRecord
			inputJSON  string
			outputJSON string
		)

		if err := rows.Scan(
			&record.ID,
			&record.Type,
			&record.Format,
			&record.Timezone,
			&record.CreatedAt,
			&inputJSON,
			&outputJSON,
		); err != nil {
			return nil, errors.WithStack(err)
		}

		if err := json.Unmarshal([]byte(inputJSON), &record.Input); err != nil {
			return nil, errors.WithStack(err)
		}
		if err := json.Unmarshal([]byte(outputJSON), &record.Output); err != nil {
			return nil, errors.WithStack(err)
		}

		items = append(items, record)
	}

	if err := rows.Err(); err != nil {
		return nil, errors.WithStack(err)
	}

	return items, nil
}

// Add 添加历史记录
func (s *HistoryStore) Add(record HistoryRecord) ([]HistoryRecord, error) {
	if err := record.Validate(); err != nil {
		return nil, err
	}

	inputJSON, err := json.Marshal(record.Input)
	if err != nil {
		return nil, errors.WithStack(err)
	}
	outputJSON, err := json.Marshal(record.Output)
	if err != nil {
		return nil, errors.WithStack(err)
	}

	if _, err := s.db.Exec(`
INSERT OR REPLACE INTO timestamp (id, type, format, timezone, created_at, input_json, output_json)
VALUES (?, ?, ?, ?, ?, ?, ?)
`,
		record.ID,
		record.Type,
		record.Format,
		record.Timezone,
		record.CreatedAt,
		string(inputJSON),
		string(outputJSON),
	); err != nil {
		return nil, errors.WithStack(err)
	}

	if _, err := s.db.Exec(`
DELETE FROM timestamp
WHERE rowid NOT IN (
  SELECT rowid
  FROM timestamp
  ORDER BY rowid DESC
  LIMIT ?
)
`, MaxHistoryItems); err != nil {
		return nil, errors.WithStack(err)
	}

	return s.List()
}

// Clear 清空历史记录
func (s *HistoryStore) Clear() error {
	if _, err := s.db.Exec("DELETE FROM timestamp"); err != nil {
		return errors.WithStack(err)
	}
	return nil
}
