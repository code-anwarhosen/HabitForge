// Main App Class
class HabitForge {
    constructor() {
        this.state = {
            currentDate: new Date(),
            startDate: new Date(), // Default to today
            targetStreak: 90,
            habits: [
                { id: 1, name: 'Workout', completed: false },
                { id: 2, name: 'Quality Sleep', completed: false },
                { id: 3, name: 'Screen Time Control', completed: false }
            ],
            tasks: [
                { id: 1, name: 'Plan tomorrow', completed: false }
            ],
            reflection: '',
            streak: 0,
            data: {}
        };

        this.motivationalMessages = [
            "Great job! You're building better habits!",
            "Consistency is key! Keep going!",
            "You're making progress! Don't give up!",
            "Small steps lead to big changes!",
            "Your future self will thank you!",
            "You're stronger than your urges!",
            "Every day is a new opportunity!",
            "You're on the right track!",
            "Discipline equals freedom!",
            "You're becoming the best version of yourself!"
        ];

        this.dailyQuotes = [
            "The secret of getting ahead is getting started.",
            "Small daily improvements are the key to staggering long-term results.",
            "Your habits determine your future.",
            "Consistency is what transforms average into excellence.",
            "The only bad workout is the one that didn't happen.",
            "Every master was once a beginner. Every pro was once an amateur.",
            "Don't let yesterday take up too much of today.",
            "The way to get started is to quit talking and begin doing.",
            "Your future is created by what you do today, not tomorrow.",
            "Success is the sum of small efforts repeated day in and day out."
        ];

        this.elements = this.initializeElements();
        this.progressChart = null;
        
        this.dataService = new DataService();
        this.streakService = new StreakService();
        this.habitService = new HabitService();
        this.taskService = new TaskService();
        
        this.nextHabitId = 4;
        this.nextTaskId = 2;
    }

    initializeElements() {
        return {
            // Modals
            addHabitModal: document.getElementById('add-habit-modal'),
            addTaskModal: document.getElementById('add-task-modal'),
            targetStreakModal: document.getElementById('target-streak-modal'),
            editStartDateModal: document.getElementById('edit-start-date-modal'),
            
            // Date elements
            datePicker: document.getElementById('date-picker'),
            editStartDateInput: document.getElementById('edit-start-date-input'),
            saveStartDate: document.getElementById('save-start-date'),
            cancelEditStartDate: document.getElementById('cancel-edit-start-date'),
            
            // Target streak elements
            targetStreakInput: document.getElementById('target-streak-input'),
            saveTargetStreak: document.getElementById('save-target-streak'),
            editTargetBtn: document.getElementById('edit-target-btn'),
            streakInfoBtn: document.getElementById('streak-info-btn'),
            
            // Progress circle elements
            progressCircle: document.getElementById('progress-circle'),
            progressDays: document.getElementById('progress-days'),
            progressTarget: document.getElementById('progress-target'),
            progressPercent: document.getElementById('progress-percent'),
            
            // Streak info elements
            streakInfo: document.getElementById('streak-info'),
            streakStartDate: document.getElementById('streak-start-date'),
            streakCurrent: document.getElementById('streak-current'),
            streakGoal: document.getElementById('streak-goal'),
            
            // Quote element
            dailyQuote: document.getElementById('daily-quote'),
            
            // Habit management
            addHabitBtn: document.getElementById('add-habit-btn'),
            newHabitName: document.getElementById('new-habit-name'),
            saveNewHabit: document.getElementById('save-new-habit'),
            cancelAddHabit: document.getElementById('cancel-add-habit'),
            quickHabitBtns: document.querySelectorAll('.quick-habit-btn'),
            
            // Task management
            addTaskBtn: document.getElementById('add-task-btn'),
            newTaskName: document.getElementById('new-task-name'),
            saveNewTask: document.getElementById('save-new-task'),
            cancelAddTask: document.getElementById('cancel-add-task'),
            
            // Tab contents
            dashboardContent: document.getElementById('dashboard-content'),
            habitsContent: document.getElementById('habits-content'),
            tasksContent: document.getElementById('tasks-content'),
            progressContent: document.getElementById('progress-content'),
            menuContent: document.getElementById('menu-content'),
            
            // Navigation buttons
            navDashboard: document.getElementById('nav-dashboard'),
            navHabits: document.getElementById('nav-habits'),
            navTasks: document.getElementById('nav-tasks'),
            navProgress: document.getElementById('nav-progress'),
            navMenu: document.getElementById('nav-menu'),
            
            // Content elements
            habitsContainer: document.getElementById('habits-container'),
            tasksContainer: document.getElementById('tasks-container'),
            reflectionText: document.getElementById('reflection-text'),
            
            // Menu actions
            resetAll: document.getElementById('reset-all'),
            exportData: document.getElementById('export-data'),
            importData: document.getElementById('import-data'),
            editStartDateBtn: document.getElementById('edit-start-date-btn'),
            
            // File input
            importFile: document.getElementById('import-file'),
            
            // Toast
            motivationalToast: document.getElementById('motivational-toast'),
            toastMessage: document.getElementById('toast-message')
        };
    }

