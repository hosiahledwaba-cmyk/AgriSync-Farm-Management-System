import { GoogleGenAI } from "@google/genai";

export enum Role {
    Owner = 'Owner',
    Manager = 'Manager',
    Worker = 'Worker',
    Accountant = 'Accountant',
}

export interface WageChange {
    date: string; // ISO string
    oldRate: number;
    newRate: number;
    changedById: number;
}

export interface User {
    id: number;
    name: string;
    role: Role;
    wageRate?: number; // Hourly wage rate in ZAR
    wageHistory?: WageChange[];
    expectedHours?: number; // Expected weekly hours
}

export interface SoilAnalysis {
    date: string; // ISO String
    ph: number;
    nitrogen: 'Optimal' | 'Slightly Low' | 'Low' | 'High';
    phosphorus: 'Optimal' | 'Slightly Low' | 'Low' | 'High';
    potassium: 'Optimal' | 'Slightly Low' | 'Low' | 'High';
}


export interface Field {
    id: number;
    farm_id: number;
    name: string;
    area: number; // in hectares
    soil_type: string;
    latitude: number;
    longitude: number;
    notes?: string;
    soilHistory: SoilAnalysis[];
}

export interface Crop {
    id: number;
    name: string;
    variety: string;
}

export interface Planting {
    id: number;
    field_id: number;
    crop_id: number;
    crop_name: string; // denormalized for easier display
    variety: string;
    date_planted: string; // ISO string
    seeds_qty: number;
    notes?: string;
    operator_id: number;
    area_planted: number; // in hectares
    watering_schedule: 'Daily' | 'Weekly' | 'Bi-Weekly' | 'None';
    status: 'Active' | 'Harvested';
}

export interface Harvest {
    id: number;
    planting_id: number; // Link back to the specific planting
    field_id: number;
    crop_id: number;
    crop_name: string; // denormalized for easier display
    date: string; // ISO string
    weight_kg: number;
    moisture_pct: number;
    notes?: string;
    operator_id: number;
}

export interface InventoryItem {
    id: number;
    farm_id: number;
    name: string;
    category: string;
    unit: string;
    stock_qty: number;
    reorder_level: number;
    unit_cost?: number; // For valuation
    // New fields for harvest traceability
    isHarvestedGood?: boolean;
    sourceHarvestId?: number;
}

export interface InventoryUsageLog {
    id: string;
    inventoryItemId: number;
    inventoryItemName: string; // denormalized
    userId: number;
    date: string; // ISO string
    quantity: number;
    purpose: string;
}


export interface CropSuggestion {
    cropName: string;
    variety: string;
    seedingRate: string;
    reasoning: string;
    plantingWindow: string;
    marketOutlook: string;
    estimatedYield: string;
}

export enum TransactionType {
    Income = 'income',
    Expense = 'expense',
}

export enum TransactionCategory {
    // Income
    CropLivestockSales = 'Crop/Livestock Sales',
    FieldRental = 'Field Rental',
    EquipmentRental = 'Equipment Rental',
    EggSales = 'Egg Sales',
    MilkSales = 'Milk Sales',
    CompostSales = 'Compost Sales',
    ManureSales = 'Manure Sales',
    OtherIncome = 'Other Income',
    // Expenses
    Supplies = 'Seeds & Supplies',
    Labor = 'Labor Costs',
    Repairs = 'Equipment Repairs',
    Utilities = 'Utilities',
    AssetPurchase = 'Asset Purchase',
    Other = 'Other',
    // Journal & Balance Sheet Accounts
    Cash = 'Cash',
    AccountsPayable = 'Accounts Payable',
    OwnersEquity = "Owner's Equity",
}

