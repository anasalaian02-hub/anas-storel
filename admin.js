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
    collection
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

// إخفاء الصفحة مبدئياً حتى نتأكد من الهوية
document.body.style.display = "none";

// التحقق من صلاحيات الدخول
onAuthStateChanged(auth, (user) => {
    if (user && user.email === ADMIN_EMAIL) {
        document.body.style.display = "block";
        openDashboard();
    } else {
        alert("🚫 عذراً، هذه الصفحة مخصصة لإدارة المتجر فقط!");
        window.location.href = "index.html";
    }
});

// =========================
// عناصر القائمة
// =========================
const page = document.getElementById("page-content");
const dashboardBtn = document.getElementById("dashboardBtn");
const exchangeBtn = document.getElementById("exchangeBtn");
const categoriesBtn = document.getElementById("categoriesBtn");
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
                <h3 style="color:#10b981; margin:0 0 10px 0; font-size:14px;">💰 أرصدة المحافظ (الحالية)</h3>
                <p style="margin:0; color:#fff; font-size:24px; font-weight:bold;">$${totalBalances.toFixed(2)}</p>
            </div>

            <div style="background:#1e293b; padding:15px; border-radius:10px; text-align:center; border:1px solid #334155;">
                <h3 style="color:#f59e0b; margin:0 0 10px 0; font-size:14px;">🛒 المبيعات (الأموال المنفقة)</h3>
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
        document.getElementById("dashboardStats").innerHTML = `<p style="color:#ef4444;">❌ فشل جلب الإحصائيات، تأكد من اتصالك بالإنترنت.</p>`;
    }
}

// =========================
// 2. سعر الصرف (Exchange Rate)
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
        if (!rate) {
            alert("أدخل سعر صحيح");
            return;
        }
        await setDoc(ref, { rate: rate });
        alert("تم حفظ سعر الصرف بنجاح ✅");
    };
}

// =========================
// 3. التصنيفات (Categories)
// =========================
async function openCategories() {
    setActive(categoriesBtn);
    page.innerHTML = `
        <h2>📂 إدارة التصنيفات</h2>
        <p>إضافة وعرض تصنيفات الخدمات.</p>
        <button id="showCatBtn" style="background:#2563eb; color:white; border:none; padding:10px 15px; border-radius:8px; cursor:pointer; margin-bottom:15px; font-weight:bold;">➕ إضافة تصنيف</button>
        <div id="catFormContainer"></div>
        <div id="catList" style="margin-top:15px; display:flex; flex-direction:column; gap:10px;">جاري التحميل...</div>
    `;

    document.getElementById("showCatBtn").onclick = () => {
        document.getElementById("catFormContainer").innerHTML = `
            <div style="background:#0f172a; padding:15px; border-radius:10px; margin-bottom:15px; border:1px solid #334155;">
                <input id="catName" type="text" placeholder="اسم التصنيف" style="width:100%; padding:10px; margin-bottom:10px; background:#1e293b; color:#fff; border:1px solid #334155; border-radius:8px; outline:none; box-sizing:border-box;">
                <button id="saveCat" style="background:#10b981; color:white; border:none; padding:10px; width:100%; border-radius:8px; cursor:pointer; font-weight:bold;">حفظ التصنيف</button>
            </div>
        `;
        document.getElementById("saveCat").onclick = async () => {
            const name = document.getElementById("catName").value;
            if (!name) return alert("أدخل اسم التصنيف");
            await addDoc(collection(db, "categories"), { name });
            alert("تمت الإضافة بنجاح ✅");
            openCategories();
        };
    };

    const list = document.getElementById("catList");
    const snap = await getDocs(collection(db, "categories"));
    list.innerHTML = snap.empty ? "<p style='color:#94a3b8;'>لا توجد تصنيفات.</p>" : "";
    snap.forEach(docSnap => {
        const d = docSnap.data();
        list.innerHTML += `<div style="background:#0f172a; padding:12px; border-radius:8px; border:1px solid #334155;"><strong>${d.name}</strong></div>`;
    });
}

