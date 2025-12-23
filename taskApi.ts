import { Task, TaskStatus, TaskRecurrence, TaskCategory } from '../types';
import { getFeedingSchedules, getLivestock } from './livestockApi';

const STORAGE_KEY = 'agrisync_tasks';

const getInitialData = (): Task[] => {
    // Set a consistent "today" for mock data generation, e.g., August 15, 2025
    const today = new Date('2025-08-15');
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    return [
        // --- Past Tasks (Completed) ---
        { id: 'task_dec1', title: 'Plant Winter Wheat in Hillside Patch', assigneeId: 6, relatedFieldId: 3, dueDate: '2024-12-05', priority: 'High', status: TaskStatus.Completed, recurrence: TaskRecurrence.None, createdAt: '2024-12-03', completedAt: '2024-12-05', completedByUserId: 6, taskCategory: 'General' },
        { id: 'task_jan1', title: 'Harvest Barley from South Paddock', assigneeId: 2, relatedFieldId: 6, dueDate: '2025-01-14', priority: 'Urgent', status: TaskStatus.Completed, recurrence: TaskRecurrence.None, createdAt: '2025-01-10', completedAt: '2025-01-15', completedByUserId: 2, completionNotes: 'Yield was higher than expected.', taskCategory: 'General' },
        { id: 'task_apr1', title: 'Plant Maize in North Field', assigneeId: 3, relatedFieldId: 1, dueDate: '2025-04-15', priority: 'High', status: TaskStatus.Completed, recurrence: TaskRecurrence.None, createdAt: '2025-04-12', completedAt: '2025-04-15', completedByUserId: 3, taskCategory: 'General' },
        { id: 'task_jun1', title: 'Harvest Winter Wheat from Hillside Patch', assigneeId: 7, relatedFieldId: 3, dueDate: '2025-06-15', priority: 'Urgent', status: TaskStatus.Completed, recurrence: TaskRecurrence.None, createdAt: '2025-06-10', completedAt: '2025-06-15', completedByUserId: 7, taskCategory: 'General' },
        { id: 'task_jul1', title: 'Scout for pests in Maize fields', assigneeId: 8, relatedFieldId: 2, dueDate: '2025-07-20', priority: 'Medium', status: TaskStatus.Completed, recurrence: TaskRecurrence.None, createdAt: '2025-07-18', completedAt: '2025-07-19', completionNotes: 'Minor aphid presence, no action needed yet.', taskCategory: 'General' },
        
        // --- Current & Future Tasks ---
        {
            id: 'task2',
            title: 'Calibrate fertilizer spreader',
            assigneeId: 2, // Bob (Manager)
            dueDate: today.toISOString().split('T')[0],
            priority: 'Medium',
            status: TaskStatus.InProgress,
            recurrence: TaskRecurrence.None,
            description: "Started calibration, need to finish sensor alignment.",
            createdAt: yesterday.toISOString(),
            taskCategory: 'General'
        },
        {
            id: 'task9',
            title: 'Scout for aphids in Canola on East Slope',
            assigneeId: 9,
            relatedFieldId: 4,
            dueDate: today.toISOString().split('T')[0],
            priority: 'High',
            status: TaskStatus.InProgress,
            recurrence: TaskRecurrence.None,
            createdAt: yesterday.toISOString(),
            taskCategory: 'Health Check'
        },
        {
            id: 'task15',
            title: 'Check water troughs for all cattle',
            assigneeId: 9,
            relatedLivestockId: 'cow1',
            dueDate: today.toISOString().split('T')[0],
            priority: 'Medium',
            status: TaskStatus.Pending,
            recurrence: TaskRecurrence.Daily,
            createdAt: today.toISOString(),
            taskCategory: 'Health Check'
        },
        {
            id: 'task1',
            title: 'Inspect North Field for corn borer',
            assigneeId: 3, // Charlie (Worker)
            relatedFieldId: 1,
            dueDate: tomorrow.toISOString().split('T')[0],
            priority: 'High',
            status: TaskStatus.Pending,
            recurrence: TaskRecurrence.Weekly,
            createdAt: today.toISOString(),
            taskCategory: 'Health Check'
        },
        { 
            id: 'task7', 
            title: 'Administer deworming medication to Sheep Flock', 
            assigneeId: 8, 
            relatedLivestockId: 'sheep1', 
            dueDate: tomorrow.toISOString().split('T')[0], 
            priority: 'High', 
            status: TaskStatus.Pending, 
            recurrence: TaskRecurrence.None, 
            createdAt: today.toISOString(),
            taskCategory: 'Treatment'
        },
        { 
            id: 'task8', 
            title: 'Perform 1500-hour service on Tractor A', 
            assigneeId: 6, 
            dueDate: nextWeek.toISOString().split('T')[0], 
            priority: 'Medium', 
            status: TaskStatus.Pending, 
            recurrence: TaskRecurrence.None, 
            description: 'Change oil, filters, and check hydraulics.', 
            createdAt: new Date(new Date(today).setDate(today.getDate() - 2)).toISOString(),
            taskCategory: 'General'
        },
        {
            id: 'task6',
            title: 'Order new seeds for next season',
            assigneeId: 2, // Bob (Manager)
            dueDate: yesterday.toISOString().split('T')[0], // This task is overdue
            priority: 'High',
            status: TaskStatus.Blocked,
            recurrence: TaskRecurrence.None,
            description: 'Waiting for budget approval from Alice.',
            createdAt: new Date(new Date(today).setDate(today.getDate() - 5)).toISOString(),
            taskCategory: 'General'
        },
    ];
};