export interface FinanceTransaction {
    id: string;
    type: TransactionType;
    description: string;
    amount: number;
    category: TransactionCategory;
    date: string; // ISO string
    // New fields for linking transactions to farm operations
    relatedEntityType?: 'field' | 'livestock' | 'sale' | 'equipment'; // Extendable to 'task', 'animal', etc.
    relatedEntityId?: number | string;
    relatedEntityName?: string;
    // Audit trail fields
    createdByUserId?: number;
    createdAt?: string; // ISO string
    lastModifiedByUserId?: number;
    lastModifiedAt?: string; // ISO string
    journalId?: string;
}

export enum TaskStatus {
    Pending = 'Pending',
    InProgress = 'In Progress',
    Blocked = 'Blocked',
    Completed = 'Completed',
}

export enum TaskRecurrence {
    None = 'None',
    Daily = 'Daily',
    Weekly = 'Weekly',
    Monthly = 'Monthly',
}

export enum TaskPriority {
    Urgent = 'Urgent',
    High = 'High',
    Medium = 'Medium',
    Low = 'Low',
}

export type TaskCategory = 'General' | 'Feeding' | 'Treatment' | 'Health Check' | 'Safety' | 'Notification';


export interface Task {
    id: string;
    title: string;
    description?: string;
    assigneeId: number;
    relatedFieldId?: number;
    relatedLivestockId?: string;
    dueDate: string; // ISO string
    priority: string;
    status: TaskStatus;
    recurrence: TaskRecurrence;
    completionNotes?: string;
    completionPhoto?: string; // base64 string
    completedAt?: string; // ISO string
    completedByUserId?: number;
    createdAt: string; // ISO string
    isAutomated?: boolean; // To identify feeding tasks
    taskCategory?: TaskCategory;
    startedAt?: string; // ISO string
    durationMinutes?: number;
    originalAssigneeId?: number;
    secondaryAssigneeIds?: number[];
    pendingExchangeId?: string; // ID of the pending TaskExchangeLog
    relatedExchangeId?: string; // ID of the TaskExchangeLog this notification task is about
}

// --- Task Exchange Types ---
export interface TaskExchangeLog {
    id: string;
    taskId: string;
    exchangedByUserId: number;
    exchangedToUserId: number;
    date: string; // ISO string YYYY-MM-DD
    type: 'handover' | 'assist_request';
    status: 'pending' | 'approved' | 'denied';
    denialReason?: string;
}


// --- Livestock Types ---
export enum LivestockTrackingType {
    Individual = 'Individual',
    Group = 'Group',
}

export enum LivestockStatus {
    Active = 'Active',
    Sold = 'Sold',
    Deceased = 'Deceased',
}

export enum LivestockHealthEventType {
    Vaccination = 'Vaccination',
    Illness = 'Illness',
    Treatment = 'Treatment',
    Checkup = 'Check-up',
}

export interface LivestockHealthEvent {
    date: string; // ISO string
    eventType: LivestockHealthEventType;
    notes: string;
}

export interface WeightLog {
    date: string;
    weight: number; // in kg
}

export interface ProductionLog {
    date: string;
    type: 'Milk' | 'Eggs' | 'Wool';
    quantity: number;
    unit: 'liters' | 'units' | 'kg';
}

export interface FeedLog {
    date: string;
    feedType: string;
    quantity: number;
    unit: 'kg' | 'bales' | 'scoops';
}

export interface TreatmentLog {
    id: string;
    date: string;
    treatmentType: 'Vaccination' | 'Deworming' | 'Antibiotic' | 'Injury Care' | 'Check-up';
    description: string;
    administeredById: number;
    medication?: string;
    withdrawalPeriod?: string; // e.g., "7 days for milk"
}


export interface Livestock {
    id: string; // use string for easier combination of animal/group
    farm_id: number;
    species: string; // e.g., 'Cow', 'Chicken'
    trackingType: LivestockTrackingType;
    
    // For Individual
    tagId?: string;
    name?: string;
    breed?: string;
    birthDate?: string; // ISO string
    status?: LivestockStatus;
    
    // For Group
    groupName?: string;
    count?: number;
    acquisitionDate?: string; // ISO string