    init() {
        this.dataService.loadData(this.state);
        this.setupEventListeners();
        this.showRandomQuote();
        
        this.updateUI();
        this.renderHabits();
        this.renderTasks();
        this.setupChart();
        this.updateDatePicker();
        this.streakService.calculateStreakFromStartDate(this.state);
        this.updateProgressCircle();
        this.updateStreakInfo();
    }

    showRandomQuote() {
        const randomIndex = Math.floor(Math.random() * this.dailyQuotes.length);
        this.elements.dailyQuote.textContent = this.dailyQuotes[randomIndex];
    }

    showTargetStreakModal() {
        this.elements.targetStreakInput.value = this.state.targetStreak;
        this.elements.targetStreakModal.classList.add('active');
    }

    hideTargetStreakModal() {
        this.elements.targetStreakModal.classList.remove('active');
    }

    showEditStartDateModal() {
        const startDateStr = this.dataService.getLocalDateString(this.state.startDate);
        this.elements.editStartDateInput.value = startDateStr;
        
        const today = this.dataService.getLocalDateString(new Date());
        this.elements.editStartDateInput.max = today;
        
        this.elements.editStartDateModal.classList.add('active');
    }

    hideEditStartDateModal() {
        this.elements.editStartDateModal.classList.remove('active');
    }

    updateStartDate() {
        if (this.elements.editStartDateInput.value) {
            this.state.startDate = new Date(this.elements.editStartDateInput.value);
            this.dataService.saveData(this.state);
            this.streakService.calculateStreakFromStartDate(this.state);
            this.updateProgressCircle();
            this.updateStreakInfo();
            this.updateChart();
            this.hideEditStartDateModal();
        }
    }

    showAddHabitModal() {
        this.elements.newHabitName.value = '';
        this.elements.addHabitModal.classList.add('active');
        this.elements.newHabitName.focus();
    }

    hideAddHabitModal() {
        this.elements.addHabitModal.classList.remove('active');
    }

    showAddTaskModal() {
        this.elements.newTaskName.value = '';
        this.elements.addTaskModal.classList.add('active');
        this.elements.newTaskName.focus();
    }

    hideAddTaskModal() {
        this.elements.addTaskModal.classList.remove('active');
    }

    updateTargetStreak() {
        const newTarget = parseInt(this.elements.targetStreakInput.value);
        if (newTarget > 0 && newTarget <= 365) {
            this.state.targetStreak = newTarget;
            this.dataService.saveData(this.state);
            this.updateProgressCircle();
            this.updateStreakInfo();
            this.hideTargetStreakModal();
        }
    }

