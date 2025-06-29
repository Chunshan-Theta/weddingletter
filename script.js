// 全局變數
let isDetailsShown = false;

// DOM 元素
const invitationCard = document.getElementById('invitation-card');
const invitationDetails = document.getElementById('invitation-details');

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 為請帖卡片添加點擊事件
    invitationCard.addEventListener('click', showDetails);
    
    // 添加鍵盤支持
    document.addEventListener('keydown', handleKeydown);
    
    // 為照片添加點擊放大功能
    initPhotoGallery();
    
    // 初始化 RSVP 表單
    initRSVPForm();
});

// 顯示詳細資訊
function showDetails() {
    if (isDetailsShown) return;
    
    isDetailsShown = true;
    invitationCard.style.transform = 'scale(0.95)';
    invitationCard.style.opacity = '0';
    
    setTimeout(() => {
        invitationCard.style.display = 'none';
        invitationDetails.classList.remove('hidden');
        
        // 添加入場動畫
        setTimeout(() => {
            invitationDetails.style.opacity = '1';
            invitationDetails.style.transform = 'translateY(0)';
        }, 50);
    }, 300);
}

// 顯示卡片（返回）
function showCard() {
    if (!isDetailsShown) return;
    
    isDetailsShown = false;
    invitationDetails.style.opacity = '0';
    invitationDetails.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        invitationDetails.classList.add('hidden');
        invitationCard.style.display = 'block';
        
        setTimeout(() => {
            invitationCard.style.transform = 'scale(1)';
            invitationCard.style.opacity = '1';
        }, 50);
    }, 300);
}

// 初始化 RSVP 表單
function initRSVPForm() {
    const form = document.getElementById('rsvp-form');
    if (!form) return;
    
    form.addEventListener('submit', handleRSVPSubmit);
    
    // 監聽出席狀況變化
    const attendanceSelect = document.getElementById('attendance');
    const guestCountGroup = document.querySelector('input[name="guestCount"]').parentElement;
    
    attendanceSelect.addEventListener('change', function() {
        if (this.value === 'decline') {
            guestCountGroup.style.opacity = '0.5';
            guestCountGroup.querySelector('input').disabled = true;
        } else {
            guestCountGroup.style.opacity = '1';
            guestCountGroup.querySelector('input').disabled = false;
        }
    });
}

// 處理 RSVP 表單提交
function handleRSVPSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    // 驗證必填欄位
    if (!data.guestName || !data.guestPhone || !data.attendance) {
        showNotification('請填寫所有必填欄位', 'error');
        return;
    }
    
    // 處理表單數據
    const rsvpData = {
        name: data.guestName,
        phone: data.guestPhone,
        attendance: data.attendance,
        guestCount: data.attendance === 'attend' ? parseInt(data.guestCount) || 1 : 0,
        blessing: data.blessing || ''
    };
    
    // 這裡可以發送到後端 API
    console.log('RSVP Data:', rsvpData);
    
    // 顯示成功訊息
    const message = rsvpData.attendance === 'attend' 
        ? `感謝 ${rsvpData.name} 的回覆！我們期待在婚禮上見到您${rsvpData.guestCount > 1 ? `和您的 ${rsvpData.guestCount - 1} 位同行者` : ''} ❤️`
        : `謝謝 ${rsvpData.name} 的回覆，我們理解您無法參加 💝`;
    
    showNotification(message, rsvpData.attendance === 'attend' ? 'success' : 'info');
    
    // 重置表單（可選）
    // event.target.reset();
}

