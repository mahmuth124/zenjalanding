document.addEventListener("DOMContentLoaded", () => {
    // ============================
    // 1) سكرول ناعم للروابط الداخلية
    // ============================
    const internalLinks = document.querySelectorAll('a[href^="#"]');

    internalLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
            const targetId = link.getAttribute("href");
            if (!targetId || targetId === "#") return;

            const targetEl = document.querySelector(targetId);
            if (!targetEl) return;

            e.preventDefault();

            targetEl.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        });
    });

    // ============================
    // 2) دالة لتحويل الأرقام العربية إلى إنجليزية
    // ============================
    const arabicToEnglishDigits = (value) => {
        if (!value) return "";
        const map = {
            "٠": "0",
            "١": "1",
            "٢": "2",
            "٣": "3",
            "٤": "4",
            "٥": "5",
            "٦": "6",
            "٧": "7",
            "٨": "8",
            "٩": "9",
        };
        return value.replace(/[٠-٩]/g, (d) => map[d] || d);
    };

    // ============================
    // 3) تحسين تجربة الفورم
    // ============================
    const orderForm = document.querySelector(".order-form");

    if (orderForm) {
        const submitBtn = orderForm.querySelector('button[type="submit"]');
        const phoneInput = orderForm.querySelector('input[name="phone"]');

        // تنظيف رقم الجوال أثناء الكتابة
        if (phoneInput) {
            phoneInput.addEventListener("input", () => {
                let val = phoneInput.value;
                // تحويل الأرقام العربية إلى إنجليزية
                val = arabicToEnglishDigits(val);
                // السماح فقط بالأرقام + والمسافة
                val = val.replace(/[^\d+]/g, "");
                phoneInput.value = val;
            });
        }

        // عند الإرسال
        orderForm.addEventListener("submit", (e) => {
            // HTML5 validation أولاً
            if (!orderForm.checkValidity()) {
                // خليه يتصرف عادي ويظهر رسائل المتصفح
                return;
            }

            // تحقق إضافي من رقم الجوال
            if (phoneInput) {
                const raw = arabicToEnglishDigits(phoneInput.value || "");
                // نشيل المسافات
                const digits = raw.replace(/\D/g, "");
                // تحقّق بسيط: لازم يكون الرقم على الأقل 8 أرقام
                if (digits.length < 8) {
                    e.preventDefault();
                    alert("يرجى إدخال رقم جوال صحيح.");
                    phoneInput.focus();
                    return;
                }
                // نخزّن النسخة المنظفة قبل الإرسال
                phoneInput.value = digits;
            }

            // تعطيل الزر ومنع الضغط أكثر من مرة
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.dataset.originalText = submitBtn.textContent;
                submitBtn.textContent = "جاري إرسال الطلب...";
            }
            // لا نستخدم preventDefault → نترك الفورم يرسل عادي إلى Google Script
        });

        // في حال رجع المستخدم للصفحة عبر back من المتصفح
        window.addEventListener("pageshow", (event) => {
            if (event.persisted && submitBtn) {
                submitBtn.disabled = false;
                if (submitBtn.dataset.originalText) {
                    submitBtn.textContent = submitBtn.dataset.originalText;
                }
            }
        });
    }

    // ============================
    // 4) التقاط UTM params من URL
    // ووضعها في hidden inputs داخل الفورم
    // مثال: ?utm_source=tiktok&utm_campaign=zenja
    // ============================
    const urlParams = new URLSearchParams(window.location.search);
    const utmKeys = [
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_content",
        "utm_term",
        "adset",
        "ad",
    ];

    if (orderForm) {
        utmKeys.forEach((key) => {
            const value = urlParams.get(key);
            if (!value) return;

            // إذا في input مخفي بنفس الاسم، نعبيه
            let hiddenInput = orderForm.querySelector(`input[name="${key}"]`);
            if (!hiddenInput) {
                // لو مش موجود، ننشئه (اختياري)
                hiddenInput = document.createElement("input");
                hiddenInput.type = "hidden";
                hiddenInput.name = key;
                orderForm.appendChild(hiddenInput);
            }
            hiddenInput.value = value;
        });
    }

    // ============================
    // 5) Sticky CTA (اختياري)
    // لو أضفت div.mobile-sticky-cta في الـ HTML
    // ============================
    const stickyCta = document.querySelector(".mobile-sticky-cta");
    const orderSection = document.querySelector("#order");

    if (stickyCta && orderSection) {
        const handleScroll = () => {
            const rect = orderSection.getBoundingClientRect();
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

            // لما يكون سكشن الطلب ظاهر تقريباً في الشاشة → نخفي الـ Sticky
            if (rect.top < viewportHeight - 220) {
                stickyCta.style.opacity = "0";
                stickyCta.style.pointerEvents = "none";
            } else {
                stickyCta.style.opacity = "1";
                stickyCta.style.pointerEvents = "auto";
            }
        };

        stickyCta.style.transition = "opacity 0.2s ease-in-out";
        window.addEventListener("scroll", handleScroll);
        handleScroll();
    }
});