    updateProgressCircle() {
        const progress = Math.min(this.state.streak / this.state.targetStreak, 1);
        const percentage = Math.round(progress * 100);
        const circumference = 2 * Math.PI * 15.9155;

        const dashArray = `${progress * circumference}, ${circumference}`;
        this.elements.progressCircle.setAttribute('stroke-dasharray', dashArray);
        
        this.elements.progressDays.textContent = this.state.streak;
        this.elements.progressTarget.textContent = `/ ${this.state.targetStreak} days`;
        this.elements.progressPercent.textContent = `${percentage}% complete`;

        // Update color based on progress
        if (percentage >= 100) {
            this.elements.progressCircle.style.stroke = '#10b981';
        } else if (percentage >= 75) {
            this.elements.progressCircle.style.stroke = '#3b82f6';
        } else if (percentage >= 50) {
            this.elements.progressCircle.style.stroke = '#f59e0b';
        } else {
            this.elements.progressCircle.style.stroke = '#ef4444';
        }
    }

    updateStreakInfo() {
        if (this.state.startDate) {
            const startDateStr = this.state.startDate.toLocaleDateString();
            this.elements.streakStartDate.textContent = startDateStr;
            this.elements.streakCurrent.textContent = `${this.state.streak} days`;
            this.elements.streakGoal.textContent = `${this.state.targetStreak} days`;
        }
    }

    toggleStreakInfo() {
        this.elements.streakInfo.classList.toggle('hidden');
    }

    updateDatePicker() {
        this.elements.datePicker.value = this.dataService.getLocalDateString(this.state.currentDate);
        
        if (this.state.startDate) {
            this.elements.datePicker.min = this.dataService.getLocalDateString(this.state.startDate);
        }
        
        const today = this.dataService.getLocalDateString(new Date());
        this.elements.datePicker.max = today;
    }

    renderHabits() {
        this.elements.habitsContainer.innerHTML = '';
        
        this.state.habits.forEach(habit => {
            const habitElement = this.habitService.createHabitElement(habit);
            this.elements.habitsContainer.appendChild(habitElement);
            
            const checkbox = document.getElementById(`habit-${habit.id}`);
            const label = checkbox.nextElementSibling;
            
            if (habit.completed) {
                checkbox.checked = true;
                label.classList.add('habit-completed');
            }
            
            this.setupHabitEventListeners(habit, checkbox, label);
        });
    }