export const getTasks = async (): Promise<Task[]> => {
    await new Promise(res => setTimeout(res, 300)); // simulate network delay
    const data = localStorage.getItem(STORAGE_KEY);
    let tasks: Task[] = [];
    if (!data) {
        const initialData = getInitialData();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
        tasks = initialData;
    } else {
        tasks = JSON.parse(data);
    }
    
    // --- Automated Task Generation for Feeding Schedules ---
    try {
        const schedules = await getFeedingSchedules();
        const livestock = await getLivestock(); 
        const livestockById = livestock.reduce((acc, item) => ({ ...acc, [item.id]: item }), {} as Record<string, any>);
        
        const todayStr = new Date('2025-08-15').toISOString().split('T')[0];
        let newTasksGenerated = false;

        schedules.forEach(schedule => {
            if (schedule.recurrence === TaskRecurrence.Daily) {
                const taskId = `feed-${schedule.id}-${todayStr}`;
                const taskExists = tasks.some(t => t.id === taskId);
                
                // Only create if not existing and not completed
                if (!taskExists) {
                    const animal = livestockById[schedule.livestockId];
                    if (animal) {
                        const animalName = animal.trackingType === 'Individual' ? animal.name || `Tag ${animal.tagId}` : animal.groupName;
                        const newTask: Task = {
                            id: taskId,
                            title: `Feed ${animalName}`,
                            description: `Feed with ${schedule.quantity} ${schedule.unit} of ${schedule.feedType}.`,
                            assigneeId: schedule.assigneeId,
                            relatedLivestockId: schedule.livestockId,
                            dueDate: todayStr,
                            priority: 'High', // Feeding is important
                            status: TaskStatus.Pending,
                            recurrence: TaskRecurrence.None, // The instance is non-recurring
                            createdAt: new Date().toISOString(),
                            isAutomated: true,
                            taskCategory: 'Feeding',
                        };
                        tasks.push(newTask);
                        newTasksGenerated = true;
                    }
                }
            }
        });

        // If new tasks were added, update localStorage
        if (newTasksGenerated) {
             localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        }

    } catch (e) {
        console.error("Failed to generate automated tasks:", e);
    }
    
    return tasks.sort((a,b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
};

export const addTask = async (
    taskData: Omit<Task, 'id' | 'status' | 'createdAt'>
): Promise<Task> => {
    await new Promise(res => setTimeout(res, 200));
    const tasks = await getTasks();
    const newTask: Task = {
        id: `task_${new Date().getTime()}`,
        status: TaskStatus.Pending,
        createdAt: new Date().toISOString(),
        ...taskData
    };
    const updatedTasks = [newTask, ...tasks];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
    return newTask;
};

// FIX: Added missing 'editTask' function required by useTaskData hook.
export const editTask = async (
    taskId: string,
    updateData: Partial<Task>
): Promise<Task> => {
    await new Promise(res => setTimeout(res, 200));
    const tasks = await getTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
        throw new Error('Task not found');
    }
    const updatedTask = { ...tasks[taskIndex], ...updateData };
    tasks[taskIndex] = updatedTask;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return updatedTask;
};

// FIX: Added missing 'updateTask' function required by useTaskData hook (for completing tasks).
export const updateTask = async (
    taskId: string,
    updateData: Partial<Omit<Task, 'id' | 'status'>>
): Promise<Task> => {
    await new Promise(res => setTimeout(res, 200));
    const tasks = await getTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
        throw new Error('Task not found');
    }
    const updatedTask: Task = {
        ...tasks[taskIndex],
        ...updateData,
        status: TaskStatus.Completed,
        completedAt: new Date().toISOString(),
    };
    tasks[taskIndex] = updatedTask;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return updatedTask;
};
