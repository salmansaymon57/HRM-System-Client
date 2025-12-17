import { List } from './employees/list/list';
import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { d_List } from './departments/list/list';
import { Signup } from './auth/signup/signup';

export const routes: Routes = [

    {
        path: '', pathMatch: 'full', redirectTo: 'login'

    },

    {
        path: 'login', loadComponent: () => import('./auth/login/login').then(m => m.Login)

    },

    {
        path: 'dashboard', component: List
    },
    {
        path:'dashboard', component: d_List
    },
    {
        path:'auth/signup', component: Signup
    }
];
