// =========================
// Firebase Setup & Security
// =========================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getFirestore,
    doc,
    getDoc,
    getDocs,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    collection,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBXc9eg8UlyhnV0Gd3CGkzv3tssTIXuF4Y",
    authDomain: "anas-store-v2.firebaseapp.com",
    projectId: "anas-store-v2",
    storageBucket: "anas-store-v2.firebasestorage.app",
    messagingSenderId: "16429154083",
    appId: "1:16429154083:web:56def9cc95515c01821696"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 🔴 إيميل الأدمن للمتجر 🔴
const ADMIN_EMAIL = "anasalaian06@gmail.com"; 

document.body.style.display = "none";

onAuthStateChanged(auth, (user) => {
    if (user && user.email === ADMIN_EMAIL) {
        document.body.style.display = "block";
        openDashboard();
    } else {
        alert("🚫 عذراً، هذه الصفحة مخصصة لإدارة المتجر فقط!");
        window.location.href = "index.html";
    }
});

// عناصر القائمة
const page = document.getElementById("page-content");
const dashboardBtn = document.getElementById("dashboardBtn");
const exchangeBtn = document.getElementById("exchangeBtn");
const servicesBtn = document.getElementById("servicesBtn");
const offersBtn = document.getElementById("offersBtn");
const ordersBtn = document.getElementById("ordersBtn");
const ticketsBtn = document.getElementById("ticketsBtn");
const usersBtn = document.getElementById("usersBtn");
const settingsBtn = document.getElementById("settingsBtn");

function setActive(btn) {
    document.querySelectorAll(".sidebar li").forEach(x => x.classList.remove("active"));
    if (btn) btn.classList.add("active");
}

// =========================
// 1. الرئيسية (Dashboard)
// =========================
async function openDashboard() {
    setActive(dashboardBtn);
    page.innerHTML = `
        <h2>مرحباً بك في لوحة تحكم Anas Store 👋</h2>
        <p>نظرة عامة ومباشرة على إحصائيات المتجر.</p>
        <div id="dashboardStats" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-top: 20px;">
            <p style="color:#94a3b8;">جاري جلب الإحصائيات من قاعدة البيانات...</p>
        </div>
    `;

    try {
        const usersSnap = await getDocs(collection(db, "users"));
        let totalUsers = usersSnap.size;
        let totalBalances = 0;
        let totalSpent = 0;

        usersSnap.forEach(doc => {
            const data = doc.data();
            totalBalances += (data.balance || 0);
            totalSpent += (data.spent || 0);
        });

        const ordersSnap = await getDocs(collection(db, "orders"));
        const ticketsSnap = await getDocs(collection(db, "tickets"));
        const servicesSnap = await getDocs(collection(db, "services"));

        document.getElementById("dashboardStats").innerHTML = `
            <div style="background:#1e293b; padding:15px; border-radius:10px; text-align:center; border:1px solid #334155;">
                <h3 style="color:#3b82f6; margin:0 0 10px 0; font-size:14px;">👥 إجمالي المستخدمين</h3>
                <p style="margin:0; color:#fff; font-size:24px; font-weight:bold;">${totalUsers}</p>
            </div>
            <div style="background:#1e293b; padding:15px; border-radius:10px; text-align:center; border:1px solid #334155;">
                <h3 style="color:#10b981; margin:0 0 10px 0; font-size:14px;">💰 أرصدة المحافظ</h3>
                <p style="margin:0; color:#fff; font-size:24px; font-weight:bold;">$${totalBalances.toFixed(2)}</p>
            </div>
            <div style="background:#1e293b; padding:15px; border-radius:10px; text-align:center; border:1px solid #334155;">
                <h3 style="color:#f59e0b; margin:0 0 10px 0; font-size:14px;">🛒 المبيعات المنفقة</h3>
                <p style="margin:0; color:#fff; font-size:24px; font-weight:bold;">$${totalSpent.toFixed(2)}</p>
            </div>
            <div style="background:#1e293b; padding:15px; border-radius:10px; text-align:center; border:1px solid #334155;">
                <h3 style="color:#8b5cf6; margin:0 0 10px 0; font-size:14px;">📦 إجمالي الطلبات</h3>
                <p style="margin:0; color:#fff; font-size:24px; font-weight:bold;">${ordersSnap.size}</p>
            </div>
            <div style="background:#1e293b; padding:15px; border-radius:10px; text-align:center; border:1px solid #334155;">
                <h3 style="color:#ef4444; margin:0 0 10px 0; font-size:14px;">🎫 إجمالي التذاكر</h3>
                <p style="margin:0; color:#fff; font-size:24px; font-weight:bold;">${ticketsSnap.size}</p>
            </div>
            <div style="background:#1e293b; padding:15px; border-radius:10px; text-align:center; border:1px solid #334155;">
                <h3 style="color:#06b6d4; margin:0 0 10px 0; font-size:14px;">🛍️ الخدمات المتاحة</h3>
                <p style="margin:0; color:#fff; font-size:24px; font-weight:bold;">${servicesSnap.size}</p>
            </div>
        `;
    } catch (error) {
        document.getElementById("dashboardStats").innerHTML = `<p style="color:#ef4444;">❌ فشل جلب الإحصائيات.</p>`;
    }
}

