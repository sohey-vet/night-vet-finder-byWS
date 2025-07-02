#!/bin/bash
# WSL環境用Claude Code診断スクリプト

echo "=== Claude Code WSL診断 ==="
echo

# バージョン確認
echo "✓ Claude Codeバージョン: $(claude --version)"

# API キー確認  
if [ -n "$ANTHROPIC_API_KEY" ]; then
    echo "✓ API キー: 設定済み"
else
    echo "❌ API キー: 未設定"
    echo "   設定方法: export ANTHROPIC_API_KEY=your_key_here"
fi

# 設定ファイル確認
if [ -f ~/.claude.json ]; then
    echo "✓ 設定ファイル: 存在"
    echo "   場所: ~/.claude.json"
else
    echo "❌ 設定ファイル: 見つからない"
fi

# Node.js確認
if command -v node >/dev/null 2>&1; then
    echo "✓ Node.js: $(node --version)"
else
    echo "❌ Node.js: インストールされていない"
fi

# WSL環境確認
if grep -q Microsoft /proc/version 2>/dev/null; then
    echo "✓ WSL環境を検出"
    echo "   注意: claude doctorコマンドはWSLでは制限があります"
else
    echo "✓ Linux環境"
fi

# プロジェクト確認
if [ -d ".git" ]; then
    echo "✓ Gitリポジトリ: 検出"
    echo "   ブランチ: $(git branch --show-current 2>/dev/null || echo '不明')"
else
    echo "❌ Gitリポジトリ: 見つからない"
fi

echo
echo "=== 診断完了 ==="