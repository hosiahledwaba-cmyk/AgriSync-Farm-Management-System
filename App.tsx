







import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useFarmData } from './hooks/useFarmData';
import { useFinanceData } from './hooks/useFinanceData';
import { useTaskData } from './hooks/useTaskData';
import { useLivestockData } from './hooks/useLivestockData';
import { useInventoryData } from './hooks/useInventoryData';
import { useEquipmentData } from './hooks/useEquipmentData';
import { useSalesData } from './hooks/useSalesData';
import { useShiftData } from './hooks/useShiftData';
import { useEquipmentUsageData } from './hooks/useEquipmentUsageData';
import { useInventoryUsageData } from './hooks/useInventoryUsageData';
import { useSafetyData } from './hooks/useSafetyData';
import { useMessagingData } from './hooks/useMessagingData';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import FieldDetail from './components/FieldDetail';
import FinanceDashboard from './components/FinanceDashboard';
import TasksDashboard from './components/TasksDashboard';
import TaskRecordsDashboard from './components/TaskRecordsDashboard';
import AccountantDashboard from './components/AccountantDashboard';
import LivestockDashboard from './components/LivestockDashboard';
import OwnerDashboard from './components/OwnerDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import EquipmentDashboard from './components/EquipmentDashboard';
import EquipmentDetail from './components/EquipmentDetail';
import InventoryDashboard from './components/InventoryDashboard';
import SalesDashboard from './components/SalesDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import EmployeeDetail from './components/EmployeeDetail';
import ShiftManagementDashboard from './components/ShiftManagementDashboard';
import MessagingDashboard from './components/MessagingDashboard';
import AddFieldModal from './components/modals/AddFieldModal';
import AddPlantingModal from './components/modals/AddPlantingModal';
import AddHarvestModal from './components/modals/AddHarvestModal';
import AddTransactionModal from './components/modals/AddTransactionModal';
import EditTransactionModal from './components/modals/EditTransactionModal';
import AddTaskModal from './components/modals/AddTaskModal';
import EditTaskModal from './components/modals/EditTaskModal';
import CompleteTaskModal from './components/modals/CompleteTaskModal';
import AddLivestockModal from './components/modals/AddLivestockModal';
import AddFeedingScheduleModal from './components/modals/AddFeedingScheduleModal';
import AddInventoryModal from './components/modals/AddInventoryModal';
import EditInventoryModal from './components/modals/EditInventoryModal';
import AddEquipmentModal from './components/modals/AddEquipmentModal';
import EditEquipmentModal from './components/modals/EditEquipmentModal';
import AddMaintenanceLogModal from './components/modals/AddMaintenanceLogModal';
import CreateSaleModal from './components/modals/CreateSaleModal';
import EditSaleModal from './components/modals/EditSaleModal';
import AccessDenied from './components/ui/AccessDenied';
import { useNotifications } from './hooks/useNotifications';
import { Field, Task, Role, Livestock, FinanceTransaction, FeedingSchedule, Equipment, MaintenanceLog, EquipmentStatus, InventoryItem, User, TransactionType, TransactionCategory, Planting, CropHealthSnapshot, Harvest, Sale, LivestockStatus, Notification, LivestockHealthEvent, TaskPriority, TaskRecurrence, Shift, TimeLog, ShiftTemplate, EmployeeAvailability, EquipmentUsageLog, InventoryUsageLog, SafetyReport, SafetyStatus, SafetySeverity, WeightLog, ProductionLog, FeedLog, TreatmentLog, Conversation, MessageReference, TaskExchangeLog } from './types';
import LivestockDetail from './components/LivestockDetail';
import EditLivestockModal from './components/modals/EditLivestockModal';
import AddHealthEventModal from './components/modals/AddHealthEventModal';
import EditFeedingScheduleModal from './components/modals/EditFeedingScheduleModal';
import AddCropHealthSnapshotModal from './components/modals/AddCropHealthSnapshotModal';
import CreateJournalModal from './components/modals/CreateJournalModal';
import HumanResourcesDashboard from './components/HumanResourcesDashboard';
import AddEmployeeModal from './components/modals/AddEmployeeModal';
import EditEmployeeModal from './components/modals/EditEmployeeModal';
import LogWageChangeModal from './components/modals/LogWageChangeModal';
import EditTimeLogModal from './components/modals/EditShiftModal';
import ShiftUpsertModal from './components/modals/ShiftUpsertModal';
import ManageShiftTemplatesModal from './components/modals/ManageShiftTemplatesModal';
import TeamAnalyticsDashboard from './components/TeamAnalyticsDashboard';
import SetAvailabilityModal from './components/modals/SetAvailabilityModal';
import EquipmentTrackingDashboard from './components/EquipmentTrackingDashboard';
import StartSessionModal from './components/modals/StartSessionModal';
import EndSessionModal from './components/modals/EndSessionModal';
import WithdrawInventoryModal from './components/modals/WithdrawInventoryModal';
import SafetyDashboard from './components/SafetyDashboard';
import AddSafetyReportModal from './components/modals/AddSafetyReportModal';
import UpdateSafetyReportModal from './components/modals/UpdateSafetyReportModal';
import CriticalAlertModal from './components/modals/CriticalAlertModal';
import AddWeightLogModal from './components/modals/AddWeightLogModal';
import AddProductionLogModal from './components/modals/AddProductionLogModal';
import AddFeedLogModal from './components/modals/AddFeedLogModal';
import AddTreatmentLogModal from './components/modals/AddTreatmentLogModal';
import LivestockHealthAnalysisModal from './components/modals/LivestockHealthAnalysisModal';
import UpdateSoilAnalysisModal from './components/modals/UpdateSoilAnalysisModal';
import NewConversationModal from './components/modals/NewConversationModal';
import { useTaskExchangeData } from './hooks/useTaskExchangeData';
import TaskExchangeModal from './components/modals/TaskExchangeModal';
import DenyExchangeModal from './components/modals/DenyExchangeModal';
import NotificationDetailModal from './components/modals/NotificationDetailModal';


type ViewType = 'fields' | 'livestock' | 'tasks' | 'task_records' | 'finance' | 'accounting' | 'owner' | 'manager' | 'equipment' | 'inventory' | 'sales' | 'employees' | 'hr' | 'shifts' | 'team_analytics' | 'equipment_tracking' | 'safety' | 'messaging';
type ModalType = 'ADD_FIELD' | 'ADD_PLANTING' | 'ADD_HARVEST' | 'ADD_TRANSACTION' | 'EDIT_TRANSACTION' | 'ADD_TASK' | 'EDIT_TASK' | 'COMPLETE_TASK' | 'EXCHANGE_TASK' | 'DENY_EXCHANGE' | 'VIEW_NOTIFICATION' | 'ADD_LIVESTOCK' | 'ADD_FEEDING_SCHEDULE' | 'EDIT_LIVESTOCK' | 'ADD_HEALTH_EVENT' | 'EDIT_FEEDING_SCHEDULE' | 'ADD_INVENTORY' | 'EDIT_INVENTORY' | 'ADD_EQUIPMENT' | 'EDIT_EQUIPMENT' | 'ADD_MAINTENANCE_LOG' | 'ADD_CROP_HEALTH_SNAPSHOT' | 'CREATE_SALE' | 'EDIT_SALE' | 'CREATE_JOURNAL' | 'ADD_EMPLOYEE' | 'EDIT_EMPLOYEE' | 'LOG_WAGE_CHANGE' | 'UPSERT_SHIFT' | 'EDIT_TIMELOG' | 'MANAGE_SHIFT_TEMPLATES' | 'SET_AVAILABILITY' | 'START_EQUIPMENT_SESSION' | 'END_EQUIPMENT_SESSION' | 'WITHDRAW_INVENTORY' | 'ADD_SAFETY_REPORT' | 'UPDATE_SAFETY_REPORT' | 'ADD_WEIGHT_LOG' | 'ADD_PRODUCTION_LOG' | 'ADD_FEED_LOG' | 'ADD_TREATMENT_LOG' | 'ANALYZE_LIVESTOCK_HEALTH' | 'UPDATE_SOIL_ANALYSIS' | 'NEW_CONVERSATION' | null;

