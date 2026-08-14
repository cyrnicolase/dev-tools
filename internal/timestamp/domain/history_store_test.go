package domain

import (
	"database/sql"
	"fmt"
	"path/filepath"
	"testing"
)

func setupTestHistoryStore(t *testing.T) *HistoryStore {
	t.Helper()

	originOpenHistoryDB := openHistoryDB
	dbPath := filepath.Join(t.TempDir(), "history-test.db")

	openHistoryDB = func() (*sql.DB, error) {
		return sql.Open("sqlite", dbPath)
	}

	store, err := NewHistoryStore()
	if err != nil {
		openHistoryDB = originOpenHistoryDB
		t.Fatalf("NewHistoryStore() error = %v", err)
	}

	t.Cleanup(func() {
		_ = store.db.Close()
		openHistoryDB = originOpenHistoryDB
	})

	return store
}

func buildHistoryRecord(id string, createdAt int64) HistoryRecord {
	return HistoryRecord{
		ID:        id,
		Type:      HistoryTypeTimestampToTime,
		Format:    "DateTime",
		Timezone:  "Asia/Shanghai",
		CreatedAt: createdAt,
		Input: map[string]string{
			"timestamp": "1730000000",
			"unit":      "second",
		},
		Output: map[string]string{
			"timeString": "2024-10-27 03:46:40",
		},
	}
}

func TestHistoryStoreAddAndListWithLimit(t *testing.T) {
	store := setupTestHistoryStore(t)

	for i := 0; i < 55; i++ {
		record := buildHistoryRecord(fmt.Sprintf("id-%d", i), int64(1000+i))
		if _, err := store.Add(record); err != nil {
			t.Fatalf("Add() error = %v", err)
		}
	}

	items, err := store.List()
	if err != nil {
		t.Fatalf("List() error = %v", err)
	}

	if got, want := len(items), MaxHistoryItems; got != want {
		t.Fatalf("len(items) = %d, want %d", got, want)
	}

	if got, want := items[0].ID, "id-54"; got != want {
		t.Fatalf("items[0].ID = %s, want %s", got, want)
	}

	if got, want := items[len(items)-1].ID, "id-5"; got != want {
		t.Fatalf("items[last].ID = %s, want %s", got, want)
	}
}

func TestHistoryStoreAddInvalidRecord(t *testing.T) {
	store := setupTestHistoryStore(t)

	invalid := HistoryRecord{
		ID:        "invalid",
		Type:      "unsupported",
		Format:    "DateTime",
		Timezone:  "Asia/Shanghai",
		CreatedAt: 1,
		Input:     map[string]string{"timestamp": "1"},
		Output:    map[string]string{"timeString": "x"},
	}

	if _, err := store.Add(invalid); err == nil {
		t.Fatalf("Add() expected error, got nil")
	}
}

func TestHistoryStoreClear(t *testing.T) {
	store := setupTestHistoryStore(t)

	if _, err := store.Add(buildHistoryRecord("id-1", 1)); err != nil {
		t.Fatalf("Add() error = %v", err)
	}

	if err := store.Clear(); err != nil {
		t.Fatalf("Clear() error = %v", err)
	}

	items, err := store.List()
	if err != nil {
		t.Fatalf("List() error = %v", err)
	}
	if len(items) != 0 {
		t.Fatalf("len(items) = %d, want 0", len(items))
	}
}