// 顯示通知
function showNotification(message, type = 'info') {
    // 移除現有的通知
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 創建新通知
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="closeNotification()">&times;</button>
        </div>
    `;
    
    // 添加樣式
    let backgroundColor;
    switch(type) {
        case 'success': backgroundColor = '#4caf50'; break;
        case 'error': backgroundColor = '#f44336'; break;
        default: backgroundColor = '#2196f3'; break;
    }
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${backgroundColor};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
        max-width: 90%;
    `;
    
    notification.querySelector('.notification-content').style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
    `;
    
    notification.querySelector('.notification-close').style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    document.body.appendChild(notification);
    
    // 顯示動畫
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 100);
    
    // 自動關閉
    setTimeout(() => {
        closeNotification();
    }, 4000);
}

// 關閉通知
function closeNotification() {
    const notification = document.querySelector('.notification');
    if (notification) {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }
}

// 鍵盤支持
function handleKeydown(event) {
    switch(event.key) {
        case 'Escape':
            if (isDetailsShown) {
                showCard();
            }
            break;
        case 'Enter':
        case ' ':
            if (!isDetailsShown) {
                event.preventDefault();
                showDetails();
            }
            break;
    }
}

// 全局變量存儲圖片列表
let galleryImages = [];

// 照片畫廊功能
async function initPhotoGallery() {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return;
    
    try {
        // 獲取 images 目錄的文件列表
        const response = await fetch('/images/');
        const files = await response.json();
        
        // 過濾圖片文件
        const imageFiles = files
            .filter(file => file.type === 'file')
            .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name))
            .sort((a, b) => a.name.localeCompare(b.name));
        
        // 存儲圖片信息
        galleryImages = imageFiles.map((file, index) => ({
            src: `images/${file.name}`,
            alt: `回憶照片${index}`
        }));
        
        // 清空現有內容
        galleryGrid.innerHTML = '';
        
        // 動態創建圖片元素
        galleryImages.forEach((imageInfo, index) => {
            const img = document.createElement('img');
            img.src = imageInfo.src;
            img.alt = imageInfo.alt;
            img.loading = 'lazy';
            
            // 添加點擊事件，傳入索引
            img.addEventListener('click', function() {
                openLightbox(index);
            });
            
            // 添加錯誤處理
            img.addEventListener('error', function() {
                this.style.display = 'none';
            });
            
            galleryGrid.appendChild(img);
        });
        
    } catch (error) {
        console.warn('無法動態載入圖片，使用靜態圖片:', error);
        // 如果動態載入失敗，為現有圖片添加事件
        const existingImages = document.querySelectorAll('.gallery-grid img');
        galleryImages = Array.from(existingImages).map(img => ({
            src: img.src,
            alt: img.alt
        }));
        
        existingImages.forEach((img, index) => {
            img.addEventListener('click', function() {
                openLightbox(index);
            });
            
            img.addEventListener('error', function() {
                this.style.display = 'none';
            });
        });
    }
}

// 當前燈箱圖片索引
let currentLightboxIndex = 0;

// 燈箱功能
function openLightbox(index) {
    if (galleryImages.length === 0) return;
    
    currentLightboxIndex = index;
    const imageInfo = galleryImages[currentLightboxIndex];
    
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <img src="${imageInfo.src}" alt="${imageInfo.alt}" id="lightbox-image">
            <button class="lightbox-close" onclick="closeLightbox()">&times;</button>
            ${galleryImages.length > 1 ? `
                <button class="lightbox-prev" onclick="previousImage()">❮</button>
                <button class="lightbox-next" onclick="nextImage()">❯</button>
                <div class="lightbox-counter">${currentLightboxIndex + 1} / ${galleryImages.length}</div>
            ` : ''}
        </div>
    `;
    
    document.body.appendChild(lightbox);
    
    // 添加樣式
    addLightboxStyles();
    
    // 點擊背景關閉
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // 顯示動畫
    setTimeout(() => {
        lightbox.style.opacity = '1';
    }, 100);
    
    // 鍵盤事件
    const keyHandler = function(e) {
        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                previousImage();
                break;
            case 'ArrowRight':
                e.preventDefault();
                nextImage();
                break;
        }
    };
    document.addEventListener('keydown', keyHandler);
    
    // 觸摸滑動支持
    let touchStartX = 0;
    const touchStartHandler = (e) => {
        touchStartX = e.touches[0].clientX;
    };
    
    const touchEndHandler = (e) => {
        if (!touchStartX) return;
        
        const touchEndX = e.changedTouches[0].clientX;
        const deltaX = touchStartX - touchEndX;
        
        if (Math.abs(deltaX) > 50) {  // 最小滑動距離
            if (deltaX > 0) {
                nextImage();  // 向左滑顯示下一張
            } else {
                previousImage();  // 向右滑顯示上一張
            }
        }
        touchStartX = 0;
    };
    
    lightbox.addEventListener('touchstart', touchStartHandler);
    lightbox.addEventListener('touchend', touchEndHandler);
    
    // 存儲事件處理器以便清理
    lightbox._keyHandler = keyHandler;
    lightbox._touchStartHandler = touchStartHandler;
    lightbox._touchEndHandler = touchEndHandler;
}

// 上一張圖片
function previousImage() {
    if (galleryImages.length <= 1) return;
    
    currentLightboxIndex = (currentLightboxIndex - 1 + galleryImages.length) % galleryImages.length;
    updateLightboxImage();
}

