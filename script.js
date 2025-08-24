// TaskFlow Pro - Professional Task Management App
class TaskFlowApp {
    constructor() {
        this.tasks = [];
        this.categories = [];
        this.currentTheme = 'midnight';
        this.editingTaskId = null;
        this.chart = null;
        this.voiceRecognition = null;
        this.isVoiceActive = false;
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.renderTasks();
        this.updateAnalytics();
        this.setupVoiceRecognition();
        this.checkDueDates();
        this.setupReminders();
    }

    // Data Management
    loadData() {
        const savedTasks = localStorage.getItem('taskflow_tasks');
        const savedCategories = localStorage.getItem('taskflow_categories');
        const savedTheme = localStorage.getItem('taskflow_theme');

        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks);
        } else {
            // Add sample tasks for demo
            this.tasks = this.getSampleTasks();
        }

        if (savedCategories) {
            this.categories = JSON.parse(savedCategories);
        } else {
            this.categories = this.getDefaultCategories();
        }

        if (savedTheme) {
            this.currentTheme = savedTheme;
            this.applyTheme(savedTheme);
        }
    }

    saveData() {
        localStorage.setItem('taskflow_tasks', JSON.stringify(this.tasks));
        localStorage.setItem('taskflow_categories', JSON.stringify(this.categories));
        localStorage.setItem('taskflow_theme', this.currentTheme);
    }

    getSampleTasks() {
        return [
            {
                id: '1',
                title: 'Complete Project Proposal',
                description: 'Finish the quarterly project proposal document',
                priority: 'high',
                category: 'work',
                status: 'todo',
                dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                recurring: 'none',
                createdAt: new Date().toISOString(),
                completedAt: null
            },
            {
                id: '2',
                title: 'Morning Exercise',
                description: '30 minutes cardio workout',
                priority: 'medium',
                category: 'personal',
                status: 'in-progress',
                dueDate: new Date().toISOString(),
                recurring: 'daily',
                createdAt: new Date().toISOString(),
                completedAt: null
            },
            {
                id: '3',
                title: 'Study JavaScript',
                description: 'Complete advanced JavaScript concepts',
                priority: 'high',
                category: 'study',
                status: 'done',
                dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                recurring: 'none',
                createdAt: new Date().toISOString(),
                completedAt: new Date().toISOString()
            }
        ];
    }

    getDefaultCategories() {
        return [
            { id: 'work', name: 'Work', icon: 'fas fa-briefcase' },
            { id: 'personal', name: 'Personal', icon: 'fas fa-user' },
            { id: 'study', name: 'Study', icon: 'fas fa-graduation-cap' }
        ];
    }

    // Event Listeners
    setupEventListeners() {
        // Floating Action Button
        document.getElementById('fab').addEventListener('click', () => {
            this.openTaskModal();
        });

        // Task Modal
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeTaskModal();
        });

        // Task Form
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });

        // Voice Input
        document.getElementById('voiceInputBtn').addEventListener('click', () => {
            this.toggleVoiceInput();
        });

        // Category Modal
        document.getElementById('addCategoryBtn').addEventListener('click', () => {
            this.openCategoryModal();
        });

        document.getElementById('closeCategoryModal').addEventListener('click', () => {
            this.closeCategoryModal();
        });

        document.getElementById('categoryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addCategory();
        });

        // Theme Toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.openThemeModal();
        });

        // Theme Options
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                const theme = option.dataset.theme;
                this.applyTheme(theme);
                this.closeThemeModal();
            });
        });

        // Search
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterTasks(e.target.value);
        });

        // Category Filter
        document.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', () => {
                this.filterByCategory(item.dataset.category);
            });
        });

        // Settings Button
        document.querySelector('.settings-btn').addEventListener('click', () => {
            this.openSettings();
        });

        // Close Theme Modal
        document.getElementById('closeThemeModal').addEventListener('click', () => {
            this.closeThemeModal();
        });

        // Drag and Drop
        this.setupDragAndDrop();
    }

    // Task Management
    openTaskModal(taskId = null) {
        const modal = document.getElementById('taskModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('taskForm');

        if (taskId) {
            // Edit mode
            this.editingTaskId = taskId;
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                modalTitle.textContent = 'Edit Task';
                this.populateTaskForm(task);
            }
        } else {
            // Add mode
            this.editingTaskId = null;
            modalTitle.textContent = 'Add New Task';
            form.reset();
        }

        modal.classList.add('show');
    }

    closeTaskModal() {
        const modal = document.getElementById('taskModal');
        modal.classList.remove('show');
        this.editingTaskId = null;
    }

    populateTaskForm(task) {
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskPriority').value = task.priority;
        document.getElementById('taskCategory').value = task.category;
        document.getElementById('taskDueDate').value = task.dueDate ? task.dueDate.slice(0, 16) : '';
        document.getElementById('taskRecurring').value = task.recurring;
    }

    saveTask() {
        const formData = new FormData(document.getElementById('taskForm'));
        const taskData = {
            title: formData.get('title'),
            description: formData.get('description'),
            priority: formData.get('priority'),
            category: formData.get('category'),
            dueDate: formData.get('dueDate'),
            recurring: formData.get('recurring')
        };

        if (this.editingTaskId) {
            // Update existing task
            const taskIndex = this.tasks.findIndex(t => t.id === this.editingTaskId);
            if (taskIndex !== -1) {
                this.tasks[taskIndex] = {
                    ...this.tasks[taskIndex],
                    ...taskData,
                    updatedAt: new Date().toISOString()
                };
                this.showNotification('Task updated successfully!', 'success');
            }
        } else {
            // Create new task
            const newTask = {
                id: this.generateId(),
                ...taskData,
                status: 'todo',
                createdAt: new Date().toISOString(),
                completedAt: null
            };
            this.tasks.push(newTask);
            this.showNotification('Task created successfully!', 'success');
        }

        this.saveData();
        this.renderTasks();
        this.updateAnalytics();
        this.closeTaskModal();
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveData();
            this.renderTasks();
            this.updateAnalytics();
            this.showNotification('Task deleted successfully!', 'success');
        }
    }

    updateTaskStatus(taskId, newStatus) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = newStatus;
            if (newStatus === 'done') {
                task.completedAt = new Date().toISOString();
            } else {
                task.completedAt = null;
            }
            this.saveData();
            this.updateAnalytics();
        }
    }

    // Voice Input
    setupVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.voiceRecognition = new SpeechRecognition();
            this.voiceRecognition.continuous = false;
            this.voiceRecognition.interimResults = false;
            this.voiceRecognition.lang = 'en-US';

            this.voiceRecognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.processVoiceInput(transcript);
            };

            this.voiceRecognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.showNotification('Voice input error. Please try again.', 'error');
            };

            this.voiceRecognition.onend = () => {
                this.stopVoiceInput();
            };
        }
    }

    toggleVoiceInput() {
        if (this.isVoiceActive) {
            this.stopVoiceInput();
        } else {
            this.startVoiceInput();
        }
    }

    startVoiceInput() {
        if (this.voiceRecognition) {
            this.isVoiceActive = true;
            document.getElementById('voiceInputBtn').classList.add('voice-input-active');
            this.voiceRecognition.start();
            this.showNotification('Listening... Speak now!', 'info');
        } else {
            this.showNotification('Voice input not supported in this browser.', 'warning');
        }
    }

    stopVoiceInput() {
        if (this.voiceRecognition) {
            this.voiceRecognition.stop();
        }
        this.isVoiceActive = false;
        document.getElementById('voiceInputBtn').classList.remove('voice-input-active');
    }

    processVoiceInput(transcript) {
        // Simple voice command processing
        const lowerTranscript = transcript.toLowerCase();
        
        if (lowerTranscript.includes('add task') || lowerTranscript.includes('new task')) {
            // Extract task details from voice input
            const title = transcript.replace(/add task|new task/gi, '').trim();
            if (title) {
                document.getElementById('taskTitle').value = title;
                this.showNotification(`Task title set to: "${title}"`, 'success');
            }
        } else if (lowerTranscript.includes('high priority')) {
            document.getElementById('taskPriority').value = 'high';
            this.showNotification('Priority set to High', 'success');
        } else if (lowerTranscript.includes('medium priority')) {
            document.getElementById('taskPriority').value = 'medium';
            this.showNotification('Priority set to Medium', 'success');
        } else if (lowerTranscript.includes('low priority')) {
            document.getElementById('taskPriority').value = 'low';
            this.showNotification('Priority set to Low', 'success');
        } else if (lowerTranscript.includes('work')) {
            document.getElementById('taskCategory').value = 'work';
            this.showNotification('Category set to Work', 'success');
        } else if (lowerTranscript.includes('personal')) {
            document.getElementById('taskCategory').value = 'personal';
            this.showNotification('Category set to Personal', 'success');
        } else if (lowerTranscript.includes('study')) {
            document.getElementById('taskCategory').value = 'study';
            this.showNotification('Category set to Study', 'success');
        }
    }

    // Category Management
    openCategoryModal() {
        document.getElementById('categoryModal').classList.add('show');
    }

    closeCategoryModal() {
        document.getElementById('categoryModal').classList.remove('show');
    }

    addCategory() {
        const formData = new FormData(document.getElementById('categoryForm'));
        const categoryData = {
            id: this.generateId(),
            name: formData.get('name'),
            icon: formData.get('icon')
        };

        this.categories.push(categoryData);
        this.saveData();
        this.renderCategories();
        this.closeCategoryModal();
        this.showNotification('Category added successfully!', 'success');
    }

    // Theme Management
    openThemeModal() {
        document.getElementById('themeModal').classList.add('show');
    }

    closeThemeModal() {
        document.getElementById('themeModal').classList.remove('show');
    }

    applyTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        this.saveData();
        
        // Update theme toggle icon
        const themeToggle = document.getElementById('themeToggle');
        const icon = themeToggle.querySelector('i');
        if (theme === 'midnight') {
            icon.className = 'fas fa-moon';
        } else {
            icon.className = 'fas fa-sun';
        }
    }

    // Task Rendering
    renderTasks() {
        this.renderTaskColumn('todo');
        this.renderTaskColumn('in-progress');
        this.renderTaskColumn('done');
        this.updateTaskCounts();
    }

    renderTaskColumn(status) {
        const column = document.getElementById(`${status.replace('-', '')}List`);
        const tasks = this.tasks.filter(t => t.status === status);
        
        column.innerHTML = '';
        
        tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            column.appendChild(taskElement);
        });
    }

    createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = `task-card priority-${task.priority}`;
        taskElement.draggable = true;
        taskElement.dataset.taskId = task.id;

        // Check if task is due today
        if (this.isDueToday(task.dueDate)) {
            taskElement.classList.add('due-today');
        }

        const isRecurring = task.recurring !== 'none';
        const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';

        taskElement.innerHTML = `
            ${isRecurring ? '<div class="recurring-indicator"><i class="fas fa-redo"></i></div>' : ''}
            <div class="task-header">
                <div class="task-title">${task.title}</div>
                <div class="task-actions">
                    <button class="task-action-btn edit-task" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-action-btn delete-task" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
            <div class="task-meta">
                <span class="priority-badge ${task.priority}">${task.priority}</span>
                <span class="task-category">${this.getCategoryName(task.category)}</span>
                <span class="task-due-date">${dueDate}</span>
            </div>
        `;

        // Add event listeners
        taskElement.querySelector('.edit-task').addEventListener('click', () => {
            this.openTaskModal(task.id);
        });

        taskElement.querySelector('.delete-task').addEventListener('click', () => {
            this.deleteTask(task.id);
        });

        return taskElement;
    }

    renderCategories() {
        const categoryList = document.getElementById('categoryList');
        categoryList.innerHTML = `
            <li class="category-item active" data-category="all">
                <i class="fas fa-home"></i>
                <span>All Tasks</span>
            </li>
        `;

        this.categories.forEach(category => {
            const li = document.createElement('li');
            li.className = 'category-item';
            li.dataset.category = category.id;
            li.innerHTML = `
                <i class="${category.icon}"></i>
                <span>${category.name}</span>
            `;
            li.addEventListener('click', () => {
                this.filterByCategory(category.id);
            });
            categoryList.appendChild(li);
        });
    }

    // Drag and Drop
    setupDragAndDrop() {
        const taskLists = document.querySelectorAll('.task-list');
        
        taskLists.forEach(list => {
            list.addEventListener('dragover', (e) => {
                e.preventDefault();
                list.classList.add('drag-over');
            });

            list.addEventListener('dragleave', () => {
                list.classList.remove('drag-over');
            });

            list.addEventListener('drop', (e) => {
                e.preventDefault();
                list.classList.remove('drag-over');
                
                const taskId = e.dataTransfer.getData('text/plain');
                const newStatus = list.parentElement.dataset.status;
                
                this.updateTaskStatus(taskId, newStatus);
                this.renderTasks();
            });
        });

        // Task dragging
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('task-card')) {
                e.target.classList.add('dragging');
                e.dataTransfer.setData('text/plain', e.target.dataset.taskId);
            }
        });

        document.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('task-card')) {
                e.target.classList.remove('dragging');
            }
        });
    }

    // Filtering and Search
    filterTasks(searchTerm) {
        const taskCards = document.querySelectorAll('.task-card');
        const term = searchTerm.toLowerCase();

        taskCards.forEach(card => {
            const title = card.querySelector('.task-title').textContent.toLowerCase();
            const description = card.querySelector('.task-description')?.textContent.toLowerCase() || '';
            
            if (title.includes(term) || description.includes(term)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    filterByCategory(category) {
        // Update active category
        document.querySelectorAll('.category-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        const taskCards = document.querySelectorAll('.task-card');
        
        taskCards.forEach(card => {
            if (category === 'all') {
                card.style.display = 'block';
            } else {
                const taskId = card.dataset.taskId;
                const task = this.tasks.find(t => t.id === taskId);
                if (task && task.category === category) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            }
        });
    }

    // Analytics
    updateAnalytics() {
        this.updateProgressBar();
        this.updateWeekStats();
        this.updateCategoryChart();
    }

    updateProgressBar() {
        const today = new Date().toDateString();
        const todayTasks = this.tasks.filter(task => {
            const taskDate = new Date(task.createdAt).toDateString();
            return taskDate === today;
        });

        const completedToday = todayTasks.filter(task => task.status === 'done').length;
        const totalToday = todayTasks.length;
        const percentage = totalToday > 0 ? (completedToday / totalToday) * 100 : 0;

        document.getElementById('todayProgress').style.width = `${percentage}%`;
        document.getElementById('todayProgressText').textContent = `${Math.round(percentage)}%`;
    }

    updateWeekStats() {
        const now = new Date();
        const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

        const weekTasks = this.tasks.filter(task => {
            const taskDate = new Date(task.createdAt);
            return taskDate >= weekStart && taskDate < weekEnd;
        });

        const completed = weekTasks.filter(task => task.status === 'done').length;
        const total = weekTasks.length;

        document.getElementById('weekCompleted').textContent = completed;
        document.getElementById('weekTotal').textContent = total;
    }

    updateCategoryChart() {
        const ctx = document.getElementById('categoryChart').getContext('2d');
        
        if (this.chart) {
            this.chart.destroy();
        }

        const categoryData = {};
        this.tasks.forEach(task => {
            categoryData[task.category] = (categoryData[task.category] || 0) + 1;
        });

        const labels = Object.keys(categoryData);
        const data = Object.values(categoryData);

        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels.map(label => this.getCategoryName(label)),
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#3b82f6',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444',
                        '#8b5cf6'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary'),
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    }

    // Utility Functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getCategoryName(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        return category ? category.name : categoryId;
    }

    updateTaskCounts() {
        const counts = {
            todo: this.tasks.filter(t => t.status === 'todo').length,
            'in-progress': this.tasks.filter(t => t.status === 'in-progress').length,
            done: this.tasks.filter(t => t.status === 'done').length
        };

        document.getElementById('todoCount').textContent = counts.todo;
        document.getElementById('inProgressCount').textContent = counts['in-progress'];
        document.getElementById('doneCount').textContent = counts.done;
    }

    isDueToday(dueDate) {
        if (!dueDate) return false;
        const today = new Date().toDateString();
        const due = new Date(dueDate).toDateString();
        return today === due;
    }

    // Notifications
    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        notification.innerHTML = `
            <div class="notification-header">
                <span class="notification-title">${type.charAt(0).toUpperCase() + type.slice(1)}</span>
                <button class="notification-close">&times;</button>
            </div>
            <div class="notification-message">${message}</div>
        `;

        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });

        container.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // Settings
    openSettings() {
        // Add export/import functionality
        const settingsContent = `
            <div class="settings-content">
                <h3>Data Management</h3>
                <div class="utility-buttons">
                    <button class="btn-utility" onclick="app.exportTasks()">
                        <i class="fas fa-download"></i> Export Tasks
                    </button>
                    <button class="btn-utility" onclick="app.importTasks()">
                        <i class="fas fa-upload"></i> Import Tasks
                    </button>
                    <button class="btn-utility" onclick="app.clearAllTasks()">
                        <i class="fas fa-trash"></i> Clear All
                    </button>
                </div>
            </div>
        `;

        // Create a simple modal for settings
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Settings</h2>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                ${settingsContent}
            </div>
        `;

        document.body.appendChild(modal);
    }

    // Export/Import
    exportTasks() {
        const dataStr = JSON.stringify(this.tasks, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `taskflow-tasks-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Tasks exported successfully!', 'success');
    }

    importTasks() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedTasks = JSON.parse(e.target.result);
                        this.tasks = [...this.tasks, ...importedTasks];
                        this.saveData();
                        this.renderTasks();
                        this.updateAnalytics();
                        this.showNotification('Tasks imported successfully!', 'success');
                    } catch (error) {
                        this.showNotification('Error importing tasks. Invalid file format.', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }

    clearAllTasks() {
        if (confirm('Are you sure you want to clear all tasks? This action cannot be undone.')) {
            this.tasks = [];
            this.saveData();
            this.renderTasks();
            this.updateAnalytics();
            this.showNotification('All tasks cleared!', 'success');
        }
    }

    // Reminders and Due Date Checking
    checkDueDates() {
        this.tasks.forEach(task => {
            if (task.dueDate && !task.completedAt) {
                const dueDate = new Date(task.dueDate);
                const now = new Date();
                const timeDiff = dueDate.getTime() - now.getTime();
                const hoursDiff = timeDiff / (1000 * 3600);

                if (hoursDiff <= 24 && hoursDiff > 0) {
                    this.showNotification(`Task "${task.title}" is due soon!`, 'warning');
                } else if (hoursDiff <= 0) {
                    this.showNotification(`Task "${task.title}" is overdue!`, 'error');
                }
            }
        });
    }

    setupReminders() {
        // Check for due tasks every hour
        setInterval(() => {
            this.checkDueDates();
        }, 60 * 60 * 1000);
    }

    // Recurring Tasks
    processRecurringTasks() {
        const now = new Date();
        const completedTasks = this.tasks.filter(task => 
            task.status === 'done' && task.recurring !== 'none'
        );

        completedTasks.forEach(task => {
            const nextDueDate = this.calculateNextDueDate(task.dueDate, task.recurring);
            if (nextDueDate && nextDueDate <= now) {
                // Create next recurring task
                const newTask = {
                    ...task,
                    id: this.generateId(),
                    status: 'todo',
                    dueDate: nextDueDate.toISOString(),
                    createdAt: new Date().toISOString(),
                    completedAt: null
                };
                this.tasks.push(newTask);
            }
        });

        this.saveData();
        this.renderTasks();
    }

    calculateNextDueDate(dueDate, recurring) {
        if (!dueDate || recurring === 'none') return null;
        
        const date = new Date(dueDate);
        const now = new Date();
        
        switch (recurring) {
            case 'daily':
                date.setDate(date.getDate() + 1);
                break;
            case 'weekly':
                date.setDate(date.getDate() + 7);
                break;
            case 'monthly':
                date.setMonth(date.getMonth() + 1);
                break;
        }
        
        return date > now ? date : null;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TaskFlowApp();
    
    // Process recurring tasks every day
    setInterval(() => {
        app.processRecurringTasks();
    }, 24 * 60 * 60 * 1000);
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case 'n':
                e.preventDefault();
                app.openTaskModal();
                break;
            case 's':
                e.preventDefault();
                app.saveData();
                app.showNotification('Data saved!', 'success');
                break;
            case 'f':
                e.preventDefault();
                document.getElementById('searchInput').focus();
                break;
        }
    }
    
    // Escape key to close modals
    if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal.show');
        openModals.forEach(modal => {
            if (modal.id === 'taskModal') {
                app.closeTaskModal();
            } else if (modal.id === 'categoryModal') {
                app.closeCategoryModal();
            } else if (modal.id === 'themeModal') {
                app.closeThemeModal();
            } else {
                modal.remove();
            }
        });
    }
});