    setupHabitEventListeners(habit, checkbox, label) {
        checkbox.addEventListener('change', () => {
            habit.completed = checkbox.checked;
            
            if (habit.completed) {
                label.classList.add('habit-completed');
                this.showMotivationalToast();
            } else {
                label.classList.remove('habit-completed');
            }
            
            this.dataService.saveCurrentDateData(this.state);
            this.updateChart();
            
            setTimeout(() => {
                label.classList.remove('habit-completed');
            }, 300);
        });
        
        const deleteBtn = label.querySelector('.delete-habit-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteHabit(habit.id);
        });
    }

    renderTasks() {
        this.elements.tasksContainer.innerHTML = '';
        
        this.state.tasks.forEach(task => {
            const taskElement = this.taskService.createTaskElement(task);
            this.elements.tasksContainer.appendChild(taskElement);
            
            const checkbox = document.getElementById(`task-${task.id}`);
            const label = checkbox.nextElementSibling;
            
            if (task.completed) {
                checkbox.checked = true;
                label.classList.add('task-completed');
            }
            
            this.setupTaskEventListeners(task, checkbox, label);
        });
    }

    setupTaskEventListeners(task, checkbox, label) {
        checkbox.addEventListener('change', () => {
            task.completed = checkbox.checked;
            
            if (task.completed) {
                label.classList.add('task-completed');
            } else {
                label.classList.remove('task-completed');
            }
            
            this.dataService.saveCurrentDateData(this.state);
            
            setTimeout(() => {
                label.classList.remove('task-completed');
            }, 300);
        });
        
        const deleteBtn = label.querySelector('.delete-task-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteTask(task.id);
        });
    }

    addNewHabit(name) {
        if (!name.trim()) return;
        
        const newHabit = this.habitService.createHabit(name.trim(), this.nextHabitId++);
        this.state.habits.push(newHabit);
        this.dataService.saveData(this.state);
        this.renderHabits();
        this.hideAddHabitModal();
        this.updateChart();
    }

    addNewTask(name) {
        if (!name.trim()) return;
        
        const newTask = this.taskService.createTask(name.trim(), this.nextTaskId++);
        this.state.tasks.push(newTask);
        this.dataService.saveData(this.state);
        this.renderTasks();
        this.hideAddTaskModal();
    }

    deleteHabit(habitId) {
        if (this.state.habits.length <= 1) {
            alert('You must have at least one habit!');
            return;
        }
        
        if (confirm('Are you sure you want to delete this habit?')) {
            this.state.habits = this.state.habits.filter(habit => habit.id !== habitId);
            this.dataService.saveData(this.state);
            this.renderHabits();
            this.updateChart();
        }
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.state.tasks = this.state.tasks.filter(task => task.id !== taskId);
            this.dataService.saveData(this.state);
            this.renderTasks();
        }
    }

    updateUI() {
        this.elements.reflectionText.value = this.state.reflection;
    }

    showMotivationalToast() {
        const randomMessage = this.motivationalMessages[Math.floor(Math.random() * this.motivationalMessages.length)];
        this.elements.toastMessage.textContent = randomMessage;
        
        this.elements.motivationalToast.classList.add('show');
        
        setTimeout(() => {
            this.elements.motivationalToast.classList.remove('show');
        }, 3000);
    }

    setupChart() {
        const ctx = document.getElementById('progress-chart').getContext('2d');
        const chartData = this.getLast30DaysData();
        
        this.progressChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Completion %',
                    data: chartData.percentages,
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    },
                    x: {
                        ticks: {
                            maxTicksLimit: 15
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Completion: ${context.parsed.y}%`;
                            }
                        }
                    }
                }
            }
        });
    }

    getLast30DaysData() {
        const labels = [];
        const percentages = [];
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            
            const dateKey = this.dataService.getLocalDateString(date);
            const dateLabel = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            labels.push(dateLabel);
            
            if (this.state.data[dateKey] && this.state.data[dateKey].habits) {
                const habits = this.state.data[dateKey].habits;
                const completedCount = Object.values(habits).filter(Boolean).length;
                const percentage = Math.round((completedCount / this.state.habits.length) * 100);
                percentages.push(percentage);
            } else {
                percentages.push(0);
            }
        }
        
        return { labels, percentages };
    }

    updateChart() {
        if (this.progressChart) {
            const chartData = this.getLast30DaysData();
            this.progressChart.data.labels = chartData.labels;
            this.progressChart.data.datasets[0].data = chartData.percentages;
            this.progressChart.update();
        }
    }

    showDashboard() {
        this.hideAllTabs();
        this.elements.dashboardContent.classList.add('active');
        this.setActiveNav('navDashboard');
    }

    showHabits() {
        this.hideAllTabs();
        this.elements.habitsContent.classList.add('active');
        this.setActiveNav('navHabits');
    }

    showTasks() {
        this.hideAllTabs();
        this.elements.tasksContent.classList.add('active');
        this.setActiveNav('navTasks');
    }

    showProgress() {
        this.hideAllTabs();
        this.elements.progressContent.classList.add('active');
        this.setActiveNav('navProgress');
        this.updateChart();
    }

    showMenu() {
        this.hideAllTabs();
        this.elements.menuContent.classList.add('active');
        this.setActiveNav('navMenu');
    }

    hideAllTabs() {
        this.elements.dashboardContent.classList.remove('active');
        this.elements.habitsContent.classList.remove('active');
        this.elements.tasksContent.classList.remove('active');
        this.elements.progressContent.classList.remove('active');
        this.elements.menuContent.classList.remove('active');
    }

    setActiveNav(activeNavId) {
        this.elements.navDashboard.classList.remove('active');
        this.elements.navHabits.classList.remove('active');
        this.elements.navTasks.classList.remove('active');
        this.elements.navProgress.classList.remove('active');
        this.elements.navMenu.classList.remove('active');
        
        this.elements[activeNavId].classList.add('active');
    }

    setupEventListeners() {
        // Target streak modal
        this.elements.editTargetBtn.addEventListener('click', () => this.showTargetStreakModal());
        this.elements.saveTargetStreak.addEventListener('click', () => this.updateTargetStreak());
        this.elements.targetStreakInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.updateTargetStreak();
        });
        
        // Start date modal
        this.elements.editStartDateBtn.addEventListener('click', () => this.showEditStartDateModal());
        this.elements.saveStartDate.addEventListener('click', () => this.updateStartDate());
        this.elements.cancelEditStartDate.addEventListener('click', () => this.hideEditStartDateModal());
        
        // Streak info toggle
        this.elements.streakInfoBtn.addEventListener('click', () => this.toggleStreakInfo());
        
        // Date picker
        this.elements.datePicker.addEventListener('change', () => {
            if (this.elements.datePicker.value) {
                this.state.currentDate = new Date(this.elements.datePicker.value);
                this.dataService.loadCurrentDateData(this.state);
                this.updateUI();
                this.renderHabits();
                this.renderTasks();
                this.updateChart();
            }
        });
        
        // Navigation
        const navItems = [
            this.elements.navDashboard,
            this.elements.navHabits,
            this.elements.navTasks,
            this.elements.navProgress,
            this.elements.navMenu
        ];
        
        navItems.forEach((navItem, index) => {
            navItem.addEventListener('click', () => {
                const tabs = ['showDashboard', 'showHabits', 'showTasks', 'showProgress', 'showMenu'];
                this[tabs[index]]();
            });
            
            navItem.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const tabs = ['showDashboard', 'showHabits', 'showTasks', 'showProgress', 'showMenu'];
                this[tabs[index]]();
            }, { passive: false });
        });
        
        // Habit management
        this.elements.addHabitBtn.addEventListener('click', () => this.showAddHabitModal());
        this.elements.saveNewHabit.addEventListener('click', () => {
            this.addNewHabit(this.elements.newHabitName.value);
        });
        this.elements.cancelAddHabit.addEventListener('click', () => this.hideAddHabitModal());
        this.elements.newHabitName.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addNewHabit(this.elements.newHabitName.value);
        });
        
        // Task management
        this.elements.addTaskBtn.addEventListener('click', () => this.showAddTaskModal());
        this.elements.saveNewTask.addEventListener('click', () => {
            this.addNewTask(this.elements.newTaskName.value);
        });
        this.elements.cancelAddTask.addEventListener('click', () => this.hideAddTaskModal());
        this.elements.newTaskName.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addNewTask(this.elements.newTaskName.value);
        });
        
        // Quick habit buttons
        this.elements.quickHabitBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const habitName = btn.getAttribute('data-habit');
                this.elements.newHabitName.value = habitName;
                this.elements.newHabitName.focus();
            });
        });
        
        // Reflection textarea
        this.elements.reflectionText.addEventListener('input', () => {
            this.state.reflection = this.elements.reflectionText.value;
            this.dataService.saveCurrentDateData(this.state);
        });
        
        // Menu actions
        this.elements.resetAll.addEventListener('click', () => this.resetAllData());
        this.elements.exportData.addEventListener('click', () => this.exportData());
        this.elements.importData.addEventListener('click', () => this.elements.importFile.click());
        this.elements.importFile.addEventListener('change', (e) => this.importData(e));
    }

    resetAllData() {
        if (confirm('Are you sure you want to reset ALL data? This cannot be undone.')) {
            this.state.data = {};
            this.state.streak = 0;
            this.state.startDate = new Date();
            this.state.targetStreak = 90;
            this.state.habits = this.habitService.getDefaultHabits();
            this.state.tasks = this.taskService.getDefaultTasks();
            this.nextHabitId = 4;
            this.nextTaskId = 2;
            this.dataService.loadCurrentDateData(this.state);
            this.dataService.saveData(this.state);
            this.updateUI();
            this.renderHabits();
            this.renderTasks();
            this.updateChart();
            this.updateProgressCircle();
            this.updateStreakInfo();
        }
    }

    exportData() {
        const exportData = {
            appData: this.state.data,
            habits: this.state.habits,
            tasks: this.state.tasks,
            streakData: { current: this.state.streak },
            targetStreak: this.state.targetStreak,
            startDate: this.state.startDate ? this.state.startDate.toISOString() : null,
            nextHabitId: this.nextHabitId,
            nextTaskId: this.nextTaskId,
            exportDate: new Date().toISOString()
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `habitforge-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                this.dataService.importData(this.state, importData);
                
                if (importData.nextHabitId) this.nextHabitId = importData.nextHabitId;
                if (importData.nextTaskId) this.nextTaskId = importData.nextTaskId;
                if (importData.tasks) this.state.tasks = importData.tasks;
                
                this.updateUI();
                this.renderHabits();
                this.renderTasks();
                this.updateChart();
                this.updateDatePicker();
                this.streakService.calculateStreakFromStartDate(this.state);
                this.updateProgressCircle();
                this.updateStreakInfo();
                this.showRandomQuote();
                alert('Data imported successfully!');
            } catch (error) {
                alert('Error importing data. Please make sure you selected a valid backup file.');
                console.error('Import error:', error);
            }
            this.elements.importFile.value = '';
        };
        reader.readAsText(file);
    }
}

