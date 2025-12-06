// Login System - login.js

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

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadSystemData();
});

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

// Switch tabs
function switchTab(tabName, event) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-btn');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    buttons.forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    if (event && event.target) {
        event.target.classList.add('active');
    } else {
        // Find the button manually if event is not passed (e.g., direct call)
        const button = document.querySelector(`.tab-btn[onclick*="${tabName}"]`);
        if (button) {
            button.classList.add('active');
        }
    }
}

// Change password
function changePassword() {
    const currentPassword = document.getElementById('changePassCurrentPassword').value;
    const newPassword = document.getElementById('changePassNewPassword').value;
    const confirmPassword = document.getElementById('changePassConfirmPassword').value;
    const successDiv = document.getElementById('changePassSuccess');
    const errorDiv = document.getElementById('changePassError');

    successDiv.style.display = 'none';
    errorDiv.style.display = 'none';

    if (!currentPassword || !newPassword || !confirmPassword) {
        errorDiv.textContent = 'الرجاء ملء جميع الحقول';
        errorDiv.style.display = 'block';
        return;
    }

    // Check if the current password matches the admin's password
    if (currentPassword !== systemData.admin.password) {
        errorDiv.textContent = 'كلمة المرور الحالية غير صحيحة';
        errorDiv.style.display = 'block';
        return;
    }

    if (newPassword !== confirmPassword) {
        errorDiv.textContent = 'كلمة المرور الجديدة غير متطابقة';
        errorDiv.style.display = 'block';
        return;
    }

    if (newPassword.length < 4) {
        errorDiv.textContent = 'كلمة المرور يجب أن تكون 4 أحرف على الأقل';
        errorDiv.style.display = 'block';
        return;
    }

    // Update the password
    systemData.admin.password = newPassword;
    saveSystemData();

    // Clear the form fields
    document.getElementById('changePassCurrentPassword').value = '';
    document.getElementById('changePassNewPassword').value = '';
    document.getElementById('changePassConfirmPassword').value = '';

    successDiv.textContent = '✓ تم تحديث كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بها.';
    successDiv.style.display = 'block';

    // Switch back to admin login tab after a short delay
    setTimeout(() => {
        successDiv.style.display = 'none';
        switchTab('admin-tab');
    }, 3000);
}

// Login Student
function loginStudent() {
    const name = document.getElementById('studentName').value.trim();
    const id = document.getElementById('studentId').value.trim();
    const errorDiv = document.getElementById('studentError');
    const successDiv = document.getElementById('studentSuccess');

    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';

    if (!name || !id) {
        errorDiv.textContent = 'الرجاء إدخال الاسم ورقم القيد';
        errorDiv.style.display = 'block';
        return;
    }

    // Find student in system
    const student = systemData.students.find(s => s.name === name && s.studentId === id);
    
    if (!student) {
        errorDiv.textContent = 'بيانات الطالب غير صحيحة. الرجاء التحقق من الاسم ورقم القيد';
        errorDiv.style.display = 'block';
        return;
    }

    // Save current user session
    const currentUser = {
        role: 'student',
        id: student.id,
        name: student.name,
        studentId: student.studentId,
        class: student.classId,
        loginTime: new Date().toLocaleString('ar-EG')
    };

    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    successDiv.textContent = `✓ مرحباً ${name}! جاري التوجيه...`;
    successDiv.style.display = 'block';
    
    setTimeout(() => {
        window.location.href = 'student_dashboard.html';
    }, 1500);
}

// Login Teacher
function loginTeacher() {
    const name = document.getElementById('teacherName').value.trim();
    const jobNumber = document.getElementById('teacherJobNumber').value.trim();
    const errorDiv = document.getElementById('teacherError');
    const successDiv = document.getElementById('teacherSuccess');

    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';

    if (!name || !jobNumber) {
        errorDiv.textContent = 'الرجاء إدخال الاسم والرقم الوظيفي';
        errorDiv.style.display = 'block';
        return;
    }

    // Find teacher in system
    const teacher = systemData.teachers.find(t => t.name === name && t.jobNumber === jobNumber);
    
    if (!teacher) {
        errorDiv.textContent = 'بيانات المعلم غير صحيحة. الرجاء التحقق من الاسم والرقم الوظيفي';
        errorDiv.style.display = 'block';
        return;
    }

    // Save current user session
    const currentUser = {
        role: 'teacher',
        id: teacher.id,
        name: teacher.name,
        jobNumber: teacher.jobNumber,
        subject: teacher.subjectId,
        class: teacher.classId,
        loginTime: new Date().toLocaleString('ar-EG')
    };

    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    successDiv.textContent = `✓ مرحباً ${name}! جاري التوجيه...`;
    successDiv.style.display = 'block';
    
    setTimeout(() => {
        window.location.href = 'teacher_dashboard.html';
    }, 1500);
}

// Login Admin
function loginAdmin() {
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value.trim();
    const errorDiv = document.getElementById('adminError');
    const successDiv = document.getElementById('adminSuccess');

    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';

    if (!username || !password) {
        errorDiv.textContent = 'الرجاء إدخال اسم المستخدم وكلمة المرور';
        errorDiv.style.display = 'block';
        return;
    }

    // Check admin credentials
    if (username !== systemData.admin.username || password !== systemData.admin.password) {
        errorDiv.textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة';
        errorDiv.style.display = 'block';
        return;
    }

    // Save current user session
    const currentUser = {
        role: 'admin',
        username: systemData.admin.username,
        loginTime: new Date().toLocaleString('ar-EG')
    };

    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    successDiv.textContent = `✓ مرحباً بك في لوحة التحكم! جاري التوجيه...`;
    successDiv.style.display = 'block';
    
    setTimeout(() => {
        window.location.href = 'admin_dashboard.html';
    }, 1500);
}
