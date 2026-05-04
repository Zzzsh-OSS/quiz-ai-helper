const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const pdf = require('pdf-parse');

const app = express();
const port = 3000;

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log('创建 uploads 文件夹');
}

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        console.log('收到文件上传请求');
        console.log('文件信息:', req.file);
        
        if (!req.file) {
            return res.status(400).json({ error: '没有上传文件' });
        }

        const dataBuffer = fs.readFileSync(req.file.path);
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
            extractedText = dataBuffer.toString('utf-8');
            console.log('TXT 文件读取成功，文本长度:', extractedText.length);
        } else {
            return res.status(400).json({ error: '不支持的文件类型' });
        }

        // 返回测试题目
        const testQuestions = {
            questions: [
                {
                    question: 'MySQL 中，哪个数据类型用于存储整数？',
                    type: 'multiple_choice',
                    options: ['VARCHAR', 'INT', 'TEXT', 'DATE'],
                    correct_answer: 'B',
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
                    correct_answer: 'C',
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
        if (req.file) {
            fs.unlink(req.file.path, () => {});
        }
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});