const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const port = 3000;

// Middleware để xử lý dữ liệu JSON
app.use(express.json());

// Định nghĩa thư mục để lưu các file txt
const filesDir = path.join(__dirname, 'files');
if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir);
}

// Các API proxy cần lấy dữ liệu
const proxyAPIs = [
    'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks5.txt',
    'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/http.txt',
    'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/socks4.txt', 
    'https://www.proxy-list.download/api/v1/get?type=socks5',
    'https://www.proxy-list.download/api/v1/get?type=socks4',
    'https://api.proxyscrape.com/?request=displayproxies&proxytype=socks4&country=all'
];

// API endpoint để tự động lấy proxy từ các nguồn và trả về nội dung file txt
app.get('/api/proxy', async (req, res) => {
    try {
        let allProxies = [];

        // Lặp qua từng URL để lấy dữ liệu
        for (let url of proxyAPIs) {
            try {
                const response = await axios.get(url);
                const proxies = response.data.split('\n').filter(proxy => proxy); // Chia nhỏ và loại bỏ các dòng trống
                allProxies = allProxies.concat(proxies); // Gộp tất cả proxy vào mảng
            } catch (error) {
                console.log(`Không thể lấy dữ liệu từ ${url}:`, error.message);
            }
        }

        // Chọn một proxy ngẫu nhiên từ danh sách
        const randomProxy = allProxies[Math.floor(Math.random() * allProxies.length)];

        // Tạo tên file ngẫu nhiên
        const fileName = `${crypto.randomBytes(16).toString('hex')}.txt`;
        const filePath = path.join(filesDir, fileName);

        // Lưu nội dung vào file txt
        fs.writeFileSync(filePath, allProxies.join('\n')); // Lưu tất cả proxy vào file

        // Tạo phản hồi dưới dạng JSON
        const message = 'File đã được tạo';
        const link = `https://a8590416-ddb6-4a67-8f2c-83f61098ee23-00-2sshc47cxz3a9.kirk.replit.dev/files/${fileName}`;

        // Trả về thông tin và proxy ngẫu nhiên dưới dạng JSON
        res.json({ message: message, link: link, randomProxy: randomProxy });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi xử lý yêu cầu' });
    }
});

// Middleware để phục vụ file tĩnh trong thư mục "files"
app.use('/files', express.static(filesDir));

// Bắt đầu server
app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});