// =========================
// 2. سعر الصرف
// =========================
async function openRate() {
    setActive(exchangeBtn);
    const ref = doc(db, "settings", "exchange");
    const snap = await getDoc(ref);
    let value = snap.exists() ? snap.data().rate : "";

    page.innerHTML = `
        <h2>💱 إدارة سعر الصرف</h2>
        <p>تحديد سعر الصرف المعتمد داخل المتجر.</p>
        <br>
        <input id="rate" type="number" step="0.01" placeholder="مثال : 5.48" value="${value}" style="width:100%; padding:15px; font-size:18px; border:1px solid #334155; background:#0f172a; color:#fff; border-radius:10px; margin-bottom:20px; outline:none;">
        <button id="saveRate" style="width:100%; padding:15px; font-size:18px; background:#2563eb; color:white; border:none; border-radius:10px; cursor:pointer; font-weight:bold;">حفظ السعر</button>
    `;

    document.getElementById("saveRate").onclick = async () => {
        const rate = parseFloat(document.getElementById("rate").value);
        if (!rate) return alert("أدخل سعر صحيح");
        await setDoc(ref, { rate: rate }, { merge: true });
        alert("تم حفظ سعر الصرف بنجاح ✅");
    };
}

// =========================
// 3. الخدمات (مع خانات المتطلبات والملاحظات والتعديل والحذف)
// =========================
async function openServices() {
    setActive(servicesBtn);
    page.innerHTML = `
        <h2>🛒 إدارة الخدمات</h2>
        <p>إضافة الخدمات مع خانات المتطلبات والملاحظات، وتعديلها أو حذفها.</p>
        <button id="showAddFormBtn" style="background:#2563eb; color:white; border:none; padding:12px 16px; border-radius:8px; cursor:pointer; margin-bottom:15px; font-weight:bold;">➕ إضافة خدمة جديدة</button>
        <div id="addServiceContainer"></div>
        <div id="servicesList" style="margin-top:20px; display:flex; flex-direction:column; gap:12px;">جاري التحميل...</div>
    `;

    window.renderServiceForm = (editId = null, existingData = null) => {
        const container = document.getElementById("addServiceContainer");
        let nameVal = existingData ? existingData.name : "";
        let descVal = existingData ? existingData.description : "";
        let noteVal = existingData ? (existingData.note || "") : "";
        let field1Val = existingData && existingData.requiredFields && existingData.requiredFields[0] ? existingData.requiredFields[0] : "رابط أو يوزر";
        let field2Val = existingData && existingData.requiredFields && existingData.requiredFields[1] ? existingData.requiredFields[1] : "";

        container.innerHTML = `
            <div style="background:#0f172a; padding:15px; border-radius:10px; margin-bottom:20px; border:1px solid #334155;">
                <h3 style="color:#3b82f6; margin-top:0; font-size:16px;">${editId ? 'تعديل الخدمة' : 'إضافة خدمة رئيسية'}</h3>
                
                <label style="font-size:12px; color:#94a3b8;">اسم الخدمة:</label>
                <input id="srvName" type="text" placeholder="مثال: اشتراك نتفلكس" value="${nameVal}" style="width:100%; padding:10px; margin-bottom:10px; background:#1e293b; color:#fff; border:1px solid #334155; border-radius:8px; outline:none; box-sizing:border-box;">
                
                <label style="font-size:12px; color:#94a3b8;">وصف الخدمة:</label>
                <textarea id="srvDesc" placeholder="وصف عام..." rows="2" style="width:100%; padding:10px; margin-bottom:10px; background:#1e293b; color:#fff; border:1px solid #334155; border-radius:8px; outline:none; box-sizing:border-box;">${descVal}</textarea>
                
                <label style="font-size:12px; color:#f59e0b;">📌 ملاحظة الخدمة (تظهر للزبون عند الطلب):</label>
                <input id="srvNote" type="text" placeholder="مثال: يرجى عدم تغيير كلمة المرور..." value="${noteVal}" style="width:100%; padding:10px; margin-bottom:10px; background:#1e293b; color:#fff; border:1px solid #334155; border-radius:8px; outline:none; box-sizing:border-box;">

                <h4 style="color:#3b82f6; margin:10px 0 5px 0; font-size:14px;">متطلبات الشحن الإجبارية (الخانات التي يملؤها الزبون):</h4>
                <div style="display:flex; gap:10px; margin-bottom:10px;">
                    <div style="flex:1;">
                        <label style="font-size:11px; color:#94a3b8;">الخانة الأساسية 1:</label>
                        <input id="srvField1" type="text" value="${field1Val}" placeholder="مثال: يوزر او رابط" style="width:100%; padding:10px; background:#1e293b; color:#fff; border:1px solid #334155; border-radius:8px; outline:none; box-sizing:border-box;">
                    </div>
                    <div style="flex:1;">
                        <label style="font-size:11px; color:#94a3b8;">الخانة الاحتياطية 2 (اختياري):</label>
                        <input id="srvField2" type="text" value="${field2Val}" placeholder="مثال: كلمة المرور" style="width:100%; padding:10px; background:#1e293b; color:#fff; border:1px solid #334155; border-radius:8px; outline:none; box-sizing:border-box;">
                    </div>
                </div>

                <h4 style="color:#3b82f6; margin:10px 0 5px 0; font-size:14px;">خيارات وباقات الخدمة:</h4>
                <div id="optionsContainer" style="display:flex; flex-direction:column; gap:8px; margin-bottom:10px;"></div>
                <button id="addOptRowBtn" type="button" style="background:#334155; color:white; border:none; padding:8px 12px; border-radius:6px; cursor:pointer; margin-bottom:15px; font-size:13px;">➕ إضافة باقة أخرى</button>
                
                <button id="saveServiceBtn" style="background:#10b981; color:white; border:none; padding:12px; width:100%; border-radius:8px; cursor:pointer; font-weight:bold;">${editId ? 'تحديث وحفظ التعديلات' : 'حفظ ونشر الخدمة'}</button>
            </div>
        `;

        const optContainer = document.getElementById("optionsContainer");
        function addOptionRow(title = "", price = "") {
            const row = document.createElement("div");
            row.className = "option-row";
            row.style.display = "flex";
            row.style.gap = "8px";
            row.innerHTML = `
                <input type="text" placeholder="اسم الباقة (مثال: شهر)" value="${title}" class="opt-title" style="flex:2; padding:10px; background:#1e293b; color:#fff; border:1px solid #334155; border-radius:8px; outline:none; box-sizing:border-box;">
                <input type="text" placeholder="السعر ($)" value="${price}" class="opt-price" style="flex:1; padding:10px; background:#1e293b; color:#fff; border:1px solid #334155; border-radius:8px; outline:none; box-sizing:border-box;">
                <button type="button" onclick="this.parentElement.remove()" style="background:#ef4444; color:white; border:none; padding:0 10px; border-radius:8px; cursor:pointer;">✕</button>
            `;
            optContainer.appendChild(row);
        }

        if (existingData && existingData.options && Array.isArray(existingData.options)) {
            existingData.options.forEach(opt => addOptionRow(opt.title, opt.price));
        } else {
            addOptionRow();
        }

        document.getElementById("addOptRowBtn").onclick = () => addOptionRow();

        document.getElementById("saveServiceBtn").onclick = async () => {
            const name = document.getElementById("srvName").value;
            const description = document.getElementById("srvDesc").value;
            const note = document.getElementById("srvNote").value;
            const f1 = document.getElementById("srvField1").value.trim();
            const f2 = document.getElementById("srvField2").value.trim();
            
            const requiredFields = [];
            if (f1) requiredFields.push(f1);
            if (f2) requiredFields.push(f2);

            const optionRows = document.querySelectorAll(".option-row");
            const options = [];
            optionRows.forEach(r => {
                const title = r.querySelector(".opt-title").value;
                const price = r.querySelector(".opt-price").value;
                if (title && price) options.push({ title, price });
            });

            if (!name || options.length === 0) {
                alert("الرجاء إدخال اسم الخدمة وباقة واحدة على الأقل مع السعر");
                return;
            }

            try {
                const serviceData = { name, description, note, requiredFields, options };
                if (editId) {
                    await updateDoc(doc(db, "services", editId), serviceData);
                    alert("تم تحديث الخدمة بنجاح ✅");
                } else {
                    serviceData.createdAt = new Date();
                    await addDoc(collection(db, "services"), serviceData);
                    alert("تمت إضافة الخدمة بنجاح ✅");
                }
                openServices();
            } catch (err) { alert("حدث خطأ أثناء الحفظ"); }
        };
    };

    document.getElementById("showAddFormBtn").onclick = () => window.renderServiceForm();

    const list = document.getElementById("servicesList");
    try {
        const snap = await getDocs(collection(db, "services"));
        list.innerHTML = snap.empty ? "<p style='color:#94a3b8;'>لا توجد خدمات مضافة.</p>" : "";
        snap.forEach(docSnap => {
            const d = docSnap.data();
            const serviceId = docSnap.id;
            let optionsHtml = "";
            if (d.options) {
                d.options.forEach(opt => {
                    optionsHtml += `<div style="display:flex; justify-content:space-between; background:#1e293b; padding:6px 10px; border-radius:6px; margin-top:4px; font-size:12px;"><span>${opt.title}</span><strong style="color:#10b981;">$${opt.price}</strong></div>`;
                });
            }

            list.innerHTML += `
                <div style="background:#0f172a; padding:15px; border-radius:10px; border:1px solid #334155;">
                    <h3 style="margin:0 0 5px 0; color:#3b82f6; font-size:16px;">${d.name}</h3>
                    <p style="margin:0 0 5px 0; color:#94a3b8; font-size:13px;">${d.description || ""}</p>
                    ${d.note ? `<p style="margin:0 0 5px 0; color:#f59e0b; font-size:12px;">📌 ملاحظة: ${d.note}</p>` : ""}
                    <div style="font-size:11px; color:#06b6d4; margin-bottom:8px;">متطلبات الشحن: ${d.requiredFields ? d.requiredFields.join(' | ') : 'لا توجد'}</div>
                    <div style="border-top:1px solid #334155; padding-top:6px;">
                        <span style="font-size:11px; color:#94a3b8; font-weight:bold;">الباقات:</span>
                        ${optionsHtml}
                    </div>
                    <div style="display:flex; gap:10px; margin-top:12px;">
                        <button onclick='window.editService("${serviceId}", ${JSON.stringify(d)})' style="flex:1; background:#f59e0b; color:white; border:none; padding:8px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:12px;">✏️ تعديل</button>
                        <button onclick='window.deleteService("${serviceId}")' style="flex:1; background:#ef4444; color:white; border:none; padding:8px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:12px;">🗑️ حذف</button>
                    </div>
                </div>`;
        });
    } catch (err) { list.innerHTML = "<p style='color:red;'>فشل تحميل الخدمات.</p>"; }
}

