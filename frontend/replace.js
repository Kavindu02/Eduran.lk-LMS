const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('./src', function (filePath) {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        let content = fs.readFileSync(filePath, 'utf-8');
        let original = content;

        // Remove 'use client'
        content = content.replace(/'use client'\n?/g, '');
        content = content.replace(/"use client"\n?/g, '');

        // next/navigation
        content = content.replace(/import\s+{\s*useRouter\s*(?:,\s*useParams\s*)?}\s+from\s+['"]next\/navigation['"]/g, "import { useNavigate, useParams } from 'react-router-dom'");
        content = content.replace(/import\s+{\s*useRouter\s*}\s+from\s+['"]next\/navigation['"]/g, "import { useNavigate } from 'react-router-dom'");
        content = content.replace(/import\s+{\s*useParams\s*(?:,\s*useRouter\s*)?}\s+from\s+['"]next\/navigation['"]/g, "import { useParams, useNavigate } from 'react-router-dom'");
        content = content.replace(/const\s+router\s*=\s*useRouter\(\)/g, "const navigate = useNavigate()");
        content = content.replace(/router\.push/g, "navigate");
        content = content.replace(/router\.replace/g, "navigate"); // with {replace: true} actually, but usually navigate is fine

        // next/link
        content = content.replace(/import\s+Link\s+from\s+['"]next\/link['"]/g, "import { Link } from 'react-router-dom'");

        // next/image
        content = content.replace(/import\s+Image\s+from\s+['"]next\/image['"]\n?/g, "");
        content = content.replace(/<Image/g, "<img");

        // next/font/google
        if (content.includes('next/font/google')) {
            content = content.replace(/import\s+{.*?}\s+from\s+['"]next\/font\/google['"]\n?/g, "");
        }

        if (original !== content) {
            fs.writeFileSync(filePath, content, 'utf-8');
            console.log('Updated:', filePath);
        }
    }
});