    // Advanced Tracking
    healthHistory: LivestockHealthEvent[];
    weightHistory?: WeightLog[];
    productionHistory?: ProductionLog[];
    feedHistory?: FeedLog[];
    treatmentHistory?: TreatmentLog[];
    iotData?: {
        temperature?: number; // Celsius
        activityLevel?: 'Low' | 'Normal' | 'High';
        location?: { lat: number; lon: number };
        lastUpdate: string; // ISO string
    };
}

export interface LivestockHealthAnalysis {
    healthScore: number;
    summary: string;
    potentialIssues: string[];
    recommendations: string[];
}


export interface FeedingSchedule {
    id: string;
    livestockId: string; // ID of the individual animal or group
    livestockName: string; // Denormalized name for display
    feedType: string;
    quantity: number;
    unit: 'kg' | 'bales' | 'scoops';
    recurrence: TaskRecurrence.Daily; // For now, only daily automated tasks
    assigneeId: number;
}


// --- Equipment Types for Manager Dashboard ---
export enum EquipmentStatus {
    Operational = 'Operational',
    InUse = 'In Use',
    InMaintenance = 'In Maintenance',
    BrokenDown = 'Broken Down',
}

export interface Equipment {
    id: string;
    name: string;
    type: 'Tractor' | 'Combine' | 'Planter' | 'Sprayer' | 'Truck';
    status: EquipmentStatus;
    currentOperatorId?: number;
    totalHours: number;
    nextMaintenanceHours: number;
    fuelLevel: number; // percentage
    currentUsageLogId?: string;
}

export interface MaintenanceLog {
    id: string;
    equipmentId: string;
    date: string; // ISO
    description: string;
    cost: number;
    mechanic: string;
}

export interface EquipmentUsageLog {
    id: string;
    equipmentId: string;
    userId: number;
    startTime: string; // ISO string
    endTime: string | null; // ISO string, null if ongoing
    startHours: number;
    endHours: number | null; // null if ongoing
    notes?: string;
}


// --- Field Lifecycle Types ---
export type HealthScore = 'Excellent' | 'Good' | 'Fair' | 'Poor';

export interface CropHealthSnapshot {
    id: string;
    field_id: number;
    planting_id: number;
    date: string; // ISO
    score: HealthScore;
    notes: string;
    photo?: string; // base64
    recorded_by_id: number;
}

export type WateringStatus = 'Scheduled' | 'Completed' | 'Skipped';

export interface WateringEvent {
    id: string;
    field_id: number;
    planting_id: number;
    scheduled_date: string; // ISO
    status: WateringStatus;
    completed_date?: string; // ISO
    notes?: string;
}

// --- Sales Types ---
export type SaleItemType = 'crop' | 'livestock';

