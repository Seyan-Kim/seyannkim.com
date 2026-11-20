document.addEventListener('DOMContentLoaded', () => {
    // 1. 네비게이션 및 내부 링크 스무스 스크롤 보정
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 1-1. Related Video: 썸네일 화질 보정 + 클릭 시 팝업 재생
    const modal = document.getElementById('video-modal');
    const modalFrame = modal ? modal.querySelector('.video-modal-frame') : null;
    let lastFocused = null;

    document.querySelectorAll('.video-card[data-video-id]').forEach(card => {
        const img = card.querySelector('img');
        const id = card.dataset.videoId;

        // 고화질 썸네일이 없는 영상은 유튜브가 120px짜리 회색 이미지를 주므로 기본 썸네일로 교체
        if (img) {
            const fallback = () => {
                if (img.naturalWidth <= 120 && !img.dataset.fallback) {
                    img.dataset.fallback = '1';
                    img.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
                }
            };
            if (img.complete) fallback();
            img.addEventListener('load', fallback);
        }

        card.addEventListener('click', () => openVideo(id));
    });

    function openVideo(id) {
        if (!modal || !modalFrame) {
            window.open(`https://youtu.be/${id}`, '_blank', 'noopener');
            return;
        }
        lastFocused = document.activeElement;
        modalFrame.innerHTML = `<iframe src="https://www.youtube.com/embed/${id}?autoplay=1&rel=0&playsinline=1" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
        modal.hidden = false;
        document.body.classList.add('modal-open');
        modal.querySelector('.video-modal-close').focus();
    }

    function closeVideo() {
        if (!modal || modal.hidden) return;
        modal.hidden = true;
        modalFrame.innerHTML = ''; // iframe 제거 → 재생 정지
        document.body.classList.remove('modal-open');
        if (lastFocused) lastFocused.focus();
    }

    if (modal) {
        modal.querySelectorAll('[data-close-modal]').forEach(el => el.addEventListener('click', closeVideo));
        document.addEventListener('keydown', e => { if (e.key === 'Escape') closeVideo(); });
    }

    // 2. 스크롤 인터랙션: 섹션 등장 페이드인 효과
    const sections = document.querySelectorAll('.section');
    
    const observerOptions = {
        root: null,
        threshold: 0
    };

    if (!('IntersectionObserver' in window)) {
        sections.forEach(section => {
            section.style.opacity = '1';
            section.style.transform = 'none';
        });
        return;
    }

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'all 0.8s ease-out';
        sectionObserver.observe(section);
    });
});