window.editService = function(id, data) {
    window.renderServiceForm(id, data);
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteService = async function(id) {
    if (confirm("هل أنت متأكد من حذف هذه الخدمة نهائياً؟")) {
        await deleteDoc(doc(db, "services", id));
        alert("تم الحذف بنجاح 🗑️");
        openServices();
    }
};

// =========================
// 4. إدارة العروض (مع التعديل والحذف)
// =========================
async function openOffers() {
    setActive(offersBtn);
    page.innerHTML = `
        <h2>🎁 إدارة العروض والكوبونات</h2>
        <p>إدارة تخفيضات الأسعار وكوبونات الخصم، مع إمكانية التعديل والحذف.</p>
        <button id="showOfferBtn" style="background:#2563eb; color:white; border:none; padding:10px 15px; border-radius:8px; cursor:pointer; margin-bottom:15px; font-weight:bold;">➕ إضافة كوبون خصم</button>
        <div id="offerFormContainer"></div>
        <div id="offerList" style="margin-top:15px; display:flex; flex-direction:column; gap:10px;">جاري التحميل...</div>
    `;

    window.renderOfferForm = (editId = null, codeVal = "", discVal = "") => {
        document.getElementById("offerFormContainer").innerHTML = `
            <div style="background:#0f172a; padding:15px; border-radius:10px; margin-bottom:15px; border:1px solid #334155;">
                <input id="codeName" type="text" placeholder="كود الخصم (مثال: ANAS50)" value="${codeVal}" style="width:100%; padding:10px; margin-bottom:10px; background:#1e293b; color:#fff; border:1px solid #334155; border-radius:8px; outline:none; box-sizing:border-box;">
                <input id="discountVal" type="text" placeholder="قيمة الخصم (مثال: 10% أو 5$)" value="${discVal}" style="width:100%; padding:10px; margin-bottom:10px; background:#1e293b; color:#fff; border:1px solid #334155; border-radius:8px; outline:none; box-sizing:border-box;">
                <button id="saveOffer" style="background:#10b981; color:white; border:none; padding:10px; width:100%; border-radius:8px; cursor:pointer; font-weight:bold;">${editId ? 'تحديث الكوبون' : 'حفظ الكوبون'}</button>
            </div>
        `;
        document.getElementById("saveOffer").onclick = async () => {
            const code = document.getElementById("codeName").value.trim();
            const discount = document.getElementById("discountVal").value.trim();
            if (!code || !discount) return alert("املأ جميع الحقول");
            
            if (editId) {
                await updateDoc(doc(db, "offers", editId), { code, discount });
                alert("تم تحديث الكوبون بنجاح ✅");
            } else {
                await addDoc(collection(db, "offers"), { code, discount, usedCount: 0, limit: 100 });
                alert("تمت إضافة الكوبون بنجاح ✅");
            }
            openOffers();
        };
    };

    document.getElementById("showOfferBtn").onclick = () => window.renderOfferForm();

    const list = document.getElementById("offerList");
    const snap = await getDocs(collection(db, "offers"));
    list.innerHTML = snap.empty ? "<p style='color:#94a3b8;'>لا توجد كوبونات خصم مفعلة.</p>" : "";
    
    snap.forEach(docSnap => {
        const d = docSnap.data();
        const offerId = docSnap.id;
        list.innerHTML += `
            <div style="background:#0f172a; padding:12px; border-radius:8px; border:1px solid #334155; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <strong>كود: ${d.code}</strong> - الخصم: ${d.discount}
                </div>
                <div style="display:flex; gap:8px;">
                    <button onclick='window.editOffer("${offerId}", "${d.code}", "${d.discount}")' style="background:#f59e0b; color:white; border:none; padding:5px 10px; border-radius:6px; cursor:pointer; font-size:12px;">✏️ تعديل</button>
                    <button onclick='window.deleteOffer("${offerId}")' style="background:#ef4444; color:white; border:none; padding:5px 10px; border-radius:6px; cursor:pointer; font-size:12px;">🗑️ حذف</button>
                </div>
            </div>`;
    });
}

window.editOffer = function(id, code, discount) {
    window.renderOfferForm(id, code, discount);
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteOffer = async function(id) {
    if (confirm("هل أنت متأكد من حذف هذا الكوبون؟")) {
        await deleteDoc(doc(db, "offers", id));
        alert("تم الحذف بنجاح ✅");
        openOffers();
    }
};

// =========================
// 5. الطلبات (إخفاء أزرار الإجراءات إذا تم إكمال الطلب أو إلغاؤه)
// =========================
async function openOrders() {
    setActive(ordersBtn);
    page.innerHTML = `
        <h2>📦 إدارة الطلبات</h2>
        <p>متابعة وتحديث حالات الطلبات (إكمال أو إلغاء واسترجاع الرصيد تلقائياً).</p>
        <div id="ordersList" style="margin-top:15px; display:flex; flex-direction:column; gap:12px;">جاري التحميل...</div>
    `;

    const list = document.getElementById("ordersList");
    const snap = await getDocs(collection(db, "orders"));
    list.innerHTML = snap.empty ? "<p style='color:#94a3b8;'>لا توجد طلبات جديدة معلقة حالياً.</p>" : "";

    snap.forEach(docSnap => {
        const d = docSnap.data();
        const orderId = docSnap.id;
        const status = d.status || "قيد المعالجة";
        let color = "#f59e0b";
        if(status === "مكتمل") color = "#10b981";
        if(status === "مرفوض" || status === "ملغي") color = "#ef4444";

        // إخفاء الأزرار إذا لم يكن الطلب قيد المعالجة
        let actionButtons = "";
        if (status === "قيد المعالجة" || (!["مكتمل", "ملغي", "مرفوض"].includes(status))) {
            actionButtons = `
                <div style="display:flex; gap:10px; margin-top:12px; border-top:1px solid #334155; padding-top:10px;">
                    <button onclick='window.updateOrderStatus("${orderId}", "مكتمل")' style="flex:1; background:#10b981; color:white; border:none; padding:8px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:12px;">✅ جعلها مكتمل</button>
                    <button onclick='window.updateOrderStatus("${orderId}", "ملغي")' style="flex:1; background:#ef4444; color:white; border:none; padding:8px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:12px;">❌ رفض وإلغاء (استرجاع المبلغ)</button>
                </div>
            `;
        }

        list.innerHTML += `
            <div style="background:#0f172a; padding:15px; border-radius:10px; border:1px solid #334155;">
                <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                    <strong style="color:#3b82f6;">${d.type || 'طلب'} (#${orderId})</strong>
                    <span style="color:${color}; font-weight:bold;">${status}</span>
                </div>
                <p style="margin:4px 0; color:#10b981; font-size:13px;">👤 المستخدم: ${d.user || 'غير معروف'}</p>
                <p style="margin:4px 0; color:#fff; font-size:14px;">🎯 التفاصيل: ${d.details || ''}</p>
                <p style="margin:4px 0; color:#f59e0b; font-size:13px;">💰 المبلغ: $${d.amount || 0}</p>
                ${actionButtons}
            </div>`;
    });
}

window.updateOrderStatus = async function(orderId, newStatus) {
    if (!confirm(`هل أنت متأكد من تغيير حالة الطلب إلى (${newStatus})؟`)) return;
    
    try {
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);
        if (!orderSnap.exists()) return alert("الطلب غير موجود");
        const orderData = orderSnap.data();

        if (newStatus === "ملغي" && orderData.status !== "ملغي" && orderData.type !== "طلب شحن رصيد") {
            const refundAmount = orderData.amount || 0;
            const username = orderData.user;
            
            const usersRef = collection(db, "users");
            const userSnap = await getDocs(query(usersRef, where("name", "==", username)));
            
            if (!userSnap.empty) {
                const userDoc = userSnap.docs[0];
                const currentBalance = userDoc.data().balance || 0;
                const currentSpent = userDoc.data().spent || 0;

                await updateDoc(userDoc.ref, {
                    balance: currentBalance + refundAmount,
                    spent: Math.max(0, currentSpent - refundAmount)
                });
            }
        }

        await updateDoc(orderRef, { status: newStatus });
        alert(`تم تحديث حالة الطلب بنجاح إلى (${newStatus}) ✅`);
        openOrders();
    } catch(e) {
        alert("حدث خطأ أثناء تحديث حالة الطلب");
    }
};

// =========================
// 6. التذاكر (مع إمكانية الرد)
// =========================
async function openTickets() {
    setActive(ticketsBtn);
    page.innerHTML = `
        <h2>🎫 إدارة التذاكر والدعم</h2>
        <p>متابعة رسائل الزبائن والرد عليها.</p>
        <div id="ticketsList" style="margin-top:15px; display:flex; flex-direction:column; gap:12px;">جاري التحميل...</div>
    `;

    const list = document.getElementById("ticketsList");
    const snap = await getDocs(collection(db, "tickets"));
    list.innerHTML = snap.empty ? "<p style='color:#94a3b8;'>لا توجد تذاكر جديدة.</p>" : "";

    snap.forEach(docSnap => {
        const d = docSnap.data();
        const ticketId = docSnap.id;
        let dateStr = "غير محدد";
        if(d.createdAt && d.createdAt.seconds) {
            const date = new Date(d.createdAt.seconds * 1000);
            dateStr = date.toLocaleDateString('ar-LY') + ' ' + date.toLocaleTimeString('ar-LY', {hour: '2-digit', minute:'2-digit'});
        }

        list.innerHTML += `
            <div style="background:#0f172a; padding:15px; border-radius:10px; border:1px solid #334155;">
                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <strong style="color:#3b82f6;">${d.type}</strong>
                    <span style="font-size:12px; color:#94a3b8;">${dateStr}</span>
                </div>
                <div style="font-size:13px; color:#10b981; margin-bottom:6px;">المستخدم: ${d.user}</div>
                <div style="background:#1e293b; padding:10px; border-radius:6px; font-size:13px; color:#fff; border:1px solid #1f2937; margin-bottom:10px;">${d.message}</div>
                
                ${d.adminReply ? `<div style="background:rgba(59,130,246,0.1); border:1px solid #3b82f6; padding:10px; border-radius:6px; font-size:13px; color:#93c5fd; margin-bottom:10px;"><strong>رد الأدمن:</strong> ${d.adminReply}</div>` : ""}

                <div style="display:flex; gap:8px;">
                    <input type="text" id="reply-input-${ticketId}" placeholder="اكتب ردك هنا..." style="flex:1; padding:8px; background:#1e293b; color:#fff; border:1px solid #334155; border-radius:6px; outline:none; font-size:12px; box-sizing:border-box;">
                    <button onclick='window.sendTicketReply("${ticketId}")' style="background:#2563eb; color:white; border:none; padding:8px 12px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:12px;">إرسال الرد 💬</button>
                </div>
            </div>
        `;
    });
}

window.sendTicketReply = async function(ticketId) {
    const replyText = document.getElementById(`reply-input-${ticketId}`).value.trim();
    if (!replyText) return alert("الرجاء كتابة نص الرد");

    try {
        await updateDoc(doc(db, "tickets", ticketId), {
            adminReply: replyText,
            status: "تم الرد"
        });
        alert("تم إرسال الرد بنجاح ✅");
        openTickets();
    } catch(e) {
        alert("فشل إرسال الرد");
    }
};

// =========================
// 7. المستخدمون
// =========================
async function openUsers() {
    setActive(usersBtn);
    page.innerHTML = `
        <h2>👥 إدارة المستخدمين</h2>
        <p>عرض ومتابعة حسابات الزبائن المسجلين.</p>
        <div id="usersList" style="margin-top:15px; display:flex; flex-direction:column; gap:10px;">جاري التحميل...</div>
    `;
    const list = document.getElementById("usersList");
    const snap = await getDocs(collection(db, "users"));
    list.innerHTML = snap.empty ? "<p style='color:#94a3b8;'>لا يوجد مستخدمين مسجلين بعد.</p>" : "";
    snap.forEach(docSnap => {
        const d = docSnap.data();
        list.innerHTML += `<div style="background:#0f172a; padding:12px; border-radius:8px; border:1px solid #334155;">المستخدم: <strong>${d.name || 'بدون'}</strong> | الإيميل: ${d.email || 'غير متوفر'} | الرصيد: $${d.balance || 0}</div>`;
    });
}

// =========================
// 8. الإعدادات (مع التحكم ببونص التحويل المصرفي)
// =========================
async function openSettings() {
    setActive(settingsBtn);
    const ref = doc(db, "settings", "general");
    const snap = await getDoc(ref);
    const d = snap.exists() ? snap.data() : {};

    page.innerHTML = `
        <h2>⚙️ إعدادات المتجر العامة</h2>
        <p>تخصيص بيانات التواصل، طرق الدفع، وعناوين المحافظ، ونسبة البونص.</p>
        <div style="display:flex; flex-direction:column; gap:12px; margin-top:20px;">
            <label style="color:#94a3b8; font-size:13px;">اسم المتجر:</label>
            <input id="setStoreName" type="text" value="${d.storeName || ''}" style="padding:12px; background:#0f172a; color:#fff; border:1px solid #334155; border-radius:8px; outline:none;">
            
            <h3 style="color:#3b82f6; margin-top:10px; margin-bottom:0; font-size:16px;">طرق الدفع المحلية والبونص:</h3>
            <input id="setLibyana" type="text" placeholder="رقم ليبيانا" value="${d.libyana || ''}" style="padding:12px; background:#0f172a; color:#fff; border:1px solid #334155; border-radius:8px; outline:none;">
            <input id="setMadar" type="text" placeholder="رقم المدار" value="${d.madar || ''}" style="padding:12px; background:#0f172a; color:#fff; border:1px solid #334155; border-radius:8px; outline:none;">
            <input id="setBank" type="text" placeholder="حساب التحويل المصرفي" value="${d.bankTransfer || ''}" style="padding:12px; background:#0f172a; color:#fff; border:1px solid #334155; border-radius:8px; outline:none;">
            
            <label style="color:#10b981; font-size:13px; font-weight:bold;">🎁 نسبة بونص التحويل المصرفي (%):</label>
            <input id="setBankBonus" type="number" placeholder="مثال: 15 (يعني 15% زيادة)" value="${d.bankBonus !== undefined ? d.bankBonus : 15}" style="padding:12px; background:#0f172a; color:#10b981; font-weight:bold; border:1px solid #10b981; border-radius:8px; outline:none;">

            <h3 style="color:#10b981; margin-top:10px; margin-bottom:0; font-size:16px;">عناوين محفظة USDT:</h3>
            <input id="setUsdtTRC20" type="text" placeholder="عنوان شبكة (TRC20)" value="${d.usdtTRC20 || ''}" style="padding:12px; background:#0f172a; color:#fff; border:1px solid #334155; border-radius:8px; outline:none;">
            <input id="setUsdtBEP20" type="text" placeholder="عنوان شبكة (BEP20)" value="${d.usdtBEP20 || ''}" style="padding:12px; background:#0f172a; color:#fff; border:1px solid #334155; border-radius:8px; outline:none;">

            <h3 style="color:#f59e0b; margin-top:10px; margin-bottom:0; font-size:16px;">روابط الدعم:</h3>
            <input id="setWa" type="text" placeholder="رقم واتساب" value="${d.whatsapp || ''}" style="padding:12px; background:#0f172a; color:#fff; border:1px solid #334155; border-radius:8px; outline:none;">
            <input id="setTg" type="text" placeholder="يوزر التلجرام" value="${d.telegram || ''}" style="padding:12px; background:#0f172a; color:#fff; border:1px solid #334155; border-radius:8px; outline:none;">

            <button id="saveSettingsBtn" style="background:#2563eb; color:white; border:none; padding:15px; border-radius:10px; font-weight:bold; cursor:pointer; margin-top:15px; font-size:16px;">حفظ جميع الإعدادات ✅</button>
        </div>
    `;

    document.getElementById("saveSettingsBtn").onclick = async () => {
        const bonusVal = parseFloat(document.getElementById("setBankBonus").value) || 0;
        await setDoc(ref, {
            storeName: document.getElementById("setStoreName").value,
            libyana: document.getElementById("setLibyana").value,
            madar: document.getElementById("setMadar").value,
            bankTransfer: document.getElementById("setBank").value,
            bankBonus: bonusVal,
            usdtTRC20: document.getElementById("setUsdtTRC20").value,
            usdtBEP20: document.getElementById("setUsdtBEP20").value,
            whatsapp: document.getElementById("setWa").value,
            telegram: document.getElementById("setTg").value
        }, { merge: true });
        alert("تم حفظ الإعدادات بنجاح ✅");
    };
}

// ربط أزرار القائمة الجانبية
dashboardBtn.onclick = openDashboard;
exchangeBtn.onclick = openRate;
servicesBtn.onclick = openServices;
offersBtn.onclick = openOffers;
ordersBtn.onclick = openOrders;
ticketsBtn.onclick = openTickets;
usersBtn.onclick = openUsers;
settingsBtn.onclick = openSettings;