// Data Service Class
class DataService {
    getLocalDateString(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    loadData(state) {
        const savedData = localStorage.getItem('habitForgeData');
        if (savedData) {
            try {
                state.data = JSON.parse(savedData);
            } catch (e) {
                console.error('Error parsing saved data:', e);
                state.data = {};
            }
        }
        
        const savedHabits = localStorage.getItem('habitForgeHabits');
        if (savedHabits) {
            try {
                state.habits = JSON.parse(savedHabits);
            } catch (e) {
                console.error('Error parsing saved habits:', e);
                state.habits = this.getDefaultHabits();
            }
        }
        
        const savedTasks = localStorage.getItem('habitForgeTasks');
        if (savedTasks) {
            try {
                state.tasks = JSON.parse(savedTasks);
            } catch (e) {
                console.error('Error parsing saved tasks:', e);
                state.tasks = this.getDefaultTasks();
            }
        }
        
        const streakData = localStorage.getItem('habitForgeStreak');
        if (streakData) {
            try {
                state.streak = JSON.parse(streakData).current || 0;
            } catch (e) {
                console.error('Error parsing streak data:', e);
                state.streak = 0;
            }
        }
        
        const startDate = localStorage.getItem('habitForgeStartDate');
        if (startDate) {
            try {
                state.startDate = new Date(startDate);
            } catch (e) {
                console.error('Error parsing start date:', e);
                state.startDate = new Date();
                state.startDate.setHours(0, 0, 0, 0);
            }
        } else {
            state.startDate = new Date();
            state.startDate.setHours(0, 0, 0, 0);
        }
        
        const targetStreak = localStorage.getItem('habitForgeTarget');
        if (targetStreak) {
            try {
                state.targetStreak = parseInt(targetStreak) || 90;
            } catch (e) {
                console.error('Error parsing target streak:', e);
                state.targetStreak = 90;
            }
        }
        
        this.loadCurrentDateData(state);
    }

    saveData(state) {
        localStorage.setItem('habitForgeData', JSON.stringify(state.data));
        localStorage.setItem('habitForgeHabits', JSON.stringify(state.habits));
        localStorage.setItem('habitForgeTasks', JSON.stringify(state.tasks));
        localStorage.setItem('habitForgeStreak', JSON.stringify({ current: state.streak }));
        if (state.startDate) {
            localStorage.setItem('habitForgeStartDate', state.startDate.toISOString());
        }
        localStorage.setItem('habitForgeTarget', state.targetStreak.toString());
    }

    loadCurrentDateData(state) {
        const dateKey = this.getLocalDateString(state.currentDate);
        
        if (state.data[dateKey]) {
            const dayData = state.data[dateKey];
            
            // Safely load habits data
            if (dayData.habits) {
                state.habits.forEach(habit => {
                    // Check if the habit data exists for this date, default to false if not
                    habit.completed = dayData.habits.hasOwnProperty(habit.id) ? dayData.habits[habit.id] : false;
                });
            } else {
                // If no habits data exists for this date, mark all as incomplete
                state.habits.forEach(habit => habit.completed = false);
            }
            
            // Safely load tasks data
            if (dayData.tasks) {
                state.tasks.forEach(task => {
                    task.completed = dayData.tasks.hasOwnProperty(task.id) ? dayData.tasks[task.id] : false;
                });
            } else {
                state.tasks.forEach(task => task.completed = false);
            }
            
            state.reflection = dayData.reflection || '';
        } else {
            // If no data exists for this date, initialize everything as incomplete
            state.habits.forEach(habit => habit.completed = false);
            state.tasks.forEach(task => task.completed = false);
            state.reflection = '';
        }
    }

    saveCurrentDateData(state) {
        const dateKey = this.getLocalDateString(state.currentDate);
        const habitsData = {};
        const tasksData = {};
        
        state.habits.forEach(habit => {
            habitsData[habit.id] = habit.completed;
        });
        state.tasks.forEach(task => {
            tasksData[task.id] = task.completed;
        });
        
        state.data[dateKey] = { 
            habits: habitsData, 
            tasks: tasksData,
            reflection: state.reflection 
        };
        this.saveData(state);
    }

    importData(state, importData) {
        if (importData.appData) state.data = importData.appData;
        if (importData.habits) state.habits = importData.habits;
        if (importData.streakData) state.streak = importData.streakData.current || 0;
        if (importData.targetStreak) state.targetStreak = importData.targetStreak;
        if (importData.startDate) state.startDate = new Date(importData.startDate);
        this.loadCurrentDateData(state);
        this.saveData(state);
    }

    getDefaultHabits() {
        return [
            { id: 1, name: 'Workout', completed: false },
            { id: 2, name: 'Quality Sleep', completed: false },
            { id: 3, name: 'Screen Time Control', completed: false }
        ];
    }

    getDefaultTasks() {
        return [
            { id: 1, name: 'Plan tomorrow', completed: false }
        ];
    }
}

// Streak Service Class
class StreakService {
    getDaysBetweenDates(date1, date2) {
        const oneDay = 24 * 60 * 60 * 1000;
        const firstDate = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
        const secondDate = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
        const diffDays = Math.round(Math.abs((secondDate - firstDate) / oneDay));
        return diffDays;
    }

