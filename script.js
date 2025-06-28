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

// RSVP 功能
function rsvp(response) {
    const message = response === 'attend' ? 
        '感謝您的參與！我們期待在婚禮上見到您 ❤️' : 
        '謝謝您的回覆，我們理解您無法參加 💝';
    
    // 創建提示訊息
    showNotification(message, response === 'attend' ? 'success' : 'info');
    
    // 這裡可以添加實際的 RSVP 處理邏輯
    // 例如發送到後端 API
    console.log(`RSVP Response: ${response}`);
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
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#4caf50' : '#2196f3'};
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

// 照片畫廊功能
function initPhotoGallery() {
    const images = document.querySelectorAll('.gallery-grid img');
    
    images.forEach(img => {
        img.addEventListener('click', function() {
            openLightbox(this.src, this.alt);
        });
        
        // 添加錯誤處理
        img.addEventListener('error', function() {
            this.style.display = 'none';
        });
    });
}

// 燈箱功能
function openLightbox(src, alt) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <img src="${src}" alt="${alt}">
            <button class="lightbox-close" onclick="closeLightbox()">&times;</button>
        </div>
    `;
    
    document.body.appendChild(lightbox);
    
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
    
    // ESC 鍵關閉
    const escHandler = function(e) {
        if (e.key === 'Escape') {
            closeLightbox();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

// 關閉燈箱
function closeLightbox() {
    const lightbox = document.querySelector('.lightbox');
    if (lightbox) {
        lightbox.style.opacity = '0';
        setTimeout(() => {
            lightbox.remove();
        }, 300);
    }
}

// 滑動手勢支持（移動設備）
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchend', function(e) {
    if (!touchStartX || !touchStartY) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchStartX - touchEndX;
    const deltaY = touchStartY - touchEndY;
    
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
    
    touchStartX = 0;
    touchStartY = 0;
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