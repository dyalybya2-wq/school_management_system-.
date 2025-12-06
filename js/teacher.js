// Teacher Dashboard - teacher.js

const ratingScale = {
    100: { min: 85, max: 100, name: 'ممتاز' },
    75: { min: 75, max: 84, name: 'جيد جداً' },
    65: { min: 65, max: 74, name: 'جيد' },
    50: { min: 50, max: 64, name: 'مقبول' },
    0: { min: 0, max: 49, name: 'راسب' }
};

let currentTeacher = null;
let systemData = null;

document.addEventListener('DOMContentLoaded', function() {
    checkUserSession();
    loadSystemData();
    displayTeacherInfo();
    updateStudentDropdown();
    displayGrades();
});

function checkUserSession() {
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    const user = JSON.parse(currentUser);
    
    if (user.role !== 'teacher') {
        window.location.href = 'login.html';
        return;
    }
    
    currentTeacher = user;
}

function loadSystemData() {
    const saved = localStorage.getItem('systemData');
    if (saved) {
        systemData = JSON.parse(saved);
    } else {
        systemData = {
            students: [],
            teachers: [],
            classes: [],
            subjects: [],
            grades: [],
            reports: []
        };
    }
}

function displayTeacherInfo() {
    document.getElementById('teacherName').textContent = currentTeacher.name;
    document.getElementById('teacherJobNumber').textContent = currentTeacher.jobNumber;
    
    const subject = systemData.subjects.find(s => s.id === currentTeacher.subject);
    if (subject) {
        document.getElementById('teacherSubject').textContent = subject.name;
    }
    
    const classInfo = systemData.classes.find(c => c.id === currentTeacher.class);
    if (classInfo) {
        document.getElementById('teacherClass').textContent = `${classInfo.year} - ${classInfo.section}`;
    }
}

function updateStudentDropdown() {
    const select = document.getElementById('studentSelect');
    select.innerHTML = '<option value="">-- اختر طالب --</option>';
    
    const classStudents = systemData.students.filter(s => s.classId === currentTeacher.class);
    classStudents.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = student.name;
        select.appendChild(option);
    });
    
    document.getElementById('totalStudents').textContent = classStudents.length;
}

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

