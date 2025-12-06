// Admin Dashboard - admin.js

// Initialize system data
let systemData = {
    admin: { username: 'admin', password: '1234' },
    students: [],
    teachers: [],
    classes: [],
    subjects: [],
    grades: [],
    reports: []
};

// Rating scale
const ratingScale = {
    100: { min: 85, max: 100, name: 'ممتاز' },
    75: { min: 75, max: 84, name: 'جيد جداً' },
    65: { min: 65, max: 74, name: 'جيد' },
    50: { min: 50, max: 64, name: 'مقبول' },
    0: { min: 0, max: 49, name: 'راسب' }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    checkUserSession();
    loadSystemData();
    updateAllDropdowns();
    displayAllData();
    handleHashChange(); // Call on load to set initial tab
    window.addEventListener('hashchange', handleHashChange); // Listen for hash changes
});

// Handle hash change for tab switching
function handleHashChange() {
    const hash = window.location.hash.substring(1); // Get hash without '#'
    const tabName = hash ? hash + '-tab' : 'dashboard-tab'; // Default to dashboard-tab

    // Check if the tab exists
    const targetTab = document.getElementById(tabName);
    if (targetTab) {
        // Remove 'active' from all tab contents
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        // Add 'active' to the target tab
        targetTab.classList.add('active');

        // Update sidebar active link
        document.querySelectorAll('.sidebar ul li a').forEach(link => {
            link.classList.remove('active');
        });
        const activeLink = document.querySelector(`.sidebar ul li a[href="#${hash}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        } else if (!hash) {
            // Activate dashboard link if hash is empty
            document.querySelector('.sidebar ul li a[href="#"]').classList.add('active');
        }
    }
}

// Check if user is logged in
function checkUserSession() {
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    const user = JSON.parse(currentUser);
    
    if (user.role !== 'admin') {
        window.location.href = 'login.html';
        return;
    }
}

// Load system data from localStorage
function loadSystemData() {
    const saved = localStorage.getItem('systemData');
    if (saved) {
        systemData = JSON.parse(saved);
    } else {
        saveSystemData();
    }
}

// Save system data to localStorage
function saveSystemData() {
    localStorage.setItem('systemData', JSON.stringify(systemData));
}

// Open settings modal
function openSettingsModal() {
    document.getElementById('settingsModal').classList.add('active');
}

// Close settings modal
function closeSettingsModal() {
    document.getElementById('settingsModal').classList.remove('active');
    clearSettingsForm();
}

// Clear settings form
function clearSettingsForm() {
    // تم إزالة حقول كلمة المرور بعد نقل الوظيفة
    document.getElementById('adminPassword2').value = '';
    document.getElementById('newUsername').value = '';
    document.getElementById('usernameSuccess').style.display = 'none';
    document.getElementById('usernameError').style.display = 'none';
}

// وظيفة تغيير كلمة المرور تم نقلها إلى login.js

// Change username
function changeUsername() {
    const password = document.getElementById('adminPassword2').value;
    const newUsername = document.getElementById('newUsername').value.trim();
    const successDiv = document.getElementById('usernameSuccess');
    const errorDiv = document.getElementById('usernameError');

    successDiv.style.display = 'none';
    errorDiv.style.display = 'none';

    if (!password || !newUsername) {
        errorDiv.textContent = 'الرجاء ملء جميع الحقول';
        errorDiv.style.display = 'block';
        return;
    }

    if (password !== systemData.admin.password) {
        errorDiv.textContent = 'كلمة المرور غير صحيحة';
        errorDiv.style.display = 'block';
        return;
    }

    if (newUsername.length < 3) {
        errorDiv.textContent = 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل';
        errorDiv.style.display = 'block';
        return;
    }

    systemData.admin.username = newUsername;
    saveSystemData();

    successDiv.textContent = '✓ تم تحديث اسم المستخدم بنجاح!';
    successDiv.style.display = 'block';

    setTimeout(() => {
        clearSettingsForm();
        closeSettingsModal();
    }, 1500);
}

// Update all dropdowns
function updateAllDropdowns() {
    // Update student class dropdown
    const studentClassSelect = document.getElementById('studentClass');
    studentClassSelect.innerHTML = '<option value="">-- اختر فصل --</option>';
    systemData.classes.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls.id;
        option.textContent = `${cls.year} - ${cls.section}`;
        studentClassSelect.appendChild(option);
    });

    // Update teacher subject dropdown
    const teacherSubjectSelect = document.getElementById('teacherSubject');
    teacherSubjectSelect.innerHTML = '<option value="">-- اختر مادة --</option>';
    systemData.subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject.id;
        option.textContent = subject.name;
        teacherSubjectSelect.appendChild(option);
    });

    // Update teacher class dropdown
    const teacherClassSelect = document.getElementById('teacherClass');
    teacherClassSelect.innerHTML = '<option value="">-- اختر فصل --</option>';
    systemData.classes.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls.id;
        option.textContent = `${cls.year} - ${cls.section}`;
        teacherClassSelect.appendChild(option);
    });
}

// Display all data
function displayAllData() {
    displayStudents();
    displayTeachers();
    displayClasses();
    displaySubjects();
    displayReports();
    updateStats();
}

// Update statistics
function updateStats() {
    document.getElementById('studentCount').textContent = systemData.students.length;
    document.getElementById('teacherCount').textContent = systemData.teachers.length;
    document.getElementById('classCount').textContent = systemData.classes.length;
    document.getElementById('subjectCount').textContent = systemData.subjects.length;
}

// Add student
function addStudent() {
    const name = document.getElementById('studentName').value.trim();
    const id = document.getElementById('studentId').value.trim();
    const email = document.getElementById('studentEmail').value.trim();
    const classId = document.getElementById('studentClass').value;
    const successDiv = document.getElementById('studentSuccess');
    const errorDiv = document.getElementById('studentError');

    successDiv.style.display = 'none';
    errorDiv.style.display = 'none';

    if (!name || !id || !classId) {
        errorDiv.textContent = 'الرجاء ملء جميع الحقول المطلوبة';
        errorDiv.style.display = 'block';
        return;
    }

    if (systemData.students.find(s => s.studentId === id)) {
        errorDiv.textContent = 'رقم القيد موجود بالفعل';
        errorDiv.style.display = 'block';
        return;
    }

    const student = {
        id: Date.now().toString(),
        name: name,
        studentId: id,
        email: email,
        classId: classId,
        createdAt: new Date().toLocaleDateString('ar-EG')
    };

    systemData.students.push(student);
    saveSystemData();

    successDiv.textContent = `✓ تم إضافة الطالب ${name} بنجاح!`;
    successDiv.style.display = 'block';

    document.getElementById('studentName').value = '';
    document.getElementById('studentId').value = '';
    document.getElementById('studentEmail').value = '';
    document.getElementById('studentClass').value = '';

    displayStudents();
    updateStats();
}

// Display students
function displayStudents() {
    const tbody = document.getElementById('studentsList');
    
    if (systemData.students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #999;">لا توجد طلاب</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    systemData.students.forEach((student, index) => {
        const classInfo = systemData.classes.find(c => c.id === student.classId);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.name}</td>
            <td>${student.studentId}</td>
            <td>${classInfo ? `${classInfo.year} - ${classInfo.section}` : '-'}</td>
            <td>
                <button class="btn btn-small btn-danger" onclick="deleteStudent(${index})">🗑️ حذف</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Delete student
function deleteStudent(index) {
    if (confirm('هل تريد حذف هذا الطالب؟')) {
        systemData.students.splice(index, 1);
        saveSystemData();
        displayStudents();
        updateStats();
    }
}

// Add teacher
function addTeacher() {
    const name = document.getElementById('teacherName').value.trim();
    const jobNumber = document.getElementById('teacherJobNumber').value.trim();
    const subjectId = document.getElementById('teacherSubject').value;
    const classId = document.getElementById('teacherClass').value;
    const email = document.getElementById('teacherEmail').value.trim();
    const phone = document.getElementById('teacherPhone').value.trim();
    const successDiv = document.getElementById('teacherSuccess');
    const errorDiv = document.getElementById('teacherError');

    successDiv.style.display = 'none';
    errorDiv.style.display = 'none';

    if (!name || !jobNumber || !subjectId || !classId) {
        errorDiv.textContent = 'الرجاء ملء جميع الحقول المطلوبة';
        errorDiv.style.display = 'block';
        return;
    }

    if (systemData.teachers.find(t => t.jobNumber === jobNumber)) {
        errorDiv.textContent = 'الرقم الوظيفي موجود بالفعل';
        errorDiv.style.display = 'block';
        return;
    }

    const teacher = {
        id: Date.now().toString(),
        name: name,
        jobNumber: jobNumber,
        subjectId: subjectId,
        classId: classId,
        email: email,
        phone: phone,
        createdAt: new Date().toLocaleDateString('ar-EG')
    };

    systemData.teachers.push(teacher);
    saveSystemData();

    successDiv.textContent = `✓ تم إضافة المعلم ${name} بنجاح!`;
    successDiv.style.display = 'block';

    document.getElementById('teacherName').value = '';
    document.getElementById('teacherJobNumber').value = '';
    document.getElementById('teacherSubject').value = '';
    document.getElementById('teacherClass').value = '';
    document.getElementById('teacherEmail').value = '';
    document.getElementById('teacherPhone').value = '';

    displayTeachers();
    updateStats();
}

// Display teachers
function displayTeachers() {
    const tbody = document.getElementById('teachersList');
    
    if (systemData.teachers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #999;">لا يوجد معلمون</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    systemData.teachers.forEach((teacher, index) => {
        const subject = systemData.subjects.find(s => s.id === teacher.subjectId);
        const classInfo = systemData.classes.find(c => c.id === teacher.classId);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${teacher.name}</td>
            <td>${teacher.jobNumber}</td>
            <td>${subject ? subject.name : '-'}</td>
            <td>${classInfo ? `${classInfo.year} - ${classInfo.section}` : '-'}</td>
            <td>
                <button class="btn btn-small btn-danger" onclick="deleteTeacher(${index})">🗑️ حذف</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Delete teacher
function deleteTeacher(index) {
    if (confirm('هل تريد حذف هذا المعلم؟')) {
        systemData.teachers.splice(index, 1);
        saveSystemData();
        displayTeachers();
        updateStats();
    }
}

// Add class
function addClass() {
    const year = document.getElementById('className').value;
    const section = document.getElementById('classSection').value;
    const successDiv = document.getElementById('classSuccess');
    const errorDiv = document.getElementById('classError');

    successDiv.style.display = 'none';
    errorDiv.style.display = 'none';

    if (!year || !section) {
        errorDiv.textContent = 'الرجاء اختيار السنة والقسم';
        errorDiv.style.display = 'block';
        return;
    }

    if (systemData.classes.find(c => c.year === year && c.section === section)) {
        errorDiv.textContent = 'هذا الفصل موجود بالفعل';
        errorDiv.style.display = 'block';
        return;
    }

    const classObj = {
        id: Date.now().toString(),
        year: year,
        section: section,
        createdAt: new Date().toLocaleDateString('ar-EG')
    };

    systemData.classes.push(classObj);
    saveSystemData();

    successDiv.textContent = `✓ تم إضافة الفصل ${year} - ${section} بنجاح!`;
    successDiv.style.display = 'block';

    document.getElementById('className').value = '';
    document.getElementById('classSection').value = '';

    displayClasses();
    updateAllDropdowns();
    updateStats();
}

// Display classes
function displayClasses() {
    const tbody = document.getElementById('classesList');
    
    if (systemData.classes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #999;">لا توجد فصول</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    systemData.classes.forEach((cls, index) => {
        const studentCount = systemData.students.filter(s => s.classId === cls.id).length;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${cls.year}</td>
            <td>${cls.section}</td>
            <td>${studentCount}</td>
            <td>
                <button class="btn btn-small btn-danger" onclick="deleteClass(${index})">🗑️ حذف</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Delete class
function deleteClass(index) {
    if (confirm('هل تريد حذف هذا الفصل؟')) {
        systemData.classes.splice(index, 1);
        saveSystemData();
        displayClasses();
        updateAllDropdowns();
        updateStats();
    }
}

// Add subject
function addSubject() {
    const name = document.getElementById('subjectName').value.trim();
    const year = document.getElementById('subjectYear').value;
    const successDiv = document.getElementById('subjectSuccess');
    const errorDiv = document.getElementById('subjectError');

    successDiv.style.display = 'none';
    errorDiv.style.display = 'none';

    if (!name || !year) {
        errorDiv.textContent = 'الرجاء ملء جميع الحقول';
        errorDiv.style.display = 'block';
        return;
    }

    if (systemData.subjects.find(s => s.name === name && s.year === year)) {
        errorDiv.textContent = 'هذه المادة موجودة بالفعل';
        errorDiv.style.display = 'block';
        return;
    }

    const subject = {
        id: Date.now().toString(),
        name: name,
        year: year,
        createdAt: new Date().toLocaleDateString('ar-EG')
    };

    systemData.subjects.push(subject);
    saveSystemData();

    successDiv.textContent = `✓ تم إضافة المادة ${name} بنجاح!`;
    successDiv.style.display = 'block';

    document.getElementById('subjectName').value = '';
    document.getElementById('subjectYear').value = '';

    displaySubjects();
    updateAllDropdowns();
    updateStats();
}

// Display subjects
function displaySubjects() {
    const tbody = document.getElementById('subjectsList');
    
    if (systemData.subjects.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #999;">لا توجد مواد</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    systemData.subjects.forEach((subject, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${subject.name}</td>
            <td>${subject.year}</td>
            <td>
                <button class="btn btn-small btn-danger" onclick="deleteSubject(${index})">🗑️ حذف</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Delete subject
function deleteSubject(index) {
    if (confirm('هل تريد حذف هذه المادة؟')) {
        systemData.subjects.splice(index, 1);
        saveSystemData();
        displaySubjects();
        updateAllDropdowns();
        updateStats();
    }
}

// Search grades
function searchGrades() {
    const name = document.getElementById('gradeStudentName').value.trim();
    const id = document.getElementById('gradeStudentId').value.trim();
    const resultDiv = document.getElementById('gradesResult');
    const resultBody = document.getElementById('gradesResultBody');

    if (!name || !id) {
        alert('الرجاء إدخال اسم الطالب ورقم القيد');
        return;
    }

    const student = systemData.students.find(s => s.name === name && s.studentId === id);
    
    if (!student) {
        alert('لم يتم العثور على الطالب');
        resultDiv.style.display = 'none';
        return;
    }

    const studentGrades = systemData.grades.filter(g => g.studentId === student.id);
    
    if (studentGrades.length === 0) {
        resultBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #999;">لا توجد درجات</td></tr>';
    } else {
        resultBody.innerHTML = '';
        studentGrades.forEach((grade, index) => {
            const subject = systemData.subjects.find(s => s.id === grade.subjectId);
            const rating = getRating(grade.grade);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${subject ? subject.name : '-'}</td>
                <td><input type="number" value="${grade.grade}" id="grade_${index}" min="0" max="100" style="width: 60px;"></td>
                <td>${rating.name}</td>
                <td>
                    <button class="btn btn-small btn-primary" onclick="updateGrade(${index}, '${student.id}')">✓ تحديث</button>
                </td>
            `;
            resultBody.appendChild(row);
        });
    }

    resultDiv.style.display = 'block';
}

