import { List } from './employees/list/list';
import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { d_List } from './departments/list/list';
import { Signup } from './auth/signup/signup';
import { VerifyEmail } from './auth/verify-email/verify-email';
import { Unverified } from './auth/unverified/unverified';

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
    },
    {
        path:'verify-email', component: VerifyEmail
    },

    {
        path:'unverified', component: Unverified
    },
];