// 下一張圖片
function nextImage() {
    if (galleryImages.length <= 1) return;
    
    currentLightboxIndex = (currentLightboxIndex + 1) % galleryImages.length;
    updateLightboxImage();
}

// 更新燈箱圖片
function updateLightboxImage() {
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxCounter = document.querySelector('.lightbox-counter');
    
    if (lightboxImage && galleryImages[currentLightboxIndex]) {
        const imageInfo = galleryImages[currentLightboxIndex];
        lightboxImage.style.opacity = '0';
        
        setTimeout(() => {
            lightboxImage.src = imageInfo.src;
            lightboxImage.alt = imageInfo.alt;
            lightboxImage.style.opacity = '1';
            
            if (lightboxCounter) {
                lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${galleryImages.length}`;
            }
        }, 150);
    }
}

// 添加燈箱樣式
function addLightboxStyles() {
    if (document.getElementById('lightbox-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'lightbox-styles';
    style.textContent = `
        .lightbox {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .lightbox-content {
            position: relative;
            max-width: 90%;
            max-height: 90%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .lightbox-content img {
            width: 60vw;
            max-height: 80vh;
            object-fit: contain;
            border-radius: 8px;
            transition: opacity 0.15s ease;
        }
        
        .lightbox-close {
            position: absolute;
            top: -40px;
            right: -40px;
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            font-size: 30px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        }
        
        .lightbox-close:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: scale(1.1);
        }
        
        .lightbox-prev, .lightbox-next {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            font-size: 24px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        }
        
        .lightbox-prev {
            left: -70px;
        }
        
        .lightbox-next {
            right: -70px;
        }
        
        .lightbox-prev:hover, .lightbox-next:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-50%) scale(1.1);
        }
        
        .lightbox-counter {
            position: absolute;
            bottom: -40px;
            left: 50%;
            transform: translateX(-50%);
            color: white;
            background: rgba(0, 0, 0, 0.5);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            backdrop-filter: blur(10px);
        }
        
        @media (max-width: 768px) {
            .lightbox-content img {
                width: 80vw;
                max-height: 70vh;
            }
            
            .lightbox-close {
                top: 20px;
                right: 20px;
                font-size: 24px;
                width: 35px;
                height: 35px;
            }
            
            .lightbox-prev, .lightbox-next {
                width: 45px;
                height: 45px;
                font-size: 20px;
            }
            
            .lightbox-prev {
                left: 20px;
            }
            
            .lightbox-next {
                right: 20px;
            }
            
            .lightbox-counter {
                bottom: 20px;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// 關閉燈箱
function closeLightbox() {
    const lightbox = document.querySelector('.lightbox');
    if (lightbox) {
        // 清理事件監聽器
        if (lightbox._keyHandler) {
            document.removeEventListener('keydown', lightbox._keyHandler);
        }
        if (lightbox._touchStartHandler) {
            lightbox.removeEventListener('touchstart', lightbox._touchStartHandler);
        }
        if (lightbox._touchEndHandler) {
            lightbox.removeEventListener('touchend', lightbox._touchEndHandler);
        }
        
        lightbox.style.opacity = '0';
        setTimeout(() => {
            lightbox.remove();
        }, 300);
    }
}

// 滑動手勢支持（移動設備）
let globalTouchStartX = 0;
let globalTouchStartY = 0;

document.addEventListener('touchstart', function(e) {
    // 如果燈箱打開，不處理全局滑動
    if (document.querySelector('.lightbox')) return;
    
    globalTouchStartX = e.touches[0].clientX;
    globalTouchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', function(e) {
    // 如果燈箱打開，不處理全局滑動
    if (document.querySelector('.lightbox')) return;
    
    if (!globalTouchStartX || !globalTouchStartY) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = globalTouchStartX - touchEndX;
    const deltaY = globalTouchStartY - touchEndY;
    
    // 檢查是否為有效滑動（最小距離 50px）
    if (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50) {
        // 水平滑動優先
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 0 && !isDetailsShown) {
                // 向左滑動，顯示詳情
                showDetails();
            } else if (deltaX < 0 && isDetailsShown) {
                // 向右滑動，返回卡片
                showCard();
            }
        }
    }
    
    globalTouchStartX = 0;
    globalTouchStartY = 0;
});

// 平滑滾動到指定元素
function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
} 