// Get rating based on grade
function getRating(grade) {
    const gradeNum = parseInt(grade);
    
    for (let key in ratingScale) {
        const scale = ratingScale[key];
        if (gradeNum >= scale.min && gradeNum <= scale.max) {
            return scale;
        }
    }
    
    return ratingScale[0];
}

// Update grade
function updateGrade(index, studentId) {
    const newGrade = document.getElementById(`grade_${index}`).value;
    
    if (newGrade < 0 || newGrade > 100) {
        alert('الدرجة يجب أن تكون بين 0 و 100');
        return;
    }

    const gradeIndex = systemData.grades.findIndex(g => g.studentId === studentId);
    if (gradeIndex !== -1) {
        systemData.grades[gradeIndex].grade = parseInt(newGrade);
        saveSystemData();
        alert('✓ تم تحديث الدرجة بنجاح!');
        searchGrades();
    }
}

// Display reports
function displayReports() {
    const tbody = document.getElementById('reportsList');
    
    if (systemData.reports.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #999;">لا توجد تقارير</td></tr>';
        return;
    }

    tbody.innerHTML = '';
    systemData.reports.forEach((report, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${report.teacherName}</td>
            <td>${report.subject}</td>
            <td>${report.class}</td>
            <td>${report.month}</td>
            <td>${report.date}</td>
            <td>
                <button class="btn btn-small btn-primary" onclick="viewReport(${index})">👁️ عرض</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// View report
function viewReport(index) {
    const report = systemData.reports[index];
    alert(`
تقرير المعلم
============
المعلم: ${report.teacherName}
المادة: ${report.subject}
الفصل: ${report.class}
الشهر: ${report.month}
التاريخ: ${report.date}

الملاحظات:
${report.notes}
    `);
}

// Delete report
function deleteReport() {
    const teacherName = document.getElementById('deleteReportTeacher').value.trim();
    const month = document.getElementById('deleteReportMonth').value;
    const successDiv = document.getElementById('deleteReportSuccess');
    const errorDiv = document.getElementById('deleteReportError');

    successDiv.style.display = 'none';
    errorDiv.style.display = 'none';

    if (!teacherName || !month) {
        errorDiv.textContent = 'الرجاء إدخال اسم المعلم واختيار الشهر.';
        errorDiv.style.display = 'block';
        return;
    }

    const initialLength = systemData.reports.length;
    
    // Filter out reports that match the criteria
    systemData.reports = systemData.reports.filter(report => {
        const nameMatch = report.teacherName.includes(teacherName);
        const monthMatch = report.month === month;
        return !(nameMatch && monthMatch);
    });

    const deletedCount = initialLength - systemData.reports.length;

    if (deletedCount > 0) {
        saveSystemData();
        displayReports();
        successDiv.textContent = `✓ تم حذف ${deletedCount} تقرير(تقارير) بنجاح!`;
        successDiv.style.display = 'block';
        document.getElementById('deleteReportTeacher').value = '';
        document.getElementById('deleteReportMonth').value = '';
    } else {
        errorDiv.textContent = 'لم يتم العثور على تقارير مطابقة للحذف.';
        errorDiv.style.display = 'block';
    }
}

// Switch tabs
function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-btn');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    buttons.forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

// Logout
function logout() {
    if (confirm('هل تريد تسجيل الخروج؟')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}

// Delete report
function deleteReport() {
    const teacherName = document.getElementById('deleteReportTeacher').value.trim();
    const month = document.getElementById('deleteReportMonth').value;
    const successDiv = document.getElementById('deleteReportSuccess');
    const errorDiv = document.getElementById('deleteReportError');

    successDiv.style.display = 'none';
    errorDiv.style.display = 'none';

    if (!teacherName || !month) {
        errorDiv.textContent = 'الرجاء إدخال اسم المعلم واختيار الشهر.';
        errorDiv.style.display = 'block';
        return;
    }

    if (confirm(`هل أنت متأكد من حذف جميع تقارير المعلم "${teacherName}" لشهر "${month}"؟ هذا الإجراء لا يمكن التراجع عنه.`)) {
        const initialLength = systemData.reports.length;
        
        // Filter out reports that match the criteria
        systemData.reports = systemData.reports.filter(report => {
            const nameMatch = report.teacherName.includes(teacherName);
            const monthMatch = report.month === month;
            return !(nameMatch && monthMatch);
        });

        const deletedCount = initialLength - systemData.reports.length;

        if (deletedCount > 0) {
            saveSystemData();
            displayReports();
            successDiv.textContent = `✓ تم حذف ${deletedCount} تقرير(تقارير) بنجاح!`;
            successDiv.style.display = 'block';
            document.getElementById('deleteReportTeacher').value = '';
            document.getElementById('deleteReportMonth').value = '';
        } else {
            errorDiv.textContent = 'لم يتم العثور على تقارير مطابقة للحذف.';
            errorDiv.style.display = 'block';
        }
    }
}