const getDefaultViewForUser = (user: User): ViewType => {
    switch (user.role) {
        case Role.Owner:
            return 'owner';
        case Role.Manager:
            return 'manager';
        case Role.Accountant:
            return 'shifts'; // Accountants now default to shift screen
        case Role.Worker:
        default:
            return 'tasks'; // Workers now default to the tasks screen
    }
};

const AppContent: React.FC = () => {
    const { user, users, addUser, editUser, removeUser } = useAuth();
    const isOwner = user.role === Role.Owner;
    const isManager = user.role === Role.Manager;

    const farmData = useFarmData();
    const livestockData = useLivestockData();
    const inventoryData = useInventoryData();
    const financeData = useFinanceData();
    const taskData = useTaskData(users);
    const equipmentManager = useEquipmentData();
    const salesData = useSalesData();
    const shiftData = useShiftData();
    const equipmentUsageData = useEquipmentUsageData();
    const inventoryUsageData = useInventoryUsageData();
    const safetyData = useSafetyData();
    const messagingData = useMessagingData(user.id);
    const taskExchangeData = useTaskExchangeData();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(taskData.tasks, user, taskExchangeData.exchangeLogs);
    
    const [currentView, setCurrentView] = useState<ViewType>(getDefaultViewForUser(user));
    const [selectedField, setSelectedField] = useState<Field | null>(null);
    const [selectedLivestock, setSelectedLivestock] = useState<Livestock | null>(null);
    const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [taskToComplete, setTaskToComplete] = useState<Task | null>(null);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const [taskToExchange, setTaskToExchange] = useState<Task | null>(null);
    const [exchangeToDeny, setExchangeToDeny] = useState<TaskExchangeLog | null>(null);
    const [notificationToView, setNotificationToView] = useState<Notification | null>(null);
    const [transactionToEdit, setTransactionToEdit] = useState<FinanceTransaction | null>(null);
    const [livestockToEdit, setLivestockToEdit] = useState<Livestock | null>(null);
    const [scheduleToEdit, setScheduleToEdit] = useState<FeedingSchedule | null>(null);
    const [equipmentToEdit, setEquipmentToEdit] = useState<Equipment | null>(null);
    const [equipmentForMaintenance, setEquipmentForMaintenance] = useState<Equipment | null>(null);
    const [inventoryToEdit, setInventoryToEdit] = useState<InventoryItem | null>(null);
    const [plantingForSnapshot, setPlantingForSnapshot] = useState<Planting | null>(null);
    const [saleToEdit, setSaleToEdit] = useState<Sale | null>(null);
    const [employeeToEdit, setEmployeeToEdit] = useState<User | null>(null);
    const [employeeForWageChange, setEmployeeForWageChange] = useState<User | null>(null);
    const [shiftToUpsert, setShiftToUpsert] = useState<Shift | { date: string, userId: number | null } | null>(null);
    const [timeLogToEdit, setTimeLogToEdit] = useState<TimeLog | null>(null);
    const [availabilityModalInfo, setAvailabilityModalInfo] = useState<{ date: string; availability?: EmployeeAvailability } | null>(null);
    const [equipmentForSession, setEquipmentForSession] = useState<Equipment | null>(null);
    const [usageLogForSession, setUsageLogForSession] = useState<EquipmentUsageLog | null>(null);
    const [safetyReportToUpdate, setSafetyReportToUpdate] = useState<SafetyReport | null>(null);
    const [criticalSafetyAlert, setCriticalSafetyAlert] = useState<SafetyReport | null>(null);
    const [livestockForLog, setLivestockForLog] = useState<Livestock | null>(null);
    const [livestockForAnalysis, setLivestockForAnalysis] = useState<Livestock | null>(null);
    const [fieldForSoilUpdate, setFieldForSoilUpdate] = useState<Field | null>(null);
    const [conversationToSelectId, setConversationToSelectId] = useState<string | null>(null);

    
    useEffect(() => {
        setCurrentView(getDefaultViewForUser(user));
    }, [user]);

    useEffect(() => {
        if (selectedEmployee) {
            const freshEmployeeData = users.find(u => u.id === selectedEmployee.id);
            if (freshEmployeeData) {
                if (JSON.stringify(freshEmployeeData) !== JSON.stringify(selectedEmployee)) {
                    setSelectedEmployee(freshEmployeeData);
                }
            }
        }
    }, [users, selectedEmployee]);

    // When livestock data changes, update the selected livestock to have the fresh data
    useEffect(() => {
        if (selectedLivestock) {
            const freshData = livestockData.livestock.find(l => l.id === selectedLivestock.id);
            if (freshData) {
                if (JSON.stringify(freshData) !== JSON.stringify(selectedLivestock)) {
                    setSelectedLivestock(freshData);
                }
            } else {
                // The livestock was deleted or is no longer available
                setSelectedLivestock(null);
            }
        }
    }, [livestockData.livestock, selectedLivestock]);

    // When field data changes, update the selected field to have the fresh data
    useEffect(() => {
        if (selectedField) {
            const freshData = farmData.fields.find(f => f.id === selectedField.id);
            if (freshData) {
                if (JSON.stringify(freshData) !== JSON.stringify(selectedField)) {
                    setSelectedField(freshData);
                }
            } else {
                setSelectedField(null);
            }
        }
    }, [farmData.fields, selectedField]);


    // --- Data Synchronization & Audit Handlers ---
    const handleAddSafetyReport = async (reportData: Omit<SafetyReport, 'id' | 'reportedById' | 'status'>) => {
        const newReport = await safetyData.addSafetyReport({
            ...reportData,
            reportedById: user.id,
            status: SafetyStatus.Open,
        });

        // Immediate popup for critical alerts for managers/owners
        if (newReport.severity === SafetySeverity.Critical && (isManager || isOwner)) {
            setCriticalSafetyAlert(newReport);
        }
        
        // Create tasks for high/critical reports for all managers/owners
        if (newReport.severity === SafetySeverity.High || newReport.severity === SafetySeverity.Critical) {
            const managersAndOwners = users.filter(u => u.role === Role.Owner || u.role === Role.Manager);
            for (const manager of managersAndOwners) {
                await taskData.addTask({
                    title: `Safety Alert (${newReport.severity}): ${newReport.type} at ${newReport.location}`,
                    description: `A new safety report requires your attention. Description: "${newReport.description}"`,
                    assigneeId: manager.id,
                    dueDate: new Date().toISOString().split('T')[0],
                    priority: newReport.severity === SafetySeverity.Critical ? TaskPriority.Urgent : TaskPriority.High,
                    recurrence: TaskRecurrence.None,
                    taskCategory: 'Safety',
                });
            }
        }
        return newReport;
    };

    const handleUpdateSafetyReportStatus = async (reportId: string, status: SafetyStatus, actionsTaken?: string) => {
        const updates: Partial<SafetyReport> = { status };
        if (status === SafetyStatus.Resolved) {
            updates.actionsTaken = actionsTaken;
            updates.resolvedById = user.id;
            updates.resolvedAt = new Date().toISOString();
        }
        return await safetyData.updateSafetyReport(reportId, updates);
    };

    const addFeedingSchedule = async (scheduleData: Omit<FeedingSchedule, 'id'>) => {
        const result = await livestockData.addFeedingSchedule(scheduleData);
        await taskData.refetch(); 
        return result;
    };

    const updateFeedingSchedule = async (scheduleId: string, updateData: Partial<Omit<FeedingSchedule, 'id'>>) => {
        const result = await livestockData.updateFeedingSchedule(scheduleId, updateData);
        await taskData.refetch();
        return result;
    };

    const handleAddHealthEvent = async (livestockId: string, eventData: LivestockHealthEvent) => {
        const updatedLivestock = await livestockData.addHealthEvent(livestockId, eventData);

        if (selectedLivestock?.id === livestockId) {
            setSelectedLivestock(updatedLivestock);
        }

        if (user.role !== Role.Owner) {
            const owner = users.find(u => u.role === Role.Owner);
            if (owner) {
                const livestockName = updatedLivestock.trackingType === 'Individual'
                    ? updatedLivestock.name || `Tag ${updatedLivestock.tagId}`
                    : updatedLivestock.groupName;

                await taskData.addTask({
                    title: `Health Alert: ${eventData.eventType} for ${livestockName}`,
                    description: `A new health event was logged for ${livestockName} by ${user.name}. Notes: "${eventData.notes}"`,
                    assigneeId: owner.id,
                    relatedLivestockId: livestockId,
                    dueDate: new Date().toISOString().split('T')[0],
                    priority: TaskPriority.High,
                    recurrence: TaskRecurrence.None,
                    taskCategory: 'Health Check',
                });
            }
        }
    };

    const handleAddWeightLog = async (livestockId: string, log: WeightLog) => {
        return await livestockData.addWeightLog(livestockId, log);
    };
    const handleAddProductionLog = async (livestockId: string, log: ProductionLog) => {
        return await livestockData.addProductionLog(livestockId, log);
    };
    const handleAddFeedLog = async (livestockId: string, log: FeedLog) => {
        return await livestockData.addFeedLog(livestockId, log);
    };
    const handleAddTreatmentLog = async (livestockId: string, log: Omit<TreatmentLog, 'id' | 'administeredById'>) => {
        const fullLog = { ...log, administeredById: user.id };
        const updated = await livestockData.addTreatmentLog(livestockId, fullLog);
        
        // Create task for manager
        const managersAndOwners = users.filter(u => u.role === Role.Owner || u.role === Role.Manager);
        for (const manager of managersAndOwners) {
            await taskData.addTask({
                title: `Treatment Logged: ${log.treatmentType} for ${selectedLivestock?.name || selectedLivestock?.groupName}`,
                description: `A new treatment was administered by ${user.name}. Details: "${log.description}".`,
                assigneeId: manager.id,
                relatedLivestockId: livestockId,
                dueDate: new Date().toISOString().split('T')[0],
                priority: TaskPriority.Medium,
                recurrence: TaskRecurrence.None,
                taskCategory: 'Treatment',
            });
        }
        return updated;
    };


    const addTransaction = (transactionData: Omit<FinanceTransaction, 'id'>) => {
        return financeData.addTransaction(transactionData, user.id);
    };

    const editTransaction = (transactionId: string, updateData: Omit<FinanceTransaction, 'id'>) => {
        return financeData.editTransaction(transactionId, updateData, user.id);
    };

    const addJournalEntry = async (description: string, date: string, legs: { account: TransactionCategory, debit: number, credit: number }[]) => {
        const journalId = `JE-${new Date().getTime()}`;
        const transactionPromises = [];

        for (const leg of legs) {
            if (leg.debit > 0) {
                const debitDesc = `Journal Entry (Debit): ${description}`;
                transactionPromises.push(financeData.addTransaction({
                    type: TransactionType.Expense,
                    description: debitDesc,
                    amount: leg.debit,
                    category: leg.account,
                    date,
                    journalId
                }, user.id));
            }
            if (leg.credit > 0) {
                 const creditDesc = `Journal Entry (Credit): ${description}`;
                 transactionPromises.push(financeData.addTransaction({
                    type: TransactionType.Income,
                    description: creditDesc,
                    amount: leg.credit,
                    category: leg.account,
                    date,
                    journalId
                }, user.id));
            }
        }
        await Promise.all(transactionPromises);
    };
    
    const handleRunPayroll = async (totalAmount: number, description: string, date: string) => {
        await addTransaction({
            type: TransactionType.Expense,
            description,
            amount: totalAmount,
            category: TransactionCategory.Labor,
            date,
        });
    };

    const addEquipment = async ({ equipmentData: newEquipmentPayload, purchasePrice, createTransaction = true }: { equipmentData: Omit<Equipment, 'id'>, purchasePrice: number, createTransaction?: boolean }) => {
        const newEquipment = await equipmentManager.addEquipment(newEquipmentPayload);
        if (createTransaction && newEquipment && purchasePrice > 0) {
            await addTransaction({
                type: TransactionType.Expense,
                description: `Purchase of ${newEquipmentPayload.name}`,
                amount: purchasePrice,
                category: TransactionCategory.AssetPurchase,
                date: new Date().toISOString().split('T')[0],
                relatedEntityType: 'equipment',
                relatedEntityId: newEquipment.id,
                relatedEntityName: newEquipment.name,
            });
        }
        return newEquipment;
    };
    
    const addMaintenanceLog = async (equipmentId: string, data: Omit<MaintenanceLog, 'id' | 'equipmentId'> & { putInMaintenance?: boolean }) => {
        const { putInMaintenance, ...logData } = data;
        const newLog = await equipmentManager.addMaintenanceLog(equipmentId, logData);

        if (newLog.cost > 0) {
            await addTransaction({
                type: TransactionType.Expense,
                description: `Maintenance on ${equipmentManager.equipment.find(e => e.id === equipmentId)?.name} ($${newLog.cost.toFixed(2)}): ${logData.description}`,
                amount: newLog.cost,
                category: TransactionCategory.Repairs,
                date: logData.date,
            });
        }
        
        if (putInMaintenance) {
            const updatedEquipment = await equipmentManager.editEquipment(equipmentId, { status: EquipmentStatus.InMaintenance });
            if (selectedEquipment?.id === equipmentId) {
                setSelectedEquipment(updatedEquipment);
            }
        }
        
        return newLog;
    };

    const addInventoryItem = async (itemData: Omit<InventoryItem, 'id' | 'farm_id'>, createTransaction = true) => {
        const newItem = await inventoryData.addInventoryItem(itemData);
        
        if (createTransaction) {
            const cost = itemData.unit_cost;
            const qty = itemData.stock_qty;
        
            if (newItem && cost && qty && cost > 0 && qty > 0) {
                const totalCost = cost * qty;
                await addTransaction({
                    type: TransactionType.Expense,
                    description: `Purchase of ${qty} ${itemData.unit} of ${itemData.name}`,
                    amount: totalCost,
                    category: TransactionCategory.Supplies,
                    date: new Date().toISOString().split('T')[0],
                });
            }
        }
        return newItem;
    };
    
    const handleAddHarvest = async (harvestData: Omit<Harvest, 'id' | 'operator_id'>, fieldId: number, unitCost?: number) => {
        await farmData.addHarvest(harvestData, fieldId, unitCost);
        await inventoryData.refetch(); // New inventory lot was created, refetch
    };

    const handleAddSale = async (saleData: Omit<Sale, 'id' | 'createdAt' | 'createdById'>) => {
        const fullSaleData = { ...saleData, createdById: user.id, createdAt: new Date().toISOString() };
        const newSale = await salesData.addSale(fullSaleData);

        // Update inventory and livestock statuses
        for (const item of newSale.items) {
            if (item.type === 'crop' && item.inventoryItemId) {
                const inventoryItem = inventoryData.inventoryItems.find(i => i.id === item.inventoryItemId);
                if (inventoryItem) {
                    await inventoryData.editInventoryItem(item.inventoryItemId, {
                        stock_qty: inventoryItem.stock_qty - item.quantity
                    });
                }
            } else if (item.type === 'livestock' && item.livestockId) {
                await livestockData.updateLivestock(item.livestockId, { status: LivestockStatus.Sold });
            }
        }

        // Create financial transaction
        await addTransaction({
            type: TransactionType.Income,
            description: `Sale to ${newSale.buyerName} (Invoice #${newSale.id.slice(-4)})`,
            amount: newSale.total,
            category: TransactionCategory.CropLivestockSales,
            date: newSale.saleDate,
            relatedEntityType: 'sale',
            relatedEntityId: newSale.id,
        });

        return newSale;
    };
    
    const handleUpdateSale = async (saleId: string, updates: Partial<Omit<Sale, 'id'>>) => {
        return await salesData.updateSale(saleId, updates);
    };

    const handleAddSnapshot = async (snapshotData: Omit<CropHealthSnapshot, 'id'>) => {
        return await farmData.addCropHealthSnapshot(snapshotData);
    }
    
    const handleStartSession = async (equipmentId: string, startHours: number) => {
        const newLog = await equipmentUsageData.startSession(equipmentId, user.id, startHours);
        const updatedEquipment = await equipmentManager.editEquipment(equipmentId, { 
            status: EquipmentStatus.InUse, 
            currentOperatorId: user.id, 
            currentUsageLogId: newLog.id 
        });
        if (selectedEquipment?.id === equipmentId) {
            setSelectedEquipment(updatedEquipment);
        }

        // Notify managers and owners
        const managersAndOwners = users.filter(u => u.role === Role.Owner || u.role === Role.Manager);
        for (const manager of managersAndOwners) {
            await taskData.addTask({
                title: `Equipment Checkout: ${updatedEquipment.name}`,
                description: `${user.name} has started a session with ${updatedEquipment.name}.`,
                assigneeId: manager.id,
                dueDate: new Date().toISOString().split('T')[0],
                priority: TaskPriority.Low,
                recurrence: TaskRecurrence.None,
            });
        }
    };

    const handleEndSession = async (logId: string, endHours: number, notes?: string) => {
        const log = equipmentUsageData.usageLogs.find(l => l.id === logId);
        if (!log) return;

        await equipmentUsageData.endSession(logId, endHours, notes);
        const hoursUsed = endHours - log.startHours;
        
        const equipment = equipmentManager.equipment.find(e => e.id === log.equipmentId);
        if (equipment) {
            const updatedEquipment = await equipmentManager.editEquipment(equipment.id, {
                status: EquipmentStatus.Operational,
                currentOperatorId: undefined,
                currentUsageLogId: undefined,
                totalHours: equipment.totalHours + hoursUsed,
            });
             if (selectedEquipment?.id === equipment.id) {
                setSelectedEquipment(updatedEquipment);
            }

            // Notify managers and owners
            const managersAndOwners = users.filter(u => u.role === Role.Owner || u.role === Role.Manager);
            for (const manager of managersAndOwners) {
                await taskData.addTask({
                    title: `Equipment Return: ${updatedEquipment.name}`,
                    description: `${user.name} has returned ${updatedEquipment.name}. Session duration: ${hoursUsed.toFixed(2)} hours.`,
                    assigneeId: manager.id,
                    dueDate: new Date().toISOString().split('T')[0],
                    priority: TaskPriority.Low,
                    recurrence: TaskRecurrence.None,
                });
            }
        }
    };
    
    const handleWithdrawInventory = async (logData: Omit<InventoryUsageLog, 'id' | 'userId' | 'date' | 'inventoryItemName'>) => {
        const item = inventoryData.inventoryItems.find(i => i.id === logData.inventoryItemId);
        if (!item) {
            console.error("Inventory item not found for withdrawal");
            return;
        }

        // 1. Add to usage log
        await inventoryUsageData.addUsageLog({
            ...logData,
            inventoryItemName: item.name,
        }, user.id);

        // 2. Deduct from stock
        const newQuantity = item.stock_qty - logData.quantity;
        await inventoryData.editInventoryItem(item.id, { stock_qty: newQuantity });

        // 3. Check for low stock alert - trigger only when it crosses the threshold
        if (newQuantity <= item.reorder_level && item.stock_qty > item.reorder_level) {
            const managersAndOwners = users.filter(u => u.role === Role.Owner || u.role === Role.Manager);
            for (const manager of managersAndOwners) {
                await taskData.addTask({
                    title: `Low Stock Alert: ${item.name}`,
                    description: `Stock for ${item.name} is low. Current quantity: ${newQuantity.toFixed(2)} ${item.unit}. Reorder level is ${item.reorder_level} ${item.unit}.`,
                    assigneeId: manager.id,
                    dueDate: new Date().toISOString().split('T')[0],
                    priority: TaskPriority.High,
                    recurrence: TaskRecurrence.None,
                });
            }
        }
    };
    
    const handleStartNewConversation = (participantIds: number[]) => {
        messagingData.sendMessage("Hey!", participantIds);
        handleNavigate('messaging');
        handleCloseModal();
    };

    const handleRequestExchange = async (
        task: Task, 
        newAssigneeId: number, 
        type: 'handover' | 'assist_request'
    ) => {
        await taskData.requestExchange(task, newAssigneeId, type, user);
        await taskExchangeData.refetch();
        handleCloseModal();
    };
    
    const handleApproveRequest = async (log: TaskExchangeLog) => {
        await taskExchangeData.approveRequest(log.id);
        await taskData.processExchangeResponse(log, 'approved');
        // The processExchangeResponse will refetch task data, so we just need to refetch logs
        await taskExchangeData.refetch();
    };

    const handleDenyRequest = async (reason: string) => {
        if (!exchangeToDeny) return;
        await taskExchangeData.denyRequest(exchangeToDeny.id, reason);
        await taskData.processExchangeResponse(exchangeToDeny, 'denied', reason);
        await taskExchangeData.refetch();
        handleCloseModal();
    };

    const handleOnExchangeTask = (task: Task) => {
        setTaskToExchange(task);
        setActiveModal('EXCHANGE_TASK');
    };


    // --- RBAC Permissions ---
    const canViewFinance = user.role === Role.Owner || user.role === Role.Manager || user.role === Role.Accountant;
    const canViewAccounting = user.role === Role.Owner || user.role === Role.Accountant;
    const canEditTasks = user.role === Role.Owner || user.role === Role.Manager;
    const canManageLivestock = user.role === Role.Owner || user.role === Role.Manager;
    const canLogHealthEvent = user.role === Role.Owner || user.role === Role.Manager || user.role === Role.Worker;
    const canViewManagerDashboard = isOwner || isManager;
    const canManageEquipment = isOwner || isManager;
    const canViewEquipment = canManageEquipment || user.role === Role.Worker;
    const canManageInventory = isOwner || isManager;
    const canViewInventory = canManageInventory || user.role === Role.Worker;
    const canManageSales = isOwner || isManager || user.role === Role.Accountant;
    const canManageEmployees = isOwner || isManager;
    const canManageHumanResources = isOwner;
    const canViewShifts = true;
    const canViewTeamAnalytics = isOwner || isManager;
    const canViewSafety = true;
    const canViewTaskRecords = isOwner || isManager;


    const handleSelectField = (field: Field) => setSelectedField(field);
    const handleSelectLivestock = (livestock: Livestock) => setSelectedLivestock(livestock);
    const handleSelectEquipment = (equipment: Equipment) => setSelectedEquipment(equipment);
    const handleSelectEmployee = (employee: User) => setSelectedEmployee(employee);
    
    const handleBackToDashboard = () => {
        setSelectedField(null);
        setSelectedLivestock(null);
        setSelectedEquipment(null);
        setSelectedEmployee(null);
    };

    const handleNavigate = (view: ViewType) => {
        if (view === 'finance' && !canViewFinance) return;
        if (view === 'accounting' && !canViewAccounting) return;
        if (view === 'owner' && !isOwner) return;
        if (view === 'manager' && !canViewManagerDashboard) return;
        if (view === 'equipment' && !canViewEquipment) return;
        if (view === 'equipment_tracking' && !canManageEquipment) return;
        if (view === 'inventory' && !canViewInventory) return;
        if (view === 'sales' && !canManageSales) return;
        if (view === 'employees' && !canManageEmployees) return;
        if (view === 'hr' && !canManageHumanResources) return;
        if (view === 'shifts' && !canViewShifts) return;
        if (view === 'team_analytics' && !canViewTeamAnalytics) return;
        if (view === 'safety' && !canViewSafety) return;
        if (view === 'task_records' && !canViewTaskRecords) return;


        setSelectedField(null);
        setSelectedLivestock(null);
        setSelectedEquipment(null);
        setSelectedEmployee(null);
        setCurrentView(view);
    }
    
    const handleNavigateToReference = (ref: MessageReference) => {
        // Close any open modals first
        handleCloseModal();
        handleBackToDashboard(); // Reset any detail views

        switch (ref.type) {
            case 'task':
                handleNavigate('tasks');
                // Future enhancement: scroll to and highlight the task.
                break;
            case 'field':
                const field = farmData.fields.find(f => f.id === ref.id);
                if (field) {
                    handleNavigate('fields');
                    setTimeout(() => setSelectedField(field), 50);
                }
                break;
            case 'livestock':
                const animal = livestockData.livestock.find(l => l.id === ref.id);
                if (animal) {
                    handleNavigate('livestock');
                    setTimeout(() => setSelectedLivestock(animal), 50);
                }
                break;
            case 'equipment':
                const equip = equipmentManager.equipment.find(e => e.id === ref.id);
                if (equip) {
                    handleNavigate('equipment');
                    setTimeout(() => setSelectedEquipment(equip), 50);
                }
                break;
            case 'shift':
                 handleNavigate('shifts');
                 break;
            case 'inventory':
                 handleNavigate('inventory');
                 break;
        }
    }
    
    const handleStartConversationWithUser = async (userId: number) => {
        if (userId === user.id) return; // Can't chat with yourself

        // Check for existing 1-on-1 conversation
        const existingConvo = messagingData.conversations.find(c => 
            c.participantIds.length === 2 && 
            c.participantIds.includes(user.id) && 
            c.participantIds.includes(userId)
        );

        if (existingConvo) {
            setConversationToSelectId(existingConvo.id);
            handleNavigate('messaging');
        } else {
            // Create a new conversation by sending an empty message
            const { conversation: newConvo } = await messagingData.sendMessage('', [userId]);
            if (newConvo) {
                setConversationToSelectId(newConvo.id);
                handleNavigate('messaging');
            }
        }
    };
    
    const handleMentionClick = async (username: string) => {
        const targetUser = users.find(u => u.name === username);
        if (targetUser) {
            await handleStartConversationWithUser(targetUser.id);
        }
    };

    const handleNavigateFromNotification = () => {
        handleCloseModal();
        handleNavigate('tasks');
    };


    const handleOpenModal = (modal: ModalType) => setActiveModal(modal);
    const handleCloseModal = () => {
        setActiveModal(null);
        if (plantingForSnapshot) setPlantingForSnapshot(null);
        if (shiftToUpsert) setShiftToUpsert(null);
        if (availabilityModalInfo) setAvailabilityModalInfo(null);
        if (equipmentForSession) setEquipmentForSession(null);
        if (usageLogForSession) setUsageLogForSession(null);
        if (safetyReportToUpdate) setSafetyReportToUpdate(null);
        if (livestockForLog) setLivestockForLog(null);
        if (livestockForAnalysis) setLivestockForAnalysis(null);
        if (fieldForSoilUpdate) setFieldForSoilUpdate(null);
        if (taskToExchange) setTaskToExchange(null);
        if (exchangeToDeny) setExchangeToDeny(null);
        if (notificationToView) setNotificationToView(null);
    };

    const loading = farmData.loading || financeData.loading || taskData.loading || livestockData.loading || inventoryData.loading || equipmentManager.loading || salesData.loading || shiftData.loading || equipmentUsageData.loading || inventoryUsageData.loading || safetyData.loading || messagingData.loading;
    const error = farmData.error || financeData.error || taskData.error || livestockData.error || inventoryData.error || equipmentManager.error || salesData.error || shiftData.error || equipmentUsageData.error || inventoryUsageData.error || safetyData.error || messagingData.error;

    // FIX: Use a typed reduce to flatten the array of arrays into a single array, ensuring correct type inference.
    const allPlantings: Planting[] = Object.values(farmData.plantingsByField).reduce((acc: Planting[], val: Planting[]) => acc.concat(val), []);
    const allHarvests: Harvest[] = Object.values(farmData.harvestsByField).reduce((acc: Harvest[], val: Harvest[]) => acc.concat(val), []);

    const renderContent = () => {
        if (selectedField) {
            return (
                <FieldDetail 
                    field={selectedField}
                    plantings={farmData.plantingsByField[selectedField.id] || []}
                    harvests={farmData.harvestsByField[selectedField.id] || []}
                    tasks={taskData.tasks.filter(task => task.relatedFieldId === selectedField.id)}
                    healthSnapshots={farmData.cropHealthSnapshotsByField[selectedField.id] || []}
                    wateringEvents={farmData.wateringEventsByField[selectedField.id] || []}
                    onBack={handleBackToDashboard}
                    onAddPlanting={() => handleOpenModal('ADD_PLANTING')}
                    onAddHarvest={() => handleOpenModal('ADD_HARVEST')}
                    onAddHealthSnapshot={(planting) => {
                        setPlantingForSnapshot(planting);
                        handleOpenModal('ADD_CROP_HEALTH_SNAPSHOT');
                    }}
                    onUpdateWateringEvent={farmData.updateWateringEvent}
                    onUpdateSoilAnalysis={() => {
                        setFieldForSoilUpdate(selectedField);
                        handleOpenModal('UPDATE_SOIL_ANALYSIS');
                    }}
                />
            );
        }

        if (selectedLivestock) {
            return (
                <LivestockDetail
                    livestock={selectedLivestock}
                    onBack={handleBackToDashboard}
                    onOpenModal={(modal, livestock) => {
                        setLivestockForLog(livestock);
                        setActiveModal(modal);
                    }}
                    onAnalyze={(livestock) => {
                        setLivestockForAnalysis(livestock);
                        setActiveModal('ANALYZE_LIVESTOCK_HEALTH');
                    }}
                />
            );
        }

        if (selectedEquipment) {
            return (
                <EquipmentDetail
                    equipment={selectedEquipment}
                    maintenanceLogs={equipmentManager.maintenanceLogs.filter(log => log.equipmentId === selectedEquipment.id)}
                    usageLogs={equipmentUsageData.usageLogs}
                    users={users}
                    onBack={handleBackToDashboard}
                    onEdit={() => {
                        setEquipmentToEdit(selectedEquipment);
                        handleOpenModal('EDIT_EQUIPMENT');
                    }}
                    onAddMaintenanceLog={() => {
                        setEquipmentForMaintenance(selectedEquipment);
                        handleOpenModal('ADD_MAINTENANCE_LOG');
                    }}
                    onStartSession={(equipment) => {
                        setEquipmentForSession(equipment);
                        handleOpenModal('START_EQUIPMENT_SESSION');
                    }}
                    onEndSession={(log) => {
                        setUsageLogForSession(log);
                        handleOpenModal('END_EQUIPMENT_SESSION');
                    }}
                />
            );
        }

        if (selectedEmployee) {
            return (
                <EmployeeDetail
                    employee={selectedEmployee}
                    onBack={handleBackToDashboard}
                    tasks={taskData.tasks}
                    plantings={allPlantings}
                    harvests={allHarvests}
                    transactions={financeData.transactions}
                    users={users}
                    onEditTask={(task) => {
                        setTaskToEdit(task);
                        handleOpenModal('EDIT_TASK');
                    }}
                    onLogWageChange={(employee) => {
                        setEmployeeForWageChange(employee);
                        handleOpenModal('LOG_WAGE_CHANGE');
                    }}
                    onExchangeTask={handleOnExchangeTask}
                    onApproveRequest={handleApproveRequest}
                    onDenyRequest={(log) => { setExchangeToDeny(log); setActiveModal('DENY_EXCHANGE'); }}
                    taskExchangeData={taskExchangeData}
                />
            );
        }

        switch (currentView) {
            case 'owner':
                if (!isOwner) return <AccessDenied requiredRole="Owner"/>;
                return <OwnerDashboard 
                    fields={farmData.fields} 
                    tasks={taskData.tasks} 
                    livestock={livestockData.livestock} 
                    transactions={financeData.transactions} 
                    users={users} 
                    plantingsByField={farmData.plantingsByField} 
                    harvestsByField={farmData.harvestsByField} 
                    inventoryItems={inventoryData.inventoryItems} 
                    onSelectField={handleSelectField} 
                    onManageInventory={() => handleNavigate('inventory')} 
                    onEditTask={(task) => {
                        setTaskToEdit(task);
                        handleOpenModal('EDIT_TASK');
                    }}
                    onCompleteTask={(task) => {
                        setTaskToComplete(task);
                        handleOpenModal('COMPLETE_TASK');
                    }}
                    onAddTransaction={() => handleOpenModal('ADD_TRANSACTION')}
                />;
             case 'manager':
                if (!canViewManagerDashboard) return <AccessDenied requiredRole="Manager"/>;
                return <ManagerDashboard 
                    tasks={taskData.tasks} 
                    inventoryItems={inventoryData.inventoryItems} 
                    users={users} 
                    fields={farmData.fields} 
                    livestock={livestockData.livestock}
                    equipment={equipmentManager.equipment} 
                    maintenanceLogs={equipmentManager.maintenanceLogs}
                    timeLogs={shiftData.timeLogs}
                    cropHealthSnapshotsByField={farmData.cropHealthSnapshotsByField}
                    plantingsByField={farmData.plantingsByField}
                    wateringEventsByField={farmData.wateringEventsByField}
                    onAddTask={() => handleOpenModal('ADD_TASK')} 
                    onManageInventory={() => handleNavigate('inventory')}
                    onEditTask={(task) => {
                        setTaskToEdit(task);
                        handleOpenModal('EDIT_TASK');
                    }}
                    onCompleteTask={(task) => {
                        setTaskToComplete(task);
                        handleOpenModal('COMPLETE_TASK');
                    }}
                    onEditEquipment={(equipment) => {
                        setEquipmentToEdit(equipment);
                        handleOpenModal('EDIT_EQUIPMENT');
                    }}
                    onAddMaintenanceLog={(equipment) => {
                        setEquipmentForMaintenance(equipment);
                        handleOpenModal('ADD_MAINTENANCE_LOG');
                    }}
                    onExchangeTask={handleOnExchangeTask}
                    onApproveRequest={handleApproveRequest}
                    onDenyRequest={(log) => { setExchangeToDeny(log); setActiveModal('DENY_EXCHANGE'); }}
                    taskExchangeData={taskExchangeData}
                />;
            case 'inventory':
                if (!canViewInventory) return <AccessDenied requiredRole="Worker" />;
                return <InventoryDashboard 
                    inventoryItems={inventoryData.inventoryItems}
                    usageLogs={inventoryUsageData.usageLogs}
                    users={users}
                    fields={farmData.fields}
                    onAddItem={() => handleOpenModal('ADD_INVENTORY')}
                    onEditItem={(item) => { setInventoryToEdit(item); handleOpenModal('EDIT_INVENTORY'); }}
                    onDeleteItem={inventoryData.deleteInventoryItem}
                    onWithdrawItem={() => handleOpenModal('WITHDRAW_INVENTORY')}
                    canManage={canManageInventory}
                />;
            case 'equipment':
                if (!canViewEquipment) return <AccessDenied requiredRole="Worker" />;
                return <EquipmentDashboard equipment={equipmentManager.equipment} onAddEquipment={() => handleOpenModal('ADD_EQUIPMENT')} onSelectEquipment={handleSelectEquipment} />;
            case 'equipment_tracking':
                 if (!canManageEquipment) return <AccessDenied requiredRole="Manager" />;
                 return <EquipmentTrackingDashboard usageLogs={equipmentUsageData.usageLogs} equipment={equipmentManager.equipment} users={users} />;
            case 'livestock':
                return <LivestockDashboard livestock={livestockData.livestock} feedingSchedules={livestockData.feedingSchedules} users={users} onAddLivestock={() => handleOpenModal('ADD_LIVESTOCK')} onAddFeedingSchedule={() => { setSelectedLivestock(null); handleOpenModal('ADD_FEEDING_SCHEDULE'); }} onSelectLivestock={handleSelectLivestock} />;
            case 'tasks':
                return <TasksDashboard 
                    tasks={taskData.tasks} 
                    users={users} 
                    fields={farmData.fields} 
                    livestock={livestockData.livestock} 
                    onAddTask={() => handleOpenModal('ADD_TASK')} 
                    onStartTask={taskData.startTask} 
                    onEditTask={(task) => { if (!canEditTasks) return; setTaskToEdit(task); handleOpenModal('EDIT_TASK'); }} 
                    onCompleteTask={(task) => { setTaskToComplete(task); handleOpenModal('COMPLETE_TASK'); }}
                    onExchangeTask={handleOnExchangeTask}
                    onApproveRequest={handleApproveRequest}
                    onDenyRequest={(log) => { setExchangeToDeny(log); setActiveModal('DENY_EXCHANGE'); }}
                    taskExchangeData={taskExchangeData}
                />;
            case 'task_records':
                if (!canViewTaskRecords) return <AccessDenied requiredRole="Manager" />;
                return <TaskRecordsDashboard tasks={taskData.tasks} users={users} />;
            case 'sales':
                if (!canManageSales) return <AccessDenied requiredRole="Manager" />;
                return <SalesDashboard 
                    sales={salesData.sales} 
                    onCreateSale={() => handleOpenModal('CREATE_SALE')} 
                    onEditSale={(sale) => {
                        setSaleToEdit(sale);
                        handleOpenModal('EDIT_SALE');
                    }}
                />;
            case 'employees':
                if (!canManageEmployees) return <AccessDenied requiredRole="Manager" />;
                return <EmployeeDashboard
                    users={users}
                    tasks={taskData.tasks}
                    plantings={allPlantings}
                    harvests={allHarvests}
                    transactions={financeData.transactions}
                    onSelectEmployee={handleSelectEmployee}
                />;
            case 'hr':
                if (!canManageHumanResources) return <AccessDenied requiredRole="Owner" />;
                return <HumanResourcesDashboard 
                    tasks={taskData.tasks}
                    timeLogs={shiftData.timeLogs}
                    onAddEmployee={() => handleOpenModal('ADD_EMPLOYEE')} 
                    onEditEmployee={(employee) => {
                        setEmployeeToEdit(employee);
                        handleOpenModal('EDIT_EMPLOYEE');
                    }}
                />;
            case 'shifts':
                if (!canViewShifts) return <AccessDenied requiredRole="Any" />;
                return <ShiftManagementDashboard 
                    shifts={shiftData.shifts}
                    timeLogs={shiftData.timeLogs}
                    availability={shiftData.availability}
                    clockIn={(userId) => shiftData.clockIn(userId)}
                    clockOut={(userId) => shiftData.clockOut(userId)}
                    updateTimeLog={(id, updates, notes) => shiftData.updateTimeLog(id, updates, notes, user.id)}
                    approveTimeLogs={(ids) => shiftData.approveTimeLogs(ids, user.id)}
                    onEditTimeLog={(timeLog) => {
                        setTimeLogToEdit(timeLog);
                        handleOpenModal('EDIT_TIMELOG');
                    }}
                    onUpsertShift={(shift) => {
                        setShiftToUpsert(shift);
                        handleOpenModal('UPSERT_SHIFT');
                    }}
                    onUpdateShift={shiftData.updateShift}
                    templates={shiftData.templates}
                    onOpenTemplateManager={() => handleOpenModal('MANAGE_SHIFT_TEMPLATES')}
                    onSetAvailability={(date, availability) => {
                        setAvailabilityModalInfo({ date, availability });
                        handleOpenModal('SET_AVAILABILITY');
                    }}
                />;
            case 'team_analytics':
                if (!canViewTeamAnalytics) return <AccessDenied requiredRole="Manager" />;
                return <TeamAnalyticsDashboard 
                    users={users}
                    shifts={shiftData.shifts}
                    timeLogs={shiftData.timeLogs}
                    onUpdateShift={shiftData.updateShift}
                    onUpsertShift={(shift) => {
                        setShiftToUpsert(shift);
                        handleOpenModal('UPSERT_SHIFT');
                    }}
                />;
            case 'finance':
                if (!canViewFinance) return <AccessDenied requiredRole="Manager"/>;
                return <FinanceDashboard transactions={financeData.transactions} summary={financeData.summary} onAddTransaction={() => handleOpenModal('ADD_TRANSACTION')} onEditTransaction={(transaction) => { setTransactionToEdit(transaction); handleOpenModal('EDIT_TRANSACTION'); }} fields={farmData.fields} livestock={livestockData.livestock} equipment={equipmentManager.equipment} />;
            case 'accounting':
                 if (!canViewAccounting) return <AccessDenied requiredRole="Accountant"/>;
                 return <AccountantDashboard 
                    allTransactions={financeData.transactions} 
                    inventoryItems={inventoryData.inventoryItems} 
                    users={users} 
                    fields={farmData.fields} 
                    livestock={livestockData.livestock} 
                    onAddTransaction={() => handleOpenModal('ADD_TRANSACTION')} 
                    onCreateJournal={() => handleOpenModal('CREATE_JOURNAL')}
                    onRunPayroll={handleRunPayroll}
                    equipment={equipmentManager.equipment} 
                />;
            case 'safety':
                return <SafetyDashboard 
                    reports={safetyData.safetyReports}
                    onAddReport={() => handleOpenModal('ADD_SAFETY_REPORT')}
                    onUpdateReport={(report) => {
                        setSafetyReportToUpdate(report);
                        handleOpenModal('UPDATE_SAFETY_REPORT');
                    }}
                />;
            case 'messaging':
                return <MessagingDashboard
                    conversations={messagingData.conversations}
                    messagesByConversation={messagingData.messagesByConversation}
                    totalUnreadCount={messagingData.totalUnreadCount}
                    currentUserId={user.id}
                    users={users}
                    sendMessage={messagingData.sendMessage}
                    markConversationAsRead={messagingData.markConversationAsRead}
                    onStartNewConversation={() => handleOpenModal('NEW_CONVERSATION')}
                    onNavigateToReference={handleNavigateToReference}
                    onMentionClick={handleMentionClick}
                    conversationToSelectId={conversationToSelectId}
                    onClearConversationToSelect={() => setConversationToSelectId(null)}
                    tasks={taskData.tasks}
                    shifts={shiftData.shifts}
                    equipment={equipmentManager.equipment}
                    inventory={inventoryData.inventoryItems}
                    fields={farmData.fields}
                    livestock={livestockData.livestock}
                />;
            case 'fields':
            default:
                return <Dashboard fields={farmData.fields} tasks={taskData.tasks} plantingsByField={farmData.plantingsByField} onSelectField={handleSelectField} onAddField={() => handleOpenModal('ADD_FIELD')} />;
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <Header 
                currentView={currentView} 
                onNavigate={handleNavigate}
                notifications={notifications}
                unreadCount={unreadCount}
                unreadMessageCount={messagingData.totalUnreadCount}
                onNotificationClick={(notif) => {
                    setNotificationToView(notif);
                    setActiveModal('VIEW_NOTIFICATION');
                    markAsRead(notif.id);
                }}
                onMarkAllNotificationsAsRead={markAllAsRead}
            />
            <main className={currentView === 'messaging' ? "h-[calc(100vh-4rem)]" : "p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto"}>
                {loading && <div className="text-center text-muted-foreground">Loading data...</div>}
                {error && <div className="text-center text-destructive">{error}</div>}
                
                {!loading && !error && renderContent()}
            </main>

            {activeModal === 'ADD_FIELD' && <AddFieldModal isOpen={true} onClose={handleCloseModal} onAddField={farmData.addField} />}
            {activeModal === 'ADD_PLANTING' && selectedField && <AddPlantingModal isOpen={true} onClose={handleCloseModal} onAddPlanting={farmData.addPlanting} field={selectedField} activePlantings={farmData.plantingsByField[selectedField.id]?.filter(p => p.status === 'Active') || []} />}
            {activeModal === 'ADD_HARVEST' && selectedField && <AddHarvestModal isOpen={true} onClose={handleCloseModal} onAddHarvest={handleAddHarvest} fieldId={selectedField.id} activePlantings={farmData.plantingsByField[selectedField.id]?.filter(p => p.status === 'Active') || []} />}
            {activeModal === 'ADD_CROP_HEALTH_SNAPSHOT' && plantingForSnapshot && <AddCropHealthSnapshotModal isOpen={true} onClose={handleCloseModal} onAddSnapshot={handleAddSnapshot} planting={plantingForSnapshot} recordedById={user.id} />}
            {activeModal === 'UPDATE_SOIL_ANALYSIS' && fieldForSoilUpdate && <UpdateSoilAnalysisModal isOpen={true} onClose={handleCloseModal} onSave={farmData.addSoilAnalysis} field={fieldForSoilUpdate} />}
            {activeModal === 'ADD_TRANSACTION' && <AddTransactionModal isOpen={true} onClose={handleCloseModal} onAddTransaction={addTransaction} fields={farmData.fields} livestock={livestockData.livestock} equipment={equipmentManager.equipment} inventoryItems={inventoryData.inventoryItems} addInventoryItem={(itemData) => addInventoryItem(itemData, false)} editInventoryItem={inventoryData.editInventoryItem} addEquipment={(payload) => addEquipment({ ...payload, createTransaction: false })} />}
            {activeModal === 'EDIT_TRANSACTION' && transactionToEdit && <EditTransactionModal isOpen={true} onClose={() => { handleCloseModal(); setTransactionToEdit(null); }} onEditTransaction={editTransaction} transaction={transactionToEdit} fields={farmData.fields} livestock={livestockData.livestock} equipment={equipmentManager.equipment} />}
            {activeModal === 'ADD_TASK' && <AddTaskModal isOpen={true} onClose={handleCloseModal} onAddTask={taskData.addTask} users={users} fields={farmData.fields} livestock={livestockData.livestock} />}
            {activeModal === 'EDIT_TASK' && taskToEdit && <EditTaskModal isOpen={true} onClose={() => { handleCloseModal(); setTaskToEdit(null); }} onEditTask={taskData.editTask} task={taskToEdit} users={users} fields={farmData.fields} livestock={livestockData.livestock} />}
            {activeModal === 'COMPLETE_TASK' && taskToComplete && <CompleteTaskModal isOpen={true} onClose={() => { handleCloseModal(); setTaskToComplete(null); }} onCompleteTask={(taskId, notes, photo) => taskData.completeTask(taskId, notes, photo, user.id)} task={taskToComplete} />}
            {activeModal === 'EXCHANGE_TASK' && taskToExchange && <TaskExchangeModal isOpen={true} onClose={handleCloseModal} onRequestExchange={handleRequestExchange} task={taskToExchange} users={users} currentUser={user} taskExchangeData={taskExchangeData} />}
            {activeModal === 'DENY_EXCHANGE' && exchangeToDeny && <DenyExchangeModal isOpen={true} onClose={handleCloseModal} onSubmit={handleDenyRequest} exchangeLog={exchangeToDeny} />}
            {activeModal === 'VIEW_NOTIFICATION' && notificationToView && <NotificationDetailModal isOpen={true} onClose={handleCloseModal} notification={notificationToView} usersById={users.reduce((acc, u) => ({...acc, [u.id]: u}), {})} onNavigate={handleNavigateFromNotification} />}
            {activeModal === 'ADD_LIVESTOCK' && <AddLivestockModal isOpen={true} onClose={handleCloseModal} onAddLivestock={livestockData.addLivestock} />}
            {activeModal === 'ADD_FEEDING_SCHEDULE' && <AddFeedingScheduleModal isOpen={true} onClose={handleCloseModal} onAddFeedingSchedule={addFeedingSchedule} livestock={livestockData.livestock} users={users} defaultLivestockId={selectedLivestock?.id} />}
            {activeModal === 'EDIT_LIVESTOCK' && livestockToEdit && <EditLivestockModal isOpen={true} onClose={() => { handleCloseModal(); setLivestockToEdit(null); }} onEditLivestock={livestockData.updateLivestock} livestock={livestockToEdit} />}
            {activeModal === 'ADD_HEALTH_EVENT' && selectedLivestock && <AddHealthEventModal isOpen={true} onClose={handleCloseModal} onAddHealthEvent={handleAddHealthEvent} livestockId={selectedLivestock.id} />}
            {activeModal === 'EDIT_FEEDING_SCHEDULE' && scheduleToEdit && <EditFeedingScheduleModal isOpen={true} onClose={() => { handleCloseModal(); setScheduleToEdit(null); }} onEditFeedingSchedule={updateFeedingSchedule} schedule={scheduleToEdit} users={users} />}
            {activeModal === 'ADD_WEIGHT_LOG' && livestockForLog && <AddWeightLogModal isOpen={true} onClose={handleCloseModal} onAddLog={handleAddWeightLog} livestock={livestockForLog} />}
            {activeModal === 'ADD_PRODUCTION_LOG' && livestockForLog && <AddProductionLogModal isOpen={true} onClose={handleCloseModal} onAddLog={handleAddProductionLog} livestock={livestockForLog} />}
            {activeModal === 'ADD_FEED_LOG' && livestockForLog && <AddFeedLogModal isOpen={true} onClose={handleCloseModal} onAddLog={handleAddFeedLog} livestock={livestockForLog} />}
            {activeModal === 'ADD_TREATMENT_LOG' && livestockForLog && <AddTreatmentLogModal isOpen={true} onClose={handleCloseModal} onAddLog={handleAddTreatmentLog} livestock={livestockForLog} users={users} />}
            {activeModal === 'ANALYZE_LIVESTOCK_HEALTH' && livestockForAnalysis && <LivestockHealthAnalysisModal isOpen={true} onClose={handleCloseModal} livestock={livestockForAnalysis} />}
            {activeModal === 'ADD_INVENTORY' && <AddInventoryModal isOpen={true} onClose={handleCloseModal} onAddInventoryItem={addInventoryItem} />}
            {activeModal === 'EDIT_INVENTORY' && inventoryToEdit && <EditInventoryModal isOpen={true} onClose={() => { handleCloseModal(); setInventoryToEdit(null); }} onEditInventoryItem={inventoryData.editInventoryItem} item={inventoryToEdit} />}
            {activeModal === 'ADD_EQUIPMENT' && <AddEquipmentModal isOpen={true} onClose={handleCloseModal} onAddEquipment={addEquipment} />}
            {activeModal === 'EDIT_EQUIPMENT' && equipmentToEdit && <EditEquipmentModal isOpen={true} onClose={() => { handleCloseModal(); setEquipmentToEdit(null); }} onEditEquipment={equipmentManager.editEquipment} equipment={equipmentToEdit} />}
            {activeModal === 'ADD_MAINTENANCE_LOG' && equipmentForMaintenance && <AddMaintenanceLogModal isOpen={true} onClose={() => { handleCloseModal(); setEquipmentForMaintenance(null); }} onAddLog={addMaintenanceLog} equipment={equipmentForMaintenance} />}
            {activeModal === 'CREATE_SALE' && <CreateSaleModal isOpen={true} onClose={handleCloseModal} onAddSale={handleAddSale} inventoryItems={inventoryData.inventoryItems} livestock={livestockData.livestock} />}
            {activeModal === 'EDIT_SALE' && saleToEdit && <EditSaleModal isOpen={true} onClose={() => { handleCloseModal(); setSaleToEdit(null); }} onEditSale={handleUpdateSale} sale={saleToEdit} />}
            {activeModal === 'CREATE_JOURNAL' && <CreateJournalModal isOpen={true} onClose={handleCloseModal} onAddJournal={addJournalEntry} />}
            {activeModal === 'ADD_EMPLOYEE' && <AddEmployeeModal isOpen={true} onClose={handleCloseModal} onAddEmployee={addUser} />}
            {activeModal === 'EDIT_EMPLOYEE' && employeeToEdit && <EditEmployeeModal isOpen={true} onClose={() => { handleCloseModal(); setEmployeeToEdit(null); }} onEditEmployee={editUser} employee={employeeToEdit} />}
            {activeModal === 'LOG_WAGE_CHANGE' && employeeForWageChange && (
                <LogWageChangeModal 
                    isOpen={true} 
                    onClose={() => { handleCloseModal(); setEmployeeForWageChange(null); }} 
                    employee={employeeForWageChange}
                    onSave={(newRate) => {
                        editUser(employeeForWageChange.id, { wageRate: newRate });
                    }}
                />
            )}
            {activeModal === 'UPSERT_SHIFT' && shiftToUpsert && (
                <ShiftUpsertModal
                    isOpen={true}
                    onClose={() => { handleCloseModal(); setShiftToUpsert(null); }}
                    shift={shiftToUpsert}
                    onSave={shiftData.addShift}
                    onBulkSave={shiftData.addShifts}
                    onUpdate={shiftData.updateShift}
                    onDelete={shiftData.deleteShift}
                    users={users}
                    templates={shiftData.templates}
                    onAddTemplate={shiftData.addTemplate}
                />
            )}
            {activeModal === 'EDIT_TIMELOG' && timeLogToEdit && (
                <EditTimeLogModal
                    isOpen={true}
                    onClose={() => { handleCloseModal(); setTimeLogToEdit(null); }}
                    timeLog={timeLogToEdit}
                    onSave={(id, updates, notes) => shiftData.updateTimeLog(id, updates, notes, user.id)}
                />
            )}
            {activeModal === 'MANAGE_SHIFT_TEMPLATES' && (
                <ManageShiftTemplatesModal
                    isOpen={true}
                    onClose={handleCloseModal}
                    templates={shiftData.templates}
                    onSave={shiftData.addTemplate}
                    onUpdate={shiftData.updateTemplate}
                    onDelete={shiftData.deleteTemplate}
                />
            )}
             {activeModal === 'SET_AVAILABILITY' && availabilityModalInfo && (
                <SetAvailabilityModal
                    isOpen={true}
                    onClose={handleCloseModal}
                    date={availabilityModalInfo.date}
                    currentAvailability={availabilityModalInfo.availability}
                    onSave={(status) => shiftData.upsertAvailability({ userId: user.id, date: availabilityModalInfo.date, status })}
                    onDelete={(id) => shiftData.deleteAvailability(id)}
                />
            )}
            {activeModal === 'START_EQUIPMENT_SESSION' && equipmentForSession && (
                <StartSessionModal 
                    isOpen={true}
                    onClose={handleCloseModal}
                    equipment={equipmentForSession}
                    onStartSession={handleStartSession}
                />
            )}
            {activeModal === 'END_EQUIPMENT_SESSION' && usageLogForSession && (
                <EndSessionModal
                    isOpen={true}
                    onClose={handleCloseModal}
                    usageLog={usageLogForSession}
                    onEndSession={handleEndSession}
                />
            )}
            {activeModal === 'WITHDRAW_INVENTORY' && (
                <WithdrawInventoryModal
                    isOpen={true}
                    onClose={handleCloseModal}
                    onWithdraw={handleWithdrawInventory}
                    inventoryItems={inventoryData.inventoryItems}
                />
            )}
            {activeModal === 'ADD_SAFETY_REPORT' && <AddSafetyReportModal isOpen={true} onClose={handleCloseModal} onAddReport={handleAddSafetyReport} />}
            {activeModal === 'UPDATE_SAFETY_REPORT' && safetyReportToUpdate && <UpdateSafetyReportModal isOpen={true} onClose={handleCloseModal} report={safetyReportToUpdate} onUpdate={handleUpdateSafetyReportStatus} />}
            {criticalSafetyAlert && <CriticalAlertModal isOpen={true} onClose={() => setCriticalSafetyAlert(null)} report={criticalSafetyAlert} />}
            {activeModal === 'NEW_CONVERSATION' && (
                <NewConversationModal
                    isOpen={true}
                    onClose={handleCloseModal}
                    users={users}
                    currentUserId={user.id}
                    onStartConversation={handleStartNewConversation}
                />
            )}


        </div>
    );
};

const App: React.FC = () => (
    <AuthProvider>
        <AppContent />
    </AuthProvider>
);

export default App;