function addGrade() {
    const studentId = document.getElementById('studentSelect').value;
    const courseworkValue = document.getElementById('courseworkGrade').value;
    const examValue = document.getElementById('examGrade').value;
    const successDiv = document.getElementById('gradeSuccess');
    const errorDiv = document.getElementById('gradeError');
    
    successDiv.style.display = 'none';
    errorDiv.style.display = 'none';
    
    if (!studentId) {
        errorDiv.textContent = 'الرجاء اختيار طالب';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (!courseworkValue || !examValue) {
        errorDiv.textContent = 'الرجاء إدخال درجة الأعمال ودرجة الامتحان';
        errorDiv.style.display = 'block';
        return;
    }
    
    const courseworkGrade = parseInt(courseworkValue);
    const examGrade = parseInt(examValue);
    
    // Validation for Coursework (max 40)
    if (isNaN(courseworkGrade) || courseworkGrade < 0 || courseworkGrade > 40) {
        errorDiv.textContent = 'درجة الأعمال يجب أن تكون بين 0 و 40';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Validation for Exam (max 60)
    if (isNaN(examGrade) || examGrade < 0 || examGrade > 60) {
        errorDiv.textContent = 'درجة الامتحان يجب أن تكون بين 0 و 60';
        errorDiv.style.display = 'block';
        return;
    }
    
    const totalGrade = courseworkGrade + examGrade;
    
    const student = systemData.students.find(s => s.id === studentId);
    
    const gradeObj = {
        id: Date.now().toString(),
        studentId: studentId,
        subjectId: currentTeacher.subject,
        grade: totalGrade, // Save the total grade (max 100)
        coursework: courseworkGrade, // Save coursework grade (max 40)
        exam: examGrade, // Save exam grade (max 60)
        date: new Date().toLocaleDateString('ar-EG')
    };
    
    // Check if a grade already exists for this student and subject
    const existingIndex = systemData.grades.findIndex(g => g.studentId === studentId && g.subjectId === currentTeacher.subject);

    if (existingIndex !== -1) {
        // Update existing grade
        systemData.grades[existingIndex] = gradeObj;
        successDiv.textContent = `✓ تم تحديث درجة ${student.name} بنجاح!`;
    } else {
        // Add new grade
        systemData.grades.push(gradeObj);
        successDiv.textContent = `✓ تم إضافة درجة ${student.name} بنجاح!`;
    }

    localStorage.setItem('systemData', JSON.stringify(systemData));
    
    successDiv.style.display = 'block';
    
    document.getElementById('studentSelect').value = '';
    document.getElementById('courseworkGrade').value = '';
    document.getElementById('examGrade').value = '';
    
    displayGrades();
}

function displayGrades() {
    const tbody = document.getElementById('gradesTableBody');
    const classStudents = systemData.students.filter(s => s.classId === currentTeacher.class);
	    const classGrades = systemData.grades.filter(g => g.subjectId === currentTeacher.subject);
    
    if (classGrades.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #999;">لا توجد درجات</td></tr>';
        document.getElementById('gradesEntered').textContent = '0';
        return;
    }
    
    tbody.innerHTML = '';
    classGrades.forEach((grade, index) => {
        const student = systemData.students.find(s => s.id === grade.studentId);
        const rating = getRating(grade.grade);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student ? student.name : '-'}</td>
	            <td>${grade.coursework || '-'}</td>
	            <td>${grade.exam || '-'}</td>
	            <td>${grade.grade}</td>
            <td>${rating.name}</td>
            <td>
                <button class="btn btn-small btn-danger" onclick="deleteGrade('${grade.id}')">🗑️ حذف</button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    document.getElementById('gradesEntered').textContent = classGrades.length;
}

function deleteGrade(gradeId) {
    if (confirm('هل تريد حذف هذه الدرجة؟')) {
        systemData.grades = systemData.grades.filter(g => g.id !== gradeId);
        localStorage.setItem('systemData', JSON.stringify(systemData));
        displayGrades();
    }
}

function submitReport() {
    const month = document.getElementById('reportMonth').value;
    const reportClass = document.getElementById('reportClass').value;
    const notes = document.getElementById('reportNotes').value.trim();
    const errorDiv = document.getElementById('reportError');
    const successDiv = document.getElementById('reportSuccess');
    
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    if (!month) {
        errorDiv.textContent = 'الرجاء اختيار الشهر';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (!reportClass) {
        errorDiv.textContent = 'الرجاء اختيار الفصل';
        errorDiv.style.display = 'block';
        return;
    }
    
    if (!notes) {
        errorDiv.textContent = 'الرجاء كتابة ملاحظات التقرير';
        errorDiv.style.display = 'block';
        return;
    }
    
    const subject = systemData.subjects.find(s => s.id === currentTeacher.subject);
    const classInfo = systemData.classes.find(c => c.id === currentTeacher.class);
    
    const report = {
        id: Date.now().toString(),
        teacherName: currentTeacher.name,
        subject: subject ? subject.name : '-',
        class: classInfo ? `${classInfo.year} - ${classInfo.section}` : '-',
        month: month,
        notes: notes,
        date: new Date().toLocaleDateString('ar-EG'),
        time: new Date().toLocaleTimeString('ar-EG')
    };
    
    systemData.reports.push(report);
    localStorage.setItem('systemData', JSON.stringify(systemData));
    
    successDiv.textContent = '✓ تم إرسال التقرير للإدارة بنجاح!';
    successDiv.style.display = 'block';
    
    document.getElementById('reportMonth').value = '';
    document.getElementById('reportClass').value = '';
    document.getElementById('reportNotes').value = '';
    
    document.getElementById('reportsSent').textContent = parseInt(document.getElementById('reportsSent').textContent) + 1;
}

function logout() {
    if (confirm('هل تريد تسجيل الخروج؟')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}
