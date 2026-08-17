package domain

import (
	"database/sql"
	"encoding/json"

	"github.com/cyrnicolase/dev-tools/internal/storage"
	"github.com/pkg/errors"
)

const createToolHistoryTableSQL = `
CREATE TABLE IF NOT EXISTS tool_history (
  id TEXT PRIMARY KEY,
  tool_id TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  input_json TEXT NOT NULL,
  output_json TEXT NOT NULL
);
`

var openHistoryDB = storage.OpenHistoryDB

// ToolHistoryStore 工具历史存储
type ToolHistoryStore struct {
	db *sql.DB
}

// NewToolHistoryStore 创建工具历史存储
func NewToolHistoryStore() (*ToolHistoryStore, error) {
	db, err := openHistoryDB()
	if err != nil {
		return nil, errors.WithStack(err)
	}

	store := &ToolHistoryStore{db: db}
	if err := store.initTable(); err != nil {
		_ = db.Close()
		return nil, err
	}

	return store, nil
}

func (s *ToolHistoryStore) initTable() error {
	if _, err := s.db.Exec(createToolHistoryTableSQL); err != nil {
		return errors.WithStack(err)
	}
	return nil
}

// List 获取某个工具的历史记录
func (s *ToolHistoryStore) List(toolID string) ([]ToolHistoryRecord, error) {
	if toolID == "" {
		return nil, errors.WithStack(ErrInvalidToolHistoryRecord)
	}

	rows, err := s.db.Query(`
SELECT id, tool_id, action, created_at, input_json, output_json
FROM tool_history
WHERE tool_id = ?
ORDER BY rowid DESC
LIMIT ?
`, toolID, MaxToolHistoryItems)
	if err != nil {
		return nil, errors.WithStack(err)
	}
	defer rows.Close()

	items := make([]ToolHistoryRecord, 0, MaxToolHistoryItems)
	for rows.Next() {
		var (
			record     ToolHistoryRecord
			inputJSON  string
			outputJSON string
		)
		if err := rows.Scan(
			&record.ID,
			&record.ToolID,
			&record.Action,
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

// Add 添加工具历史记录
func (s *ToolHistoryStore) Add(record ToolHistoryRecord) ([]ToolHistoryRecord, error) {
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
INSERT OR REPLACE INTO tool_history (id, tool_id, action, created_at, input_json, output_json)
VALUES (?, ?, ?, ?, ?, ?)
`,
		record.ID,
		record.ToolID,
		record.Action,
		record.CreatedAt,
		string(inputJSON),
		string(outputJSON),
	); err != nil {
		return nil, errors.WithStack(err)
	}

	if _, err := s.db.Exec(`
DELETE FROM tool_history
WHERE tool_id = ?
  AND rowid NOT IN (
    SELECT rowid
    FROM tool_history
    WHERE tool_id = ?
    ORDER BY rowid DESC
    LIMIT ?
  )
`, record.ToolID, record.ToolID, MaxToolHistoryItems); err != nil {
		return nil, errors.WithStack(err)
	}

	return s.List(record.ToolID)
}

// Clear 清空某个工具的历史记录
func (s *ToolHistoryStore) Clear(toolID string) error {
	if toolID == "" {
		return errors.WithStack(ErrInvalidToolHistoryRecord)
	}
	if _, err := s.db.Exec("DELETE FROM tool_history WHERE tool_id = ?", toolID); err != nil {
		return errors.WithStack(err)
	}
	return nil
}
