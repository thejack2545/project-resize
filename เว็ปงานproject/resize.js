document.getElementById('inputResizeImages').addEventListener('change', function (e) {
  const files = e.target.files; // รับไฟล์ที่ผู้ใช้เลือก
  const previewsContainer = document.getElementById('resizePreviews');
  previewsContainer.innerHTML = ''; // ล้างพรีวิวที่มีอยู่ก่อนหน้า

  if (files.length > 0) { // ถ้ามีไฟล์ที่เลือกอยู่
    Array.from(files).forEach(file => { // ทำการวนลูปไฟล์แต่ละไฟล์ที่เลือก
      const reader = new FileReader(); // ใช้ FileReader ในการอ่านไฟล์
      reader.onload = function (event) {
        const img = document.createElement('img'); // สร้าง element รูปภาพ
        img.src = event.target.result; // ตั้งค่า URL ของรูปจากข้อมูลไฟล์ที่อ่านได้
        img.className = 'preview-image'; // กำหนดคลาสของรูป
        img.onload = function () {
          // สร้าง container พรีวิวสำหรับแต่ละรูป
          const previewContainer = document.createElement('div');
          previewContainer.className = 'preview'; // กำหนดคลาส
          previewContainer.appendChild(img); // ใส่รูปใน container
          previewsContainer.appendChild(previewContainer); // ใส่ container ใน container หลัก
        };
      };
      reader.readAsDataURL(file); // อ่านไฟล์เป็น Data URL
    });
  }
});

document.getElementById('resizeButton').addEventListener('click', async function () {
  const width = parseInt(document.getElementById('resizeWidth').value) || 300; // รับค่าความกว้างจาก input หรือใช้ค่าเริ่มต้น 300
  const height = parseInt(document.getElementById('resizeHeight').value) || 300; // รับค่าความสูงจาก input หรือใช้ค่าเริ่มต้น 300
  const outputElement = document.getElementById('resizeOutput');
  outputElement.innerHTML = ''; // ล้างผลลัพธ์ที่มีอยู่ก่อนหน้า
  outputElement.style.display = 'block'; // แสดงส่วนของผลลัพธ์

  // สร้างตัวอย่าง JSZip
  const zip = new JSZip();
  const files = document.getElementById('inputResizeImages').files;

  if (files.length > 0) { // ถ้ามีไฟล์ที่เลือกอยู่
    const resizePromises = Array.from(files).map(file => { // สร้าง Promise สำหรับการย่อขนาดแต่ละไฟล์
      return new Promise((resolve, reject) => {
        const reader = new FileReader(); // ใช้ FileReader ในการอ่านไฟล์
        reader.onload = function (event) {
          const img = new Image(); // สร้าง element รูปภาพ
          img.src = event.target.result; // ตั้งค่า URL ของรูปจากข้อมูลไฟล์ที่อ่านได้
          img.onload = function () {
            const canvas = document.createElement('canvas'); // สร้าง element แคนวาส
            const ctx = canvas.getContext('2d'); // รับบริบท 2D ของแคนวาส
            // รักษาอัตราส่วนของรูปภาพ
            const aspectRatio = img.width / img.height;

            if (width / height > aspectRatio) { // คำนวณขนาดแคนวาสตามอัตราส่วน
              canvas.width = height * aspectRatio;
              canvas.height = height;
            } else {
              canvas.width = width;
              canvas.height = width / aspectRatio;
            }

            // วาดรูปภาพในแคนวาสตามขนาดที่ต้องการ
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
              if (blob) { // ถ้ามี blob (ข้อมูลรูปภาพ)
                const fileName = file.name; // ตั้งชื่อไฟล์
                zip.file(fileName, blob); // ใส่ไฟล์ลงใน zip
                resolve(); // ทำงานสำเร็จ
              } else {
                reject('Error generating blob'); // ถ้าผิดพลาด
              }
            }, 'image/png'); // ใช้รูปแบบ PNG เพื่อให้คุณภาพดีที่สุด
          };
        };
        reader.readAsDataURL(file); // อ่านไฟล์เป็น Data URL
      });
    });

    // รอให้การย่อขนาดของทุกไฟล์เสร็จสิ้น
    await Promise.all(resizePromises);

    // สร้างไฟล์ ZIP และสร้างลิงก์ดาวน์โหลด
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipUrl = URL.createObjectURL(zipBlob);

    // สร้างลิงก์ดาวน์โหลด
    const downloadLink = document.createElement('a');
    downloadLink.href = zipUrl; // ตั้งค่า URL ของลิงก์ดาวน์โหลด
    downloadLink.download = 'resized-images.zip'; // ตั้งชื่อไฟล์ ZIP
    downloadLink.textContent = 'Download';
    outputElement.appendChild(downloadLink); // แสดงลิงก์ดาวน์โหลด

    // สร้างลิงก์กลับไปหน้าหลัก
    const backToHomeLink = document.createElement('a');
    backToHomeLink.href = 'index.html'; // ลิงก์ไปยังหน้าหลัก
    backToHomeLink.className = 'btn'; // กำหนดคลาส
    backToHomeLink.textContent = 'Back to Home';
    outputElement.appendChild(backToHomeLink); // แสดงลิงก์กลับหน้าหลัก
  }
});
