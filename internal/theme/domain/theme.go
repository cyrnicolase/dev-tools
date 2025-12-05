package domain

const (
	// DefaultTheme 默认主题
	DefaultTheme = "dark"
	// ThemeLight 浅色主题
	ThemeLight = "light"
	// ThemeDark 深色主题
	ThemeDark = "dark"
)

// ValidThemes 有效的主题列表
var ValidThemes = []string{ThemeLight, ThemeDark}

// ValidateTheme 验证主题值
// 如果主题无效，返回默认主题
func ValidateTheme(theme string) string {
	if theme == ThemeLight || theme == ThemeDark {
		return theme
	}
	return DefaultTheme
}

// IsValidTheme 检查主题值是否有效
func IsValidTheme(theme string) bool {
	return theme == ThemeLight || theme == ThemeDark
}
