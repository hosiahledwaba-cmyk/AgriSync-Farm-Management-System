import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LeafIcon, UserIcon, MapPinIcon, DollarSignIcon, ClipboardListIcon, BarChartIcon, CowIcon, MenuIcon, XIcon, LayoutDashboardIcon, TractorIcon, ArchiveIcon, BellIcon, UsersIcon, ClockIcon, ShieldAlertIcon, MessageSquareIcon, HistoryIcon, ChevronDownIcon } from './ui/Icon';
import ThemeToggle from './ui/ThemeToggle';
import Dropdown from './ui/Dropdown';
import { Role, Notification } from '../types';
import NotificationDropdown from './ui/NotificationDropdown';

type View = 'fields' | 'livestock' | 'tasks' | 'task_records' | 'finance' | 'accounting' | 'owner' | 'manager' | 'equipment' | 'inventory' | 'sales' | 'employees' | 'hr' | 'shifts' | 'team_analytics' | 'equipment_tracking' | 'safety' | 'messaging';

interface HeaderProps {
    currentView: View;
    onNavigate: (view: View) => void;
    notifications: Notification[];
    unreadCount: number;
    unreadMessageCount: number;
    onNotificationClick: (notification: Notification) => void;
    onMarkAllNotificationsAsRead: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, notifications, unreadCount, unreadMessageCount, onNotificationClick, onMarkAllNotificationsAsRead }) => {
    const { user, users, setUser } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [openMobileSection, setOpenMobileSection] = useState<string | null>(null);

    const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedUserId = parseInt(event.target.value, 10);
        const selectedUser = users.find(u => u.id === selectedUserId);
        if (selectedUser) {
            setUser(selectedUser);
        }
        setIsMenuOpen(false); // Close menu on user change
    };

    const handleNavClick = (view: View) => {
        onNavigate(view);
        setIsMenuOpen(false); // Close menu on navigation
    };
    
    // --- RBAC ---
    const canViewFinance = user.role === Role.Owner || user.role === Role.Manager || user.role === Role.Accountant;
    const canViewAccounting = user.role === Role.Owner || user.role === Role.Accountant;
    const canViewOwnerDashboard = user.role === Role.Owner;
    const canViewManagerDashboard = user.role === Role.Owner || user.role === Role.Manager;
    const canManageInventory = user.role === Role.Owner || user.role === Role.Manager;
    const canViewInventory = canManageInventory || user.role === Role.Worker;
    const canManageEquipment = user.role === Role.Owner || user.role === Role.Manager;
    const canViewEquipment = canManageEquipment || user.role === Role.Worker;
    const canManageSales = user.role === Role.Owner || user.role === Role.Manager || user.role === Role.Accountant;
    const canManageEmployees = user.role === Role.Owner || user.role === Role.Manager;
    const canManageHumanResources = user.role === Role.Owner;
    const canViewShifts = true; // All roles can now view shifts
    const canViewTeamAnalytics = user.role === Role.Owner || user.role === Role.Manager;
    const canViewSafety = true;
    const canViewTaskRecords = user.role === Role.Owner || user.role === Role.Manager;


    const isDashboardsActive = ['owner', 'manager'].includes(currentView);
    const isOperationsActive = ['fields', 'livestock', 'inventory', 'equipment', 'equipment_tracking', 'safety'].includes(currentView);
    const isTeamActive = ['employees', 'tasks', 'task_records', 'hr', 'shifts', 'team_analytics', 'messaging'].includes(currentView);
    const isFinancialsActive = ['sales', 'finance', 'accounting'].includes(currentView);

    // --- Styling ---
    const mobileNavButtonClasses = (view: View) => 
        `flex items-center w-full text-left px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            currentView === view 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        }`;

    const dropdownItemClasses = (view: View) => 
        `flex items-center w-full text-left px-4 py-2 text-sm transition-colors rounded-md ${
            currentView === view 
                ? 'bg-accent text-accent-foreground font-semibold' 
                : 'text-foreground hover:bg-accent'
        }`;

    // --- Navigation Components ---
    const DesktopNav = () => (
        <>
            {(canViewOwnerDashboard || canViewManagerDashboard) && (
                <Dropdown trigger="Dashboards" isActive={isDashboardsActive}>
                    {canViewOwnerDashboard && (
                        <button onClick={() => handleNavClick('owner')} className={dropdownItemClasses('owner')}>
                            <LayoutDashboardIcon className="h-5 w-5 mr-2" />
                            Owner's Hub
                        </button>
                    )}
                    {canViewManagerDashboard && (
                        <button onClick={() => handleNavClick('manager')} className={dropdownItemClasses('manager')}>
                            <TractorIcon className="h-5 w-5 mr-2" />
                            Manager's Dash
                        </button>
                    )}
                </Dropdown>
            )}
            <Dropdown trigger="Operations" isActive={isOperationsActive}>
                <button onClick={() => handleNavClick('fields')} className={dropdownItemClasses('fields')}>
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    Fields
                </button>
                <button onClick={() => handleNavClick('livestock')} className={dropdownItemClasses('livestock')}>
                    <CowIcon className="h-5 w-5 mr-2" />
                    Livestock
                </button>
                {canViewInventory && (
                    <button onClick={() => handleNavClick('inventory')} className={dropdownItemClasses('inventory')}>
                        <ArchiveIcon className="h-5 w-5 mr-2" />
                        Inventory
                    </button>
                )}
                {canViewEquipment && (
                    <button onClick={() => handleNavClick('equipment')} className={dropdownItemClasses('equipment')}>
                        <TractorIcon className="h-5 w-5 mr-2" />
                        Equipment
                    </button>
                )}
                {canManageEquipment && (
                    <button onClick={() => handleNavClick('equipment_tracking')} className={dropdownItemClasses('equipment_tracking')}>
                        <ClockIcon className="h-5 w-5 mr-2" />
                        Usage Tracking
                    </button>
                )}
                {canViewSafety && (
                     <button onClick={() => handleNavClick('safety')} className={dropdownItemClasses('safety')}>
                        <ShieldAlertIcon className="h-5 w-5 mr-2" />
                        Health & Safety
                    </button>
                )}
            </Dropdown>
            
            <Dropdown trigger="Team" isActive={isTeamActive}>
                 {canManageEmployees && (
                    <button onClick={() => handleNavClick('employees')} className={dropdownItemClasses('employees')}>
                        <UsersIcon className="h-5 w-5 mr-2" />
                        Team Performance
                    </button>
                )}
                {canViewTeamAnalytics && (
                     <button onClick={() => handleNavClick('team_analytics')} className={dropdownItemClasses('team_analytics')}>
                        <BarChartIcon className="h-5 w-5 mr-2" />
                        Team Analytics
                    </button>
                )}
                {canManageHumanResources && (
                    <button onClick={() => handleNavClick('hr')} className={dropdownItemClasses('hr')}>
                        <UsersIcon className="h-5 w-5 mr-2" />
                        HR Management
                    </button>
                )}
                {canViewShifts && (
                    <button onClick={() => handleNavClick('shifts')} className={dropdownItemClasses('shifts')}>
                        <ClockIcon className="h-5 w-5 mr-2" />
                        Shift Management
                    </button>
                )}
                <button onClick={() => handleNavClick('tasks')} className={dropdownItemClasses('tasks')}>
                    <ClipboardListIcon className="h-5 w-5 mr-2" />
                    Tasks
                </button>
                {canViewTaskRecords && (
                    <button onClick={() => handleNavClick('task_records')} className={dropdownItemClasses('task_records')}>
                        <HistoryIcon className="h-5 w-5 mr-2" />
                        Task Records
                    </button>
                )}
                <button onClick={() => handleNavClick('messaging')} className={dropdownItemClasses('messaging')}>
                    <MessageSquareIcon className="h-5 w-5 mr-2" />
                    Messages
                </button>
            </Dropdown>

            {(canManageSales || canViewFinance || canViewAccounting) && (
                 <Dropdown trigger="Financials" isActive={isFinancialsActive}>
                    {canManageSales && (
                        <button onClick={() => handleNavClick('sales')} className={dropdownItemClasses('sales')}>
                            <DollarSignIcon className="h-5 w-5 mr-2" />
                            Sales
                        </button>
                    )}
                    {canViewFinance && (
                        <button onClick={() => handleNavClick('finance')} className={dropdownItemClasses('finance')}>
                            <DollarSignIcon className="h-5 w-5 mr-2" />
                            Finance
                        </button>
                    )}
                    {canViewAccounting && (
                        <button onClick={() => handleNavClick('accounting')} className={dropdownItemClasses('accounting')}>
                            <BarChartIcon className="h-5 w-5 mr-2" />
                            Accounting
                        </button>
                    )}
                </Dropdown>
            )}
        </>
    );

    const AccordionSection: React.FC<{
        title: string;
        sectionKey: string;
        openSection: string | null;
        setOpenSection: (key: string | null) => void;
        children: React.ReactNode;
    }> = ({ title, sectionKey, openSection, setOpenSection, children }) => {
        const isOpen = openSection === sectionKey;
        return (
            <div>
                <button 
                    onClick={() => setOpenSection(isOpen ? null : sectionKey)}
                    className="flex items-center justify-between w-full text-left px-2 py-2 text-md font-semibold rounded-md transition-colors text-foreground hover:bg-accent"
                >
                    {title}
                    <ChevronDownIcon className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                    <div className="pl-4 py-2 space-y-1 border-l-2 border-border ml-2">
                        {children}
                    </div>
                )}
            </div>
        );
    };

    const MobileNav = () => (
        <>
            {(canViewOwnerDashboard || canViewManagerDashboard) && (
                <AccordionSection title="Dashboards" sectionKey="dashboards" openSection={openMobileSection} setOpenSection={setOpenMobileSection}>
                    {canViewOwnerDashboard && (
                        <button onClick={() => handleNavClick('owner')} className={mobileNavButtonClasses('owner')}>
                            <LayoutDashboardIcon className="h-5 w-5 mr-2" /> Owner's Hub
                        </button>
                    )}
                    {canViewManagerDashboard && (
                        <button onClick={() => handleNavClick('manager')} className={mobileNavButtonClasses('manager')}>
                            <TractorIcon className="h-5 w-5 mr-2" /> Manager's Dash
                        </button>
                    )}
                </AccordionSection>
            )}
            
            <AccordionSection title="Operations" sectionKey="operations" openSection={openMobileSection} setOpenSection={setOpenMobileSection}>
                <button onClick={() => handleNavClick('fields')} className={mobileNavButtonClasses('fields')}>
                    <MapPinIcon className="h-5 w-5 mr-2" /> Fields
                </button>
                <button onClick={() => handleNavClick('livestock')} className={mobileNavButtonClasses('livestock')}>
                    <CowIcon className="h-5 w-5 mr-2" /> Livestock
                </button>
                {canViewInventory && (
                    <button onClick={() => handleNavClick('inventory')} className={mobileNavButtonClasses('inventory')}>
                        <ArchiveIcon className="h-5 w-5 mr-2" /> Inventory
                    </button>
                )}
                {canViewEquipment && (
                    <button onClick={() => handleNavClick('equipment')} className={mobileNavButtonClasses('equipment')}>
                        <TractorIcon className="h-5 w-5 mr-2" /> Equipment
                    </button>
                )}
                {canManageEquipment && (
                    <button onClick={() => handleNavClick('equipment_tracking')} className={mobileNavButtonClasses('equipment_tracking')}>
                        <ClockIcon className="h-5 w-5 mr-2" /> Usage Tracking
                    </button>
                )}
                {canViewSafety && (
                    <button onClick={() => handleNavClick('safety')} className={mobileNavButtonClasses('safety')}>
                        <ShieldAlertIcon className="h-5 w-5 mr-2" /> Health & Safety
                    </button>
                )}
            </AccordionSection>

            <AccordionSection title="Team" sectionKey="team" openSection={openMobileSection} setOpenSection={setOpenMobileSection}>
                {canManageEmployees && (
                    <button onClick={() => handleNavClick('employees')} className={mobileNavButtonClasses('employees')}>
                        <UsersIcon className="h-5 w-5 mr-2" /> Team Performance
                    </button>
                )}
                {canViewTeamAnalytics && (
                    <button onClick={() => handleNavClick('team_analytics')} className={mobileNavButtonClasses('team_analytics')}>
                        <BarChartIcon className="h-5 w-5 mr-2" /> Team Analytics
                    </button>
                )}
                {canManageHumanResources && (
                    <button onClick={() => handleNavClick('hr')} className={mobileNavButtonClasses('hr')}>
                        <UsersIcon className="h-5 w-5 mr-2" /> HR Management
                    </button>
                )}
                {canViewShifts && (
                    <button onClick={() => handleNavClick('shifts')} className={mobileNavButtonClasses('shifts')}>
                        <ClockIcon className="h-5 w-5 mr-2" /> Shift Management
                    </button>
                )}
                <button onClick={() => handleNavClick('tasks')} className={mobileNavButtonClasses('tasks')}>
                    <ClipboardListIcon className="h-5 w-5 mr-2" /> Tasks
                </button>
                {canViewTaskRecords && (
                    <button onClick={() => handleNavClick('task_records')} className={mobileNavButtonClasses('task_records')}>
                        <HistoryIcon className="h-5 w-5 mr-2" /> Task Records
                    </button>
                )}
                <button onClick={() => handleNavClick('messaging')} className={mobileNavButtonClasses('messaging')}>
                    <MessageSquareIcon className="h-5 w-5 mr-2" /> Messages
                </button>
            </AccordionSection>

            {(canManageSales || canViewFinance || canViewAccounting) && (
                <AccordionSection title="Financials" sectionKey="financials" openSection={openMobileSection} setOpenSection={setOpenMobileSection}>
                    {canManageSales && (
                        <button onClick={() => handleNavClick('sales')} className={mobileNavButtonClasses('sales')}>
                            <DollarSignIcon className="h-5 w-5 mr-2" /> Sales
                        </button>
                    )}
                    {canViewFinance && (
                        <button onClick={() => handleNavClick('finance')} className={mobileNavButtonClasses('finance')}>
                            <DollarSignIcon className="h-5 w-5 mr-2" /> Finance
                        </button>
                    )}
                    {canViewAccounting && (
                        <button onClick={() => handleNavClick('accounting')} className={mobileNavButtonClasses('accounting')}>
                            <BarChartIcon className="h-5 w-5 mr-2" /> Accounting
                        </button>
                    )}
                </AccordionSection>
            )}
        </>
    );

    return (
        <header className="bg-card/80 backdrop-blur-sm shadow-sm sticky top-0 z-20 border-b border-border">
            <div className={currentView === 'messaging' ? 'w-full px-4 sm:px-6 lg:px-8' : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"}>
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <LeafIcon className="h-8 w-8 text-primary" />
                        <h1 className="ml-2 text-xl font-bold text-foreground">AgriSync</h1>
                    </div>

                    <nav className="hidden md:flex items-center gap-1">
                        <DesktopNav />
                    </nav>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="relative">
                             <button 
                                onClick={() => handleNavClick('messaging')} 
                                className="p-2 rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors relative"
                                aria-label="Toggle messages"
                            >
                                <MessageSquareIcon className="h-6 w-6" />
                                {unreadMessageCount > 0 && (
                                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                                        {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        <div className="relative">
                            <button 
                                onClick={() => setIsNotificationOpen(!isNotificationOpen)} 
                                className="p-2 rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors relative"
                                aria-label="Toggle notifications"
                            >
                                <BellIcon className="h-6 w-6" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-1 ring-card" />
                                )}
                            </button>
                            {isNotificationOpen && (
                                <NotificationDropdown
                                    notifications={notifications}
                                    onNotificationClick={(notif) => {
                                        onNotificationClick(notif);
                                        setIsNotificationOpen(false);
                                    }}
                                    onMarkAllAsRead={onMarkAllNotificationsAsRead}
                                    onClose={() => setIsNotificationOpen(false)}
                                />
                            )}
                        </div>

                         <div className="hidden md:block relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <select
                                value={user.id}
                                onChange={handleRoleChange}
                                className="pl-10 pr-4 py-2 border border-input rounded-md shadow-sm bg-background text-sm font-medium text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring focus:ring-offset-background"
                                aria-label="Select user"
                            >
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.name} ({u.role})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <ThemeToggle />
                         <div className="md:hidden">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-muted-foreground hover:bg-accent" aria-label="Toggle menu">
                                {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
             {isMenuOpen && (
                 <div className="md:hidden bg-card/95 backdrop-blur-sm p-4 border-t border-border absolute w-full shadow-lg">
                    <nav className="flex flex-col gap-1">
                        <MobileNav />
                    </nav>
                    <div className="pt-4 mt-4 border-t border-border">
                        <label htmlFor="mobile-user-switcher" className="block text-sm font-medium text-muted-foreground mb-2">Switch User</label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <select
                                id="mobile-user-switcher"
                                value={user.id}
                                onChange={handleRoleChange}
                                className="w-full pl-10 pr-4 py-2 border border-input rounded-md shadow-sm bg-background text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring focus:ring-offset-background"
                                aria-label="Select user"
                            >
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.name} ({u.role})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
             )}
        </header>
    );
};

export default Header;