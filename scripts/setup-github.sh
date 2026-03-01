#!/bin/bash
# GitHub仓库初始化脚本

set -e

echo "=== 能量管理应用 - GitHub仓库初始化 ==="
echo ""

# 检查git是否安装
if ! command -v git &> /dev/null; then
    echo "错误: git未安装"
    exit 1
fi

# 检查GitHub CLI是否安装
if ! command -v gh &> /dev/null; then
    echo "警告: GitHub CLI (gh) 未安装"
    echo "请访问 https://cli.github.com/ 安装"
fi

# 获取仓库名
echo "请输入GitHub仓库名 (例如: myusername/energy-app):"
read REPO_NAME

if [ -z "$REPO_NAME" ]; then
    echo "错误: 仓库名不能为空"
    exit 1
fi

# 初始化git仓库
if [ ! -d ".git" ]; then
    echo "初始化Git仓库..."
    git init
    git branch -M main
fi

# 添加所有文件
echo "添加文件到Git..."
git add .

# 提交
echo "创建初始提交..."
git commit -m "Initial commit: 能量管理应用 v1.0" || echo "已提交"

# 添加远程仓库
echo "添加远程仓库..."
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$REPO_NAME.git"

echo ""
echo "=== 设置完成 ==="
echo ""
echo "下一步操作:"
echo "1. 在GitHub上创建仓库: https://github.com/new"
echo "   仓库名: $(echo $REPO_NAME | cut -d'/' -f2)"
echo "   不要初始化README (已存在)"
echo ""
echo "2. 推送代码:"
echo "   git push -u origin main"
echo ""
echo "3. 创建Release触发APK构建:"
echo "   git tag v1.0.0"
echo "   git push origin v1.0.0"
echo ""
echo "4. 下载APK:"
echo "   访问 https://github.com/$REPO_NAME/releases"
echo ""
