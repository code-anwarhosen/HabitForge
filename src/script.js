// Main App Class
class HabitForge {
    constructor() {
        this.state = {
            currentDate: new Date(),
            startDate: null,
            targetStreak: 90,
            habits: [
                { id: 'workout', name: 'Exercise & Movement', completed: false },
                { id: 'meditate', name: 'Mindfulness Practice', completed: false },
                { id: 'nutrition', name: 'Healthy Nutrition', completed: false },
                { id: 'cold-shower', name: 'Cold Exposure', completed: false },
                { id: 'sleep-on-time', name: 'Quality Sleep', completed: false },
                { id: 'no-pmo', name: 'Healthy Habits', completed: false },
                { id: 'screen-time', name: 'Screen Time Control', completed: false }
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

        this.elements = this.initializeElements();
        this.progressChart = null;
        
        this.dataService = new DataService();
        this.streakService = new StreakService();
        this.uiService = new UIService(this.elements);
        this.habitService = new HabitService();
    }

    initializeElements() {
        return {
            // Modals
            startDateModal: document.getElementById('start-date-modal'),
            actionsModal: document.getElementById('actions-modal'),
            addHabitModal: document.getElementById('add-habit-modal'),
            targetStreakModal: document.getElementById('target-streak-modal'),
            
            // Date elements
            datePicker: document.getElementById('date-picker'),
            startDateInput: document.getElementById('start-date-input'),
            confirmStartDate: document.getElementById('confirm-start-date'),
            
            // Target streak elements
            targetStreakInput: document.getElementById('target-streak-input'),
            saveTargetStreak: document.getElementById('save-target-streak'),
            editTargetBtn: document.getElementById('edit-target-btn'),
            
            // Progress circle elements
            progressCircle: document.getElementById('progress-circle'),
            progressDays: document.getElementById('progress-days'),
            progressTarget: document.getElementById('progress-target'),
            progressPercent: document.getElementById('progress-percent'),
            
            // Habit management
            addHabitBtn: document.getElementById('add-habit-btn'),
            newHabitName: document.getElementById('new-habit-name'),
            saveNewHabit: document.getElementById('save-new-habit'),
            cancelAddHabit: document.getElementById('cancel-add-habit'),
            
            // Tabs
            habitsTab: document.getElementById('habits-tab'),
            progressTab: document.getElementById('progress-tab'),
            habitsContent: document.getElementById('habits-content'),
            progressContent: document.getElementById('progress-content'),
            
            // Menu buttons
            menuHabits: document.getElementById('menu-habits'),
            menuProgress: document.getElementById('menu-progress'),
            menuActions: document.getElementById('menu-actions'),
            
            // Content elements
            habitsContainer: document.getElementById('habits-container'),
            reflectionText: document.getElementById('reflection-text'),
            completionRate: document.getElementById('completion-rate'),
            totalDays: document.getElementById('total-days'),
            currentStreakDisplay: document.getElementById('current-streak-display'),
            totalHabits: document.getElementById('total-habits'),
            
            // Action buttons
            resetAll: document.getElementById('reset-all'),
            exportData: document.getElementById('export-data'),
            importData: document.getElementById('import-data'),
            closeActions: document.getElementById('close-actions'),
            
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
        
        if (!this.state.startDate) {
            this.showStartDateModal();
        } else {
            this.updateUI();
            this.renderHabits();
            this.setupChart();
            this.updateDatePicker();
            this.streakService.calculateStreakFromStartDate(this.state);
            this.updateProgressCircle();
        }
    }

    showStartDateModal() {
        const today = this.dataService.getLocalDateString(new Date());
        this.elements.startDateInput.value = today;
        this.elements.startDateModal.classList.add('active');
    }

    hideStartDateModal() {
        this.elements.startDateModal.classList.remove('active');
    }

    showTargetStreakModal() {
        this.elements.targetStreakInput.value = this.state.targetStreak;
        this.elements.targetStreakModal.classList.add('active');
    }

    hideTargetStreakModal() {
        this.elements.targetStreakModal.classList.remove('active');
    }

    updateTargetStreak() {
        const newTarget = parseInt(this.elements.targetStreakInput.value);
        if (newTarget > 0 && newTarget <= 365) {
            this.state.targetStreak = newTarget;
            this.dataService.saveData(this.state);
            this.updateProgressCircle();
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
            this.elements.progressCircle.classList.add('celebrate');
            setTimeout(() => {
                this.elements.progressCircle.classList.remove('celebrate');
            }, 500);
        } else if (percentage >= 75) {
            this.elements.progressCircle.style.stroke = '#3b82f6';
        } else if (percentage >= 50) {
            this.elements.progressCircle.style.stroke = '#f59e0b';
        } else {
            this.elements.progressCircle.style.stroke = '#ef4444';
        }
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
            
            // Set initial state
            const checkbox = document.getElementById(habit.id);
            const label = checkbox.nextElementSibling;
            const statusIndicator = label.querySelector('.status-indicator');
            
            if (habit.completed) {
                checkbox.checked = true;
                label.classList.add('habit-completed');
                statusIndicator.style.backgroundColor = 'white';
            }
            
            // Add event listeners
            this.setupHabitEventListeners(habit, checkbox, label, statusIndicator);
        });
    }

    setupHabitEventListeners(habit, checkbox, label, statusIndicator) {
        checkbox.addEventListener('change', () => {
            habit.completed = checkbox.checked;
            
            if (habit.completed) {
                label.classList.add('habit-completed');
                statusIndicator.style.backgroundColor = 'white';
                
                this.showMotivationalToast();
                
                if (habit.id === 'no-pmo') {
                    this.streakService.calculateStreakFromStartDate(this.state);
                }
            } else {
                label.classList.remove('habit-completed');
                statusIndicator.style.backgroundColor = '#cbd5e1';
                
                if (habit.id === 'no-pmo') {
                    this.streakService.calculateStreakFromStartDate(this.state);
                }
            }
            
            this.dataService.saveCurrentDateData(this.state);
            this.updateUI();
            this.updateChart();
            
            setTimeout(() => {
                label.classList.remove('habit-completed');
            }, 500);
        });
        
        const deleteBtn = label.nextElementSibling;
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteHabit(habit.id);
        });
    }

    addNewHabit(name) {
        if (!name.trim()) return;
        
        const newHabit = this.habitService.createHabit(name.trim());
        this.state.habits.push(newHabit);
        this.dataService.saveData(this.state);
        this.renderHabits();
        this.hideAddHabitModal();
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

    showAddHabitModal() {
        this.elements.newHabitName.value = '';
        this.elements.addHabitModal.classList.add('active');
    }

    hideAddHabitModal() {
        this.elements.addHabitModal.classList.remove('active');
    }

    updateUI() {
        this.elements.reflectionText.value = this.state.reflection;
        this.updateStats();
    }

    updateStats() {
        if (!this.state.startDate) return;
        
        let totalCompletion = 0;
        let dayCount = 0;
        
        Object.values(this.state.data).forEach(dayData => {
            if (dayData.habits) {
                const completedCount = Object.values(dayData.habits).filter(Boolean).length;
                const completionRate = (completedCount / this.state.habits.length) * 100;
                totalCompletion += completionRate;
                dayCount++;
            }
        });
        
        const averageCompletion = dayCount > 0 ? Math.round(totalCompletion / dayCount) : 0;
        this.elements.completionRate.textContent = `${averageCompletion}%`;
        this.elements.totalDays.textContent = dayCount;
        this.elements.currentStreakDisplay.textContent = this.state.streak;
        this.elements.totalHabits.textContent = this.state.habits.length;
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
        this.updateStats();
    }

    showHabitsTab() {
        this.uiService.activateTab('habits');
        this.elements.menuHabits.classList.add('active');
        this.elements.menuProgress.classList.remove('active');
    }

    showProgressTab() {
        this.uiService.activateTab('progress');
        this.elements.menuProgress.classList.add('active');
        this.elements.menuHabits.classList.remove('active');
        this.updateChart();
    }

    showActionsModal() {
        this.elements.actionsModal.classList.add('active');
    }

    hideActionsModal() {
        this.elements.actionsModal.classList.remove('active');
    }

    setupEventListeners() {
        // Start date modal
        this.elements.confirmStartDate.addEventListener('click', () => {
            if (this.elements.startDateInput.value) {
                this.state.startDate = new Date(this.elements.startDateInput.value);
                this.dataService.saveData(this.state);
                this.hideStartDateModal();
                this.updateUI();
                this.renderHabits();
                this.setupChart();
                this.updateDatePicker();
                this.streakService.calculateStreakFromStartDate(this.state);
            }
        });
        
        // Target streak modal
        this.elements.editTargetBtn.addEventListener('click', () => this.showTargetStreakModal());
        this.elements.saveTargetStreak.addEventListener('click', () => this.updateTargetStreak());
        this.elements.targetStreakInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.updateTargetStreak();
        });
        
        // Date picker
        this.elements.datePicker.addEventListener('change', () => {
            if (this.elements.datePicker.value) {
                this.state.currentDate = new Date(this.elements.datePicker.value);
                this.dataService.loadCurrentDateData(this.state);
                this.updateUI();
                this.renderHabits();
                this.updateChart();
            }
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
        
        // Tab navigation
        this.elements.habitsTab.addEventListener('click', () => this.showHabitsTab());
        this.elements.progressTab.addEventListener('click', () => this.showProgressTab());
        
        // Bottom menu navigation
        this.elements.menuHabits.addEventListener('click', () => this.showHabitsTab());
        this.elements.menuProgress.addEventListener('click', () => this.showProgressTab());
        this.elements.menuActions.addEventListener('click', () => this.showActionsModal());
        
        // Reflection textarea
        this.elements.reflectionText.addEventListener('input', () => {
            this.state.reflection = this.elements.reflectionText.value;
            this.dataService.saveCurrentDateData(this.state);
        });
        
        // Actions modal
        this.elements.closeActions.addEventListener('click', () => this.hideActionsModal());
        this.elements.actionsModal.addEventListener('click', (e) => {
            if (e.target === this.elements.actionsModal) this.hideActionsModal();
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
            this.state.startDate = null;
            this.state.targetStreak = 90;
            this.state.habits = this.habitService.getDefaultHabits();
            this.dataService.loadCurrentDateData(this.state);
            this.dataService.saveData(this.state);
            this.updateUI();
            this.renderHabits();
            this.updateChart();
            this.updateProgressCircle();
            this.hideActionsModal();
            this.showStartDateModal();
        }
    }

    exportData() {
        const exportData = {
            appData: this.state.data,
            habits: this.state.habits,
            streakData: { current: this.state.streak },
            targetStreak: this.state.targetStreak,
            startDate: this.state.startDate ? this.state.startDate.toISOString() : null,
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
        this.hideActionsModal();
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                this.dataService.importData(this.state, importData);
                this.updateUI();
                this.renderHabits();
                this.updateChart();
                this.updateDatePicker();
                this.streakService.calculateStreakFromStartDate(this.state);
                this.updateProgressCircle();
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
        if (savedData) state.data = JSON.parse(savedData);
        
        const savedHabits = localStorage.getItem('habitForgeHabits');
        if (savedHabits) state.habits = JSON.parse(savedHabits);
        
        const streakData = localStorage.getItem('habitForgeStreak');
        if (streakData) state.streak = JSON.parse(streakData).current || 0;
        
        const startDate = localStorage.getItem('habitForgeStartDate');
        if (startDate) state.startDate = new Date(startDate);
        
        const targetStreak = localStorage.getItem('habitForgeTarget');
        if (targetStreak) state.targetStreak = parseInt(targetStreak) || 90;
        
        this.loadCurrentDateData(state);
    }

    saveData(state) {
        localStorage.setItem('habitForgeData', JSON.stringify(state.data));
        localStorage.setItem('habitForgeHabits', JSON.stringify(state.habits));
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
            state.habits.forEach(habit => {
                habit.completed = dayData.habits[habit.id] || false;
            });
            state.reflection = dayData.reflection || '';
        } else {
            state.habits.forEach(habit => habit.completed = false);
            state.reflection = '';
        }
    }

    saveCurrentDateData(state) {
        const dateKey = this.getLocalDateString(state.currentDate);
        const habitsData = {};
        state.habits.forEach(habit => {
            habitsData[habit.id] = habit.completed;
        });
        state.data[dateKey] = { habits: habitsData, reflection: state.reflection };
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
}

// Streak Service Class
class StreakService {
    getDaysBetweenDates(date1, date2) {
        const oneDay = 24 * 60 * 60 * 1000;
        const firstDate = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
        const secondDate = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
        return Math.round(Math.abs((firstDate - secondDate) / oneDay));
    }

    calculateStreakFromStartDate(state) {
        if (!state.startDate) return;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = new Date(state.startDate);
        start.setHours(0, 0, 0, 0);
        
        // Calculate days since start (inclusive)
        const daysSinceStart = this.getDaysBetweenDates(start, today);
        
        // Check if today's "Healthy Habits" is completed
        const todayKey = (new DataService()).getLocalDateString(today);
        const todayData = state.data[todayKey];
        const todayCompleted = todayData && todayData.habits && todayData.habits['no-pmo'];
        
        if (todayCompleted) {
            // If today is completed, streak is days from start to today
            state.streak = daysSinceStart;
        } else {
            // If today is not completed, streak is days from start to yesterday
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            state.streak = this.getDaysBetweenDates(start, yesterday);
        }
        
        (new DataService()).saveData(state);
    }
}

// UI Service Class
class UIService {
    constructor(elements) {
        this.elements = elements;
    }

    activateTab(tabName) {
        // Deactivate all tabs
        this.elements.habitsTab.classList.remove('active');
        this.elements.progressTab.classList.remove('active');
        this.elements.habitsContent.classList.remove('active');
        this.elements.progressContent.classList.remove('active');
        
        // Activate selected tab
        if (tabName === 'habits') {
            this.elements.habitsTab.classList.add('active');
            this.elements.habitsContent.classList.add('active');
        } else {
            this.elements.progressTab.classList.add('active');
            this.elements.progressContent.classList.add('active');
        }
    }
}

// Habit Service Class
class HabitService {
    createHabit(name) {
        return {
            id: this.generateHabitId(),
            name: name,
            completed: false
        };
    }

    generateHabitId() {
        return 'habit-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    createHabitElement(habit) {
        const habitElement = document.createElement('div');
        habitElement.className = 'habit-item';
        habitElement.innerHTML = `
            <input type="checkbox" id="${habit.id}" class="habit-checkbox">
            <label for="${habit.id}" class="habit-label">
                <span class="habit-name">${habit.name}</span>
                <span class="status-indicator"></span>
            </label>
            <button class="delete-habit-btn">
                <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
            </button>
        `;
        return habitElement;
    }

    getDefaultHabits() {
        return [
            { id: 'workout', name: 'Exercise & Movement', completed: false },
            { id: 'meditate', name: 'Mindfulness Practice', completed: false },
            { id: 'nutrition', name: 'Healthy Nutrition', completed: false },
            { id: 'cold-shower', name: 'Cold Exposure', completed: false },
            { id: 'sleep-on-time', name: 'Quality Sleep', completed: false },
            { id: 'no-pmo', name: 'Healthy Habits', completed: false },
            { id: 'screen-time', name: 'Screen Time Control', completed: false }
        ];
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    const app = new HabitForge();
    app.init();
});