// =========================
// 4. الخدمات (Services - معدلة مع التعديل والحذف)
// =========================
async function openServices() {
    setActive(servicesBtn);
    page.innerHTML = `
        <h2>🛒 إدارة الخدمات</h2>
        <p>إضافة خدمة رئيسية مع خياراتها وباقاتها المختلفة، أو تعديل وحذف الخدمات السابقة.</p>
        <button id="showAddFormBtn" style="background:#2563eb; color:white; border:none; padding:12px 16px; border-radius:8px; cursor:pointer; margin-bottom:15px; font-weight:bold;">➕ إضافة خدمة جديدة</button>
        <div id="addServiceContainer"></div>
        <div id="servicesList" style="margin-top:20px; display:flex; flex-direction:column; gap:12px;">جاري التحميل...</div>
    `;

    // دالة فتح نموذج الإضافة أو التعديل
    window.renderServiceForm = (editId = null, existingData = null) => {
        const container = document.getElementById("addServiceContainer");
        let nameVal = existingData ? existingData.name : "";
        let descVal = existingData ? existingData.description : "";
        
        container.innerHTML = `
            <div style="background:#0f172a; padding:15px; border-radius:10px; margin-bottom:20px; border:1px solid #334155;">
                <h3 style="color:#3b82f6; margin-top:0; font-size:16px;">${editId ? 'تعديل الخدمة' : 'إضافة خدمة رئيسية'}</h3>
                <input id="srvName" type="text" placeholder="اسم الخدمة (مثال: اشتراك كاب كات)" value="${nameVal}" style="width:100%; padding:12px; margin-bottom:10px; background:#1e293b; color:#fff; border:1px solid #334155; border-radius:8px; outline:none; box-sizing:border-box;">
                <textarea id="srvDesc" placeholder="وصف عام للخدمة..." rows="2" style="width:100%; padding:12px; margin-bottom:15px; background:#1e293b; color:#fff; border:1px solid #334155; border-radius:8px; outline:none; box-sizing:border-box;">${descVal}</textarea>
                
                <h4 style="color:#3b82f6; margin:0 0 10px 0; font-size:14px;">خيارات / باقات الخدمة:</h4>
                <div id="optionsContainer" style="display:flex; flex-direction:column; gap:8px; margin-bottom:10px;"></div>
                <button id="addOptRowBtn" type="button" style="background:#334155; color:white; border:none; padding:8px 12px; border-radius:6px; cursor:pointer; margin-bottom:15px; font-size:13px;">➕ إضافة خيار آخر</button>
                
                <button id="saveServiceBtn" style="background:#10b981; color:white; border:none; padding:12px; width:100%; border-radius:8px; cursor:pointer; font-weight:bold;">${editId ? 'تحديث وحفظ التعديلات' : 'حفظ ونشر الخدمة وباقاتها'}</button>
            </div>
        `;

        const optContainer = document.getElementById("optionsContainer");

        function addOptionRow(title = "", price = "") {
            const row = document.createElement("div");
            row.className = "option-row";
            row.style.display = "flex";
            row.style.gap = "8px";
            row.innerHTML = `
                <input type="text" placeholder="المدة أو النوع (مثال: سنة كاملة)" value="${title}" class="opt-title" style="flex:2; padding:10px; background:#1e293b; color:#fff; border:1px solid #334155; border-radius:8px; outline:none; box-sizing:border-box;">
                <input type="text" placeholder="السعر (مثال: 2$)" value="${price}" class="opt-price" style="flex:1; padding:10px; background:#1e293b; color:#fff; border:1px solid #334155; border-radius:8px; outline:none; box-sizing:border-box;">
                <button type="button" onclick="this.parentElement.remove()" style="background:#ef4444; color:white; border:none; padding:0 10px; border-radius:8px; cursor:pointer;">✕</button>
            `;
            optContainer.appendChild(row);
        }

        // إذا كنا نعدل خدمة موجودة، نعبي خياراتها القديمة
        if (existingData && existingData.options && Array.isArray(existingData.options)) {
            existingData.options.forEach(opt => {
                addOptionRow(opt.title, opt.price);
            });
        } else {
            addOptionRow(); // إضافة صف فارغ افتراضي لو جديدة
        }

        document.getElementById("addOptRowBtn").onclick = () => addOptionRow();

        document.getElementById("saveServiceBtn").onclick = async () => {
            const name = document.getElementById("srvName").value;
            const description = document.getElementById("srvDesc").value;
            const optionRows = document.querySelectorAll(".option-row");
            const options = [];
            optionRows.forEach(r => {
                const title = r.querySelector(".opt-title").value;
                const price = r.querySelector(".opt-price").value;
                if (title && price) {
                    options.push({ title, price });
                }
            });

            if (!name || options.length === 0) {
                alert("الرجاء إدخال اسم الخدمة وخيار واحد على الأقل مع السعر");
                return;
            }

            try {
                if (editId) {
                    // تحديث خدمة موجودة
                    await updateDoc(doc(db, "services", editId), {
                        name, description, options
                    });
                    alert("تم تحديث الخدمة بنجاح ✅");
                } else {
                    // إضافة خدمة جديدة
                    await addDoc(collection(db, "services"), {
                        name, description, options, createdAt: new Date()
                    });
                    alert("تمت إضافة الخدمة وباقاتها بنجاح ✅");
                }
                openServices();
            } catch (err) { alert("حدث خطأ أثناء الحفظ"); }
        };
    };

    document.getElementById("showAddFormBtn").onclick = () => window.renderServiceForm();

    // جلب وعرض الخدمات مع أزرار التعديل والحذف
    const list = document.getElementById("servicesList");
    try {
        const snap = await getDocs(collection(db, "services"));
        list.innerHTML = snap.empty ? "<p style='color:#94a3b8;'>لا توجد خدمات مضافة.</p>" : "";
        
        snap.forEach(docSnap => {
            const d = docSnap.data();
            const serviceId = docSnap.id;
            let optionsHtml = "";
            if (d.options && Array.isArray(d.options)) {
                d.options.forEach(opt => {
                    optionsHtml += `
                        <div style="display:flex; justify-content:space-between; background:#1e293b; padding:8px 12px; border-radius:6px; margin-top:5px; font-size:13px;">
                            <span>${opt.title}</span><strong style="color:#10b981;">${opt.price}</strong>
                        </div>`;
                });
            }

            list.innerHTML += `
                <div style="background:#0f172a; padding:15px; border-radius:10px; border:1px solid #334155;" id="srv-card-${serviceId}">
                    <h3 style="margin:0 0 5px 0; color:#3b82f6; font-size:16px;">${d.name}</h3>
                    <p style="margin:0 0 10px 0; color:#94a3b8; font-size:13px;">${d.description || ""}</p>
                    <div style="border-top:1px solid #334155; padding-top:8px; margin-top:8px;">
                        <span style="font-size:12px; color:#94a3b8; font-weight:bold;">الخيارات / الباقات المتاحة:</span>
                        ${optionsHtml}
                    </div>
                    <div style="display:flex; gap:10px; margin-top:15px;">
                        <button onclick='window.editService("${serviceId}", ${JSON.stringify(d.name)}, ${JSON.stringify(d.description || "")}, ${JSON.stringify(d.options)})' style="flex:1; background:#f59e0b; color:white; border:none; padding:8px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:13px;">✏️ تعديل الخدمة</button>
                        <button onclick='window.deleteService("${serviceId}")' style="flex:1; background:#ef4444; color:white; border:none; padding:8px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:13px;">🗑️ حذف الخدمة</button>
                    </div>
                </div>`;
        });
    } catch (err) { list.innerHTML = "<p style='color:red;'>فشل تحميل الخدمات.</p>"; }
}