export interface SaleItem {
    id: string; // unique within the sale
    type: SaleItemType;
    inventoryItemId?: number;
    livestockId?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export enum PaymentStatus {
    Paid = 'Paid',
    Unpaid = 'Unpaid',
    PartiallyPaid = 'Partially Paid',
}
export enum DeliveryStatus {
    Pending = 'Pending',
    Shipped = 'Shipped',
    Delivered = 'Delivered',
    Cancelled = 'Cancelled',
}

export interface Sale {
    id: string;
    saleDate: string; // ISO
    buyerName: string;
    items: SaleItem[];
    subtotal: number;
    tax: number; // tax amount
    discount: number; // discount amount
    total: number;
    paymentStatus: PaymentStatus;
    deliveryStatus: DeliveryStatus;
    notes?: string;
    createdById: number;
    createdAt: string; // ISO
}


// --- Weather Types ---
export type WeatherCondition = 'Sunny' | 'Partly Cloudy' | 'Cloudy' | 'Rain';

export interface CurrentWeather {
    temperature: number; // Celsius
    condition: WeatherCondition;
    windSpeed: number; // km/h
    humidity: number; // percentage
}

export interface ForecastDay {
    date: string; // ISO string
    maxTemp: number; // Celsius
    minTemp: number; // Celsius
    condition: WeatherCondition;
}

export interface WeatherData {
    current: CurrentWeather;
    forecast: ForecastDay[];
}

export interface HistoricalDay {
    date: string; // ISO string
    avgTemp: number; // Celsius
    precipitation: number; // mm
}

// --- Notification Types ---
export type NotificationType = 'new_assignment' | 'due_soon' | 'overdue' | 'task_notification';

export interface Notification {
    id: string; // e.g., 'overdue-task1'
    type: NotificationType;
    message: string;
    taskId: string;
    taskTitle: string;
    createdAt: Date;
    isRead: boolean;
    task?: Task;
    exchangeLog?: TaskExchangeLog;
}

// --- Shift Management Types ---

// A scheduled shift slot assigned by a manager
export interface Shift {
    id: string;
    userId: number;
    start: string; // ISO string
    end: string; // ISO string
    notes?: string;
}

// A template for common shift patterns
export interface ShiftTemplate {
    id: string;
    name: string;
    startTime: string; // "HH:MM"
    endTime: string; // "HH:MM"
    notes?: string;
}


// A record of an employee clocking in and out
export enum TimeLogStatus {
    Ongoing = 'Ongoing',
    Completed = 'Completed', // Pending approval
    Approved = 'Approved',
}

export interface TimeLog {
    id: string;
    userId: number;
    shiftId?: string; // Link to the scheduled shift
    clockIn: string; // ISO string
    clockOut: string | null;
    status: TimeLogStatus;
    notes?: string; // For manager edits
    editedById?: number;
}

// Employee availability for a specific day
export enum AvailabilityStatus {
    Available = 'Available',
    Unavailable = 'Unavailable',
    Preferred = 'Preferred',
}

export interface EmployeeAvailability {
    id: string;
    userId: number;
    date: string; // YYYY-MM-DD
    status: AvailabilityStatus;
}

// --- Safety Types ---
export enum SafetyReportType {
    Incident = 'Incident', // An event that resulted in injury or damage.
    Hazard = 'Hazard', // A potential source of harm.
    NearMiss = 'Near-Miss', // An incident that could have caused harm but didn't.
}

export enum SafetySeverity {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
    Critical = 'Critical',
}

export enum SafetyStatus {
    Open = 'Open',
    InReview = 'In Review',
    Resolved = 'Resolved',
}

export interface SafetyReport {
    id: string;
    type: SafetyReportType;
    location: string;
    dateTime: string; // ISO
    description: string;
    severity: SafetySeverity;
    photo?: string; // base64
    reportedById: number;
    status: SafetyStatus;
    actionsTaken?: string;
    resolvedById?: number;
    resolvedAt?: string; // ISO
}

// --- AI-Powered Insight Types ---

export interface FieldInsights {
    fertilizer: {
        recommendation: string;
        reasoning: string;
    };
    pesticide: {
        recommendation: string;
        reasoning: string;
    };
    irrigation: {
        recommendation: string;
        reasoning: string;
    };
    harvest: {
        prediction: string;
        reasoning: string;
    };
    expectedYield: number; // in tons/hectare
}

export interface FieldAlert {
    id: string;
    type: 'info' | 'warning' | 'critical';
    message: string;
}

// --- Messaging Types ---
export interface MessageReference {
    type: 'task' | 'shift' | 'equipment' | 'inventory' | 'field' | 'livestock';
    id: string | number;
    name: string;
    details?: string;
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: number;
    text: string;
    timestamp: string; // ISO string
    readBy: number[];
    reference?: MessageReference;
}

export interface Conversation {
    id: string;
    participantIds: number[];
    lastMessage?: {
        text: string;
        timestamp: string;
        senderId: number;
    };
    // Unread count for each user in the conversation
    unreadCounts: Record<number, number>; 
}