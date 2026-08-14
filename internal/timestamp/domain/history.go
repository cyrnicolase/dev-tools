package domain

import "github.com/pkg/errors"

const (
	// HistoryTypeTimestampToTime 时间戳转时间
	HistoryTypeTimestampToTime = "timestamp_to_time"
	// HistoryTypeTimeToTimestamp 时间转时间戳
	HistoryTypeTimeToTimestamp = "time_to_timestamp"
	// MaxHistoryItems 最大历史条数
	MaxHistoryItems = 50
)

var validHistoryTypes = map[string]struct{}{
	HistoryTypeTimestampToTime: {},
	HistoryTypeTimeToTimestamp: {},
}

// HistoryRecord 历史记录
type HistoryRecord struct {
	ID        string            `json:"id"`
	Type      string            `json:"type"`
	Format    string            `json:"format"`
	Timezone  string            `json:"timezone"`
	CreatedAt int64             `json:"createdAt"`
	Input     map[string]string `json:"input"`
	Output    map[string]string `json:"output"`
}

// Validate 校验历史记录
func (r HistoryRecord) Validate() error {
	if r.ID == "" {
		return errors.WithStack(ErrInvalidHistoryRecord)
	}
	if _, exists := validHistoryTypes[r.Type]; !exists {
		return errors.WithStack(ErrInvalidHistoryRecord)
	}
	if r.CreatedAt <= 0 {
		return errors.WithStack(ErrInvalidHistoryRecord)
	}
	if r.Format == "" || r.Timezone == "" {
		return errors.WithStack(ErrInvalidHistoryRecord)
	}
	if r.Input == nil || r.Output == nil {
		return errors.WithStack(ErrInvalidHistoryRecord)
	}
	return nil
}