// دوال التعديل والحذف العامة لتكون متاحة في النطاق العام
window.editService = function(id, name, description, options) {
    window.renderServiceForm(id, { name, description, options });
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteService = async function(id) {
    if (confirm("هل أنت متأكد من حذف هذه الخدمة نهائياً؟")) {
        try {
            await deleteDoc(doc(db, "services", id));
            alert("تم حذف الخدمة بنجاح 🗑️");
            openServices();
        } catch(e) {
            alert("فشل حذف الخدمة");
        }
    }
};

// =========================
// 5. العروض (Offers)
// =========================
async function openOffers() {
    setActive(offersBtn);
    page.innerHTML = `
        <h2>🎁 إدارة العروض والكوبونات</h2>
        <p>إدارة تخفيضات الأسعار وكوبونات الخصم.</p>
        <button id="showOfferBtn" style="background:#2563eb; color:white; border:none; padding:10px 15px; border-radius:8px; cursor:pointer; margin-bottom:15px; font-weight:bold;">➕ إضافة كوبون خصم</button>
        <div id="offerFormContainer"></div>
        <div id="offerList" style="margin-top:15px; display:flex; flex-direction:column; gap:10px;">جاري التحميل...</div>
    `;

    document.getElementById("showOfferBtn").onclick = () => {
        document.getElementById("offerFormContainer").innerHTML = `
            <div style="background:#0f172a; padding:15px; border-radius:10px; margin-bottom:15px; border:1px solid #334155;">
                <input id="codeName" type="text" placeholder="كود الخصم (مثال: ANAS50)" style="width:100%; padding:10px; margin-bottom:10px; background:#1e293b; color:#fff; border:1px solid #334155; border-radius:8px; outline:none; box-sizing:border-box;">
                <input id="discountVal" type="text" placeholder="قيمة الخصم (مثال: 10% أو 5 د.ل)" style="width:100%; padding:10px; margin-bottom:10px; background:#1e293b; color:#fff; border:1px solid #334155; border-radius:8px; outline:none; box-sizing:border-box;">
                <button id="saveOffer" style="background:#10b981; color:white; border:none; padding:10px; width:100%; border-radius:8px; cursor:pointer; font-weight:bold;">حفظ الكوبون</button>
            </div>
        `;
        document.getElementById("saveOffer").onclick = async () => {
            const code = document.getElementById("codeName").value;
            const discount = document.getElementById("discountVal").value;
            if (!code || !discount) return alert("املأ جميع الحقول");
            await addDoc(collection(db, "offers"), { code, discount });
            alert("تم حفظ الكوبون بنجاح ✅");
            openOffers();
        };
    };

    const list = document.getElementById("offerList");
    const snap = await getDocs(collection(db, "offers"));
    list.innerHTML = snap.empty ? "<p style='color:#94a3b8;'>لا توجد كوبونات خصم مفعلة.</p>" : "";
    snap.forEach(docSnap => {
        const d = docSnap.data();
        list.innerHTML += `<div style="background:#0f172a; padding:12px; border-radius:8px; border:1px solid #334155;"><strong>كود: ${d.code}</strong> - الخصم: ${d.discount}</div>`;
    });
}

// =========================
// 6. الطلبات (Orders)
// =========================
async function openOrders() {
    setActive(ordersBtn);
    page.innerHTML = `
        <h2>📦 إدارة الطلبات</h2>
        <p>متابعة طلبات الزبائن الواردة.</p>
        <div id="ordersList" style="margin-top:15px; display:flex; flex-direction:column; gap:10px;">جاري التحميل...</div>
    `;
    const list = document.getElementById("ordersList");
    const snap = await getDocs(collection(db, "orders"));
    list.innerHTML = snap.empty ? "<p style='color:#94a3b8;'>لا توجد طلبات جديدة معلقة حالياً.</p>" : "";
    snap.forEach(docSnap => {
        const d = docSnap.data();
        list.innerHTML += `<div style="background:#0f172a; padding:12px; border-radius:8px; border:1px solid #334155;">طلب رقم: ${docSnap.id} - الحالة: ${d.status || 'معلق'}</div>`;
    });
}

// =========================
// 7. التذاكر (Tickets)
// =========================
async function openTickets() {
    setActive(ticketsBtn);
    page.innerHTML = `
        <h2>🎫 إدارة التذاكر والدعم</h2>
        <p>متابعة رسائل الزبائن وطلبات التعويض.</p>
        <div id="ticketsList" style="margin-top:15px; display:flex; flex-direction:column; gap:10px;">جاري التحميل...</div>
    `;
    const list = document.getElementById("ticketsList");
    const snap = await getDocs(collection(db, "tickets"));
    list.innerHTML = snap.empty ? "<p style='color:#94a3b8;'>لا توجد تذاكر جديدة معلقة.</p>" : "";
    snap.forEach(docSnap => {
        const d = docSnap.data();
        let dateStr = "غير محدد";
        if(d.createdAt && d.createdAt.seconds) {
            const date = new Date(d.createdAt.seconds * 1000);
            dateStr = date.toLocaleDateString('ar-LY') + ' ' + date.toLocaleTimeString('ar-LY', {hour: '2-digit', minute:'2-digit'});
        }
        list.innerHTML += `
            <div style="background:#0f172a; padding:15px; border-radius:10px; border:1px solid #334155;">
                <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                    <strong style="color:#3b82f6;">${d.type}</strong>
                    <span style="font-size:12px; color:#94a3b8;">${dateStr}</span>
                </div>
                <div style="font-size:14px; color:#10b981; margin-bottom:8px;">المستخدم: ${d.user}</div>
                <div style="background:#1e293b; padding:10px; border-radius:6px; font-size:14px; color:#fff; border:1px solid #1f2937;">${d.message}</div>
            </div>
        `;
    });
}

// =========================
// 8. المستخدمون (Users)
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
        list.innerHTML += `<div style="background:#0f172a; padding:12px; border-radius:8px; border:1px solid #334155;">المستخدم: ${d.name || d.email || docSnap.id}</div>`;
    });
}

