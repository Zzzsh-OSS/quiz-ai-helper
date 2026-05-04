const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testPDFUpload() {
    const formData = new FormData();
    const filePath = 'test_data.txt'; // 先用 txt 文件测试
    console.log('文件路径:', filePath);
    console.log('文件是否存在:', fs.existsSync(filePath));

    const fileStats = fs.statSync(filePath);
    console.log('文件大小:', fileStats.size, 'bytes');

    formData.append('file', fs.createReadStream(filePath));

    console.log('表单数据内容类型:', formData.getHeaders()['content-type']);

    try {
        console.log('开始发送请求...');
        const response = await axios.post('http://localhost:3000/upload', formData, {
            headers: {
                ...formData.getHeaders()
            }
        });
        console.log('上传成功!');
        console.log('返回的题目数量:', response.data.questions?.length);
        console.log('第一题:', JSON.stringify(response.data.questions?.[0], null, 2));
    } catch (error) {
        console.error('上传失败:', error.response?.data || error.message);
        console.error('状态码:', error.response?.status);
        if (error.response?.data) {
            console.error('错误详情:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testPDFUpload();