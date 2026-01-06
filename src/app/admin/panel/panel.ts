import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ChartModule } from 'primeng/chart'; 
import { Setup } from '../CompanySetup/setup/setup';
import { Branches } from '../CompanySetup/branches/branches';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  department: string;
  joinedDate: Date;
}


interface StatCard {
  title: string;
  value: number;
  icon: string;
  color: string;
}


@Component({
  selector: 'app-panel',
  imports: [CommonModule, TableModule, ButtonModule, MenuModule, CardModule, InputTextModule, ChartModule, Setup, Branches],
  templateUrl: './panel.html',
  styleUrl: './panel.css',
})
export class Panel implements OnInit {
  users: User[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', department: 'IT', joinedDate: new Date('2024-01-15') },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Inactive', department: 'HR', joinedDate: new Date('2024-02-20') },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Moderator', status: 'Active', department: 'IT', joinedDate: new Date('2024-03-10') },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'User', status: 'Active', department: 'Finance', joinedDate: new Date('2024-04-05') },
    { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'Admin', status: 'Active', department: 'Marketing', joinedDate: new Date('2024-05-12') },
    { id: 6, name: 'Diana Evans', email: 'diana@example.com', role: 'User', status: 'Inactive', department: 'HR', joinedDate: new Date('2024-06-18') }
  ];

  statCards: StatCard[] = [
    { title: 'Total Users', value: 150, icon: '👥', color: '#10b981' },
    { title: 'Active Users', value: 120, icon: '✅', color: '#3b82f6' },
    { title: 'New Joins', value: 25, icon: '➕', color: '#f59e0b' },
    { title: 'Departments', value: 6, icon: '🏢', color: '#8b5cf6' }
  ];

  basicData: any = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'User Growth',
        data: [65, 59, 80, 81, 56, 90],
        fill: false,
        borderColor: '#3b82f6',
        tension: 0.4
      }
    ]
  };

  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: '🏠',
      routerLink: '/admin/dashboard',
      command: () => this.setActiveTab('dashboard')
    },
    {
      label: 'Users',
      icon: '👥',
      routerLink: '/admin/users',
      command: () => this.setActiveTab('users'),
      items: [
        { label: 'All Users', icon: '📋', command: () => this.setActiveTab('users') },
        { label: 'Add User', icon: '➕', command: () => console.log('Add User') },
        { label: 'Roles', icon: '🔒', command: () => console.log('Roles') }
      ]
    },
    {
      label: 'Companies',
      icon: '⚙️',
      routerLink: '/admin/companies',
      command: () => this.setActiveTab('companies'),
      items: [
        { label: 'Setup', icon: '👤', command: () => this.setActiveTab('companies') },
        { label: 'Branches', icon: '🛠️', command: () => this.setActiveTab('branches') },
        { label: 'Backup', icon: '💾', command: () => console.log('Backup') },
        { separator: true },
        { label: 'Logout', icon: '🚪', command: () => console.log('Logout') }
      ]
    },
    {
      label: 'Support',
      icon: '🆘',
      routerLink: '/admin/support',
      command: () => this.setActiveTab('support'),
      items: [
        { label: 'Tickets', icon: '🎫', command: () => console.log('Tickets') },
        { label: 'Documentation', icon: '📚', command: () => console.log('Docs') },
        { label: 'Contact', icon: '📞', command: () => console.log('Contact') }
      ]
    }
  ];

  activeTab: string = 'dashboard';  // Default to dashboard

  ngOnInit() {
    
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  getStatusClass(status: string): { [key: string]: boolean } {
    return {
      'status-badge': true,
      'status-active': status === 'Active',
      'status-inactive': status === 'Inactive',
      'status-default': status !== 'Active' && status !== 'Inactive'
    };
  }

  editUser(user: User) {
    console.log('Edit user:', user);
  }

  deleteUser(user: User) {
    console.log('Delete user:', user);
  }

}
