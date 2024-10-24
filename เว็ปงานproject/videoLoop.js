const video = document.getElementById('background-video');

function setupVideo() {
    video.currentTime = 0; // เริ่มที่เวลา 0
    video.play(); // เริ่มเล่นวิดีโอ
}


// ฟังก์ชันเพื่อเล่นย้อนกลับ
function reversePlayback() {
    video.currentTime -= 0.1; // ลดเวลา 0.1 วินาที
    if (video.currentTime <= 0) {
        video.currentTime = video.duration; // ถ้าถึงจุดเริ่มต้น ตั้งเวลาเป็นจุดสิ้นสุด
    }
}

// ฟังก์ชันเพื่อเล่นไปข้างหน้า
function forwardPlayback() {
    video.currentTime += 0.1; // เพิ่มเวลา 0.1 วินาที
    if (video.currentTime >= video.duration) {
        video.currentTime = 0; // ถ้าถึงจุดสิ้นสุด ตั้งเวลาเป็น 0
    }
}

// เริ่มเล่นวิดีโอในลูป
function updatePlayback() {
    if (video.currentTime <= 0) {
        forwardPlayback(); // เล่นไปข้างหน้า
    } else if (video.currentTime >= video.duration) {
        reversePlayback(); // เล่นย้อนกลับ
    } else {
        forwardPlayback(); // เล่นไปข้างหน้า
    }
    requestAnimationFrame(updatePlayback); // เรียกใช้ฟังก์ชันอัปเดตในเฟรมถัดไป
};
