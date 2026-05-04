const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const pdf = require('pdf-parse');

const app = express();
const PORT = process.env.PORT || 3000;

// 确保 uploads 文件夹存在
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('创建 uploads 文件夹');
}

// 请求日志中间件
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 解析 JSON 请求体
app.use(express.json());

// 配置 multer 存储
const upload = multer({ dest: 'uploads/' });

// 根路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 文件上传和处理路由
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        console.log('收到文件上传请求');
        console.log('文件信息:', req.file);

        if (!req.file) {
            return res.status(400).json({ error: '没有上传文件' });
        }

        // 读取上传的临时文件
        const dataBuffer = fs.readFileSync(req.file.path);

        // 根据文件扩展名选择解析方式
        const fileName = req.file.originalname;
        const dotIndex = fileName.lastIndexOf('.');
        const fileExtension = dotIndex === -1 ? '' : fileName.substring(dotIndex + 1).toLowerCase();

        console.log('文件名:', fileName);
        console.log('文件扩展名:', fileExtension);

        let extractedText = '';

        if (fileExtension === 'pdf') {
            console.log('开始解析 PDF 文件...');
            try {
                const data = await pdf(dataBuffer);
                extractedText = data.text;
                console.log('PDF 解析成功，文本长度:', extractedText.length);
            } catch (pdfError) {
                console.error('PDF 解析失败:', pdfError);
                return res.status(500).json({ error: 'PDF 解析失败: ' + pdfError.message });
            }
        } else if (fileExtension === 'txt') {
            console.log('开始读取 TXT 文件...');
            extractedText = dataBuffer.toString('utf-8');
            console.log('TXT 文件读取成功，文本长度:', extractedText.length);
        } else {
            console.log('不支持的文件类型:', fileExtension);
            return res.status(400).json({ error: '不支持的文件类型' });
        }

        // 生成题目（可以基于提取的文本内容生成，或者返回测试题目）
        // 这里先返回修复后的测试题目
        const testQuestions = {
            questions: [
                {
                    question: 'MySQL 中，哪个数据类型用于存储整数？',
                    type: 'multiple_choice',
                    options: ['VARCHAR', 'INT', 'TEXT', 'DATE'],
                    correct_answer: 'B',  // 修复：使用选项字母而不是选项内容
                    explanation: 'INT 是 MySQL 中的整数数据类型，用于存储标准整数值。'
                },
                {
                    question: 'MySQL 默认的存储引擎是 InnoDB。',
                    type: 'true_false',
                    correct_answer: '正确',
                    explanation: '从 MySQL 5.5 版本开始，InnoDB 成为默认的存储引擎，支持事务和外键约束。'
                },
                {
                    question: 'SQL 中用于查询数据的关键字是什么？',
                    type: 'multiple_choice',
                    options: ['INSERT', 'UPDATE', 'SELECT', 'DELETE'],
                    correct_answer: 'C',  // 修复：使用选项字母而不是选项内容
                    explanation: 'SELECT 关键字用于从数据库表中查询数据。'
                },
                {
                    question: '索引可以减慢数据查询速度。',
                    type: 'true_false',
                    correct_answer: '错误',
                    explanation: '索引的作用是加速数据查询，虽然会减慢插入、更新和删除操作的速度。'
                },
                {
                    question: '请简述 MySQL 中事务的 ACID 特性。',
                    type: 'short_answer',
                    correct_answer: 'Atomicity（原子性）、Consistency（一致性）、Isolation（隔离性）、Durability（持久性）',
                    explanation: '原子性：事务是不可分割的工作单位；一致性：事务执行前后数据状态一致；隔离性：多个事务相互隔离；持久性：事务提交后数据永久保存。'
                }
            ]
        };

        res.json(testQuestions);

    } catch (error) {
        console.error('处理文件时出错:', error);
        res.status(500).json({ error: error.message });
    } finally {
        // 处理完删除临时文件，避免堆积
        if (req.file) {
            fs.unlink(req.file.path, () => {});
        }
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});