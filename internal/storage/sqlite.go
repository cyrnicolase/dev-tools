package storage

import (
	"database/sql"
	"os"
	"path/filepath"

	"github.com/cyrnicolase/dev-tools/internal/config"
	"github.com/pkg/errors"
	_ "modernc.org/sqlite"
)

const (
	// historyDBFileName 历史数据库文件名
	historyDBFileName = "history.db"
)

// OpenHistoryDB 打开历史数据库
func OpenHistoryDB() (*sql.DB, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return nil, errors.WithStack(err)
	}

	dbDirPath := filepath.Join(homeDir, config.AppConfigDirName)
	if err := os.MkdirAll(dbDirPath, config.AppConfigDirMode); err != nil {
		return nil, errors.WithStack(err)
	}

	dbPath := filepath.Join(dbDirPath, historyDBFileName)
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, errors.WithStack(err)
	}
	// SQLite 在桌面本地场景下使用单连接更稳定，可避免并发写入时出现锁冲突。
	db.SetMaxOpenConns(1)
	db.SetMaxIdleConns(1)

	if err := db.Ping(); err != nil {
		_ = db.Close()
		return nil, errors.WithStack(err)
	}

	return db, nil
}
