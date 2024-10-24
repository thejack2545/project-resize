let cropperList = [];
let originalFiles = []; // เก็บไฟล์ต้นฉบับ

// เพิ่ม event listener ให้กับ input สำหรับเลือกภาพ
document.getElementById('inputImages').addEventListener('change', function (e) {
  const files = e.target.files;
  const previewsContainer = document.getElementById('previews');
  previewsContainer.innerHTML = ''; // ล้างภาพตัวอย่างเก่า

  cropperList = []; // ล้าง cropperList
  originalFiles = []; // ล้างไฟล์ต้นฉบับ

  // ทำการวนลูปไฟล์ภาพที่เลือก
  Array.from(files).forEach((file, index) => {
    const reader = new FileReader();
    originalFiles.push(file); // เก็บไฟล์ต้นฉบับ

    reader.onload = function (event) {
      const img = new Image();
      img.src = event.target.result;
      img.className = 'preview-img'; // ใช้คลาสใหม่เพื่อปรับขนาดภาพ

      const previewContainer = document.createElement('div');
      previewContainer.className = 'preview';
      previewContainer.style.position = 'relative'; // ปรับตำแหน่งให้สัมพันธ์กัน

      previewContainer.appendChild(img);
      previewsContainer.appendChild(previewContainer);

      img.onload = function () {
        const cropper = new Cropper(img, {
          aspectRatio: NaN, // ไม่จำกัดอัตราส่วน
          viewMode: 2, // ปรับให้เห็นเฉพาะพื้นที่ภาพที่กำลังครอบ
          autoCrop: true,
          scalable: true, // อนุญาตให้ขยายขนาดภาพ
          zoomable: true, // อนุญาตให้ซูมภาพ
          responsive: true, // ปรับขนาดภาพตามหน้าจอ
          background: false, // ซ่อนพื้นหลัง
          ready() {
            // ขยายขนาด crop box ให้ใหญ่ขึ้น
            const containerData = cropper.getContainerData();
            cropper.setCropBoxData({
              width: containerData.width * 0.8, // ขยายครอบกล่องให้ใหญ่ขึ้น 80% ของขนาดพื้นที่แสดงผล
              height: containerData.height * 0.8,
            });
          }
        });
        cropperList.push(cropper); // เพิ่ม cropper ลงในลิสต์
      };
    };

    reader.readAsDataURL(file); // อ่านไฟล์ภาพ
  });
});

// เมื่อคลิกปุ่มครอบภาพ
document.getElementById('cropButton').addEventListener('click', async function () {
  const outputElement = document.getElementById('cropoutput');
  outputElement.innerHTML = ''; // ล้างข้อมูลเก่า

  const zip = new JSZip(); // สร้างไฟล์ ZIP

  try {
    // วนลูปครอบภาพทีละภาพ
    const cropperPromises = cropperList.map((cropper, index) => {
      return new Promise((resolve, reject) => {
        // เพิ่มคุณภาพในการครอบภาพ
        const canvas = cropper.getCroppedCanvas({
          fillColor: '#fff', // กำหนดสีพื้นหลังเป็นสีขาว
          imageSmoothingQuality: 'high' // คุณภาพการครอบสูงสุด
        });

        if (canvas) {
          // แปลง canvas เป็น Blob
          canvas.toBlob(async (blob) => {
            if (blob) {
              // ใช้ชื่อไฟล์ต้นฉบับ แต่เปลี่ยนนามสกุลเป็น .png เสมอ
              const originalName = originalFiles[index].name.split('.').slice(0, -1).join('.'); // เอาชื่อไฟล์เดิมออกมาโดยไม่เอานามสกุล
              const fileName = `${originalName}.png`; // ตั้งชื่อไฟล์ใหม่ด้วย .png
              
              zip.file(fileName, blob); // เพิ่มภาพลงในไฟล์ ZIP
              resolve();
            } else {
              reject(new Error('Error converting canvas to Blob'));
            }
          }, 'image/png'); // บันทึกเป็น PNG
        } else {
          reject(new Error('Canvas is empty or not available'));
        }
      });
    });

    // รอให้การครอบภาพเสร็จทั้งหมด
    await Promise.all(cropperPromises);

    // สร้างไฟล์ ZIP และลิงก์ดาวน์โหลด
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const zipUrl = URL.createObjectURL(zipBlob);

    // ลิงก์ดาวน์โหลดไฟล์ ZIP
    const downloadLink = document.createElement('a');
    downloadLink.href = zipUrl;
    downloadLink.download = 'cropped-images.zip';
    downloadLink.textContent = 'Download';
    downloadLink.className = 'btn'; // ใช้คลาสปุ่ม
    outputElement.appendChild(downloadLink);

    // ปุ่มกลับไปที่หน้าแรก
    const backToHomeLink = document.createElement('a');
    backToHomeLink.href = 'index.html';
    backToHomeLink.className = 'btn'; // ใช้คลาสปุ่ม
    backToHomeLink.textContent = 'Back to Home';
    outputElement.appendChild(backToHomeLink);

  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการประมวลผลภาพ:', error);
  }
});
