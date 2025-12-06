// Student Dashboard - student.js

const ratingScale = {
    100: { min: 85, max: 100, name: 'ممتاز', class: 'rating-excellent' },
    75: { min: 75, max: 84, name: 'جيد جداً', class: 'rating-very-good' },
    65: { min: 65, max: 74, name: 'جيد', class: 'rating-good' },
    50: { min: 50, max: 64, name: 'مقبول', class: 'rating-acceptable' },
    0: { min: 0, max: 49, name: 'راسب', class: 'rating-fail' }
};

let currentStudent = null;
let systemData = null;

document.addEventListener('DOMContentLoaded', function() {
    checkUserSession();
    loadSystemData();
    displayStudentInfo();
    displayGrades();
});

function checkUserSession() {
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    const user = JSON.parse(currentUser);
    
    if (user.role !== 'student') {
        window.location.href = 'login.html';
        return;
    }
    
    currentStudent = user;
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

function displayStudentInfo() {
    document.getElementById('studentName').textContent = currentStudent.name;
    document.getElementById('studentId').textContent = currentStudent.studentId;

    
    const classInfo = systemData.classes.find(c => c.id === currentStudent.class);
    if (classInfo) {
        document.getElementById('studentClass').textContent = `${classInfo.year} - ${classInfo.section}`;
    }
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

function displayGrades() {
    const student = systemData.students.find(s => s.id === currentStudent.id);
    if (!student) return;

    const studentGrades = systemData.grades.filter(g => g.studentId === student.id);
    const tbody = document.getElementById('gradesTableBody');
    
    if (studentGrades.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #999;">لا توجد درجات</td></tr>';
        document.getElementById('subjectCount').textContent = '0';
        document.getElementById('averageGrade').textContent = '0%';
        return;
    }

    tbody.innerHTML = '';
    let totalGrade = 0;
    
    studentGrades.forEach(grade => {
        const subject = systemData.subjects.find(s => s.id === grade.subjectId);
        const rating = getRating(grade.grade);
        totalGrade += grade.grade;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${subject ? subject.name : '-'}</td>
            <td>${grade.grade}</td>
            <td><span class="rating-badge ${rating.class}">${rating.name}</span></td>
            <td>${grade.grade}%</td>
        `;
        tbody.appendChild(row);
    });

    document.getElementById('subjectCount').textContent = studentGrades.length;
    const averageGrade = Math.round(totalGrade / studentGrades.length);
    document.getElementById('averageGrade').textContent = averageGrade + '%';
}

function logout() {
    if (confirm('هل تريد تسجيل الخروج؟')) {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }
}
