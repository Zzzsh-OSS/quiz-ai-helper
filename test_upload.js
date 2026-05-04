const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testUpload() {
    const formData = new FormData();
    formData.append('file', fs.createReadStream('test_data.txt'));

    try {
        const response = await axios.post('http://localhost:3000/upload', formData, {
            headers: {
                ...formData.getHeaders()
            }
        });
        console.log('上传成功:', response.data);
    } catch (error) {
        console.error('上传失败:', error.response?.data || error.message);
        console.error('状态码:', error.response?.status);
        console.error('响应头:', error.response?.headers);
    }
}

testUpload();