// =========================
// 9. الإعدادات (Settings)
// =========================
async function openSettings() {
    setActive(settingsBtn);
    const ref = doc(db, "settings", "general");
    const snap = await getDoc(ref);
    const d = snap.exists() ? snap.data() : {};

    page.innerHTML = `
        <h2>⚙️ إعدادات المتجر العامة</h2>
        <p>تخصيص بيانات التواصل وطرق الدفع وعناوين المحافظ.</p>
        <div style="display:flex; flex-direction:column; gap:12px; margin-top:20px;">
            <label style="color:#94a3b8; font-size:13px;">اسم المتجر:</label>
            <input id="setStoreName" type="text" value="${d.storeName || ''}" style="padding:12px; background:#0f172a; color:#fff; border:1px solid #334155; border-radius:8px; outline:none;">
            
            <h3 style="color:#3b82f6; margin-top:10px; margin-bottom:0; font-size:16px;">طرق الدفع المحلية:</h3>
            <input id="setLibyana" type="text" placeholder="رقم ليبيانا" value="${d.libyana || ''}" style="padding:12px; background:#0f172a; color:#fff; border:1px solid #334155; border-radius:8px; outline:none;">
            <input id="setMadar" type="text" placeholder="رقم المدار" value="${d.madar || ''}" style="padding:12px; background:#0f172a; color:#fff; border:1px solid #334155; border-radius:8px; outline:none;">
            <input id="setBank" type="text" placeholder="حساب التحويل المصرفي" value="${d.bankTransfer || ''}" style="padding:12px; background:#0f172a; color:#fff; border:1px solid #334155; border-radius:8px; outline:none;">

            <h3 style="color:#10b981; margin-top:10px; margin-bottom:0; font-size:16px;">عناوين محفظة USDT:</h3>
            <input id="setUsdtTRC20" type="text" placeholder="عنوان شبكة (TRC20)" value="${d.usdtTRC20 || ''}" style="padding:12px; background:#0f172a; color:#fff; border:1px solid #334155; border-radius:8px; outline:none;">
            <input id="setUsdtBEP20" type="text" placeholder="عنوان شبكة (BEP20 / BNB)" value="${d.usdtBEP20 || ''}" style="padding:12px; background:#0f172a; color:#fff; border:1px solid #334155; border-radius:8px; outline:none;">

            <h3 style="color:#f59e0b; margin-top:10px; margin-bottom:0; font-size:16px;">روابط الدعم:</h3>
            <input id="setWa" type="text" placeholder="رقم واتساب (بدون أصفار أو +)" value="${d.whatsapp || ''}" style="padding:12px; background:#0f172a; color:#fff; border:1px solid #334155; border-radius:8px; outline:none;">
            <input id="setTg" type="text" placeholder="يوزر التلجرام (بدون @)" value="${d.telegram || ''}" style="padding:12px; background:#0f172a; color:#fff; border:1px solid #334155; border-radius:8px; outline:none;">

            <button id="saveSettingsBtn" style="background:#2563eb; color:white; border:none; padding:15px; border-radius:10px; font-weight:bold; cursor:pointer; margin-top:15px; font-size:16px;">حفظ جميع الإعدادات ✅</button>
        </div>
    `;

    document.getElementById("saveSettingsBtn").onclick = async () => {
        await setDoc(ref, {
            storeName: document.getElementById("setStoreName").value,
            libyana: document.getElementById("setLibyana").value,
            madar: document.getElementById("setMadar").value,
            bankTransfer: document.getElementById("setBank").value,
            usdtTRC20: document.getElementById("setUsdtTRC20").value,
            usdtBEP20: document.getElementById("setUsdtBEP20").value,
            whatsapp: document.getElementById("setWa").value,
            telegram: document.getElementById("setTg").value
        }, { merge: true });
        alert("تم حفظ الإعدادات بنجاح ✅");
    };
}

// ربط الأزرار
dashboardBtn.onclick = openDashboard;
exchangeBtn.onclick = openRate;
categoriesBtn.onclick = openCategories;
servicesBtn.onclick = openServices;
offersBtn.onclick = openOffers;
ordersBtn.onclick = openOrders;
ticketsBtn.onclick = openTickets;
usersBtn.onclick = openUsers;
settingsBtn.onclick = openSettings;
