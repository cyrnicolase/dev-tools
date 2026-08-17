package domain

import (
	"database/sql"
	"fmt"
	"path/filepath"
	"testing"
)

func setupTestToolHistoryStore(t *testing.T) *ToolHistoryStore {
	t.Helper()

	originOpenHistoryDB := openHistoryDB
	dbPath := filepath.Join(t.TempDir(), "tool-history-test.db")

	openHistoryDB = func() (*sql.DB, error) {
		return sql.Open("sqlite", dbPath)
	}

	store, err := NewToolHistoryStore()
	if err != nil {
		openHistoryDB = originOpenHistoryDB
		t.Fatalf("NewToolHistoryStore() error = %v", err)
	}

	t.Cleanup(func() {
		_ = store.db.Close()
		openHistoryDB = originOpenHistoryDB
	})

	return store
}

func buildToolHistoryRecord(toolID, id string, createdAt int64) ToolHistoryRecord {
	return ToolHistoryRecord{
		ID:        id,
		ToolID:    toolID,
		Action:    "test_action",
		CreatedAt: createdAt,
		Input: map[string]string{
			"input": "value",
		},
		Output: map[string]string{
			"output": "value",
		},
	}
}

func TestToolHistoryStoreAddAndListWithLimit(t *testing.T) {
	store := setupTestToolHistoryStore(t)

	for i := 0; i < 55; i++ {
		record := buildToolHistoryRecord("base64", fmt.Sprintf("id-%d", i), int64(1000+i))
		if _, err := store.Add(record); err != nil {
			t.Fatalf("Add() error = %v", err)
		}
	}

	items, err := store.List("base64")
	if err != nil {
		t.Fatalf("List() error = %v", err)
	}

	if got, want := len(items), MaxToolHistoryItems; got != want {
		t.Fatalf("len(items) = %d, want %d", got, want)
	}

	if got, want := items[0].ID, "id-54"; got != want {
		t.Fatalf("items[0].ID = %s, want %s", got, want)
	}

	if got, want := items[len(items)-1].ID, "id-5"; got != want {
		t.Fatalf("items[last].ID = %s, want %s", got, want)
	}
}

func TestToolHistoryStoreIsolationByTool(t *testing.T) {
	store := setupTestToolHistoryStore(t)

	for i := 0; i < 5; i++ {
		if _, err := store.Add(buildToolHistoryRecord("base64", fmt.Sprintf("b-%d", i), int64(100+i))); err != nil {
			t.Fatalf("Add(base64) error = %v", err)
		}
		if _, err := store.Add(buildToolHistoryRecord("uuid", fmt.Sprintf("u-%d", i), int64(200+i))); err != nil {
			t.Fatalf("Add(uuid) error = %v", err)
		}
	}

	base64Items, err := store.List("base64")
	if err != nil {
		t.Fatalf("List(base64) error = %v", err)
	}
	uuidItems, err := store.List("uuid")
	if err != nil {
		t.Fatalf("List(uuid) error = %v", err)
	}

	if len(base64Items) != 5 || len(uuidItems) != 5 {
		t.Fatalf("unexpected lengths: base64=%d uuid=%d", len(base64Items), len(uuidItems))
	}
}

func TestToolHistoryStoreClear(t *testing.T) {
	store := setupTestToolHistoryStore(t)

	if _, err := store.Add(buildToolHistoryRecord("hash", "id-1", 1)); err != nil {
		t.Fatalf("Add() error = %v", err)
	}

	if err := store.Clear("hash"); err != nil {
		t.Fatalf("Clear() error = %v", err)
	}

	items, err := store.List("hash")
	if err != nil {
		t.Fatalf("List() error = %v", err)
	}
	if len(items) != 0 {
		t.Fatalf("len(items) = %d, want 0", len(items))
	}
}
