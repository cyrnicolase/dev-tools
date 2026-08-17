package domain

import "github.com/pkg/errors"

const (
	// MaxToolHistoryItems 每个工具的最大历史记录条数
	MaxToolHistoryItems = 50
)

// ToolHistoryRecord 工具历史记录
type ToolHistoryRecord struct {
	ID        string            `json:"id"`
	ToolID    string            `json:"toolId"`
	Action    string            `json:"action"`
	CreatedAt int64             `json:"createdAt"`
	Input     map[string]string `json:"input"`
	Output    map[string]string `json:"output"`
}

// Validate 校验历史记录
func (r ToolHistoryRecord) Validate() error {
	if r.ID == "" || r.ToolID == "" || r.Action == "" {
		return errors.WithStack(ErrInvalidToolHistoryRecord)
	}
	if r.CreatedAt <= 0 {
		return errors.WithStack(ErrInvalidToolHistoryRecord)
	}
	if r.Input == nil || r.Output == nil {
		return errors.WithStack(ErrInvalidToolHistoryRecord)
	}
	return nil
}