    calculateStreakFromStartDate(state) {
        if (!state.startDate) return;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = new Date(state.startDate);
        start.setHours(0, 0, 0, 0);
        
        const totalDays = this.getDaysBetweenDates(start, today) + 1;

        state.streak = totalDays;
        (new DataService()).saveData(state);
    }
}

// Habit Service Class
class HabitService {
    createHabit(name, id) {
        return {
            id: id,
            name: name,
            completed: false
        };
    }

    createHabitElement(habit) {
        const habitElement = document.createElement('div');
        habitElement.className = 'habit-item';
        habitElement.innerHTML = `
            <input type="checkbox" id="habit-${habit.id}" class="habit-checkbox">
            <label for="habit-${habit.id}" class="habit-label">
                <div class="habit-content">
                    <div class="habit-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                    </div>
                    <span class="habit-name">${habit.name}</span>
                    <div class="habit-actions">
                        <button class="delete-habit-btn" title="Delete habit">
                            <svg viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </label>
        `;
        return habitElement;
    }

    getDefaultHabits() {
        return [
            { id: 1, name: 'Workout', completed: false },
            { id: 2, name: 'Quality Sleep', completed: false },
            { id: 3, name: 'Screen Time Control', completed: false }
        ];
    }
}

// Task Service Class
class TaskService {
    createTask(name, id) {
        return {
            id: id,
            name: name,
            completed: false
        };
    }

    createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        taskElement.innerHTML = `
            <input type="checkbox" id="task-${task.id}" class="task-checkbox">
            <label for="task-${task.id}" class="task-label">
                <div class="task-content">
                    <div class="task-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                    </div>
                    <span class="task-name">${task.name}</span>
                    <div class="task-actions">
                        <button class="delete-task-btn" title="Delete task">
                            <svg viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </label>
        `;
        return taskElement;
    }

    getDefaultTasks() {
        return [
            { id: 1, name: 'Test Task', completed: false }
        ];
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    const app = new HabitForge();
    app.init();
});
